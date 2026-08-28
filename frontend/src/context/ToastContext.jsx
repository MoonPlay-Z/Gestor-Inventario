import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import closeCircleIcon from '@iconify/icons-mdi/close-circle-outline';
import alertCircleIcon from '@iconify/icons-mdi/alert-circle-outline';
import checkboxMarkedCircleIcon from '@iconify/icons-mdi/checkbox-marked-circle-outline';
import closeIcon from '@iconify/icons-mdi/close';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast-icon">
              {t.type === 'error' ? <Icon icon={closeCircleIcon} className="h-4 w-4" /> : t.type === 'warning' ? <Icon icon={alertCircleIcon} className="h-4 w-4" /> : <Icon icon={checkboxMarkedCircleIcon} className="h-4 w-4" />}
            </div>
            <div className="toast-msg">{t.msg}</div>
            <div className="toast-close" onClick={() => removeToast(t.id)}><Icon icon={closeIcon} className="h-4 w-4" /></div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
