import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NavItem, NavSection, ROLE_GROUPS } from '../ui';

// ─── Iconos ─────────────────────────────────────────────────────────────────
import closeIcon from '@iconify/icons-mdi/close';
import logoutIcon from '@iconify/icons-mdi/logout';
import sunIcon from '@iconify/icons-mdi/weather-sunny';
import moonIcon from '@iconify/icons-mdi/weather-night';
import dashboardIcon from '@iconify/icons-mdi/view-dashboard';
import cartIcon from '@iconify/icons-mdi/cart';
import fileDocIcon from '@iconify/icons-mdi/file-document-outline';
import clipboardIcon from '@iconify/icons-mdi/clipboard-list';
import cashMultipleIcon from '@iconify/icons-mdi/cash-multiple';
import cashRegIcon from '@iconify/icons-mdi/cash-register';
import packageIcon from '@iconify/icons-mdi/package-variant';
import accountGroupIcon from '@iconify/icons-mdi/account-group';
import accountKeyIcon from '@iconify/icons-mdi/account-key';
import bellRingIcon from '@iconify/icons-mdi/bell-ring';
import cogIcon from '@iconify/icons-mdi/cog';

// ─── Mapa de etiquetas de rol ────────────────────────────────────────────────
const ROL_LABEL = {
  SUPER_ADMIN: 'Super Administrador',
  EMPRESA: 'Empresa',
  CAJA: 'Operador de Caja',
  INVENTARIO: 'Inventario',
};

export function Sidebar({ isMobileOpen, isCollapsed, setIsMobileOpen, brandName }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <aside
      id="sidebar"
      className={`fixed top-0 left-0 z-50 h-full overflow-y-auto bg-[var(--surface)] border-r border-[var(--border)] text-[var(--text-primary)] transition-all duration-200 ${isCollapsed ? 'md:w-20 w-64' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      style={{ minWidth: '16rem' }}
    >
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div className={`flex items-center justify-between gap-3 px-4 py-5 border-b border-[var(--border)] bg-[var(--surface2)] ${isCollapsed ? 'justify-center' : ''}`}>
        <div className={isCollapsed ? 'hidden md:block' : ''}>
          <h1 id="brand-name" className="text-lg font-black text-[var(--text-primary)] tracking-tight">
            {brandName || 'Sistema POS'}
          </h1>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Gestión Integral</p>
        </div>
        <button
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface3)] px-2 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--surface2)] md:hidden"
          onClick={closeMobile}
          aria-label="Cerrar menú"
        >
          <Icon icon={closeIcon} className="h-4 w-4" />
        </button>
      </div>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-5 space-y-6 w-full min-w-[16rem]">

        <NavSection label="Principal">
          <NavItem to="/dashboard" icon={dashboardIcon} label="Dashboard"
            roles={ROLE_GROUPS.ALL} onClick={closeMobile} />
        </NavSection>

        <NavSection label="Operaciones" roles={ROLE_GROUPS.VENTAS}>
          <NavItem to="/pos" icon={cartIcon} label="Nueva Factura"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} />
          <NavItem to="/cotizaciones" icon={fileDocIcon} label="Cotizaciones"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} />
          <NavItem to="/ventas" icon={clipboardIcon} label="Historial de Ventas"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} />
          <NavItem to="/pagos" icon={cashMultipleIcon} label="Cuentas por Cobrar"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} />
          <NavItem to="/caja" icon={cashRegIcon} label="Cierre de Caja"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} />
        </NavSection>

        <NavSection label="Administración">
          <NavItem to="/inventario" icon={packageIcon} label="Inventario"
            roles={ROLE_GROUPS.INVENTARIO} onClick={closeMobile} />
          <NavItem to="/clientes" icon={accountGroupIcon} label="Clientes"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} />
          <NavItem to="/usuarios" icon={accountKeyIcon} label="Usuarios / Cajas"
            roles={ROLE_GROUPS.ADMIN_ONLY} onClick={closeMobile} />
          <NavItem to="/activaciones" icon={bellRingIcon} label="Historial Activaciones"
            roles={ROLE_GROUPS.SUPER_ADMIN_ONLY} onClick={closeMobile} />
        </NavSection>

        <NavSection label="Ajustes" roles={ROLE_GROUPS.ADMIN_ONLY}>
          <NavItem to="/config" icon={cogIcon} label="Configuración"
            roles={ROLE_GROUPS.ADMIN_ONLY} onClick={closeMobile} />
        </NavSection>

      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-4 py-4 border-t border-[var(--border)] bg-[var(--surface2)]">
        {/* Info de usuario */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface3)] p-3 text-sm">
          <div className="truncate font-semibold text-[var(--text-primary)]">
            {user?.nombre || user?.username || 'Usuario'}
          </div>
          <div className="mt-1 text-xs text-[var(--text-secondary)]">
            {ROL_LABEL[user?.rol] || user?.rol} · @{user?.username || ''}
          </div>
        </div>

        {/* Toggle tema */}
        <button
          onClick={toggleTheme}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface3)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface2)] transition flex items-center justify-center gap-2"
        >
          <Icon icon={theme === 'dark' ? sunIcon : moonIcon} className="h-4 w-4" />
          {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        </button>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="rounded-2xl border border-rose-500 bg-rose-600/10 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/10 transition flex items-center justify-center gap-2"
        >
          <Icon icon={logoutIcon} className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
