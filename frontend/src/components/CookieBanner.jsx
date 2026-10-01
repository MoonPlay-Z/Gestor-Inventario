import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'gestorpos_cookie_consent';
const COOKIE_CONSENT_DATE_KEY = 'gestorpos_cookie_consent_date';
const COOKIE_CONSENT_VERSION = '1.0';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState({
    technical: true, // Siempre activas
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (consent) => {
    const consentData = {
      ...consent,
      version: COOKIE_CONSENT_VERSION,
      date: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
    setShowBanner(false);
    setShowModal(false);

    // Aplicar preferencias de cookies
    applyCookiePreferences(consent);
  };

  const applyCookiePreferences = (consent) => {
    // Si no hay consentimiento para analíticas, bloquear Google Analytics
    if (!consent.analytics) {
      // Deshabilitar GA si está cargado
      window['ga-disable-G-XXXXXXXXXX'] = true;
    }

    // Disparar evento para que otros componentes reaccionen
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consent }));
  };

  const handleAcceptAll = () => {
    saveConsent({
      technical: true,
      analytics: true,
      marketing: true
    });
  };

  const handleRejectAll = () => {
    saveConsent({
      technical: true,
      analytics: false,
      marketing: false
    });
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const handleCustomize = () => {
    setShowModal(true);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Banner principal */}
      {showBanner && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1e293b',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px 32px',
          zIndex: 10000,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div style={{ flex: '1 1 400px' }}>
              <h3 style={{
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 700,
                margin: '0 0 8px'
              }}>
                🍪 Utilizamos cookies
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                margin: 0
              }}>
                Este sitio utiliza cookies técnicas necesarias para su funcionamiento y, con tu consentimiento, cookies analíticas para entender cómo se usa el sitio.{' '}
                <Link to="/politica-cookies" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                  Más información
                </Link>
              </p>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <button
                onClick={handleRejectAll}
                style={{
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Rechazar
              </button>
              <button
                onClick={handleCustomize}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Personalizar
              </button>
              <button
                onClick={handleAcceptAll}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Aceptar todas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de personalización */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{
              color: '#ffffff',
              fontSize: '1.3rem',
              fontWeight: 800,
              margin: '0 0 8px'
            }}>
              Personalizar cookies
            </h2>
            <p style={{
              color: '#94a3b8',
              fontSize: '0.9rem',
              margin: '0 0 24px'
            }}>
              Selecciona qué tipos de cookies deseas aceptar.
            </p>

            {/* Cookies técnicas */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    margin: '0 0 4px'
                  }}>
                    🔧 Cookies técnicas
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    margin: 0
                  }}>
                    Necesarias para el funcionamiento del sitio
                  </p>
                </div>
                <span style={{
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  SIEMPRE ACTIVAS
                </span>
              </div>
            </div>

            {/* Cookies analíticas */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    margin: '0 0 4px'
                  }}>
                    📊 Cookies analíticas
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    margin: 0
                  }}>
                    Nos ayudan a mejorar el sitio (Google Analytics)
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: preferences.analytics ? '#2563eb' : '#475569',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      transition: '0.3s',
                      transform: preferences.analytics ? 'translateX(20px)' : 'translateX(0)'
                    }} />
                  </span>
                </label>
              </div>
            </div>

            {/* Cookies de marketing */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 700,
                    margin: '0 0 4px'
                  }}>
                    📢 Cookies de marketing
                  </h3>
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    margin: 0
                  }}>
                    Para publicidad personalizada (si aplica)
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: preferences.marketing ? '#2563eb' : '#475569',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: '3px',
                      bottom: '3px',
                      backgroundColor: '#ffffff',
                      borderRadius: '50%',
                      transition: '0.3s',
                      transform: preferences.marketing ? 'translateX(20px)' : 'translateX(0)'
                    }} />
                  </span>
                </label>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePreferences}
                style={{
                  flex: 1,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Guardar preferencias
              </button>
            </div>

            <p style={{
              color: '#64748b',
              fontSize: '0.75rem',
              textAlign: 'center',
              margin: '16px 0 0'
            }}>
              Puedes cambiar tus preferencias en cualquier momento desde la configuración de tu navegador.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// Hook para verificar consentimiento
export function useCookieConsent() {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      setConsent(JSON.parse(stored));
    }

    const handleChange = (e) => {
      setConsent(e.detail);
    };

    window.addEventListener('cookieConsentChanged', handleChange);
    return () => window.removeEventListener('cookieConsentChanged', handleChange);
  }, []);

  return consent;
}
