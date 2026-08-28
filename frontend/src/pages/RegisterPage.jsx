import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span className="badge badge-success" style={{ marginBottom: '8px', padding: '4px 12px' }}>
            🎁 7 Días de Prueba Sin Tarjeta
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px' }}>Crear Cuenta SaaS</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Empieza a gestionar tu inventario y ventas hoy mismo
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Nombre del Negocio o Titular <span className="required">*</span></label>
            <input
              type="text"
              name="nombre"
              className="form-control"
              placeholder="Ej: Inversiones Los Andes C.A."
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nombre de Usuario <span className="required">*</span></label>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="ej: mi_negocio"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="contacto@minegocio.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña <span className="required">*</span></label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Creando Cuenta...' : 'Activar Mi Prueba de 7 Días'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
}
