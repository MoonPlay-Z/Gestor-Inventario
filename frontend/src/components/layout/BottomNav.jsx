import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import dashboardIcon from '@iconify/icons-mdi/view-dashboard';
import cartIcon from '@iconify/icons-mdi/cart';
import packageIcon from '@iconify/icons-mdi/package-variant';
import cashRegIcon from '@iconify/icons-mdi/cash-register';
import menuIcon from '@iconify/icons-mdi/menu';

export function BottomNav({ setIsMobileOpen }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)] border-t border-[var(--border)] px-2 py-2 shadow-lg flex items-center justify-around">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[0.7rem] font-semibold p-1 transition ${
            isActive ? 'text-[#2563eb]' : 'text-[var(--text-secondary)]'
          }`
        }
      >
        <Icon icon={dashboardIcon} className="h-5 w-5" />
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="/pos"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[0.7rem] font-semibold p-1 transition ${
            isActive ? 'text-[#2563eb]' : 'text-[var(--text-secondary)]'
          }`
        }
      >
        <Icon icon={cartIcon} className="h-5 w-5" />
        <span>Vender</span>
      </NavLink>

      <NavLink
        to="/inventario"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[0.7rem] font-semibold p-1 transition ${
            isActive ? 'text-[#2563eb]' : 'text-[var(--text-secondary)]'
          }`
        }
      >
        <Icon icon={packageIcon} className="h-5 w-5" />
        <span>Stock</span>
      </NavLink>

      <NavLink
        to="/caja"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[0.7rem] font-semibold p-1 transition ${
            isActive ? 'text-[#2563eb]' : 'text-[var(--text-secondary)]'
          }`
        }
      >
        <Icon icon={cashRegIcon} className="h-5 w-5" />
        <span>Caja</span>
      </NavLink>

      <button
        onClick={() => setIsMobileOpen(prev => !prev)}
        className="flex flex-col items-center gap-1 text-[0.7rem] font-semibold p-1 text-[var(--text-secondary)] hover:text-[#2563eb] transition"
      >
        <Icon icon={menuIcon} className="h-5 w-5" />
        <span>Menú</span>
      </button>
    </div>
  );
}
