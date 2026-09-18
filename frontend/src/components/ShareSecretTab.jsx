import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Copy, Check, Lock, Clock, Eye, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { secretShareAPI } from '../services/api';

const ShareSecretTab = () => {
  const [secretText, setSecretText] = useState('');
  const [title, setTitle] = useState('Secret Note');
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [maxViews, setMaxViews] = useState(1);
  const [passcode, setPasscode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdShare, setCreatedShare] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const handleReset = () => {
    setSecretText('');
    setTitle('Secret Note');
    setCreatedShare(null);
    setError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="glass-panel p-5 border border-amber-500/30 relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
          <Flame size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            One-Time Secret Sharing Link
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">Zero-Knowledge</span>
          </h2>
          <p className="text-xs text-muted">Generate temporary, self-destructing links for sensitive passwords, keys, or private notes.</p>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      {!createdShare ? (
        <form onSubmit={handleCreate} className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-white mb-1">Secret Title / Label</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field w-full text-xs"
                placeholder="e.g. Wi-Fi or API Secret Key"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-white mb-1">Secret Content (AES-256-GCM Encrypted)</label>
              <input
                type="text"
                value={secretText}
                onChange={(e) => setSecretText(e.target.value)}
                className="input-field w-full text-xs font-mono"
                placeholder="Type or paste private key, password, or sensitive text here..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1">
                <Clock size={12} className="text-gold" /> Expiration Window
              </label>
              <select
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value)}
                className="input-field w-full text-xs py-1.5"
              >
                <option value={10}>10 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={1440}>24 Hours (1 Day)</option>
                <option value={10080}>7 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1">
                <Eye size={12} className="text-gold" /> Self-Destruct Limit
              </label>
              <select
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                className="input-field w-full text-xs py-1.5"
              >
                <option value={1}>1 View (Burn after single read)</option>
                <option value={2}>2 Views</option>
                <option value={5}>5 Views</option>
                <option value={10}>10 Views</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1">
                <Lock size={12} className="text-gold" /> Optional Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="input-field w-full text-xs py-1.5"
                placeholder="Optional extra passcode"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary text-xs px-5 py-2 flex items-center gap-2 font-bold"
            >
              <Flame size={14} className="text-amber-300" />
              {loading ? 'Encrypting & Generating...' : 'Generate Encrypted Link'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-center py-4 max-w-lg mx-auto">
          <div className="inline-flex p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck size={28} />
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Self-Destruct Link Created!</h3>
            <p className="text-xs text-muted mt-0.5">
              Will self-destruct after <strong>{createdShare.maxViews} view{createdShare.maxViews > 1 ? 's' : ''}</strong> or upon reaching expiry.
            </p>
          </div>

          {/* Generated Link Display Box */}
          <div className="p-3 bg-black/60 border border-amber-500/40 rounded-lg flex items-center justify-between gap-2 text-left">
            <div className="text-xs font-mono text-amber-300 truncate flex-1">
              {`${window.location.origin}/share/${createdShare.shareToken}`}
            </div>
            <button
              onClick={handleCopyLink}
              className="btn btn-primary text-xs px-3 py-1.5 flex items-center gap-1 shrink-0 font-bold"
            >
              {copied ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="p-2 rounded bg-white/5 border border-white/10 text-[11px] text-muted flex items-center justify-around">
            <span>Views Allowed: <strong className="text-white">{createdShare.maxViews}</strong></span>
            <span>Passcode Protected: <strong className="text-white">{createdShare.hasPasscode ? 'Yes' : 'No'}</strong></span>
          </div>

          <div className="pt-1 flex justify-center">
            <button onClick={handleReset} className="btn btn-secondary text-xs px-5 py-2 flex items-center gap-1.5">
              <RefreshCw size={13} /> Create Another Link
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ShareSecretTab;
