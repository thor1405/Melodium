import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('melodium_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('melodium_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('melodium_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('melodium_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid. Logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('melodium_token', res.token);
      localStorage.setItem('melodium_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('melodium_token', res.token);
      localStorage.setItem('melodium_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('melodium_token');
    localStorage.removeItem('melodium_user');
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.success && res.user) {
      setUser((prev) => ({ ...prev, ...res.user }));
      localStorage.setItem('melodium_user', JSON.stringify({ ...user, ...res.user }));
    }
    return res;
  };

  const updateAvatar = (newAvatarUrl, updatedUser) => {
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('melodium_user', JSON.stringify(updatedUser));
    } else if (newAvatarUrl) {
      setUser((prev) => {
        const next = { ...prev, avatar: newAvatarUrl };
        localStorage.setItem('melodium_user', JSON.stringify(next));
        return next;
      });
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
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
