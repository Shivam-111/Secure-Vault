import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LockMark from '../components/LockMark';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '', bars: 0, percent: 0 };
    if (pwd.length < 6) return { label: 'Too short (min 6 chars)', color: 'text-danger', bars: 1, percent: 33 };
    if (pwd.length < 10) return { label: 'Medium', color: 'text-warning', bars: 2, percent: 66 };
    return { label: 'Strong', color: 'text-success', bars: 3, percent: 100 };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Master Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({ name: name.trim(), email: email.trim(), password });
      if (res.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

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
            whileHover={{ scale: 1.08, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <LockMark size={28} />
          </motion.div>
          <h2>Seal a new vault</h2>
          <p>Choose a strong master password. This is the only key that opens your credentials.</p>
        </div>
        <p className="text-xs text-muted flex items-center gap-1">
          <Shield size={12} className="text-primary" />
          Hashed with SHA-256 · never stored in plain text
        </p>
      </aside>

      <div className="auth-card">
        <div className="mb-6">
          <p className="eyebrow">Register</p>
          <h2 className="text-2xl font-bold">Create master vault</h2>
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

          {success && (
            <motion.div
              className="alert alert-success flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="form-group">
          <div>
            <label className="form-label flex items-center gap-1">
              <User size={12} />
              Full Name
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              name="name"
              className="form-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
            {strength.label && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99 }}>
                  <motion.div
                    className="h-full"
                    style={{
                      height: '4px',
                      borderRadius: 99,
                      background: strength.bars === 1 ? 'var(--danger)' : strength.bars === 2 ? '#d4b24a' : 'var(--success)'
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${strength.percent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className={`text-xs mt-1 block font-semibold ${strength.color}`}>
                  Strength: {strength.label}
                </span>
              </motion.div>
            )}
          </div>

          <div>
            <label className="form-label flex items-center gap-1">
              <Lock size={12} />
              Confirm Master Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="••••••••••••"
              value={formData.confirmPassword}
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
                Sealing vault…
              </>
            ) : (
              <>
                Create vault
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="link-gold">
            Unlock
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
