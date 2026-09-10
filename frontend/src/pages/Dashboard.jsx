import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Copy,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Lock,
  LogOut,
  Shield,
  Check,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { vaultAPI } from '../services/api';
import VaultModal from '../components/VaultModal';
import LockMark from '../components/LockMark';

const siteInitial = (name) => (name || '?').trim().charAt(0).toUpperCase();

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [vaultEntries, setVaultEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [decryptingId, setDecryptingId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchVault = async () => {
    setLoading(true);
    try {
      const res = await vaultAPI.getAll();
      if (res.success && Array.isArray(res.data)) {
        setVaultEntries(res.data);
      }
    } catch (err) {
      console.error('Failed to load vault entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleShowPassword = async (id) => {
    if (decryptedPasswords[id]) {
      setDecryptedPasswords((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return;
    }

    setDecryptingId(id);
    try {
      const res = await vaultAPI.getOne(id);
      if (res.success && res.data && res.data.password) {
        setDecryptedPasswords((prev) => ({ ...prev, [id]: res.data.password }));
      }
    } catch (err) {
      console.error('Failed to decrypt password:', err);
      alert('Failed to decrypt password. Please try again.');
    } finally {
      setDecryptingId(null);
    }
  };

  const handleCopyText = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`Copied ${label}!`);
    setTimeout(() => setCopyFeedback(''), 2200);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (entry) => {
    try {
      const res = await vaultAPI.getOne(entry._id);
      if (res.success && res.data) {
        setEditingItem(res.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch entry for edit:', err);
      alert('Could not load credential for editing.');
    }
  };

  const handleSaveModal = async (formData) => {
    if (editingItem) {
      await vaultAPI.update(editingItem._id, formData);
    } else {
      await vaultAPI.create(formData);
    }
    await fetchVault();
  };

  const handleDeleteEntry = async (id, website) => {
    if (window.confirm(`Are you sure you want to delete the credential for "${website}"?`)) {
      try {
        await vaultAPI.delete(id);
        await fetchVault();
      } catch (err) {
        console.error('Failed to delete entry:', err);
        alert(err.message || 'Failed to delete credential.');
      }
    }
  };

  const filteredEntries = vaultEntries.filter(
    (entry) =>
      entry.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-shell">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <p className="eyebrow flex items-center gap-1">
            <Lock size={12} />
            Your vault
          </p>
          <h1 className="dash-title">Sealed credentials</h1>
          <p className="text-xs text-muted mt-2">
            Signed in as <span className="font-semibold text-primary">{user?.name}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className="status-chip">
            <Shield size={12} />
            Vault locked until reveal
          </span>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleOpenAddModal}
            className="btn btn-primary text-sm flex items-center gap-1.5"
          >
            <Plus size={16} />
            Add credential
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleLogout}
            className="btn btn-secondary text-sm flex items-center gap-1.5"
          >
            <LogOut size={15} />
            Lock out
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {copyFeedback && (
          <motion.div
            className="alert alert-success toast-copy text-xs font-semibold flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <CheckCircle2 size={16} />
            <span>{copyFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="search-wrap">
          <Search size={16} />
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            className="form-input text-sm py-2 pl-9"
            placeholder="Search website or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="stat-pill card-box py-1 px-3">
            Total: <strong className="text-primary">{vaultEntries.length}</strong>
          </span>
          {searchQuery && (
            <span className="stat-pill card-box py-1 px-3">
              Matching: <strong className="text-success">{filteredEntries.length}</strong>
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-center p-12 card-box">
          <div className="spinner"></div>
          <p className="mt-4 text-sm text-muted">Opening vault metadata…</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <motion.div
          className="card-box empty-vault"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="empty-illustration"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <LockMark size={32} />
          </motion.div>
          <h3 className="text-lg font-semibold mb-1">
            {searchQuery ? 'No matching credentials' : 'Your vault is empty'}
          </h3>
          <p className="text-xs text-muted mb-4">
            {searchQuery
              ? `No credentials match "${searchQuery}"`
              : 'Add your first password. It will be sealed with AES-256 encryption.'}
          </p>
          {!searchQuery && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleOpenAddModal}
              className="btn btn-primary text-sm inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add first credential
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div className="vault-grid" layout>
          <AnimatePresence>
            {filteredEntries.map((entry) => {
              const isPasswordRevealed = !!decryptedPasswords[entry._id];
              const isDecrypting = decryptingId === entry._id;
              const displayedPassword = isPasswordRevealed ? decryptedPasswords[entry._id] : '••••••••••••';

              return (
                <motion.div
                  key={entry._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3 }}
                  className={`vault-item-card flex flex-col md:flex-row justify-between items-start md:items-center p-4 card-box gap-4${
                    isPasswordRevealed ? ' revealed' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <motion.div
                      className="site-avatar"
                      whileHover={{ scale: 1.08, rotate: 3 }}
                      aria-hidden="true"
                    >
                      {siteInitial(entry.website)}
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-bold text-white">{entry.website}</h3>
                        <span className="badge badge-encrypted text-xs flex items-center gap-1">
                          <Sparkles size={10} />
                          AES-256
                        </span>
                      </div>
                      <div className="text-xs text-muted flex flex-wrap gap-3">
                        <span>
                          User: <strong className="text-white">{entry.username}</strong>
                        </span>
                        {entry.notes && (
                          <span>
                            Notes: <em>{entry.notes}</em>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <div className="password-pill font-mono">
                      <span>{isDecrypting ? 'Decrypting…' : displayedPassword}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleShowPassword(entry._id)}
                        disabled={isDecrypting}
                        className="btn-ghost flex items-center gap-1 cursor-pointer"
                      >
                        {isPasswordRevealed ? (
                          <>
                            <EyeOff size={12} />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye size={12} />
                            Reveal
                          </>
                        )}
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleCopyText(entry.username, 'username')}
                      className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                      title="Copy Username"
                    >
                      <Copy size={12} />
                      Copy user
                    </motion.button>

                    {isPasswordRevealed && (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleCopyText(decryptedPasswords[entry._id], 'password')}
                        className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                        title="Copy Password"
                      >
                        <Copy size={12} />
                        Copy pass
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleOpenEditModal(entry)}
                      className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                      title="Edit Credential"
                    >
                      <Edit2 size={12} />
                      Edit
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleDeleteEntry(entry._id, entry.website)}
                      className="btn btn-danger text-xs py-1 px-2.5 flex items-center gap-1"
                      title="Delete Credential"
                    >
                      <Trash2 size={12} />
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <VaultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItem}
        isEditing={!!editingItem}
      />
    </div>
  );
};

export default Dashboard;
