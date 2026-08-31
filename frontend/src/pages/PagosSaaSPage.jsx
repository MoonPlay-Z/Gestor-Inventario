import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import arrowLeftIcon from '@iconify/icons-mdi/arrow-left';
import emailIcon from '@iconify/icons-mdi/email-outline';
import whatsappIcon from '@iconify/icons-mdi/whatsapp';
import globeIcon from '@iconify/icons-mdi/earth';
import sendIcon from '@iconify/icons-mdi/send';
import checkCircleIcon from '@iconify/icons-mdi/check-circle';
import { API } from '../services/api';
import { useToast } from '../context/ToastContext';

export function PagosSaaSPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const stateData = location.state || {};
  const [usuarioId, setUsuarioId] = useState(stateData.usuarioId || stateData.empresaId || '');
  const [empresaNombre, setEmpresaNombre] = useState(stateData.empresaNombre || '');
  const [metodoPago, setMetodoPago] = useState('PAGO_MOVIL_BANESCO');
  const [referencia, setReferencia] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioId.trim()) {
      showToast('Ingresa tu ID de usuario o nombre de empresa', 'error');
      return;
    }
    if (!referencia.trim()) {
      showToast('El número de referencia es obligatorio', 'error');
      return;
    }

    setLoading(true);
    try {
      await API.reportarPagoSaaS({
        usuarioId: usuarioId.trim(),
        metodoPago,
        referencia: referencia.trim(),
        notas: notas.trim(),
      });

      setEnviado(true);
      showToast('Pago reportado exitosamente. Se ha notificado a soporte.', 'success');
    } catch (err) {
      showToast(err.message || 'Error al enviar reporte de pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justify: 'center',
      padding: '30px 16px',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Top Left Navigation Link */}
      <div style={{ width: '100%', maxWidth: '980px', marginBottom: '16px' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2563eb',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none'
          }}
        >
          <Icon icon={arrowLeftIcon} className="h-5 w-5" /> Volver al Inicio
        </Link>
      </div>

      {/* Main Split Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '980px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.1), 0 10px 15px -5px rgba(15, 23, 42, 0.04)',
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 420px) 1fr',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>

        {/* LEFT PANEL: Deep Royal Blue Gradient Card */}
        <div style={{
          background: 'linear-gradient(180deg, #1d4ed8 0%, #1e1b4b 100%)',
          color: '#ffffff',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '32px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
              ¡Cancela tu Mensualidad!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', lineHeight: '1.55', marginBottom: '28px' }}>
              {empresaNombre ? `Hola ${empresaNombre}, para` : 'Para'} mantener activa tu cuenta en el Gestor de Inventario POS, realiza tu pago y reporta el comprobante a continuación.
            </p>

            {/* Payment Method Option Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Option 1: Pago Móvil */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon icon={emailIcon} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>Pago Móvil Venezuela</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>
                    Banesco | Venezuela | Bancamiga
                  </div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '2px' }}>
                    C.I: 30054384 | Tlf: 0412-7723148
                  </div>
                </div>
              </div>

              {/* Option 2: WhatsApp */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon icon={whatsappIcon} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>Atención & Soporte WhatsApp</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>
                    +58 412-7723148
                  </div>
                </div>
              </div>

              {/* Option 3: Internacional */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon icon={globeIcon} className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 500 }}>Resto del Mundo (Internacional)</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>
                    PayPal, Binance Pay, Zinly, Wally
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', fontSize: '0.75rem', opacity: 0.8 }}>
            Los reportes son notificados directamente a <strong>Arcila.juan10@gmail.com</strong> para activación rápida.
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div style={{ padding: '44px 40px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {enviado ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <Icon icon={checkCircleIcon} className="mx-auto mb-4 h-16 w-16 text-[#10b981]" />
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                ¡Comprobante Enviado!
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Tu pago con la referencia <strong>{referencia}</strong> ha sido registrado. Un administrador verificará la transacción y reactivará tu acceso inmediatamente.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                Reportar Mensualidad
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '28px' }}>
                Rellena el formulario con los detalles del comprobante para reactivar tu cuenta.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', letterSpacing: '0.05em' }}>
                    ID DE USUARIO / EMPRESA *
                  </label>
                  <input
                    type="text"
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                    placeholder="Ej: tu-empresa-id o username"
                    value={usuarioId}
                    onChange={e => setUsuarioId(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', letterSpacing: '0.05em' }}>
                    MÉTODO DE PAGO *
                  </label>
                  <select
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                    value={metodoPago}
                    onChange={e => setMetodoPago(e.target.value)}
                    required
                  >
                    <option value="PAGO_MOVIL_BANESCO">Pago Móvil — Banesco</option>
                    <option value="PAGO_MOVIL_VENEZUELA">Pago Móvil — Banco de Venezuela</option>
                    <option value="PAGO_MOVIL_BANCAMIGA">Pago Móvil — Bancamiga</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="BINANCE_PAY">Binance Pay</option>
                    <option value="ZINLY">Zinly</option>
                    <option value="WALLY">Wally Tech</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', letterSpacing: '0.05em' }}>
                    NÚMERO DE REFERENCIA *
                  </label>
                  <input
                    type="text"
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                    placeholder="Ej: 94810294"
                    value={referencia}
                    onChange={e => setReferencia(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', letterSpacing: '0.05em' }}>
                    OBSERVACIONES / MENSAJE
                  </label>
                  <textarea
                    rows={3}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      resize: 'vertical'
                    }}
                    placeholder="Escribe aquí cualquier aclaración o fecha de transferencia..."
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    padding: '14px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon icon={sendIcon} className="h-5 w-5" />
                  {loading ? 'Enviando Reporte...' : 'Enviar Reporte de Pago'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
