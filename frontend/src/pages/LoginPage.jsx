import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import packageIcon from '@iconify/icons-mdi/package-variant';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Por favor ingresa usuario y contraseña', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await API.login({ username, password });
      loginUser(res.usuario, res.token);
      showToast(`¡Bienvenido de nuevo, ${res.usuario.nombre || res.usuario.username}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Credenciales inválidas', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Icon icon={packageIcon} className="mx-auto mb-3 h-12 w-12 text-[var(--accent)]" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Iniciar Sesión</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Ingresa tus datos para acceder al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Usuario o Correo</label>
            <input
              type="text"
              className="form-control"
              placeholder="ejemplo@correo.com o admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          ¿No tienes una cuenta? <Link to="/registro" style={{ color: 'var(--accent)', fontWeight: 600 }}>Prueba Gratis (7 Días)</Link>
        </div>
      </div>
    </div>
  );
}
