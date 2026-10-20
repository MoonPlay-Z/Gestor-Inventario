import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import arrowLeftIcon from '@iconify/icons-mdi/arrow-left';
import { API_URL } from '../../services/api';

/**
 * Marco visual compartido por login y registro: cabecera con volver + estado
 * del servidor, tarjeta de marca, tarjeta blanca con el formulario y pie.
 * Mantiene el mismo lenguaje en las dos pantallas (móvil primero, 28rem).
 */

const ESTADOS = {
  comprobando: {
    texto: 'Conectando…',
    clases: 'border-slate-200 bg-slate-100 text-slate-600',
    punto: 'bg-slate-400',
  },
  ok: {
    texto: 'Servidor en línea',
    clases: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    punto: 'bg-emerald-500 animate-pulse',
  },
  error: {
    texto: 'Sin conexión',
    clases: 'border-rose-200 bg-rose-50 text-rose-700',
    punto: 'bg-rose-500',
  },
};

/**
 * Comprueba `GET /api/health` usando la misma base que el resto de la app
 * (relativa en la web, absoluta dentro de la APK).
 */
export function useEstadoServidor() {
  const [estado, setEstado] = useState('comprobando');

  useEffect(() => {
    let vigente = true;
    const control = new AbortController();
    const limite = setTimeout(() => control.abort(), 8000);

    fetch(`${API_URL}/health`, { signal: control.signal, cache: 'no-store' })
      .then((respuesta) => {
        if (vigente) setEstado(respuesta.ok ? 'ok' : 'error');
      })
      .catch(() => {
        if (vigente) setEstado('error');
      })
      .finally(() => clearTimeout(limite));

    return () => {
      vigente = false;
      clearTimeout(limite);
      control.abort();
    };
  }, []);

  return estado;
}

export function AuthLayout({ titulo, children }) {
  const estado = useEstadoServidor();
  const badge = ESTADOS[estado];

  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-800"
      style={{ paddingLeft: 'var(--safe-left, 0px)', paddingRight: 'var(--safe-right, 0px)' }}
    >
      <header
        className="auth-header sticky top-0 z-40 w-full border-b border-slate-200/50 bg-slate-50/90 backdrop-blur-md"
        style={{ paddingTop: 'var(--safe-top, 0px)' }}
      >
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-3 md:max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 py-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-800"
          >
            <Icon icon={arrowLeftIcon} className="h-5 w-5" />
            Volver al Inicio
          </Link>

          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${badge.clases}`}
            title="Estado de la conexión con el servidor"
          >
            <span className={`h-2 w-2 rounded-full ${badge.punto}`} />
            {badge.texto}
          </div>
        </div>
      </header>

      <main
        className="auth-main mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4 sm:pt-6 md:max-w-4xl md:justify-center"
        style={{ paddingBottom: 'calc(8px + var(--safe-bottom, 0px))' }}
      >
        <div className="auth-grid md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:items-stretch md:gap-6">
          {/* Tarjeta de marca */}
          <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-b from-brand-600 via-brand-800 to-brand-950 p-6 text-white shadow-xl shadow-blue-950/20 sm:p-7 md:mb-0 md:flex md:flex-col md:justify-center md:p-9">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-sky-400/20 blur-2xl md:h-64 md:w-64" />

            <div className="relative z-10 flex flex-col items-center justify-center py-3 text-center">
              <img
                src="/favicon.png"
                alt=""
                className="mb-4 h-14 w-14 rounded-2xl shadow-lg shadow-blue-950/30 md:h-16 md:w-16"
              />

              <div className="mb-2 flex items-baseline justify-center text-2xl font-bold tracking-tight">
                <span>GestorPOS</span>
                <span className="ml-0.5 text-xl font-bold text-sky-400">.dev</span>
              </div>

              <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                {titulo}
              </h1>

              <p className="auth-hero-sub mt-3 hidden max-w-[16rem] text-sm leading-relaxed text-white/75 md:block">
                Ventas, inventario, cierres de caja y tasa BCV en un solo lugar.
              </p>
            </div>
          </section>

          {/* Tarjeta del formulario */}
          <section className="auth-card flex flex-1 flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-7">
            {children}
          </section>
        </div>

        <footer className="mb-2 mt-6 text-center text-xs text-slate-600">
          <p className="font-medium tracking-wide text-slate-600">
            GestorPOS • Sistema POS e inventario
          </p>
          <p className="mt-1 text-xs font-normal text-slate-500">
            © 2026 GestorPOS.dev • Todos los derechos reservados
          </p>
        </footer>
      </main>
    </div>
  );
}
