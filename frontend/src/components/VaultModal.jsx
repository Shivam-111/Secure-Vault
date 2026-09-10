import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Wand2, Eye, EyeOff, ChevronDown, ChevronUp, ShieldCheck, AlertCircle, Save } from 'lucide-react';
import { generateSecurePassword } from '../utils/passwordGenerator';

const VaultModal = ({ isOpen, onClose, onSave, initialData = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    website: '',
    username: '',
    password: '',
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showGenOptions, setShowGenOptions] = useState(false);
  const [genConfig, setGenConfig] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        website: initialData.website || '',
        username: initialData.username || '',
        password: initialData.password || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({ website: '', username: '', password: '', notes: '' });
    }
    setError('');
    setShowPassword(false);
    setShowGenOptions(false);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword(genConfig);
    setFormData((prev) => ({ ...prev, password: generated }));
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.website.trim() || !formData.username.trim() || !formData.password) {
      setError('Please fill in Website, Username, and Password.');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save credential.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="modal-card"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gold-soft">
              <div>
                <p className="eyebrow flex items-center gap-1">
                  <ShieldCheck size={12} />
                  {isEditing ? 'Update secret' : 'New secret'}
                </p>
                <h3 className="text-xl font-bold text-white">
                  {isEditing ? 'Edit credential' : 'Seal a credential'}
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="btn-icon"
                aria-label="Close modal"
              >
                <X size={20} />
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="alert alert-danger mb-4 flex items-center gap-2"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="form-group">
              <div>
                <label className="form-label">Website / App Name *</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="website"
                  className="form-input"
                  placeholder="e.g. Gmail, GitHub, Netflix"
                  value={formData.website}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Username / Email *</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="username"
                  className="form-input"
                  placeholder="e.g. user@example.com"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label mb-0">Password *</label>
                  <button
                    type="button"
                    className="btn-ghost flex items-center gap-1"
                    onClick={() => setShowGenOptions(!showGenOptions)}
                  >
                    {showGenOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showGenOptions ? 'Hide options' : 'Generator options'}
                  </button>
                </div>

                <div className="relative flex items-center">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input pr-20 font-mono"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="btn-input-action flex items-center gap-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="mt-2 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    onClick={handleGeneratePassword}
                  >
                    <Wand2 size={13} className="text-primary" />
                    Generate strong password
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showGenOptions && (
                    <motion.div
                      className="gen-panel text-xs"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="flex justify-between items-center">
                        <span>Length: <strong>{genConfig.length}</strong></span>
                        <input
                          type="range"
                          min="8"
                          max="32"
                          value={genConfig.length}
                          onChange={(e) => setGenConfig({ ...genConfig, length: Number(e.target.value) })}
                          className="w-32"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={genConfig.includeUppercase}
                            onChange={(e) => setGenConfig({ ...genConfig, includeUppercase: e.target.checked })}
                          />
                          <span>A-Z (Uppercase)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={genConfig.includeLowercase}
                            onChange={(e) => setGenConfig({ ...genConfig, includeLowercase: e.target.checked })}
                          />
                          <span>a-z (Lowercase)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={genConfig.includeNumbers}
                            onChange={(e) => setGenConfig({ ...genConfig, includeNumbers: e.target.checked })}
                          />
                          <span>0-9 (Numbers)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={genConfig.includeSymbols}
                            onChange={(e) => setGenConfig({ ...genConfig, includeSymbols: e.target.checked })}
                          />
                          <span>!@# (Symbols)</span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <label className="form-label">Notes (Optional)</label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  name="notes"
                  className="form-input font-sans"
                  rows="3"
                  placeholder="e.g. Personal recovery codes or hints"
                  value={formData.notes}
                  onChange={handleChange}
                ></motion.textarea>
              </div>

              <p className="text-xs text-muted flex items-center gap-1">
                <KeyRound size={12} className="text-primary" />
                Encrypted before save · AES-256
              </p>

              <div className="flex gap-3 justify-end mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn btn-primary text-sm flex items-center gap-1.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      {isEditing ? 'Update credential' : 'Seal in vault'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VaultModal;
