import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useRole } from '../ui/RoleGuard';

export function NavItem({ to, icon, label, roles, onClick, badge, isCollapsed }) {
  const { can } = useRole();

  if (roles && roles.length > 0 && !can(roles)) return null;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-150 ${
          isCollapsed ? 'justify-center px-2' : ''
        } ${
          isActive
            ? 'bg-[#2563eb] text-white shadow-md border border-[#60a5fa]/30 font-bold'
            : 'text-[#e2e8f0] hover:bg-white/12 hover:text-white'
        }`
      }
    >
      <span className="text-base flex-shrink-0">
        <Icon icon={icon} className="h-5 w-5" />
      </span>
      {!isCollapsed && <span className="flex-1 truncate">{label}</span>}
      {!isCollapsed && badge !== undefined && badge !== null && (
        <span style={{
          background: '#ef4444',
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

export function NavSection({ label, children, roles, isCollapsed }) {
  const { can } = useRole();

  if (roles && roles.length > 0 && !can(roles)) return null;

  const validChildren = React.Children.toArray(children).filter(Boolean);
  if (validChildren.length === 0) return null;

  return (
    <div className="mb-4">
      {!isCollapsed && (
        <div className="px-3 pb-2 text-[0.7rem] font-extrabold uppercase tracking-widest text-[#93c5fd]">
          {label}
        </div>
      )}
      <div className="space-y-1">
        {React.Children.map(validChildren, child =>
          React.isValidElement(child) ? React.cloneElement(child, { isCollapsed }) : child
        )}
      </div>
    </div>
  );
}
