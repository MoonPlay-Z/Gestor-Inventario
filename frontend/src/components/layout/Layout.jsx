import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { API } from '../../services/api';

export default function Layout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [brandName, setBrandName] = useState('Sistema POS');

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
    <div className="flex min-h-screen">
      <Sidebar
        isMobileOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        setIsMobileOpen={setIsMobileOpen}
        brandName={brandName}
      />
      <main
        id="main-content"
        className={`flex-1 min-h-screen transition-[margin] duration-200 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}
      >
        <Outlet context={{ toggleSidebar, setIsMobileOpen, setBrandName, isCollapsed, brandName }} />
      </main>
    </div>
  );
}
