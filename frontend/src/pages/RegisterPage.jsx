import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import storeIcon from '@iconify/icons-mdi/store-outline';
import accountIcon from '@iconify/icons-mdi/account-outline';
import emailIcon from '@iconify/icons-mdi/email-outline';
import lockIcon from '@iconify/icons-mdi/lock-outline';
import eyeIcon from '@iconify/icons-mdi/eye';
import eyeOffIcon from '@iconify/icons-mdi/eye-off';
import rocketIcon from '@iconify/icons-mdi/rocket-launch';
import shieldCheckIcon from '@iconify/icons-mdi/shield-check-outline';
import { API } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FieldError, FormError } from '../components/ui';
import { ValidationRules, getErrorMessage } from '../utils/validation';
import { getBrowserLocation } from '../utils/geolocation';
import { AuthLayout } from '../components/auth/AuthLayout';

const CLASES_INPUT =
  'w-full rounded-[12px] border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-base font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 transition-colors focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/30';

const CLASES_INPUT_ERROR =
  'border-rose-400 focus:border-rose-500 focus:ring-rose-500/30';

const CLASES_LABEL =
  'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700';

const CLASES_CHECK =
  'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-brand-600';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    email: '',
    password: '',
    aceptaTerminos: false,
    aceptaPrivacidad: false,
    aceptaComunicaciones: false
  });
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const { loginUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));

    // Limpiar error del campo al modificar
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    const nombreError = ValidationRules.required(formData.nombre, 'El nombre del negocio');
    if (nombreError) errors.nombre = nombreError;

    const usernameError = ValidationRules.username(formData.username);
    if (usernameError) errors.username = usernameError;

    const emailError = ValidationRules.email(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = ValidationRules.password(formData.password);
    if (passwordError) errors.password = passwordError;

    if (!formData.aceptaTerminos) {
      errors.aceptaTerminos = 'Debes aceptar los Términos y Condiciones';
    }

    if (!formData.aceptaPrivacidad) {
      errors.aceptaPrivacidad = 'Debes aceptar la Política de Privacidad';
    }

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
      const location = await getBrowserLocation();
      if (!location) {
        showToast('No se pudo obtener la ubicación. La cuenta se creará sin coordenadas.', 'info');
      }
      const res = await API.register({
        nombre: formData.nombre,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        aceptaComunicaciones: formData.aceptaComunicaciones,
        ...location,
      });
      loginUser(res.usuario, res.token, null, res.refreshToken);
      showToast('🎉 ¡Cuenta creada con éxito! Tus 7 días de prueba gratuita han comenzado.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Error al crear la cuenta. Inténtalo de nuevo.');
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = ValidationRules.passwordStrength(formData.password);

  return (
    <AuthLayout titulo="¡Prueba gratis 7 días!">
      <div className="auth-head reg-head mb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Crear Cuenta
        </h2>
        <p className="auth-subtitulo mt-1.5 text-sm leading-relaxed text-slate-500">
          Registra tu negocio y empieza a vender hoy mismo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="reg-form flex flex-col gap-4" noValidate>
        <FormError message={formError} onDismiss={() => setFormError('')} />

        <div className="reg-field">
          <label htmlFor="nombre" className={CLASES_LABEL}>
            Nombre del negocio o titular *
          </label>
          <div className="relative">
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Ej: Inversiones Los Andes C.A."
              value={formData.nombre}
              onChange={handleChange}
              className={`${CLASES_INPUT} ${fieldErrors.nombre ? CLASES_INPUT_ERROR : ''}`}
              aria-invalid={Boolean(fieldErrors.nombre)}
              required
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400">
              <Icon icon={storeIcon} className="h-5 w-5" />
            </span>
          </div>
          <FieldError message={fieldErrors.nombre} />
        </div>

        <div className="reg-field">
          <label htmlFor="username" className={CLASES_LABEL}>
            Nombre de usuario *
          </label>
          <div className="relative">
            <input
              id="username"
              type="text"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="ej: mi_negocio"
              value={formData.username}
              onChange={handleChange}
              className={`${CLASES_INPUT} ${fieldErrors.username ? CLASES_INPUT_ERROR : ''}`}
              aria-invalid={Boolean(fieldErrors.username)}
              required
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400">
              <Icon icon={accountIcon} className="h-5 w-5" />
            </span>
          </div>
          <FieldError message={fieldErrors.username} />
        </div>

        <div className="reg-field">
          <label htmlFor="email" className={CLASES_LABEL}>
            Correo electrónico *
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="contacto@minegocio.com"
              value={formData.email}
              onChange={handleChange}
              className={`${CLASES_INPUT} ${fieldErrors.email ? CLASES_INPUT_ERROR : ''}`}
              aria-invalid={Boolean(fieldErrors.email)}
              required
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400">
              <Icon icon={emailIcon} className="h-5 w-5" />
            </span>
          </div>
          <FieldError message={fieldErrors.email} />
        </div>

        <div className="reg-field">
          <label htmlFor="password" className={CLASES_LABEL}>
            Contraseña *
          </label>
          <div className="relative">
            <input
              id="password"
              type={verPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              className={`${CLASES_INPUT} ${fieldErrors.password ? CLASES_INPUT_ERROR : ''}`}
              aria-invalid={Boolean(fieldErrors.password)}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setVerPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-[12px] text-slate-400 transition-colors hover:text-brand-600 focus:outline-none focus-visible:text-brand-600"
              aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={verPassword}
            >
              <Icon icon={verPassword ? eyeOffIcon : eyeIcon} className="h-5 w-5" />
            </button>
          </div>
          <FieldError message={fieldErrors.password} />

          {/* Indicador de fortaleza de contraseña */}
          {formData.password && (
            <div className="mt-2">
              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: passwordStrength.color
                  }}
                />
              </div>
              <p
                className="mt-1 text-xs font-semibold"
                style={{ color: passwordStrength.color }}
              >
                Fortaleza: {passwordStrength.label}
              </p>
            </div>
          )}
        </div>

        {/* Checkboxes de aceptación */}
        <div
          className={`reg-legal flex flex-col gap-3 rounded-[12px] border bg-slate-50 p-4 ${
            fieldErrors.aceptaTerminos || fieldErrors.aceptaPrivacidad
              ? 'border-rose-400'
              : 'border-slate-200'
          }`}
        >
          <p className="reg-aviso m-0 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
            <Icon icon={shieldCheckIcon} className="mt-px h-4 w-4 shrink-0 text-slate-400" />
            <span>
              Al registrarte, solicitaremos permiso para guardar la ubicación precisa de este
              dispositivo junto con la IP y fecha de creación de la cuenta. Si no autorizas o no
              está disponible, podrás continuar sin coordenadas.
            </span>
          </p>

          <div>
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-slate-700">
              <input
                type="checkbox"
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleChange}
                required
                className={CLASES_CHECK}
              />
              <span>
                He leído y acepto los{' '}
                <Link to="/terminos" className="font-semibold text-brand-600 hover:text-brand-800">
                  Términos y Condiciones
                </Link>{' '}
                *
              </span>
            </label>
            <FieldError message={fieldErrors.aceptaTerminos} />
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-slate-700">
              <input
                type="checkbox"
                name="aceptaPrivacidad"
                checked={formData.aceptaPrivacidad}
                onChange={handleChange}
                required
                className={CLASES_CHECK}
              />
              <span>
                He leído y acepto la{' '}
                <Link to="/politica-privacidad" className="font-semibold text-brand-600 hover:text-brand-800">
                  Política de Privacidad
                </Link>{' '}
                <span className="solo-vertical">y el tratamiento de mis datos personales</span> *
              </span>
            </label>
            <FieldError message={fieldErrors.aceptaPrivacidad} />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-slate-700">
            <input
              type="checkbox"
              name="aceptaComunicaciones"
              checked={formData.aceptaComunicaciones}
              onChange={handleChange}
              className={CLASES_CHECK}
            />
            <span className="text-slate-500">
              [Opcional] Deseo recibir comunicaciones<span className="solo-vertical"> comerciales y novedades por email/WhatsApp</span>
            </span>
          </label>
        </div>

        <div className="reg-submit pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-brand-600 px-5 py-3.5 text-base font-bold text-white shadow-btn-glow transition-all hover:bg-brand-700 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          >
            <Icon icon={loading ? lockIcon : rocketIcon} className="h-5 w-5" />
            {loading ? 'Creando cuenta…' : 'Activar Prueba Gratis'}
          </button>
        </div>
      </form>

      <div className="auth-cta mt-5 text-center text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-bold text-brand-600 transition-colors hover:text-brand-800">
          Iniciar Sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
