import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import timerSandIcon from '@iconify/icons-mdi/timer-sand';
import creditCardIcon from '@iconify/icons-mdi/credit-card-outline';
import { useAuth } from '../context/AuthContext';
import { API } from '../services/api';

export function SuscripcionExpiradaPage() {
  const { user, logout } = useAuth();
  const [checkoutUrl, setCheckoutUrl] = useState('#');

  useEffect(() => {
    API.getConfig()
      .then(config => {
        if (config?.empresaCheckoutUrl) {
          setCheckoutUrl(config.empresaCheckoutUrl);
        }
      })
      .catch(() => {});
  }, []);

  const fullCheckoutLink = checkoutUrl.includes('?') 
    ? `${checkoutUrl}&username=${user?.username || ''}`
    : `${checkoutUrl}?username=${user?.username || ''}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}><Icon icon={timerSandIcon} className="h-16 w-16" /></div>
        <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '6px 16px', marginBottom: '16px' }}>
          Periodo de Prueba Vencido
        </span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '12px 0 8px' }}>
          Tu prueba gratuita de 7 días ha finalizado
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '28px' }}>
          Hola <strong>@{user?.username}</strong>, el acceso a tu cuenta ha sido suspendido temporalmente. Para continuar disfrutando de todas las herramientas de facturación e inventario, por favor activa tu suscripción.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href={fullCheckoutLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg inline-flex items-center justify-center gap-2"
            style={{ width: '100%', textDecoration: 'none' }}
          >
            <Icon icon={creditCardIcon} className="h-5 w-5" />
            Suscribirme Ahora
          </a>
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
