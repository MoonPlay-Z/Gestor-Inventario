/**
 * Button — Componente de botón centralizado (CSS Modules)
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
import styles from './Button.module.css';

const VARIANT_CLASSES = {
  primary:   styles.btnPrimary,
  secondary: styles.btnSecondary,
  danger:    styles.btnDanger,
  success:   styles.btnSuccess,
  ghost:     styles.btnGhost,
  outline:   styles.btnSecondary,
};

const SIZE_CLASSES = {
  sm:   styles.btnSm,
  md:   '',
  lg:   styles.btnLg,
  icon: styles.btnIcon,
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
  type,
  ...rest
}) {
  const { user } = useAuth();

  // Guardia de roles: si el botón tiene roles asignados y el usuario no califica, no renderizar
  if (roles && roles.length > 0) {
    const userRole = user?.rol || 'EMPRESA';
    if (!roles.includes(userRole)) return null;
  }

  const classes = [
    styles.btn,
    VARIANT_CLASSES[variant] || VARIANT_CLASSES.secondary,
    SIZE_CLASSES[size] || '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      className={classes}
      disabled={loading || disabled}
      type={Tag === 'button' ? (type || 'button') : type}
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
