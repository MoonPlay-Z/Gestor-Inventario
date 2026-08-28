/**
 * NavItem — Ítem individual de navegación con soporte de rol
 *
 * Props:
 *   to      — ruta React Router
 *   icon    — objeto de icono @iconify
 *   label   — texto del enlace
 *   roles   — array de roles permitidos (omitir = visible para todos)
 *   onClick — callback opcional (ej. cerrar el menú móvil)
 *   badge   — número o string para mostrar como badge (ej. notificaciones)
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useRole } from '../ui/RoleGuard';

export function NavItem({ to, icon, label, roles, onClick, badge }) {
  const { can } = useRole();

  // Si el ítem requiere roles y el usuario no los tiene, no renderizar
  if (roles && roles.length > 0 && !can(roles)) return null;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-primary/15 text-white shadow-[0_12px_32px_-18px_rgba(99,102,241,0.8)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--surface3)] hover:text-[var(--text-primary)]'
        }`
      }
    >
      <span className="text-base">
        <Icon icon={icon} className="h-5 w-5" />
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge !== null && (
        <span style={{
          background: 'var(--danger)',
          color: '#fff',
          borderRadius: '999px',
          fontSize: '0.65rem',
          fontWeight: 700,
          padding: '1px 6px',
          lineHeight: '1.4',
        }}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

/**
 * NavSection — Sección agrupada de ítems de navegación
 *
 * Props:
 *   label    — título de la sección (ej. "Operaciones")
 *   children — <NavItem> elementos
 *   roles    — si la sección entera debe ocultarse para ciertos roles
 */
export function NavSection({ label, children, roles }) {
  const { can } = useRole();

  if (roles && roles.length > 0 && !can(roles)) return null;

  // Filtrar hijos nulos (NavItems que no pasaron su propio filtro de rol)
  const validChildren = React.Children.toArray(children).filter(Boolean);
  if (validChildren.length === 0) return null;

  return (
    <div>
      <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
        {label}
      </div>
      <div className="space-y-1">
        {validChildren}
      </div>
    </div>
  );
}
