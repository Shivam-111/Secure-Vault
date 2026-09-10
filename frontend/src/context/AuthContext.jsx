import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [mfaToken, setMfaToken] = useState(() => sessionStorage.getItem('mfaToken') || null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session restoration failed:', err.message);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const registerUser = async (userData) => {
    return await authAPI.register(userData);
  };

  const loginUser = async (credentials) => {
    const response = await authAPI.login(credentials);
    if (response.success && response.mfaRequired && response.mfaToken) {
      setMfaToken(response.mfaToken);
      sessionStorage.setItem('mfaToken', response.mfaToken);
    }
    return response;
  };

  const verifyOTPCode = async (otp, overrideMfaToken = null) => {
    const activeMfaToken = overrideMfaToken || mfaToken || sessionStorage.getItem('mfaToken');
    if (!activeMfaToken) {
      throw new Error('MFA session expired. Please log in again.');
    }

    const response = await authAPI.verifyOTP({ mfaToken: activeMfaToken, otp });
    if (response.success && response.token) {
      // Clear temporary MFA token
      setMfaToken(null);
      sessionStorage.removeItem('mfaToken');

      // Set full access JWT token
      localStorage.setItem('token', response.token);
      setToken(response.token);

      // Fetch user profile immediately
      try {
        const profileRes = await authAPI.getProfile();
        if (profileRes.success && profileRes.user) {
          setUser(profileRes.user);
        }
      } catch (err) {
        console.error('Failed to fetch user profile after OTP verification:', err);
      }
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('mfaToken');
    setToken(null);
    setMfaToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    mfaToken,
    loading,
    isAuthenticated: !!token && !!user,
    registerUser,
    loginUser,
    verifyOTPCode,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
