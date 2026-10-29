import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ResponsiveTables } from './ResponsiveTables';
import { AlertaTasaDolar } from '../widgets/AlertaTasaDolar';
import { ActualizarApk } from '../app/ActualizarApk';
import { API } from '../../services/api';
import { useMediaQuery, QUERY_NAVEGACION_MOVIL } from '../../hooks/useMediaQuery';

const DESKTOP_BREAKPOINT = 1024;

export default function Layout() {
  const esTelefono = useMediaQuery(QUERY_NAVEGACION_MOVIL);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= DESKTOP_BREAKPOINT && window.innerWidth < 1600;
  });
  const [brandName, setBrandName] = useState('GestorPOS');

  useEffect(() => {
    API.getConfig()
      .then(config => {
        if (config?.empresa?.nombre) {
          setBrandName(config.empresa.nombre);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const handleResize = (e) => {
      if (!e.matches) {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };
    mq.addEventListener('change', handleResize);
    return () => mq.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    if (!esTelefono) setIsMobileOpen(false);
  }, [esTelefono]);

  const toggleSidebar = () => {
    if (esTelefono) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

  // En teléfono (incluido el horizontal) el contenido ocupa todo el ancho:
  // el menú vive en un cajón y la navegación en el dock inferior.
  const clasesMain = esTelefono ? 'pb-16' : 'md:ml-72 md:pb-0';

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity ${esTelefono ? '' : 'hidden'}`}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        setIsMobileOpen={setIsMobileOpen}
        toggleSidebar={toggleSidebar}
        brandName={brandName}
        esTelefono={esTelefono}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`flex-1 min-h-screen transition-[margin] duration-200 ${clasesMain}`}
      >
        <Outlet context={{ toggleSidebar, setIsMobileOpen, setBrandName, isCollapsed, brandName }} />
      </main>

      {/* Bottom Navigation Dock (Visible on Mobile Screens) */}
      <BottomNav setIsMobileOpen={setIsMobileOpen} visible={esTelefono} isMenuOpen={isMobileOpen} />

      {/* Adapta las tablas del contenido a tarjetas en móvil (solo presentación) */}
      <ResponsiveTables />

      {/* Recordatorio de la tasa: una vez al día, al iniciar sesión. */}
      <AlertaTasaDolar />

      {/* Aviso de nueva APK: una consulta diaria, nunca durante una venta. */}
      <ActualizarApk />
    </div>
  );
}
