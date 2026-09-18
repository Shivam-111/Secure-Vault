import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, RefreshCw, Sparkles, AlertOctagon, ArrowUpRight } from 'lucide-react';
import { vaultAPI } from '../services/api';

const SecurityRadar = ({ onRefreshVault, compact = false }) => {
  const [radarData, setRadarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null); // 'breached', 'reused', 'weak'

  const fetchRadar = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await vaultAPI.getSecurityRadar();
      if (res.success) {
        setRadarData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze vault security radar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadar();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return { text: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: '#10B981', label: 'Strong Security' };
    if (score >= 50) return { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: '#F59E0B', label: 'Moderate Risk' };
    return { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', border: '#EF4444', label: 'Critical Vulnerabilities' };
  };

  if (loading) {
    return (
      <div className="glass-panel p-5 mb-6 flex items-center justify-center gap-3 text-muted text-xs">
        <RefreshCw className="animate-spin text-gold" size={16} />
        <span>Scanning Vault Credentials & Dark Web Breaches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-4 mb-6 border border-red-500/30 flex items-center justify-between text-xs text-red-400">
        <span>{error}</span>
        <button onClick={fetchRadar} className="btn btn-secondary py-1 px-2 flex items-center gap-1 text-xs">
          <RefreshCw size={12} /> Retry Scan
        </button>
      </div>
    );
  }

  if (!radarData || radarData.totalCount === 0) {
    return (
      <div className="glass-panel p-5 mb-6 flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs">Security Health Radar Active</h3>
            <p className="text-[11px] text-muted">Add vault credentials to activate real-time breach scanning and health metrics.</p>
          </div>
        </div>
      </div>
    );
  }

  const { overallScore, weakCount, reusedCount, breachedCount, breachedItems, reusedGroups, weakItems } = radarData;
  const scoreBadge = getScoreColor(overallScore);

  // SVG Gauge Math for compact 64px circle
  const radius = 26;
  const circumference = 2 * Math.PI * radius; // ~163.36
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div 
      className="glass-panel p-5 mb-6 relative overflow-hidden transition-all"
      style={{ border: `1px solid ${scoreBadge.border}35` }}
    >
      {/* Background Ambient Glow */}
      <div 
        className="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-2xl opacity-15 pointer-events-none"
        style={{ background: scoreBadge.text }}
      />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
        {/* Score Ring & Title */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div 
            className="relative flex items-center justify-center shrink-0" 
            style={{ width: '68px', height: '68px' }}
          >
            <svg 
              style={{ width: '68px', height: '68px', transform: 'rotate(-90deg)' }} 
              viewBox="0 0 64 64"
            >
              {/* Background Track */}
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="5"
                fill="none"
              />
              {/* Score Fill */}
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                stroke={scoreBadge.text}
                strokeWidth="5"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-extrabold text-white leading-none font-mono">{overallScore}</span>
              <span className="text-[9px] text-muted font-bold tracking-tighter">%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-gold" />
              <h3 className="font-bold text-white text-sm">Security Radar</h3>
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ color: scoreBadge.text, backgroundColor: scoreBadge.bg, border: `1px solid ${scoreBadge.border}40` }}
              >
                {scoreBadge.label}
              </span>
            </div>
            <p className="text-xs text-muted max-w-sm">
              Live Dark Web Breach Intelligence. Zero-Knowledge HIBP verification enabled.
            </p>
          </div>
        </div>

      {/* Vertical Stacked Cards: 1 after 1 */}
      <div className="flex flex-col gap-2.5 w-full mt-4">
        {/* Card 1: Breached Passwords */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab(activeTab === 'breached' ? null : 'breached')}
          style={{
            background: breachedCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${breachedCount > 0 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.12)'}`
          }}
          className={`p-3 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between gap-4 w-full ${
            activeTab === 'breached' ? 'ring-2 ring-red-400' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${breachedCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <AlertOctagon size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Breached Credentials
                {breachedCount > 0 && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-semibold">Action Required</span>}
              </div>
              <div className="text-[11px] text-muted">{breachedCount > 0 ? 'Found in public dark web breach leaks' : '0 Leaks Found'}</div>
            </div>
          </div>
          <div className="text-xs font-mono font-extrabold text-white px-3 py-1 rounded bg-black/50 border border-white/10 shrink-0">
            {breachedCount}
          </div>
        </motion.button>

        {/* Card 2: Reused Passwords */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab(activeTab === 'reused' ? null : 'reused')}
          style={{
            background: reusedCount > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${reusedCount > 0 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(255, 255, 255, 0.12)'}`
          }}
          className={`p-3 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between gap-4 w-full ${
            activeTab === 'reused' ? 'ring-2 ring-amber-400' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${reusedCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <RefreshCw size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Reused Passwords
                {reusedCount > 0 && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">Duplicates Detected</span>}
              </div>
              <div className="text-[11px] text-muted">{reusedCount > 0 ? 'Identical passwords used across websites' : 'All unique passwords'}</div>
            </div>
          </div>
          <div className="text-xs font-mono font-extrabold text-white px-3 py-1 rounded bg-black/50 border border-white/10 shrink-0">
            {reusedCount}
          </div>
        </motion.button>

        {/* Card 3: Weak Passwords */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab(activeTab === 'weak' ? null : 'weak')}
          style={{
            background: weakCount > 0 ? 'rgba(234, 179, 8, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${weakCount > 0 ? 'rgba(234, 179, 8, 0.35)' : 'rgba(255, 255, 255, 0.12)'}`
          }}
          className={`p-3 rounded-xl text-left cursor-pointer transition-all flex items-center justify-between gap-4 w-full ${
            activeTab === 'weak' ? 'ring-2 ring-yellow-400' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${weakCount > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Weak Credentials
                {weakCount > 0 && <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-semibold">Needs Improvement</span>}
              </div>
              <div className="text-[11px] text-muted">{weakCount > 0 ? 'Passwords with low entropy or missing special characters' : 'Strong password entropy'}</div>
            </div>
          </div>
          <div className="text-xs font-mono font-extrabold text-white px-3 py-1 rounded bg-black/50 border border-white/10 shrink-0">
            {weakCount}
          </div>
        </motion.button>
      </div>
      </div>

      {/* Tab Details Drawer */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                {activeTab === 'breached' && <AlertOctagon size={13} className="text-red-400" />}
                {activeTab === 'reused' && <RefreshCw size={13} className="text-amber-400" />}
                {activeTab === 'weak' && <AlertTriangle size={13} className="text-yellow-400" />}
                {activeTab === 'breached' && `Breached Accounts (${breachedItems.length})`}
                {activeTab === 'reused' && `Reused Password Groups (${reusedGroups.length})`}
                {activeTab === 'weak' && `Weak Credentials (${weakItems.length})`}
              </h4>
              <button 
                onClick={() => setActiveTab(null)}
                className="text-[11px] text-muted hover:text-white font-medium"
              >
                Close Drawer ✕
              </button>
            </div>

            {/* Breached Items */}
            {activeTab === 'breached' && (
              <div className="space-y-2">
                {breachedItems.length === 0 ? (
                  <p className="text-xs text-emerald-400">✓ No credentials found in public breach databases!</p>
                ) : (
                  breachedItems.map((item) => (
                    <div key={item.id} className="p-2.5 bg-red-950/30 border border-red-500/30 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white block">{item.title}</strong>
                        <span className="text-red-400 text-[11px]">
                          Leaked in <strong>{item.breachCount.toLocaleString()}</strong> public breaches
                        </span>
                      </div>
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-semibold">
                        Change Password
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Reused Groups */}
            {activeTab === 'reused' && (
              <div className="space-y-2">
                {reusedGroups.length === 0 ? (
                  <p className="text-xs text-emerald-400">✓ All credentials use unique passwords!</p>
                ) : (
                  reusedGroups.map((group, idx) => (
                    <div key={idx} className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs">
                      <div className="text-amber-400 font-semibold mb-1">
                        Same Password used across {group.count} websites:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((subItem) => (
                          <span key={subItem.id} className="bg-white/10 text-white px-2 py-0.5 rounded text-[11px]">
                            {subItem.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Weak Items */}
            {activeTab === 'weak' && (
              <div className="space-y-2">
                {weakItems.length === 0 ? (
                  <p className="text-xs text-emerald-400">✓ All credentials meet entropy criteria!</p>
                ) : (
                  weakItems.map((item) => (
                    <div key={item.id} className="p-2.5 bg-yellow-950/30 border border-yellow-500/30 rounded-lg flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white block">{item.title}</strong>
                        <span className="text-yellow-400 text-[11px]">
                          {item.reasons.join(', ')}
                        </span>
                      </div>
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded font-semibold">
                        Needs Improvement
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityRadar;
