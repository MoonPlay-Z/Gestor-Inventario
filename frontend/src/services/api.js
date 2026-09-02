const API_URL = import.meta.env.VITE_API_URL || '/api';

// Tiempo máximo de espera para una petición antes de abortarla (ms).
const REQUEST_TIMEOUT_MS = 20000;

export class ApiError extends Error {
  constructor(message, status, fields, code, data) {
    super(message);
    this.status = status;
    this.fields = fields;
    this.code = code;
    this.data = data;
  }
}

export async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const mergedHeaders = { ...headers, ...(options.headers || {}) };

  const body = (options.body && typeof options.body === 'object')
    ? JSON.stringify(options.body)
    : options.body;

  // Controlador para poder abortar la petición si tarda demasiado
  // (evita que el usuario quede esperando indefinidamente si el
  // backend no responde).
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
      body,
      signal: controller.signal
    });
  } catch (err) {
    // fetch() lanza un error nativo (no HTTP) cuando: el servidor está
    // caído, hay un problema de CORS, no hay conexión a internet, o la
    // petición fue abortada por timeout. Antes esto se propagaba sin
    // envolver, dando un "TypeError: Failed to fetch" crudo en la UI.
    if (err.name === 'AbortError') {
      throw new ApiError(
        'El servidor tardó demasiado en responder. Verifica tu conexión e inténtalo de nuevo.',
        0,
        null,
        'TIMEOUT'
      );
    }
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica tu conexión a internet e inténtalo de nuevo.',
      0,
      null,
      'NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) return null;

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new ApiError('Sesión expirada', 401);
  }

  // El backend puede responder con contenido no-JSON en ciertos fallos
  // (por ejemplo una página de error HTML de un proxy). Si eso pasa,
  // igual queremos que quede claro cuál fue el status HTTP en el mensaje.
  const data = await response.json().catch(() => null);
  const safeData = data || {};

  // El backend usa el código 'PAYMENT_REQUIRED' (no 'SUBSCRIPTION_EXPIRED')
  // para indicar que la mensualidad venció. Antes esta comparación nunca
  // coincidía y el evento 'subscription:expired' nunca se disparaba.
  if (response.status === 403 && safeData.code === 'PAYMENT_REQUIRED') {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.subscriptionStatus = 'expired_trial';
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('subscription:expired'));
    throw new ApiError(safeData.error || 'Suscripción expirada', 403, null, 'PAYMENT_REQUIRED', safeData);
  }

  if (!response.ok) {
    throw new ApiError(
      safeData.error || safeData.message || `Ha ocurrido un error inesperado (HTTP ${response.status})`,
      response.status,
      safeData.fields,
      safeData.code,
      safeData
    );
  }

  return data;
}

