import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import accountIcon from '@iconify/icons-mdi/account-outline';
import lockIcon from '@iconify/icons-mdi/lock-outline';
import eyeIcon from '@iconify/icons-mdi/eye';
import eyeOffIcon from '@iconify/icons-mdi/eye-off';
import loginIcon from '@iconify/icons-mdi/login';
import shieldLockIcon from '@iconify/icons-mdi/shield-lock-outline';
import whatsappIcon from '@iconify/icons-mdi/whatsapp';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FieldError, FormError } from '../components/ui';
import { ValidationRules, getErrorMessage } from '../utils/validation';
import { AuthLayout } from '../components/auth/AuthLayout';

// El sistema todavía no tiene recuperación automática de contraseña: el
// enlace abre WhatsApp con el mensaje ya escrito para que soporte la restablezca.
const SOPORTE_WHATSAPP =
  'https://wa.me/584127723148?text=' +
  encodeURIComponent('Hola, necesito ayuda para recuperar el acceso a mi cuenta de GestorPOS.');

const CLASES_INPUT =
  'w-full rounded-[12px] border bg-slate-50 px-4 py-3.5 text-base font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 transition-colors focus:bg-white focus:outline-none focus:ring-2';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const { token, loginUser, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const usuarioRef = useRef(null);

  // En escritorio el foco ahorra un clic; en teléfono abriría el teclado al
  // entrar y taparía el formulario, así que solo se enfoca desde 1024 px.
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      usuarioRef.current?.focus();
    }
  }, []);

  // Redirect to dashboard if already logged in. El Super Admin no tiene
  // dashboard operativo: su panel es /admin.
  React.useEffect(() => {
    if (token && navigate) {
      navigate(user?.rol === 'SUPER_ADMIN' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [token, user, navigate]);

  const validateForm = () => {
    const errors = {};

    const usernameError = ValidationRules.required(username, 'El usuario');
    if (usernameError) errors.username = usernameError;

    const passwordError = ValidationRules.required(password, 'La contraseña');
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await API.login({ username, password });
      loginUser(res.usuario, res.token, res.empresa, res.refreshToken);
      showToast(`¡Bienvenido de nuevo, ${res.usuario.nombre || res.usuario.username}!`, 'success');
      navigate(res.usuario.rol === 'SUPER_ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      if (err.code === 'PAYMENT_REQUIRED' || (err.data && err.data.code === 'PAYMENT_REQUIRED')) {
        const payload = err.data || {};
        showToast(err.message || 'Debe cancelar la mensualidad para continuar utilizando el sistema.', 'warning');
        navigate('/pagos-saas', {
          state: {
            usuarioId: payload.usuarioId || username,
            empresaId: payload.empresaId,
            empresaNombre: payload.empresaNombre,
            metodosPago: payload.metodosPago
          }
        });
        return;
      }

      const errorMessage = err.status === 401 && err.message
        ? err.message
        : getErrorMessage(err, 'Usuario o contraseña incorrectos. Verifica tus credenciales.');
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout titulo="¡Bienvenido!">
      <div className="auth-head mb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Iniciar Sesión
        </h2>
        <p className="auth-subtitulo mt-1.5 text-sm leading-relaxed text-slate-500">
          Introduce tus credenciales para acceder al sistema
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormError message={formError} onDismiss={() => setFormError('')} />

        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            Usuario o correo *
          </label>

          <div className="relative">
            <input
              id="username"
              ref={usuarioRef}
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="ej: admin o tu_usuario"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (fieldErrors.username) {
                  setFieldErrors((prev) => ({ ...prev, username: null }));
                }
              }}
              className={`${CLASES_INPUT} pr-12 ${
                fieldErrors.username
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-brand-600 focus:ring-brand-600/30'
              }`}
              aria-invalid={Boolean(fieldErrors.username)}
              required
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400">
              <Icon icon={accountIcon} className="h-5 w-5" />
            </span>
          </div>

          <FieldError message={fieldErrors.username} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
            >
              Contraseña *
            </label>

            <a
              href={SOPORTE_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-800"
            >
              <Icon icon={whatsappIcon} className="h-3.5 w-3.5" />
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={verPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: null }));
                }
              }}
              className={`${CLASES_INPUT} pr-12 ${
                fieldErrors.password
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-slate-200 focus:border-brand-600 focus:ring-brand-600/30'
              }`}
              aria-invalid={Boolean(fieldErrors.password)}
              required
            />

            <button
              type="button"
              onClick={() => setVerPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-[12px] text-slate-400 transition-colors hover:text-brand-600 focus:outline-none focus-visible:text-brand-600"
              aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={verPassword}
              tabIndex={0}
            >
              <Icon icon={verPassword ? eyeOffIcon : eyeIcon} className="h-5 w-5" />
            </button>
          </div>

          <FieldError message={fieldErrors.password} />
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-brand-600 px-5 py-3.5 text-base font-bold text-white shadow-btn-glow transition-all hover:bg-brand-700 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            <Icon icon={loading ? lockIcon : loginIcon} className="h-5 w-5" />
            {loading ? 'Ingresando…' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>

      <div className="auth-cta mt-5 text-center text-sm text-slate-600">
        ¿No tienes una cuenta?{' '}
        <Link
          to="/registro"
          className="font-bold text-brand-600 transition-colors hover:text-brand-800"
        >
          Prueba gratis 7 días
        </Link>
      </div>

      <div className="auth-nota mt-5 flex items-start gap-2.5 rounded-[12px] border border-slate-100 bg-slate-50 px-3.5 py-3 text-[11px] leading-relaxed text-slate-500">
        <Icon icon={shieldLockIcon} className="mt-px h-4 w-4 shrink-0 text-emerald-600" />
        <span>
          Conexión cifrada. Tus datos viajan protegidos y cada empresa opera en un
          espacio aislado.
        </span>
      </div>
    </AuthLayout>
  );
}
