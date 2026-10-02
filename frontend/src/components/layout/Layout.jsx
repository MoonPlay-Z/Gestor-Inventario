import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { API } from '../../services/api';

const MOBILE_BREAKPOINT = 767;
const DESKTOP_BREAKPOINT = 1024;

export default function Layout() {
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

  const toggleSidebar = () => {
    if (window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

  const sidebarWidth = 'md:ml-72';

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
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
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`flex-1 min-h-screen transition-[margin] duration-200 pb-16 md:pb-0 ${sidebarWidth}`}
      >
        <Outlet context={{ toggleSidebar, setIsMobileOpen, setBrandName, isCollapsed, brandName }} />
      </main>

      {/* Bottom Navigation Dock (Visible on Mobile Screens) */}
      <BottomNav setIsMobileOpen={setIsMobileOpen} />
    </div>
  );
}
