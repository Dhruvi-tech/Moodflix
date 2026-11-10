import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('moodflix_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('moodflix_token') || '');
  const [loading, setLoading] = useState(true);

  // Sync with /api/auth/me on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('moodflix_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('moodflix_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          localStorage.removeItem('moodflix_token');
          localStorage.removeItem('moodflix_user');
          setUser(null);
          setToken('');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('moodflix_token', res.data.token);
      localStorage.setItem('moodflix_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (name, email, password, preferences) => {
    const res = await api.post('/auth/register', { name, email, password, preferences });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('moodflix_token', res.data.token);
      localStorage.setItem('moodflix_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('moodflix_token');
    localStorage.removeItem('moodflix_user');
    setToken('');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('moodflix_user', JSON.stringify(res.data.user));
      return res.data;
    }
    throw new Error(res.data.message || 'Update failed');
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  };

  const updatePreferences = async (newPrefs) => {
    try {
      if (token) {
        const res = await api.put('/auth/preferences', newPrefs);
        if (res.data.success && user) {
          const updated = { ...user, preferences: { ...user.preferences, ...newPrefs } };
          setUser(updated);
          localStorage.setItem('moodflix_user', JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.warn('Failed to sync preferences to server, persisting locally:', err);
    }
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
