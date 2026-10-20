// Configuración base del arnés k6.
// Todas las variables llegan por entorno para no hardcodear credenciales.

export const BASE = (__ENV.BASE_URL || 'http://localhost:3001').replace(/\/+$/, '');

export const TIMEOUT = __ENV.K6_TIMEOUT || '30s';

// Etiquetas comunes para poder filtrar resultados por suite.
export const SUITE_TAGS = {
  harness: 'pos-bug-hunt',
};
