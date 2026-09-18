import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Copy, Check, Lock, Clock, Eye, ShieldCheck, Sparkles, Link as LinkIcon } from 'lucide-react';
import { secretShareAPI } from '../services/api';

const ShareSecretModal = ({ isOpen, onClose, initialSecret = '', initialTitle = '' }) => {
  const [secretText, setSecretText] = useState(initialSecret);
  const [title, setTitle] = useState(initialTitle || 'Secret Note');
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [maxViews, setMaxViews] = useState(1);
  const [passcode, setPasscode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdShare, setCreatedShare] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!secretText.trim()) {
      setError('Please enter the secret content to share.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await secretShareAPI.create({
        secretText,
        title,
        expiryMinutes: Number(expiryMinutes),
        maxViews: Number(maxViews),
        passcode: passcode.trim() || null
      });

      if (res.success) {
        setCreatedShare(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to create self-destruct link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdShare) return;
    const fullShareUrl = `${window.location.origin}/share/${createdShare.shareToken}`;
    await navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setSecretText('');
    setTitle('Secret Note');
    setCreatedShare(null);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="glass-panel w-full max-w-lg p-6 relative overflow-hidden border border-amber-500/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
                <Flame size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  Self-Destruct Secret Share
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">Zero-Knowledge</span>
                </h3>
                <p className="text-xs text-muted">Create a secure link that auto-destructs after viewing</p>
              </div>
            </div>
            <button onClick={resetForm} className="text-muted hover:text-white p-1">
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          {!createdShare ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Secret Label / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field w-full text-xs"
                  placeholder="e.g. Wi-Fi Password or Production API Key"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Secret Content (Encrypted AES-256-GCM)</label>
                <textarea
                  rows={4}
                  value={secretText}
                  onChange={(e) => setSecretText(e.target.value)}
                  className="input-field w-full text-xs font-mono"
                  placeholder="Type or paste password, token, or sensitive note here..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1">
                    <Clock size={12} className="text-gold" /> Link Expiry
                  </label>
                  <select
                    value={expiryMinutes}
                    onChange={(e) => setExpiryMinutes(e.target.value)}
                    className="input-field w-full text-xs"
                  >
                    <option value={10}>10 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={1440}>24 Hours</option>
                    <option value={10080}>7 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1">
                    <Eye size={12} className="text-gold" /> Self-Destruct View Limit
                  </label>
                  <select
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    className="input-field w-full text-xs"
                  >
                    <option value={1}>1 View (Burn after read)</option>
                    <option value={2}>2 Views</option>
                    <option value={5}>5 Views</option>
                    <option value={10}>10 Views</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1">
                  <Lock size={12} className="text-gold" /> Optional Passcode Protection
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="input-field w-full text-xs"
                  placeholder="Optional extra passcode required to unlock link"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="btn btn-secondary text-xs px-4 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary text-xs px-5 py-2 flex items-center gap-2">
                  <Flame size={14} className="text-amber-300" />
                  {loading ? 'Encrypting & Generating...' : 'Generate Self-Destruct Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
                <ShieldCheck size={32} />
              </div>

              <h4 className="text-base font-bold text-white">Encrypted Share Link Created!</h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                This link will self-destruct automatically after <strong>{createdShare.maxViews} view{createdShare.maxViews > 1 ? 's' : ''}</strong> or when it expires.
              </p>

              {/* Generated URL Box */}
              <div className="p-3 bg-black/50 border border-amber-500/40 rounded-lg flex items-center justify-between gap-2">
                <div className="text-xs font-mono text-amber-300 truncate text-left flex-1">
                  {`${window.location.origin}/share/${createdShare.shareToken}`}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="p-3 rounded bg-white/5 border border-white/10 text-[11px] text-muted flex items-center justify-between">
                <span>Views allowed: <strong className="text-white">{createdShare.maxViews}</strong></span>
                <span>Passcode protected: <strong className="text-white">{createdShare.hasPasscode ? 'Yes' : 'No'}</strong></span>
              </div>

              <div className="pt-3 flex justify-center">
                <button onClick={resetForm} className="btn btn-secondary text-xs px-6 py-2">
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShareSecretModal;
