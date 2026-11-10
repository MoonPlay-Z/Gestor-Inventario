import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

/**
 * Selector desplegable personalizado con diseño coherente con el sistema POS.
 * Reemplaza los selects nativos del navegador por un menú emergente elegante,
 * accesible y estilizado con la paleta oscura/clara del sistema.
 */
export function CustomSelect({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className="form-control"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          gap: '8px',
          borderColor: open ? 'var(--accent, #2563eb)' : 'var(--border, #e2e8f0)',
          boxShadow: open ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
          userSelect: 'none',
          background: 'var(--bg-primary, #ffffff)',
          color: 'var(--text-primary, #0f172a)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md, 8px)',
          minHeight: '42px',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, overflow: 'hidden' }}>
          {selectedOption?.icon && (
            <Icon
              icon={selectedOption.icon}
              style={{ fontSize: '1.2rem', color: 'var(--accent, #2563eb)', flexShrink: 0 }}
            />
          )}
          <span
            style={{
              fontWeight: 500,
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedOption?.label || placeholder}
          </span>
          {selectedOption?.moneda && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor:
                  selectedOption.moneda === 'USD' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: selectedOption.moneda === 'USD' ? '#16a34a' : '#2563eb',
                border: `1px solid ${
                  selectedOption.moneda === 'USD' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'
                }`,
                flexShrink: 0,
              }}
            >
              {selectedOption.moneda}
            </span>
          )}
        </div>
        <Icon
          icon="mdi:chevron-down"
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary, #64748b)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: 'var(--radius-md, 8px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                  color: isSelected ? 'var(--accent, #2563eb)' : 'var(--text-primary, #0f172a)',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '0.85rem',
                  gap: '8px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover, #f1f5f9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  {opt.icon && (
                    <Icon
                      icon={opt.icon}
                      style={{
                        fontSize: '1.2rem',
                        color: isSelected ? 'var(--accent, #2563eb)' : 'var(--text-secondary, #64748b)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.label}
                      </span>
                      {opt.moneda && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor:
                              opt.moneda === 'USD' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: opt.moneda === 'USD' ? '#16a34a' : '#2563eb',
                            flexShrink: 0,
                          }}
                        >
                          {opt.moneda}
                        </span>
                      )}
                    </div>
                    {opt.desc && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                        {opt.desc}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Icon
                    icon="mdi:check"
                    style={{ fontSize: '1.1rem', color: 'var(--accent, #2563eb)', flexShrink: 0 }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
