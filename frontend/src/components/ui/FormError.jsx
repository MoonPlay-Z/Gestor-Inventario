import React from 'react';
import { Icon } from '@iconify/react';
import alertCircleIcon from '@iconify/icons-mdi/alert-circle';
import closeIcon from '@iconify/icons-mdi/close';

export function FormError({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '12px',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      marginBottom: '20px'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon icon={alertCircleIcon} className="h-5 w-5" style={{ color: '#ef4444' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          color: '#ef4444',
          fontWeight: 700,
          fontSize: '0.9rem',
          marginBottom: '4px'
        }}>
          Error en el formulario
        </div>
        <div style={{
          color: '#fca5a5',
          fontSize: '0.85rem',
          lineHeight: 1.5
        }}>
          {message}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon icon={closeIcon} className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function FormSuccess({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '16px',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderRadius: '12px',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      marginBottom: '20px'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon icon={alertCircleIcon} className="h-5 w-5" style={{ color: '#22c55e' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          color: '#22c55e',
          fontWeight: 700,
          fontSize: '0.9rem',
          marginBottom: '4px'
        }}>
          Operación exitosa
        </div>
        <div style={{
          color: '#86efac',
          fontSize: '0.85rem',
          lineHeight: 1.5
        }}>
          {message}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#22c55e',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon icon={closeIcon} className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
