import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { API } from '../../services/api';

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const toggleSidebar = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setIsMobileOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };

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
        className={`flex-1 min-h-screen transition-[margin] duration-200 pb-16 md:pb-0 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Outlet context={{ toggleSidebar, setIsMobileOpen, setBrandName, isCollapsed, brandName }} />
      </main>

      {/* Bottom Navigation Dock (Visible on Mobile Screens) */}
      <BottomNav setIsMobileOpen={setIsMobileOpen} />
    </div>
  );
}
