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
      success: { bg: '#15803d', border: '#15803d', color: '#ffffff', icon: checkboxMarkedCircleIcon },
      error: { bg: '#b91c1c', border: '#b91c1c', color: '#ffffff', icon: closeCircleIcon },
      warning: { bg: '#b45309', border: '#b45309', color: '#ffffff', icon: alertCircleIcon },
      info: { bg: '#1d4ed8', border: '#1d4ed8', color: '#ffffff', icon: informationIcon }
    };
    return base[type] || base.success;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        width: 'calc(100% - 40px)'
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
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
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
