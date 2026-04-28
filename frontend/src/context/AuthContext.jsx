// ============================================================
//  context/AuthContext.jsx — Global auth state
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);
const authBypassEnabled = process.env.REACT_APP_BYPASS_AUTH === 'true';
const guestUser = {
  id: 'dev-bypass-user',
  name: 'Dev Guest',
  email: 'dev-guest@local.test',
  createdAt: new Date(0).toISOString(),
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => (authBypassEnabled ? guestUser : null));
  const [token, setToken]     = useState(() => localStorage.getItem('llmj_token'));
  const [loading, setLoading] = useState(!authBypassEnabled);

  // Verify token on mount
  useEffect(() => {
    if (authBypassEnabled) {
      setUser(guestUser);
      setLoading(false);
      return;
    }

    const verify = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch {
        // Token invalid — clear it
        localStorage.removeItem('llmj_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

  const login = useCallback((newToken, userData) => {
    if (authBypassEnabled) {
      setUser(guestUser);
      setLoading(false);
      return;
    }
    localStorage.setItem('llmj_token', newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    if (authBypassEnabled) {
      setUser(guestUser);
      setLoading(false);
      return;
    }
    localStorage.removeItem('llmj_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
