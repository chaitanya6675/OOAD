import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiClient from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smart_ecom_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state by verifying token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('smart_ecom_token');
      if (storedToken) {
        try {
          const data = await ApiClient.get('/auth/me');
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await ApiClient.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('smart_ecom_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed.');
  };

  const register = async (formData) => {
    const data = await ApiClient.post('/auth/register', formData);
    if (data.success && data.token) {
      localStorage.setItem('smart_ecom_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Registration failed.');
  };

  const logout = () => {
    localStorage.removeItem('smart_ecom_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const data = await ApiClient.put('/auth/profile', profileData);
    if (data.success && data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Profile update failed.');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isCustomer: user?.role === 'customer',
    login,
    register,
    logout,
    updateProfile
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
