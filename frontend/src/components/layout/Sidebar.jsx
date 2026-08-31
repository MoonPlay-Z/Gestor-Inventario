import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../../context/AuthContext';
import { NavItem, NavSection, ROLE_GROUPS } from '../ui';

// ─── Iconos ─────────────────────────────────────────────────────────────────
import closeIcon from '@iconify/icons-mdi/close';
import logoutIcon from '@iconify/icons-mdi/logout';
import chevronLeftIcon from '@iconify/icons-mdi/chevron-left';
import chevronRightIcon from '@iconify/icons-mdi/chevron-right';
import packageIcon from '@iconify/icons-mdi/package-variant';
import dashboardIcon from '@iconify/icons-mdi/view-dashboard';
import cartIcon from '@iconify/icons-mdi/cart';
import fileDocIcon from '@iconify/icons-mdi/file-document-outline';
import clipboardIcon from '@iconify/icons-mdi/clipboard-list';
import cashMultipleIcon from '@iconify/icons-mdi/cash-multiple';
import cashRegIcon from '@iconify/icons-mdi/cash-register';
import accountGroupIcon from '@iconify/icons-mdi/account-group';
import accountKeyIcon from '@iconify/icons-mdi/account-key';
import bellRingIcon from '@iconify/icons-mdi/bell-ring';
import cogIcon from '@iconify/icons-mdi/cog';

const ROL_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  EMPRESA: 'Empresa',
  CAJA: 'Cajero',
  INVENTARIO: 'Inventario',
};

export function Sidebar({ isMobileOpen, isCollapsed, setIsMobileOpen, toggleSidebar, brandName }) {
  const { user, logout } = useAuth();
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
      className={`fixed top-0 left-0 z-50 h-full overflow-y-auto border-r border-[#1e40af]/40 transition-all duration-300 ${
        isCollapsed ? 'md:w-20 w-64' : 'w-64'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      style={{
        background: 'linear-gradient(180deg, #0b4f9c 0%, #022a5e 100%)',
        color: '#ffffff'
      }}
    >
      {/* ── Brand & Toggle Button Header ───────────────────────── */}
      <div className={`flex items-center justify-between gap-2 px-4 py-4 border-b border-white/15 bg-black/10 ${
        isCollapsed ? 'md:justify-center md:px-2' : ''
      }`}>
        <div className="flex items-center gap-3 truncate">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-white font-extrabold">
            <Icon icon={packageIcon} className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 id="brand-name" className="text-base font-black text-white tracking-tight truncate leading-tight">
                {brandName || 'GestorPOS'}
              </h1>
              <p className="text-[0.7rem] text-[#93c5fd] font-medium">Sistema Multi-Tenant</p>
            </div>
          )}
        </div>

        {/* Desktop Expand / Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition items-center justify-center"
          title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          aria-label="Contraer o expandir barra lateral"
        >
          <Icon icon={isCollapsed ? chevronRightIcon : chevronLeftIcon} className="h-5 w-5" />
        </button>

        {/* Mobile Close Button */}
        <button
          className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition md:hidden"
          onClick={closeMobile}
          aria-label="Cerrar menú"
        >
          <Icon icon={closeIcon} className="h-5 w-5" />
        </button>
      </div>

      {/* ── Navigation Links ──────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-4 w-full">

        <NavSection label="Principal" isCollapsed={isCollapsed}>
          <NavItem to="/dashboard" icon={dashboardIcon} label="Dashboard"
            roles={ROLE_GROUPS.ALL} onClick={closeMobile} isCollapsed={isCollapsed} />
        </NavSection>

        <NavSection label="Operaciones" roles={ROLE_GROUPS.VENTAS} isCollapsed={isCollapsed}>
          <NavItem to="/pos" icon={cartIcon} label="Nueva Factura"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={isCollapsed} />
          <NavItem to="/cotizaciones" icon={fileDocIcon} label="Cotizaciones"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={isCollapsed} />
          <NavItem to="/ventas" icon={clipboardIcon} label="Historial Ventas"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={isCollapsed} />
          <NavItem to="/pagos" icon={cashMultipleIcon} label="Cuentas por Cobrar"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={isCollapsed} />
          <NavItem to="/caja" icon={cashRegIcon} label="Cierre de Caja"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={isCollapsed} />
        </NavSection>

        <NavSection label="Administración" isCollapsed={isCollapsed}>
          <NavItem to="/inventario" icon={packageIcon} label="Inventario"
            roles={ROLE_GROUPS.INVENTARIO} onClick={closeMobile} isCollapsed={isCollapsed} />
          <NavItem to="/clientes" icon={accountGroupIcon} label="Clientes"
            roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={isCollapsed} />
          <NavItem to="/usuarios" icon={accountKeyIcon} label="Usuarios / Cajas"
            roles={ROLE_GROUPS.ADMIN_ONLY} onClick={closeMobile} isCollapsed={isCollapsed} />
          <NavItem to="/activaciones" icon={bellRingIcon} label="Historial Activaciones"
            roles={ROLE_GROUPS.SUPER_ADMIN_ONLY} onClick={closeMobile} isCollapsed={isCollapsed} />
        </NavSection>

        <NavSection label="Ajustes" roles={ROLE_GROUPS.ADMIN_ONLY} isCollapsed={isCollapsed}>
          <NavItem to="/config" icon={cogIcon} label="Configuración"
            roles={ROLE_GROUPS.ADMIN_ONLY} onClick={closeMobile} isCollapsed={isCollapsed} />
        </NavSection>

      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className={`p-3 border-t border-white/15 bg-black/15 flex flex-col gap-2 ${
        isCollapsed ? 'items-center px-2' : ''
      }`}>
        {/* Info de usuario */}
        {!isCollapsed ? (
          <div className="rounded-xl border border-white/15 bg-white/10 p-2.5 text-xs">
            <div className="truncate font-bold text-white">
              {user?.nombre || user?.username || 'Usuario'}
            </div>
            <div className="mt-0.5 text-[0.7rem] text-[#93c5fd] truncate">
              {ROL_LABEL[user?.rol] || user?.rol} · @{user?.username || ''}
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-xs font-bold text-white" title={user?.nombre || user?.username}>
            {(user?.nombre || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
        )}

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          title="Cerrar Sesión"
          className={`rounded-xl border border-red-400/30 bg-red-500/20 hover:bg-red-500/30 text-white text-xs font-bold py-2.5 transition flex items-center justify-center gap-2 ${
            isCollapsed ? 'w-10 h-10 p-0' : 'w-full px-3'
          }`}
        >
          <Icon icon={logoutIcon} className="h-4 w-4 text-red-200" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
