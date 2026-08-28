import { Icon } from '@iconify/react';
import { Button } from '../ui';

export function Header({ title, subtitle, toggleSidebar, setIsMobileOpen, actions, isCollapsed }) {
  const handleToggle = toggleSidebar || (() => setIsMobileOpen?.(prev => !prev));

  return (
    <header className="page-header flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="icon"
          className="hidden md:inline-flex"
          onClick={handleToggle}
          aria-label="Contraer barra lateral"
          icon={isCollapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
        />
        <div>
          <h2 className="page-title">{title}</h2>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
