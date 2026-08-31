import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import arrowLeftIcon from '@iconify/icons-mdi/arrow-left';
import packageIcon from '@iconify/icons-mdi/package-variant';
import rocketLaunchIcon from '@iconify/icons-mdi/rocket-launch';
import flashIcon from '@iconify/icons-mdi/flash';
import checkDecagramIcon from '@iconify/icons-mdi/check-decagram';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.register(formData);
      loginUser(res.usuario, res.token);
      showToast('🎉 ¡Cuenta creada con éxito! Tus 7 días de prueba gratuita han comenzado.', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Error al crear la cuenta', 'error');
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
      justifyContent: 'center',
      padding: '30px 16px',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Top Left Navigation Link */}
      <div style={{ width: '100%', maxWidth: '980px', marginBottom: '16px' }}>
        <Link
          to="/"
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

      {/* Main Split Container */}
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

        {/* LEFT PANEL: Royal Blue Gradient Card */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon icon={packageIcon} className="h-6 w-6 text-white" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>GestorPOS<span style={{ color: '#38bdf8' }}>.dev</span></span>
            </div>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
              ¡Prueba Gratis 7 Días!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.9rem', lineHeight: '1.55', marginBottom: '28px' }}>
              Crea la cuenta de tu empresa sin tarjeta de crédito y comienza a vender en dólares y bolívares al instante.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon icon={rocketLaunchIcon} className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Acceso Inmediato</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '2px' }}>7 días de prueba completa</div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon icon={flashIcon} className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Tasa BCV en Vivo</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '2px' }}>Actualización automática diaria</div>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon icon={checkDecagramIcon} className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Sin Tarjeta de Crédito</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '2px' }}>Pago Móvil & Transferencias</div>
                </div>
              </div>

            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '16px', fontSize: '0.75rem', opacity: 0.8 }}>
            Soporte técnico y atención WhatsApp: <strong>+58 412-7723148</strong>
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div style={{ padding: '44px 40px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            Crear Cuenta SaaS
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '28px' }}>
            Regístrate y gestiona tu inventario y ventas hoy mismo
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', letterSpacing: '0.05em' }}>
                NOMBRE DEL NEGOCIO O TITULAR *
              </label>
              <input
                type="text"
                name="nombre"
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
                placeholder="Ej: Inversiones Los Andes C.A."
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', letterSpacing: '0.05em' }}>
                NOMBRE DE USUARIO *
              </label>
              <input
                type="text"
                name="username"
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
                placeholder="ej: mi_negocio"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', letterSpacing: '0.05em' }}>
                CORREO ELECTRÓNICO *
              </label>
              <input
                type="email"
                name="email"
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
                placeholder="contacto@minegocio.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', letterSpacing: '0.05em' }}>
                CONTRASEÑA *
              </label>
              <input
                type="password"
                name="password"
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
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
              <Icon icon={rocketLaunchIcon} className="h-5 w-5" />
              {loading ? 'Creando Cuenta...' : 'Activar Prueba Gratis (7 Días)'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: '#64748b' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Iniciar Sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
