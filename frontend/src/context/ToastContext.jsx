import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import closeCircleIcon from '@iconify/icons-mdi/close-circle-outline';
import alertCircleIcon from '@iconify/icons-mdi/alert-circle-outline';
import checkboxMarkedCircleIcon from '@iconify/icons-mdi/checkbox-marked-circle-outline';
import closeIcon from '@iconify/icons-mdi/close';
import informationIcon from '@iconify/icons-mdi/information-outline';

const ToastContext = createContext();

// Duración por tipo de toast (ms)
const TOAST_DURATION = {
  success: 5000,
  error: 8000,
  warning: 6000,
  info: 5000
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);

    const duration = TOAST_DURATION[type] || 5000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const getToastStyles = (type) => {
    const base = {
      success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', color: '#22c55e', icon: checkboxMarkedCircleIcon },
      error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', icon: closeCircleIcon },
      warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b', icon: alertCircleIcon },
      info: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6', icon: informationIcon }
    };
    return base[type] || base.success;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        width: '100%'
      }}>
        {toasts.map(t => {
          const styles = getToastStyles(t.type);
          return (
            <div key={t.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: styles.bg,
              borderRadius: '12px',
              border: `1px solid ${styles.border}`,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: styles.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon icon={styles.icon} className="h-5 w-5" style={{ color: styles.color }} />
              </div>
              <div style={{
                flex: 1,
                color: '#f8fafc',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                fontWeight: 500
              }}>
                {t.msg}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: styles.color,
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.7'}
              >
                <Icon icon={closeIcon} className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
