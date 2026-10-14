import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    const handleSubscriptionExpired = () => {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      savedUser.subscriptionStatus = 'expired_trial';
      setUser(savedUser);
      localStorage.setItem('user', JSON.stringify(savedUser));
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('subscription:expired', handleSubscriptionExpired);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('subscription:expired', handleSubscriptionExpired);
    };
  }, []);

  const [empresa, setEmpresa] = useState(() => {
    const saved = localStorage.getItem('empresa');
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (userData, userToken, empresaData) => {
    setUser(userData);
    setToken(userToken);
    if (empresaData) {
      setEmpresa(empresaData);
      localStorage.setItem('empresa', JSON.stringify(empresaData));
    }
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setEmpresa(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('empresa');
  };

  const updateEmpresa = (empresaData) => {
    setEmpresa(empresaData);
    localStorage.setItem('empresa', JSON.stringify(empresaData));
  };

  const isExpired = user && (user.subscriptionStatus === 'expired_trial' || user.subscriptionStatus === 'canceled');

  return (
    <AuthContext.Provider value={{ user, token, empresa, loginUser, logout, updateEmpresa, isExpired }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
