import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LockMark from '../components/LockMark';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { email, password } = formData;

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser({ email: email.trim(), password });
      if (res.success && res.mfaRequired) {
        navigate('/verify-otp', {
          state: {
            mfaToken: res.mfaToken,
            email: email.trim()
          }
        });
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <LockMark size={28} />
          </motion.div>
          <h2>Unlock the vault</h2>
          <p>Enter your master credentials. The door stays shut until the email verification code is confirmed.</p>
        </div>
        <p className="text-xs text-muted flex items-center gap-1">
          <KeyRound size={12} className="text-primary" />
          Step 1 of 2 · Master password
        </p>
      </aside>

      <div className="auth-card">
        <div className="mb-6">
          <p className="eyebrow">Sign in</p>
          <h2 className="text-2xl font-bold">Welcome back</h2>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="alert alert-danger flex items-center gap-2"
              initial={{ opacity: 0, y: -10, x: [-5, 5, -5, 5, 0] }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="form-group">
          <div>
            <label className="form-label flex items-center gap-1">
              <Mail size={12} />
              Email Address
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="email"
              name="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-1">
              <Lock size={12} />
              Master Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Sending code…
              </>
            ) : (
              <>
                Email me a code
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-sm text-muted">
          Don&apos;t have a vault yet?{' '}
          <Link to="/register" className="link-gold">
            Create one
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
