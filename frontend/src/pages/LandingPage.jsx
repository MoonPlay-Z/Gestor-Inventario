import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import packageIcon from '@iconify/icons-mdi/package-variant';
import rocketLaunchIcon from '@iconify/icons-mdi/rocket-launch';
import flashIcon from '@iconify/icons-mdi/flash';
import cartIcon from '@iconify/icons-mdi/cart';
import shieldCheckIcon from '@iconify/icons-mdi/shield-check';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Header / Navbar */}
      <header className="border-b border-[var(--border)] px-8 py-4 md:px-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Icon icon={packageIcon} className="h-8 w-8 text-[var(--accent)]" />
          <h1 className="text-xl font-black bg-gradient-to-r from-[#6366f1] via-[#a78bfa] to-[#8b5cf6] bg-clip-text text-transparent">
            Sistema POS SaaS
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 justify-center md:justify-end">
          <Link to="/login" className="btn btn-ghost">
            Iniciar Sesión
          </Link>
          <Link to="/registro" className="btn btn-primary">
            Prueba Gratis (7 Días)
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 py-20 md:px-10 text-center max-w-5xl mx-auto">
        <span className="badge badge-accent inline-flex items-center justify-center px-4 py-2 mb-5 text-sm gap-2">
          <Icon icon={rocketLaunchIcon} className="h-4 w-4" />
          7 Días de Prueba Sin Tarjeta de Crédito
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
          El Sistema POS e Inventario más Completo para tu Negocio
        </h2>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-10">
          Controla ventas en dólares y bolívares con la tasa oficial del BCV en tiempo real. Gestiona stock, cierres de caja, cotizaciones y clientes desde cualquier dispositivo.
        </p>
        <div className="flex flex-col gap-4 justify-center items-center sm:flex-row">
          <Link to="/registro" className="btn btn-primary btn-lg">
            Comenzar Mi Prueba Gratuita
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Acceso Clientes
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 py-16 md:px-10 max-w-[1100px] mx-auto">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-8">
            <div className="text-4xl mb-3"><Icon icon={flashIcon} className="h-10 w-10" /></div>
            <h3 className="text-lg font-bold mb-2">Tasa BCV Automática</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Consulta en tiempo real la tasa oficial del Banco Central de Venezuela y emite facturas multimoneda sin margen de error.
            </p>
          </div>
          <div className="card p-8">
            <div className="text-4xl mb-3"><Icon icon={cartIcon} className="h-10 w-10" /></div>
            <h3 className="text-lg font-bold mb-2">Punto de Venta Rápido</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Interface ultra optimizada para ventas de mostrador con lector de código de barras y múltiples métodos de pago.
            </p>
          </div>
          <div className="card p-8">
            <div className="text-4xl mb-3"><Icon icon={shieldCheckIcon} className="h-10 w-10" /></div>
            <h3 className="text-lg font-bold mb-2">Control de Caja y Roles</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Apertura y cierre de turnos con descuadres automáticos. Restringe permisos para cajeros y personal de almacén.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-8 py-6 text-center text-[var(--text-muted)] text-sm">
        © {new Date().getFullYear()} Sistema POS SaaS. Todos los derechos reservados.
      </footer>
    </div>
  );
}
