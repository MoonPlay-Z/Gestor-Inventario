const API_URL = import.meta.env.VITE_API_URL || '/api';


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

  const defaultOptions = {
    headers: { ...headers, ...(options.headers || {}) },
  };
  
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, { ...options, ...defaultOptions });
  
  if (response.status === 204) return null;

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new ApiError('Sesión expirada', 401);
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 403 && data.code === 'SUBSCRIPTION_EXPIRED') {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.subscriptionStatus = 'expired_trial';
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('subscription:expired'));
    throw new ApiError(data.error || 'Suscripción expirada', 403, null, 'SUBSCRIPTION_EXPIRED', data);
  }

  if (!response.ok) {
    throw new ApiError(
      data.error || data.message || 'Ha ocurrido un error inesperado',
      response.status,
      data.fields,
      data.code,
      data
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
    const response = await fetch(url, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
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