export const API = {
  request,
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register-client', { method: 'POST', body: userData }),

  // Config
  getConfig: () => request('/config'),
  saveConfig: (data) => request('/config', { method: 'POST', body: data }),

  // Dashboard
  getDashboardStats: () => request('/dashboard'),

  // Clientes
  getClientes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/clientes${qs ? `?${qs}` : ''}`);
  },
  getCliente: (id) => request(`/clientes/${id}`),
  crearCliente: (data) => request('/clientes', { method: 'POST', body: data }),
  actualizarCliente: (id, data) => request(`/clientes/${id}`, { method: 'PUT', body: data }),
  eliminarCliente: (id) => request(`/clientes/${id}`, { method: 'DELETE' }),

  // Productos
  getProductos: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/productos${qs ? `?${qs}` : ''}`);
  },
  getProducto: (id) => request(`/productos/${id}`),
  lookupProducto: (codigo) => request(`/productos/lookup/${encodeURIComponent(codigo)}`),
  getNextSku: () => request('/productos/next-sku'),
  crearProducto: (data) => request('/productos', { method: 'POST', body: data }),
  actualizarProducto: (id, data) => request(`/productos/${id}`, { method: 'PUT', body: data }),
  eliminarProducto: (id) => request(`/productos/${id}`, { method: 'DELETE' }),
  ajustarStock: (id, cantidad, operacion) => request(`/productos/${id}/stock`, { method: 'PATCH', body: { cantidad, operacion } }),

  // Facturas
  getFacturas: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/facturas${qs ? `?${qs}` : ''}`);
  },
  getFactura: (id) => request(`/facturas/${id}`),
  emitirFactura: (data) => request('/facturas', { method: 'POST', body: data }),
  anularFactura: (id) => request(`/facturas/${id}/anular`, { method: 'PATCH' }),

  // Cotizaciones
  getCotizaciones: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/cotizaciones${qs ? `?${qs}` : ''}`);
  },
  crearCotizacion: (data) => request('/cotizaciones', { method: 'POST', body: data }),
  convertirCotizacion: (id) => request(`/cotizaciones/${id}/convert`, { method: 'POST' }),

  // Pagos
  getPagos: (facturaId) => request(`/pagos?facturaId=${facturaId}`),
  registrarPago: (data) => request('/pagos', { method: 'POST', body: data }),
  eliminarPago: (id) => request(`/pagos/${id}`, { method: 'DELETE' }),

  // Caja
  getCajaActual: () => request('/caja/status'),
  abrirCaja: (montoInicial, observaciones) => request('/caja/open', { method: 'POST', body: { montoInicial, observaciones } }),
  cerrarCaja: (montoFinal, observaciones) => request('/caja/close', { method: 'POST', body: { montoFinal, observaciones } }),
  getHistorialCaja: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/caja${qs ? `?${qs}` : ''}`);
  },
  getPreviewCaja: (usuarioId) => request(`/caja/preview${usuarioId ? `?usuarioId=${usuarioId}` : ''}`),

  // Usuarios (Subcuentas)
  getUsuarios: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/usuarios${qs ? `?${qs}` : ''}`);
  },
  crearUsuario: (data) => request('/usuarios', { method: 'POST', body: data }),
  actualizarUsuario: (id, data) => request(`/usuarios/${id}`, { method: 'PUT', body: data }),
  eliminarUsuario: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),

  // Administración de Empresas y Activaciones (Super Admin)
  getActivaciones: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/activaciones${qs ? `?${qs}` : ''}`);
  },
  getEmpresas: () => request('/activaciones/empresas'),
  cambiarEstadoEmpresa: (id, activo) => request(`/activaciones/empresas/${id}/estado`, { method: 'PUT', body: { activo } }),
  eliminarEmpresa: (id) => request(`/activaciones/empresas/${id}`, { method: 'DELETE' }),
  activarManual: (id, data) => request(`/activaciones/${id}/activar-manual`, { method: 'PUT', body: data }),

  // Backup
  importarRespaldo: (data) => request('/backup/import', { method: 'POST', body: data }),
  exportarRespaldo: async () => {
    const url = `${API_URL}/backup/export`;
    const token = localStorage.getItem('token');
    let response;
    try {
      response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch (err) {
      throw new ApiError('No se pudo conectar con el servidor para exportar el respaldo.', 0, null, 'NETWORK_ERROR');
    }
    if (!response.ok) throw new Error('Error al exportar el respaldo');
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlBlob;
    a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(urlBlob);
    document.body.removeChild(a);
  },

  // Máquina Fiscal
  getFiscalStatus: () => request('/fiscal/status'),
  connectFiscal: (data) => request('/fiscal/connect', { method: 'POST', body: data }),
  disconnectFiscal: () => request('/fiscal/disconnect', { method: 'POST' }),
  imprimirFiscal: (facturaId) => request(`/fiscal/imprimir/${facturaId}`, { method: 'POST' }),
  reporteXFiscal: () => request('/fiscal/reporte-x', { method: 'POST' }),
  reporteZFiscal: () => request('/fiscal/reporte-z', { method: 'POST' }),

  // Suscripciones y Pagos SaaS
  reportarPagoSaaS: (data) => request('/auth/reportar-pago', { method: 'POST', body: data }),
  getMetodosPagoSaaS: () => request('/auth/metodos-pago'),
  getPublicNoticias: () => request('/public/noticias'),
};

export const Utils = {
  escapeHtml: (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  formatMoney: (amount, symbol = '$') => {
    return `${symbol} ${Number(amount || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  formatDate: (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }
};