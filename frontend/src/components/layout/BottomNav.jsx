import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import dashboardIcon from '@iconify/icons-mdi/view-dashboard';
import cartIcon from '@iconify/icons-mdi/cart';
import packageIcon from '@iconify/icons-mdi/package-variant';
import cashRegIcon from '@iconify/icons-mdi/cash-register';
import menuIcon from '@iconify/icons-mdi/menu';
import cashCheckIcon from '@iconify/icons-mdi/cash-check';

/**
 * Navegación inferior (dock) para móvil.
 *
 * Formato: barra blanca fija al borde inferior, 6 destinos espaciados de
 * forma uniforme, cada uno con el icono encima y la etiqueta debajo.
 * - Iconos azules (el activo más intenso para marcar la sección actual).
 * - Etiquetas oscuras, legibles sobre fondo claro.
 * - Objetivo táctil ≥ 44px y safe-area inferior para iOS.
 */
const ITEMS = [
  { to: '/dashboard', label: 'Inicio', icon: dashboardIcon },
  { to: '/pos', label: 'Vender', icon: cartIcon },
  { to: '/inventario', label: 'Stock', icon: packageIcon },
  { to: '/cxc', label: 'Cobrar', icon: cashCheckIcon },
  { to: '/caja', label: 'Caja', icon: cashRegIcon },
];

export function BottomNav({ setIsMobileOpen, visible = true }) {
  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] ${visible ? '' : 'hidden'}`}
      style={{
        boxShadow: '0 -2px 12px rgba(15, 23, 42, 0.06)',
        // Pantalla completa: deja libre el lente (izq./der.) y la píldora de gestos.
        paddingBottom: 'var(--safe-bottom, 0px)',
        paddingLeft: 'var(--safe-left, 0px)',
        paddingRight: 'var(--safe-right, 0px)',
      }}
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch justify-around">
        {ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors ${
                isActive ? 'text-[#2563eb]' : 'text-[#93c5fd] hover:text-[#2563eb]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon icon={icon} className="h-6 w-6" />
                <span
                  className={`text-[0.7rem] leading-none ${
                    isActive ? 'font-bold text-[#1e40af]' : 'font-medium text-[#334155]'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] text-[#93c5fd] hover:text-[#2563eb] transition-colors"
          aria-label="Abrir menú"
        >
          <Icon icon={menuIcon} className="h-6 w-6" />
          <span className="text-[0.7rem] leading-none font-medium text-[#334155]">Menú</span>
        </button>
      </div>
    </nav>
  );
}
