import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, Eye, KeyRound, ArrowRight, Lock, CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LockMark from '../components/LockMark';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [cipherState, setCipherState] = useState(0);

  // Cycle cipher simulation text
  useEffect(() => {
    const interval = setInterval(() => {
      setCipherState((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const samplePasses = [
    { title: 'Bank Vault Pass', plain: 'S3cur3!P@ss#2026', cipher: 'e8b941a3c7f21d904b8e' },
    { title: 'Master Keyphrase', plain: '984-alpha-vault-key', cipher: '4f92c10b7a83d6e51f02' },
    { title: 'OAuth Secret Token', plain: 'sk_live_992100341', cipher: 'b7194c0a82e4f3a91c85' }
  ];

  const currentSample = samplePasses[cipherState];

  return (
    <div className="landing">
      <motion.div
        className="hero-panel"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="hero-rings" aria-hidden="true" />

        <div className="hero-grid">
          {/* Left Column: Headline & CTA */}
          <div className="hero-content">
            <motion.p className="eyebrow flex items-center gap-1.5" variants={itemVariants}>
              <Sparkles size={13} className="text-warning" />
              Private password manager
            </motion.p>

            <motion.h1 className="display-title" variants={itemVariants}>
              Your passwords stay locked.{' '}
              <span className="shimmer-text">You hold the key.</span>
            </motion.h1>

            <motion.p className="hero-copy" variants={itemVariants}>
              Store credentials in an AES-256 vault, sealed behind a master password and a second factor.
              Nothing is revealed until you ask.
            </motion.p>

            <motion.div className="flex gap-3 mb-6" variants={itemVariants}>
              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/dashboard" className="btn btn-primary flex items-center gap-2">
                    <Lock size={16} />
                    Open vault
                    <ArrowRight size={16} />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register" className="btn btn-primary flex items-center gap-2">
                      Create vault
                      <ArrowRight size={16} />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/login" className="btn btn-secondary flex items-center gap-2">
                      <KeyRound size={16} />
                      Unlock
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>

          {/* Right Column: Interactive Animated 3D Vault Lock Showcase */}
          <motion.div className="hero-visual" variants={itemVariants}>
            <div
              className="vault-lock-widget"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Outer Dashed Rotating Ring */}
              <div className="vault-ring-outer" />
              
              {/* Inner Pulsing Ring */}
              <div className="vault-ring-inner" />

              {/* Core Lock Sphere */}
              <motion.div
                className="vault-core"
                animate={{
                  scale: isHovered ? [1, 1.1, 1.05] : [1, 1.04, 1],
                  boxShadow: isHovered
                    ? '0 0 50px rgba(201, 162, 39, 0.6), inset 0 0 25px rgba(201, 162, 39, 0.4)'
                    : '0 0 35px rgba(201, 162, 39, 0.35), inset 0 0 15px rgba(201, 162, 39, 0.25)'
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
              >
                <motion.div
                  animate={{ rotate: isHovered ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  {isHovered ? (
                    <LockKeyhole size={42} className="text-primary" />
                  ) : (
                    <LockMark size={42} />
                  )}
                </motion.div>
              </motion.div>

              {/* Orbiting Security Chips */}
              <motion.div
                className="orbiting-chip chip-1"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ShieldCheck size={13} className="text-success" />
                <span>2FA Protected</span>
              </motion.div>

              <motion.div
                className="orbiting-chip chip-2"
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <Shield size={13} className="text-primary" />
                <span>AES-256-GCM</span>
              </motion.div>

              <motion.div
                className="orbiting-chip chip-3"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <CheckCircle2 size={13} className="text-success" />
                <span>Zero Knowledge</span>
              </motion.div>
            </div>

            {/* Live Encrypted Cipher Simulation Box */}
            <motion.div
              className="cipher-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="cipher-header">
                <span className="flex items-center gap-1">
                  <span className="status-chip" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                    LIVE DEMO
                  </span>
                  {currentSample.title}
                </span>
                <span>Encrypted on client</span>
              </div>

              <div className="cipher-row">
                <span className="cipher-key">Plaintext:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`plain-${cipherState}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="cipher-val"
                  >
                    {isHovered ? currentSample.plain : '••••••••••••••••'}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="cipher-row">
                <span className="cipher-key">Vault Hash:</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`cipher-${cipherState}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="cipher-encrypted"
                  >
                    0x{currentSample.cipher}...
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* 3 Trust Feature Cards with Hover Effects & Icons */}
        <motion.div className="trust-grid" variants={containerVariants}>
          <motion.div
            className="trust-tile"
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(201, 162, 39, 0.45)', boxShadow: '0 14px 35px rgba(201, 162, 39, 0.15)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2 text-primary">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Shield size={22} />
              </motion.div>
              <h3 className="mb-0">AES-256 at rest</h3>
            </div>
            <p>Each secret is encrypted before it is stored in your vault.</p>
          </motion.div>

          <motion.div
            className="trust-tile"
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(201, 162, 39, 0.45)', boxShadow: '0 14px 35px rgba(201, 162, 39, 0.15)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2 text-primary">
              <motion.div
                whileHover={{ rotate: -15, scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ShieldCheck size={22} />
              </motion.div>
              <h3 className="mb-0">Two-factor gate</h3>
            </div>
            <p>Login is incomplete until the email OTP door is verified.</p>
          </motion.div>

          <motion.div
            className="trust-tile"
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(201, 162, 39, 0.45)', boxShadow: '0 14px 35px rgba(201, 162, 39, 0.15)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2 text-primary">
              <motion.div
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Eye size={22} />
              </motion.div>
              <h3 className="mb-0">Reveal on demand</h3>
            </div>
            <p>Passwords stay masked until you choose to decrypt one entry.</p>
          </motion.div>
        </motion.div>

        <motion.div className="flex items-center gap-2 text-xs text-muted" variants={itemVariants}>
          <LockMark size={14} />
          SHA-256 master hashing · encrypted vault entries · session-protected dashboard
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
