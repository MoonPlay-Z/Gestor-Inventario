import React, { createContext, useContext, useState, useEffect } from 'react';
import { refreshAccessToken, setRefreshToken } from '../services/api';

const AuthContext = createContext();

/**
 * Lee y parsea una clave de `localStorage` sin tumbar la app si el valor está
 * corrupto. `JSON.parse` lanza con el literal `"undefined"` (lo que deja
 * `JSON.stringify(undefined)`), y ese error ocurría durante el render inicial,
 * dejando la pantalla en blanco. Ante un valor inválido se limpia la clave.
 */
function leerJSON(key, fallback = null) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') return fallback;
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => leerJSON('user'));

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    const handleSubscriptionExpired = () => {
      const savedUser = leerJSON('user', {});
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

  // Refresco proactivo: si el access token (12h) está por vencer o venció y
  // hay un refresh token (30d), renueva al montar la app. Así en móvil no hay
  // relogin diario. Si el refresh falla, el reintento 401 de request() cierra
  // la sesión (no se fuerza un logout aquí para no interrumpir al usuario).
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expMs = payload.exp ? payload.exp * 1000 : null;
      if (!expMs) return;
      if (expMs - Date.now() < 5 * 60 * 1000) {
        refreshAccessToken().catch(() => {});
      }
    } catch { /* token malformado: lo manejará el 401-retry */ }
  }, []);

  const [empresa, setEmpresa] = useState(() => leerJSON('empresa'));

  const loginUser = (userData, userToken, empresaData, refreshToken) => {
    setUser(userData);
    setToken(userToken);
    if (empresaData) {
      setEmpresa(empresaData);
      localStorage.setItem('empresa', JSON.stringify(empresaData));
    }
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setRefreshToken(refreshToken || null);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setEmpresa(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('empresa');
    setRefreshToken(null);
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
