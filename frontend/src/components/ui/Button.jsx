/**
 * Button — Componente de botón centralizado
 *
 * Variantes: primary | secondary | danger | success | ghost | outline
 * Tamaños  : sm | md (default) | lg | icon
 *
 * Props:
 *  variant   — estilo visual
 *  size      — tamaño
 *  loading   — muestra spinner y bloquea el botón
 *  icon      — icono @iconify a la izquierda
 *  iconRight — icono @iconify a la derecha
 *  as        — tag alternativo ('a', 'div', etc.)
 *  roles     — array de roles permitidos; si el usuario no coincide, oculta el botón
 *  ...rest   — cualquier prop HTML nativa (onClick, disabled, type, title, etc.)
 */
import React from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '../../context/AuthContext';

const VARIANT_CLASSES = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger:    'btn btn-danger',
  success:   'btn btn-success',
  ghost:     'btn btn-ghost',
  outline:   'btn btn-secondary',
};

const SIZE_CLASSES = {
  sm:   'btn-sm',
  md:   '',
  lg:   'btn-lg',
  icon: 'btn-icon',
};

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  as: Tag = 'button',
  roles,
  className = '',
  disabled,
  ...rest
}) {
  const { user } = useAuth();

  // Guardia de roles: si el botón tiene roles asignados y el usuario no califica, no renderizar
  if (roles && roles.length > 0) {
    const userRole = user?.rol || 'EMPRESA';
    if (!roles.includes(userRole)) return null;
  }

  const classes = [
    VARIANT_CLASSES[variant] || VARIANT_CLASSES.secondary,
    SIZE_CLASSES[size] || '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      className={classes}
      disabled={loading || disabled}
      {...rest}
    >
      {loading ? (
        <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
      ) : icon ? (
        <Icon icon={icon} className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      ) : null}

      {size !== 'icon' && children}

      {!loading && iconRight && (
        <Icon icon={iconRight} className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      )}
    </Tag>
  );
}
