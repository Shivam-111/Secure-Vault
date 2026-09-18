import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Eye, Lock, Copy, Check, AlertTriangle, ShieldCheck, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { secretShareAPI } from '../services/api';
import LockMark from '../components/LockMark';

const ViewSharedSecret = () => {
  const { shareToken } = useParams();

  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passcode, setPasscode] = useState('');
  
  const [revealedData, setRevealedData] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [burned, setBurned] = useState(false);
  const [revealLoading, setRevealLoading] = useState(false);

  useEffect(() => {
    fetchMeta();
  }, [shareToken]);

  const fetchMeta = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await secretShareAPI.getMeta(shareToken);
      if (res.success) {
        setMeta(res.data);
      }
    } catch (err) {
      setError(err.message || 'This secret link does not exist, has expired, or has already been burned.');
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async (e) => {
    if (e) e.preventDefault();
    try {
      setRevealLoading(true);
      setError('');
      const res = await secretShareAPI.reveal(shareToken, passcode);
      if (res.success) {
        setRevealedData(res.data);
        setRevealed(true);
        if (res.data.isBurned) {
          setBurned(true);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to unlock secret.');
    } finally {
      setRevealLoading(false);
    }
  };

  const handleManualBurn = async () => {
    if (!window.confirm('Are you sure you want to permanently destroy this secret right now?')) return;
    try {
      await secretShareAPI.burn(shareToken);
      setBurned(true);
      setRevealed(false);
      setMeta(null);
      setError('Secret permanently burned and deleted from backend database.');
    } catch (err) {
      setError('Failed to burn secret.');
    }
  };

  const handleCopy = async () => {
    if (!revealedData?.secretText) return;
    await navigator.clipboard.writeText(revealedData.secretText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-xl p-8 relative overflow-hidden border border-amber-500/30"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <span className="brand-mark">
              <LockMark size={16} />
            </span>
            <span className="brand-name">SecureVault Share</span>
          </Link>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Flame size={12} /> One-Time Secret
          </span>
        </div>

        {loading && (
          <div className="py-12 text-center text-muted flex flex-col items-center gap-3">
            <RefreshCw className="animate-spin text-gold" size={28} />
            <span className="text-xs">Decrypting Secret Metadata...</span>
          </div>
        )}

        {error && !meta && !revealedData && (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 mb-2">
              <Flame size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">Secret Destroyed or Expired</h3>
            <p className="text-xs text-muted max-w-md mx-auto">{error}</p>
            <div className="pt-4">
              <Link to="/" className="btn btn-secondary text-xs px-6 py-2 inline-flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back to SecureVault
              </Link>
            </div>
          </div>
        )}

        {meta && !revealed && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Flame size={28} />
              </div>
              <h2 className="text-xl font-extrabold text-white">{meta.title}</h2>
              <p className="text-xs text-muted">
                This encrypted secret will self-destruct after <strong>{meta.remainingViews} remaining view{meta.remainingViews > 1 ? 's' : ''}</strong>.
              </p>
            </div>

            {meta.requiresPasscode && (
              <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-2">
                <label className="block text-xs font-semibold text-white flex items-center gap-1">
                  <Lock size={13} className="text-gold" /> Passcode Required
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="input-field w-full text-xs"
                  placeholder="Enter passcode set by creator"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleReveal}
                disabled={revealLoading}
                className="btn btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 font-bold"
              >
                <Eye size={16} />
                {revealLoading ? 'Decrypting Secret...' : 'View Secret Content Now'}
              </button>

              <button
                onClick={handleManualBurn}
                className="btn btn-secondary w-full sm:w-auto py-3 px-4 text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                Burn Now
              </button>
            </div>
          </div>
        )}

        {revealed && revealedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {revealedData.title}
                  {burned && (
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/40 flex items-center gap-1">
                      <Flame size={10} /> Permanently Burned
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted">Copy or save this secret now. It cannot be recovered after leaving this page.</p>
              </div>
            </div>

            {/* Revealed Secret Box */}
            <div className="p-4 bg-black/60 border border-amber-500/40 rounded-xl relative group">
              <pre className="text-sm font-mono text-amber-200 whitespace-pre-wrap break-all pr-12">
                {revealedData.secretText}
              </pre>

              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-gold hover:text-black text-white transition-all"
                title="Copy Secret"
              >
                {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
              </button>
            </div>

            {copied && (
              <p className="text-xs text-emerald-400 text-center font-medium">
                ✓ Secret copied to clipboard! Auto-clear recommended after 30 seconds.
              </p>
            )}

            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-amber-400" />
              <span>
                {burned 
                  ? 'This secret has reached its maximum view limit and has been permanently deleted from the database.'
                  : `Views left: ${revealedData.maxViews - revealedData.viewCount}`}
              </span>
            </div>

            <div className="pt-2 flex justify-center">
              <Link to="/" className="btn btn-secondary text-xs px-6 py-2">
                Close & Return to Home
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ViewSharedSecret;
