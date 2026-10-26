import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, isExpired } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isExpired && user?.rol !== 'SUPER_ADMIN' && location.pathname !== '/suscripcion-expirada') {
    return <Navigate to="/suscripcion-expirada" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.rol || 'EMPRESA')) {
    return <Navigate to={user.rol === 'SUPER_ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}
