/**
 * RoleGuard — Wrapper declarativo para control de acceso por rol
 *
 * Uso:
 *   <RoleGuard roles={['EMPRESA']}>
 *     <SensitiveComponent />
 *   </RoleGuard>
 *
 *   <RoleGuard roles={['EMPRESA']} fallback={<ReadOnlyView />}>
 *     <EditView />
 *   </RoleGuard>
 *
 * Props:
 *   roles    — array de roles con acceso. Si está vacío/undefined, permite todos.
 *   fallback — nodo a renderizar si el usuario no tiene el rol. Default: null
 *   invert   — si true, oculta el contenido para los roles indicados (blacklist)
 */
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export function RoleGuard({ children, roles, fallback = null, invert = false }) {
  const { user } = useAuth();
  const userRole = user?.rol || 'EMPRESA';

  if (!roles || roles.length === 0) return children;

  const hasRole = roles.includes(userRole);
  const shouldShow = invert ? !hasRole : hasRole;

  return shouldShow ? children : fallback;
}

/**
 * useRole — Hook para leer el rol del usuario actual y compararlo
 *
 * const { rol, is, can } = useRole();
 * rol              → 'EMPRESA' | 'CAJA' | 'INVENTARIO'
 * is('EMPRESA')    → true/false
 * can(['EMPRESA', 'CAJA']) → true/false
 */
export function useRole() {
  const { user } = useAuth();
  const rol = user?.rol || null;

  return {
    rol,
    is: (r) => rol === r,
    can: (roles) => roles.includes(rol),
  };
}

/**
 * ROLES — Constantes centralizadas de roles del sistema
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  EMPRESA:     'EMPRESA',
  CAJA:        'CAJA',
  INVENTARIO:  'INVENTARIO',
  VISOR:       'VISOR',
};

/** Grupos de roles predefinidos para uso frecuente */
export const ROLE_GROUPS = {
  /** Exclusivo Super Administrador del sistema SaaS */
  SUPER_ADMIN_ONLY:  [ROLES.SUPER_ADMIN],
  /** Solo el administrador de la empresa y Super Admin */
  ADMIN_ONLY:        [ROLES.EMPRESA, ROLES.SUPER_ADMIN],
  /** Quienes pueden operar ventas */
  VENTAS:            [ROLES.EMPRESA, ROLES.CAJA, ROLES.SUPER_ADMIN],
  /** Quienes pueden ver/gestionar inventario */
  INVENTARIO:        [ROLES.EMPRESA, ROLES.INVENTARIO, ROLES.SUPER_ADMIN],
  /** Quienes pueden usar el visor de precios */
  VISOR_ONLY:        [ROLES.EMPRESA, ROLES.CAJA, ROLES.INVENTARIO, ROLES.VISOR, ROLES.SUPER_ADMIN],
  /** Todos los roles */
  ALL:               [ROLES.SUPER_ADMIN, ROLES.EMPRESA, ROLES.CAJA, ROLES.INVENTARIO, ROLES.VISOR],
};
