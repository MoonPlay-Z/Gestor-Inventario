import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import menuIcon from '@iconify/icons-mdi/menu';
import cartIcon from '@iconify/icons-mdi/cart';
import accountIcon from '@iconify/icons-mdi/account-circle';
import chevronLeftIcon from '@iconify/icons-mdi/chevron-left';
import chevronRightIcon from '@iconify/icons-mdi/chevron-right';
import { useAuth } from '../../context/AuthContext';

export function Header({ title, subtitle, toggleSidebar, setIsMobileOpen, actions, isCollapsed }) {
  const { user } = useAuth();
  const handleToggle = toggleSidebar || (() => setIsMobileOpen?.(prev => !prev));

  return (
    <header className="page-header flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar for Desktop & Mobile Hamburger */}
        <button
          onClick={handleToggle}
          className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition flex items-center justify-center"
          aria-label="Abrir Menú"
        >
          <Icon icon={isCollapsed ? chevronRightIcon : menuIcon} className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-[var(--text-primary)] leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-[var(--text-secondary)] hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {actions}

        {/* Quick POS Action Button (Exact from reference design) */}
        <Link
          to="/pos"
          className="hidden sm:inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs md:text-sm px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <Icon icon={cartIcon} className="h-4 w-4" />
          <span>Realizar Ventas</span>
        </Link>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)] text-xs text-[var(--text-secondary)]">
          <Icon icon={accountIcon} className="h-6 w-6 text-[#2563eb]" />
          <span className="hidden md:inline font-semibold text-[var(--text-primary)]">{user?.nombre || user?.username}</span>
        </div>
      </div>
    </header>
  );
}
