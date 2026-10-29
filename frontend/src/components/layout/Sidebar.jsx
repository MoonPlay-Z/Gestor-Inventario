import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../../context/AuthContext';
import { NavItem, NavSection, ROLE_GROUPS } from '../ui';
import { API } from '../../services/api';

// ─── Iconos ─────────────────────────────────────────────────────────────────
import closeIcon from '@iconify/icons-mdi/close';
import logoutIcon from '@iconify/icons-mdi/logout';
import packageIcon from '@iconify/icons-mdi/package-variant';
import dashboardIcon from '@iconify/icons-mdi/view-dashboard';
import cartIcon from '@iconify/icons-mdi/cart';
import fileDocIcon from '@iconify/icons-mdi/file-document-outline';
import clipboardIcon from '@iconify/icons-mdi/clipboard-list';
import cashRegIcon from '@iconify/icons-mdi/cash-register';
import accountGroupIcon from '@iconify/icons-mdi/account-group';
import accountKeyIcon from '@iconify/icons-mdi/account-key';
import bellRingIcon from '@iconify/icons-mdi/bell-ring';
import cogIcon from '@iconify/icons-mdi/cog';
import chartBarIcon from '@iconify/icons-mdi/chart-bar';
import cashCheckIcon from '@iconify/icons-mdi/cash-check';
import closeCircleIcon from '@iconify/icons-mdi/close-circle-outline';
import downloadIcon from '@iconify/icons-mdi/download';
import searchIcon from '@iconify/icons-mdi/magnify';

const ROL_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  EMPRESA: 'Empresa',
  CAJA: 'Cajero',
  INVENTARIO: 'Inventario',
  VISOR: 'Visor de Precios',
};

