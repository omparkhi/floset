import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authConfig, setAuthConfig] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('floset_token');
    if (token) {
      api.auth.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('floset_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const openAuth = (options = {}) => {
    setAuthConfig(typeof options === 'object' && options !== null ? options : {});
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
    setAuthConfig({});
  };

  const login = async (credentials) => {
    const data = await api.auth.login(credentials);
    localStorage.setItem('floset_token', data.token);
    setUser(data);
    setIsAuthOpen(false);
    return data;
  };

  const register = async (userData) => {
    const data = await api.auth.register(userData);
    localStorage.setItem('floset_token', data.token);
    setUser(data);
    setIsAuthOpen(false);
    return data;
  };

  const logout = () => {
    try {
      localStorage.removeItem('floset_token');
      localStorage.removeItem('floset_wishlist');
      localStorage.removeItem('floset_cart');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const updated = await api.auth.updateProfile(updates);
    setUser(prev => ({ ...prev, ...updated }));
    return updated;
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('floset_token');
    if (token) {
      try {
        const userData = await api.auth.getMe();
        setUser(userData);
        return userData;
      } catch {
        // ignore
      }
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        setUser,
        isAuthOpen,
        authConfig,
        openAuth,
        closeAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
