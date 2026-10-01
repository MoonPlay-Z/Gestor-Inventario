import React from 'react';
import { Icon } from '@iconify/react';
import alertCircleIcon from '@iconify/icons-mdi/alert-circle';

export function FieldError({ message }) {
  if (!message) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '6px',
      marginTop: '6px',
      padding: '8px 12px',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }}>
      <Icon icon={alertCircleIcon} className="h-4 w-4" style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
      <span style={{
        color: '#ef4444',
        fontSize: '0.8rem',
        lineHeight: 1.4
      }}>
        {message}
      </span>
    </div>
  );
}

export function FieldSuccess({ message }) {
  if (!message) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '6px',
      marginTop: '6px',
      padding: '8px 12px',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(34, 197, 94, 0.2)'
    }}>
      <Icon icon={alertCircleIcon} className="h-4 w-4" style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
      <span style={{
        color: '#22c55e',
        fontSize: '0.8rem',
        lineHeight: 1.4
      }}>
        {message}
      </span>
    </div>
  );
}
