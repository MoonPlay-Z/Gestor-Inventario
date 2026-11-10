const {
  registrar,
  contexto,
  completarSolicitud,
} = require('../services/bitacora');

const METODOS_MUTACION = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CATEGORIA_MODULO = {
  auth: 'ACCESO',
  backup: 'ADMIN',
  caja: 'CAJA',
  clientes: 'CLIENTES',
  config: 'CONFIGURACION',
  cotizaciones: 'VENTAS',
  cxc: 'CXC',
  facturas: 'VENTAS',
  'facturas-pruebas': 'VENTAS',
  fiscal: 'CONFIGURACION',
  pagos: 'PAGOS',
  productos: 'INVENTARIO',
  reportes: 'REPORTES',
  tasa: 'CONFIGURACION',
  usuarios: 'ADMIN',
  roles: 'ADMIN',
  activaciones: 'ADMIN',
};

function capturar(req) {
  if (METODOS_MUTACION.has(req.method)) return true;
  return req.method === 'GET'
    && /\/(?:export|descargar|download)(?:\/|$)/i.test(req.originalUrl.split('?')[0]);
}

function auditoriaHttp(req, res, next) {
  if (!req.user || !capturar(req)) return next();

  const iniciadoEn = Date.now();
  const httpPath = req.originalUrl.split('?')[0].slice(0, 500);
  const partes = httpPath.split('/').filter(Boolean);
  const modulo = partes[1] || 'api';
  const metadata = {
    httpMethod: req.method,
    httpPath,
    httpStatus: null,
    duracionMs: null,
    ready: false,
  };
  req.bitacoraHttp = metadata;

  const finalizar = (httpStatus) => {
    if (metadata.ready) return;
    const duracionMs = Math.max(0, Date.now() - iniciadoEn);
    completarSolicitud(req, httpStatus, duracionMs);
    if (req.bitacoraExplicita) return;

    const categoria = CATEGORIA_MODULO[modulo] || 'ADMIN';

    registrar({
      contexto: contexto(req, false),
      categoria,
      modulo,
      accion: `HTTP_${req.method}_${httpStatus}`,
      entidad: 'Endpoint',
      descripcion: `${req.method} ${httpPath} respondió ${httpStatus}`,
      httpMethod: metadata.httpMethod,
      httpPath: metadata.httpPath,
      httpStatus: metadata.httpStatus,
      duracionMs: metadata.duracionMs,
    });
  };

  res.once('finish', () => finalizar(res.statusCode));
  res.once('close', () => finalizar(res.writableFinished ? res.statusCode : 499));

  next();
}

module.exports = { auditoriaHttp };
