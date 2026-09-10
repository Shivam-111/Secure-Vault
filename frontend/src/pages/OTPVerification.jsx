import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LockMark from '../components/LockMark';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { verifyOTPCode, mfaToken: contextMfaToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const stateMfaToken = location.state?.mfaToken;
  const userEmail = location.state?.email || 'your email';
  const activeMfaToken = stateMfaToken || contextMfaToken || sessionStorage.getItem('mfaToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }

    if (!activeMfaToken) {
      setError('MFA session expired. Please return to login.');
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOTPCode(otp.trim(), activeMfaToken);
      if (res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.message || 'OTP verification failed.');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-shell"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <aside className="auth-aside">
        <div>
          <motion.div
            className="lock-ring"
            whileHover={{ scale: 1.08, rotate: 5 }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <LockMark size={28} />
          </motion.div>
          <h2>Check your inbox</h2>
          <p>We sent a 6-digit verification code to <strong className="text-white">{userEmail}</strong>. Enter it here to open the vault.</p>
        </div>
        <p className="text-xs text-muted flex items-center gap-1">
          <KeyRound size={12} className="text-primary" />
          Step 2 of 2 · Email OTP
        </p>
      </aside>

      <div className="auth-card">
        <div className="mb-6">
          <p className="eyebrow">Two-factor authentication</p>
          <h2 className="text-2xl font-bold">Enter email code</h2>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="alert alert-danger flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="form-group">
          <div>
            <label className="form-label text-center block">6-digit email code</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              className="form-input otp-input"
              placeholder="••••••"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>

          <motion.div
            className="card-box text-xs text-muted text-center notice-dev"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-semibold text-warning mb-1 flex items-center justify-center gap-1">
              <ShieldAlert size={14} />
              Code sent via Email
            </p>
            <p>
              The code was sent to <strong>{userEmail}</strong> and expires in 5 minutes. Check spam if you do not see it.
            </p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Verifying code…
              </>
            ) : (
              <>
                Verify & open vault
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-sm text-muted">
          Need to restart?{' '}
          <button onClick={() => navigate('/login')} className="link-gold bg-transparent border-0 cursor-pointer">
            Back to unlock
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OTPVerification;