export function Sidebar({ isMobileOpen, isCollapsed, setIsMobileOpen, toggleSidebar, brandName, esTelefono = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cxCvencidas, setCxCvencidas] = useState(0);
  const [busquedaMovil, setBusquedaMovil] = useState('');
  const busquedaNormalizada = busquedaMovil.trim().toLocaleLowerCase();
  const coincideBusqueda = (...textos) =>
    !busquedaNormalizada || textos.some((texto) => texto.toLocaleLowerCase().includes(busquedaNormalizada));

  const closeMobile = () => setIsMobileOpen(false);

  useEffect(() => {
    if (!user || (user.rol !== 'EMPRESA' && user.rol !== 'CAJA')) return;
    const loadCxC = async () => {
      try {
        const data = await API.getCxcResumen();
        setCxCvencidas(data.cantidadVencidas || 0);
      } catch (err) {
        console.error('Error loading CxC resumen in sidebar:', err);
      }
    };
    loadCxC();
    const interval = setInterval(loadCxC, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <aside
      id="sidebar"
      className={`app-sidebar fixed top-0 left-0 z-50 h-full overflow-y-auto border-r border-[#1e40af]/40 transition-all duration-300 w-72 ${
        esTelefono
          ? (isMobileOpen ? 'translate-x-0 mobile-open' : '-translate-x-full')
          : 'translate-x-0'
      }`}
      style={{
        background: esTelefono
          ? 'var(--bg-page)'
          : 'linear-gradient(180deg, #0b4f9c 0%, #022a5e 100%)',
        color: '#ffffff',
        // Pantalla completa: el panel sigue llegando al borde, pero el
        // contenido no queda bajo el lente ni bajo la barra de estado.
        paddingTop: 'var(--safe-top, 0px)',
        paddingLeft: 'var(--safe-left, 0px)'
      }}
    >
      <div className="sidebar-mobile-header">
        <div className="sidebar-mobile-status">
          <span><i /> Sesión activa · {ROL_LABEL[user?.rol] || user?.rol || 'Usuario'}</span>
          <strong>{user?.rol === 'CAJA' ? 'CAJERO' : user?.rol === 'SUPER_ADMIN' ? 'ADMIN' : 'GESTORPOS'}</strong>
        </div>
        <div className="sidebar-mobile-brand">
          <div className="sidebar-mobile-logo"><Icon icon={packageIcon} /></div>
          <div className="sidebar-mobile-identity">
            <strong>{user?.nombre || user?.username || brandName || 'GestorPOS'}</strong>
            <span>{ROL_LABEL[user?.rol] || 'Sistema Administrativo'}</span>
          </div>
          <button type="button" onClick={closeMobile} aria-label="Cerrar menú">
            <Icon icon={closeIcon} />
          </button>
        </div>
        <label className="sidebar-mobile-search">
          <Icon icon={searchIcon} />
          <input
            type="search"
            value={busquedaMovil}
            onChange={(event) => setBusquedaMovil(event.target.value)}
            placeholder="Buscar módulo o función..."
            aria-label="Buscar módulo o función"
          />
        </label>
      </div>

      {/* ── Brand & Toggle Button Header ───────────────────────── */}
      <div className="sidebar-desktop-header flex items-center justify-between gap-2 px-5 py-5 border-b border-white/15 bg-black/10">
        <div className="flex items-center gap-3 truncate">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 text-white font-extrabold">
            <Icon icon={packageIcon} className="h-6 w-6" />
          </div>
          <div className="truncate">
            <h1 id="brand-name" className="text-lg font-black text-white tracking-tight truncate leading-tight">
              {user?.nombre || brandName || 'Sistema Administrativo'}
            </h1>
            <p className="text-xs text-[#93c5fd] font-medium">Sistema Administrativo</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition ${esTelefono ? '' : 'hidden'}`}
          onClick={closeMobile}
          aria-label="Cerrar menú"
        >
          <Icon icon={closeIcon} className="h-5 w-5" />
        </button>
      </div>

      {/* ── Navigation Links ──────────────────────────────────── */}
      <nav className="sidebar-mobile-menu">
        {user?.rol === 'SUPER_ADMIN' ? (
          <div className="sidebar-mobile-feature">
            <NavSection label="Administración" isCollapsed={false}>
              {coincideBusqueda('Panel de Administración', 'Admin') && (
                <NavItem to="/admin" icon={dashboardIcon} label="Panel de Administración"
                  roles={ROLE_GROUPS.SUPER_ADMIN_ONLY} onClick={closeMobile} isCollapsed={false}
                  className="sidebar-mobile-feature-link" />
              )}
              {import.meta.env.DEV && coincideBusqueda('Pruebas de facturas') && (
                <NavItem to="/pruebas/facturas" icon={clipboardIcon} label="Pruebas de facturas"
                  roles={ROLE_GROUPS.SUPER_ADMIN_ONLY} onClick={closeMobile} isCollapsed={false}
                  className="sidebar-mobile-feature-link" />
              )}
            </NavSection>
          </div>
        ) : (
          <>
            <div className="sidebar-mobile-feature">
              <NavSection label="Principal" isCollapsed={false}>
                {coincideBusqueda('Dashboard General', 'Dashboard') && (
                  <NavItem to="/dashboard" icon={dashboardIcon} label="Dashboard General"
                    roles={ROLE_GROUPS.ALL} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-feature-link" />
                )}
              </NavSection>
            </div>

            <div className="sidebar-mobile-operations">
              <NavSection label="Operaciones diarias" isCollapsed={false}>
                {coincideBusqueda('Nueva Factura', 'Ventas') && (
                  <NavItem to="/pos" icon={cartIcon} label="Nueva Factura"
                    roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-tile sidebar-mobile-tone-green"
                    description="Emitir venta POS" />
                )}
                {coincideBusqueda('Visor de Precios', 'Precios') && (
                  <NavItem to="/visor" icon={packageIcon} label="Visor de Precios"
                    roles={ROLE_GROUPS.VISOR_ONLY} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-tile sidebar-mobile-tone-violet"
                    description="Buscar productos y precios" />
                )}
                {coincideBusqueda('Cotizaciones', 'Presupuestos') && (
                  <NavItem to="/cotizaciones" icon={fileDocIcon} label="Cotizaciones"
                    roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-tile sidebar-mobile-tone-blue"
                    description="Crear presupuestos" />
                )}
                {coincideBusqueda('Historial Ventas', 'Tickets') && (
                  <NavItem to="/ventas" icon={clipboardIcon} label="Historial Ventas"
                    roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-tile sidebar-mobile-tone-cyan"
                    description="Tickets y facturas" />
                )}
                {coincideBusqueda('Cuentas por Cobrar', 'Cobrar') && (
                  <NavItem to="/cxc" icon={cashCheckIcon} label="Cuentas por Cobrar"
                    roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false}
                    badge={cxCvencidas > 0 ? cxCvencidas : null}
                    className="sidebar-mobile-tile sidebar-mobile-tone-rose"
                    description="Saldos y cobranza" />
                )}
                {coincideBusqueda('Pagos anulados', 'Anulaciones') && (
                  <NavItem to="/pagos-anulados" icon={closeCircleIcon} label="Pagos anulados"
                    roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-tile sidebar-mobile-tone-orange"
                    description="Auditoría de pagos" />
                )}
                {coincideBusqueda('Cierre de Caja', 'Caja') && (
                  <NavItem to="/caja" icon={cashRegIcon} label="Cierre de Caja"
                    roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-tile sidebar-mobile-tone-blue"
                    description="Aperturas y cierres" />
                )}
                {coincideBusqueda('Reportes', 'Estadísticas') && (
                  <NavItem to="/reportes" icon={chartBarIcon} label="Reportes"
                    roles={ROLE_GROUPS.REPORTES} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-tile sidebar-mobile-tone-violet"
                    description="Estadísticas" />
                )}
              </NavSection>
            </div>

            <div className="sidebar-mobile-list">
              <NavSection label="Administración" isCollapsed={false}>
                {coincideBusqueda('Inventario', 'Stock') && (
                  <NavItem to="/inventario" icon={packageIcon} label="Inventario y Stock"
                    roles={ROLE_GROUPS.INVENTARIO} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-list-link sidebar-mobile-tone-orange"
                    description="Control de almacén y existencias" />
                )}
                {coincideBusqueda('Clientes') && (
                  <NavItem to="/clientes" icon={accountGroupIcon} label="Clientes"
                    roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-list-link sidebar-mobile-tone-cyan"
                    description="Directorio, créditos y contactos" />
                )}
                {coincideBusqueda('Usuarios', 'Cajas', 'Permisos') && (
                  <NavItem to="/usuarios" icon={accountKeyIcon} label="Usuarios / Cajas"
                    roles={ROLE_GROUPS.ADMIN_ONLY} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-list-link sidebar-mobile-tone-rose"
                    description="Permisos, cajas y terminales" />
                )}
              </NavSection>
            </div>

            <div className="sidebar-mobile-settings">
              <NavSection label="Ajustes y sistema" isCollapsed={false}>
                {coincideBusqueda('Configuración', 'Preferencias') && (
                  <NavItem to="/config" icon={cogIcon} label="Configuración"
                    roles={ROLE_GROUPS.ADMIN_ONLY} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-list-link sidebar-mobile-tone-slate"
                    description="Personaliza tasa, empresa e impresión" />
                )}
                {coincideBusqueda('Descargar app', 'Aplicación') && (
                  <NavItem to="/descargar" icon={downloadIcon} label="Descargar app"
                    roles={ROLE_GROUPS.ALL} onClick={closeMobile} isCollapsed={false}
                    className="sidebar-mobile-list-link sidebar-mobile-tone-blue"
                    description="Instala GestorPOS en tu dispositivo" />
                )}
                {coincideBusqueda('Cerrar sesión', 'Salir') && (
                  <button type="button" onClick={handleLogout} className="sidebar-mobile-logout">
                    <span className="sidebar-mobile-logout-icon"><Icon icon={logoutIcon} /></span>
                    <span><strong>Cerrar sesión</strong><small>Salir de tu cuenta de forma segura</small></span>
                    <span aria-hidden="true">›</span>
                  </button>
                )}
              </NavSection>
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-mobile-footer">
        <span>{brandName || 'GestorPOS'} · Sistema Administrativo</span>
      </div>

      <nav className="sidebar-desktop-menu flex-1 px-4 py-4 space-y-5 w-full">

        {/* SuperAdmin: solo ve la página de administración */}
        {user?.rol === 'SUPER_ADMIN' ? (
          <NavSection label="Administración" isCollapsed={false}>
            <NavItem to="/admin" icon={dashboardIcon} label="Panel de Administración"
              roles={ROLE_GROUPS.SUPER_ADMIN_ONLY} onClick={closeMobile} isCollapsed={false} />
            {import.meta.env.DEV && <NavItem to="/pruebas/facturas" icon={clipboardIcon} label="Pruebas de facturas"
              roles={ROLE_GROUPS.SUPER_ADMIN_ONLY} onClick={closeMobile} isCollapsed={false} />}
          </NavSection>
        ) : (
          <>
            <NavSection label="Principal" isCollapsed={false}>
              <NavItem to="/dashboard" icon={dashboardIcon} label="Dashboard"
                roles={ROLE_GROUPS.ALL} onClick={closeMobile} isCollapsed={false} />
            </NavSection>

            <NavSection label="Operaciones" roles={ROLE_GROUPS.VISOR_ONLY} isCollapsed={false}>
              <NavItem to="/pos" icon={cartIcon} label="Nueva Factura"
                roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false} />
              <NavItem to="/visor" icon={packageIcon} label="Visor de Precios"
                roles={ROLE_GROUPS.VISOR_ONLY} onClick={closeMobile} isCollapsed={false} />
              <NavItem to="/cotizaciones" icon={fileDocIcon} label="Cotizaciones"
                roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false} />
              <NavItem to="/ventas" icon={clipboardIcon} label="Historial Ventas"
                roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false} />
              <NavItem to="/cxc" icon={cashCheckIcon} label="Cuentas por Cobrar"
                roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false}
                badge={cxCvencidas > 0 ? cxCvencidas : null} />
              <NavItem to="/pagos-anulados" icon={closeCircleIcon} label="Pagos anulados"
                roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false} />
              <NavItem to="/caja" icon={cashRegIcon} label="Cierre de Caja"
                roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false} />
              <NavItem to="/reportes" icon={chartBarIcon} label="Reportes"
                roles={ROLE_GROUPS.REPORTES} onClick={closeMobile} isCollapsed={false} />
            </NavSection>

            <NavSection label="Administración" isCollapsed={false}>
              <NavItem to="/inventario" icon={packageIcon} label="Inventario"
                roles={ROLE_GROUPS.INVENTARIO} onClick={closeMobile} isCollapsed={false} />
              <NavItem to="/clientes" icon={accountGroupIcon} label="Clientes"
                roles={ROLE_GROUPS.VENTAS} onClick={closeMobile} isCollapsed={false} />
              <NavItem to="/usuarios" icon={accountKeyIcon} label="Usuarios / Cajas"
                roles={ROLE_GROUPS.ADMIN_ONLY} onClick={closeMobile} isCollapsed={false} />
            </NavSection>

            <NavSection label="Ajustes" roles={ROLE_GROUPS.ADMIN_ONLY} isCollapsed={false}>
              <NavItem to="/config" icon={cogIcon} label="Configuración"
                roles={ROLE_GROUPS.ADMIN_ONLY} onClick={closeMobile} isCollapsed={false} />
            </NavSection>

            <NavSection label="Aplicación" isCollapsed={false}>
              <NavItem to="/descargar" icon={downloadIcon} label="Descargar app"
                roles={ROLE_GROUPS.ALL} onClick={closeMobile} isCollapsed={false} />
            </NavSection>
          </>
        )}

      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className={`sidebar-desktop-footer p-3 border-t border-white/15 bg-black/15 flex flex-col gap-2 ${
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
          className={`min-h-[44px] rounded-xl border border-red-400/30 bg-red-500/20 hover:bg-red-500/30 text-white text-xs font-bold py-2.5 transition flex items-center justify-center gap-2 ${
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
