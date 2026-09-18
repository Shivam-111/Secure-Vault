import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, LogOut, KeyRound, User, PlusCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LockMark from './components/LockMark';
import SecurityBackground from './components/SecurityBackground';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import OTPVerification from './pages/OTPVerification';
import Dashboard from './pages/Dashboard';
import ViewSharedSecret from './pages/ViewSharedSecret';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  return (
    <motion.nav
      className="nav-bar"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-4">
        <Link to="/" className="brand-link">
          <motion.span
            className="brand-mark"
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <LockMark size={16} />
          </motion.span>
          <span className="brand-name">SecureVault</span>
        </Link>
        <div className="nav-links" style={{ position: 'relative' }}>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active relative' : 'relative')}>
            {({ isActive }) => (
              <>
                <span>Home</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute inset-0 border-b-2 border-gold"
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--gold)',
                      borderRadius: '2px'
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>

          {isAuthenticated && (
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active relative' : 'relative')}>
              {({ isActive }) => (
                <>
                  <span>Vault</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeNavTab"
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'var(--gold)',
                        borderRadius: '2px'
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <motion.span
              className="status-chip"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ShieldCheck size={12} />
              2FA on
            </motion.span>
            <span className="text-xs text-muted flex items-center gap-1">
              <User size={12} className="text-primary" />
              Hi, <strong className="text-white">{user?.name}</strong>
            </span>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="btn btn-secondary text-xs px-3 py-1 flex items-center gap-1"
            >
              <LogOut size={13} />
              Lock out
            </motion.button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="flex items-center gap-1">
              <KeyRound size={14} />
              Unlock
            </NavLink>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/register" className="btn btn-primary text-xs px-3 py-1 flex items-center gap-1">
                <PlusCircle size={14} />
                Create vault
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </motion.nav>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.985 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/share/:shareToken" element={<ViewSharedSecret />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function AppContent() {
  return (
    <Router>
      <div className="app-container">
        <SecurityBackground />
        <Navigation />
        <main className="main-content">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
