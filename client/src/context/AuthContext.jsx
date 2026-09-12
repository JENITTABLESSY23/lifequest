import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lifequest_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore authenticated session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('lifequest_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.getMe(storedToken);
        if (data.success && data.user) {
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('lifequest_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('[AuthContext] Session restore failed:', err.message);
        localStorage.removeItem('lifequest_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Listen for unauthorized events dispatched by API services on 401
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('[AuthContext] Session expired or unauthorized response received. Logging out.');
      localStorage.removeItem('lifequest_token');
      setToken(null);
      setUser(null);
    };

    window.addEventListener('lifequest:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('lifequest:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {

    setError(null);
    try {
      const data = await authService.login(email, password);
      if (data.token && data.user) {
        localStorage.setItem('lifequest_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const data = await authService.register(name, email, password);
      if (data.token && data.user) {
        localStorage.setItem('lifequest_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = (updatedUser) => {
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const refetchUser = async () => {
    const storedToken = localStorage.getItem('lifequest_token') || token;
    if (!storedToken) return;
    try {
      const data = await authService.getMe(storedToken);
      if (data.success && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.warn('[AuthContext] Refetch user failed:', err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('lifequest_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        updateUser,
        refetchUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
