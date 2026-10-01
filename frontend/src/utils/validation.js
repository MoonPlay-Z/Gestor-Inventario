// Utilidades de validación para formularios

export const ValidationRules = {
  required: (value, fieldName = 'Este campo') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} es obligatorio`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Ingresa un email válido (ej: nombre@correo.com)';
    }
    return null;
  },

  minLength: (value, min, fieldName = 'Este campo') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} debe tener al menos ${min} caracteres`;
    }
    return null;
  },

  maxLength: (value, max, fieldName = 'Este campo') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} no puede tener más de ${max} caracteres`;
    }
    return null;
  },

  numeric: (value, fieldName = 'Este campo') => {
    if (!value) return null;
    if (isNaN(Number(value))) {
      return `${fieldName} debe ser un número`;
    }
    return null;
  },

  positive: (value, fieldName = 'Este campo') => {
    if (!value) return null;
    if (Number(value) < 0) {
      return `${fieldName} no puede ser negativo`;
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) {
      return 'Ingresa un número de teléfono válido';
    }
    return null;
  },

  rif: (value) => {
    if (!value) return null;
    const rifRegex = /^[VEJPGvejpg]\d{8,9}$/;
    if (!rifRegex.test(value)) {
      return 'Ingresa un RIF válido (ej: V123456789)';
    }
    return null;
  },

  username: (value) => {
    if (!value) return null;
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(value)) {
      return 'El usuario solo puede contener letras, números y guiones bajos';
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  },

  passwordStrength: (value) => {
    if (!value) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (value.length >= 6) score++;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const levels = [
      { score: 0, label: 'Muy débil', color: '#ef4444' },
      { score: 1, label: 'Débil', color: '#f97316' },
      { score: 2, label: 'Regular', color: '#eab308' },
      { score: 3, label: 'Buena', color: '#84cc16' },
      { score: 4, label: 'Fuerte', color: '#22c55e' },
      { score: 5, label: 'Muy fuerte', color: '#10b981' }
    ];

    return levels[score];
  },

  match: (value, matchValue, fieldName = 'Este campo') => {
    if (!value) return null;
    if (value !== matchValue) {
      return `${fieldName} no coincide`;
    }
    return null;
  }
};

// Función para validar un formulario completo
export const validateForm = (values, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule(values[field], field);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Mensajes de error contextuales para la API
export const getErrorMessage = (err, defaultMessage = 'Ha ocurrido un error inesperado') => {
  if (!err) return defaultMessage;
  
  // Errores de red
  if (err.code === 'NETWORK_ERROR') {
    return 'Sin conexión a internet. Verifica tu red e inténtalo de nuevo.';
  }
  
  if (err.code === 'TIMEOUT') {
    return 'El servidor tardó demasiado en responder. Inténtalo de nuevo.';
  }
  
  // Errores de autenticación
  if (err.status === 401) {
    return 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
  }
  
  // Errores de pago
  if (err.code === 'PAYMENT_REQUIRED') {
    return 'Debe cancelar la mensualidad para continuar utilizando el sistema.';
  }
  
  // Errores de validación del servidor
  if (err.status === 400 && err.fields) {
    const firstError = Object.values(err.fields)[0];
    return firstError || 'Los datos ingresados no son válidos.';
  }
  
  // Error genérico del servidor
  if (err.status >= 500) {
    return 'Algo salió mal de nuestro lado. Inténtalo en unos minutos.';
  }
  
  return err.message || defaultMessage;
};
