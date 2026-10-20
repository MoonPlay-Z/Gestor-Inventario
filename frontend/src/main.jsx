import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './css/main.css';
import './css/movil.css';
import './css/escaner.css';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { instalarDescargasNativas } from './utils/descargas';

// En la app Android, los reportes (CSV/PDF) y el respaldo JSON se guardan en
// Descargas a través del puente nativo; en la web no hace nada.
instalarDescargasNativas();

/**
 * Retira la pantalla de carga del HTML cuando React ya pintó la app.
 * En la app nativa espera un mínimo de 600 ms para que el logo y el nombre se
 * lean (no es un parpadeo); en la web se retira de inmediato.
 */
function QuitarSplash() {
  React.useEffect(() => {
    const splash = document.getElementById('boot-splash');
    if (!splash) return undefined;

    const minimo = window.AndroidDownloads ? 600 : 0;
    const espera = Math.max(0, minimo - performance.now());

    const temporizador = setTimeout(() => {
      splash.classList.add('boot-out');
      setTimeout(() => splash.remove(), 240);
    }, espera);

    return () => clearTimeout(temporizador);
  }, []);

  return null;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <QuitarSplash />
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

// ── Service Worker (PWA) ──────────────────────────────────────────────────────
// Sólo en producción: en desarrollo Vite sirve módulos sin hash y el SW
// interferiría con HMR. Con esto la app es instalable y navegable sin red.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] No se pudo registrar el service worker:', err);
    });
  });
}
