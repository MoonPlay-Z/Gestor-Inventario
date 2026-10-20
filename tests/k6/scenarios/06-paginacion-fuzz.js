import { check } from 'k6';
import { F } from '../lib/fixtures.js';
import { api, json } from '../lib/http.js';

/**
 * 06 — Entradas raras en listados + bugs funcionales concretos.
 *
 * Contrato: la API nunca debe devolver 5xx por parámetros de paginación o
 * búsqueda. Debe clampear page >= 1 y limit dentro de un máximo razonable, o
 * responder 400.
 *
 * Incluye dos comprobaciones funcionales que no son de carga:
 *   - GET /api/cxc/export está declarado después de /:id en cxc.js, así que
 *     Express lo captura como id="export".
 *   - GET /api/productos/metricas usa req.user.id en vez de empresaId, por lo
 *     que un CAJA/INVENTARIO ve todo en cero.
 */
export const options = {
  scenarios: {
    fuzz: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '2m',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
  },
  tags: { suite: '06-paginacion-fuzz' },
};

const QRARGO = 'a'.repeat(2000);

export default function () {
  const token = F.users.empresaA.token;
  const filas = [];

  function caso(nombre, path, validar) {
    const res = api('GET', path, token, undefined, { name: nombre });
    const body = json(res);
    filas.push({ nombre, status: res.status, body });
    return { nombre, res, body, validar };
  }

  const casos = [
    caso('clientes page=0', '/clientes?page=0&limit=50', (r) => r.status < 500),
    caso('clientes page=-1', '/clientes?page=-1&limit=50', (r) => r.status < 500),
    caso('clientes limit=-5', '/clientes?limit=-5', (r, b) =>
      r.status < 500 && (r.status !== 200 || (Number(b.limit) >= 1 && Array.isArray(b.data)))
    ),
    caso('clientes limit=999999', '/clientes?limit=999999', (r, b) =>
      r.status < 500 && (r.status !== 200 || Number(b.limit) <= 100)
    ),
    caso('clientes page/limit no numéricos', '/clientes?page=abc&limit=xyz', (r, b) =>
      r.status === 200 && Number(b.page) === 1
    ),

    caso('facturas page=0', '/facturas?page=0', (r) => r.status < 500),
    caso('facturas page=-2', '/facturas?page=-2', (r) => r.status < 500),
    caso('facturas limit=-1', '/facturas?limit=-1', (r) => r.status < 500),
    caso('facturas limit=100000', '/facturas?limit=100000', (r, b) =>
      r.status < 500 && (r.status !== 200 || Number(b.limit) <= 100)
    ),
    caso('facturas fecha inválida', '/facturas?desde=no-es-fecha', (r) => r.status === 400),
    caso('facturas estado inválido', '/facturas?estados=NOPE', (r) =>
      r.status === 400 || r.status === 422
    ),
    caso('facturas rango válido', '/facturas?desde=2026-01-01&hasta=2026-12-31', (r) => r.status === 200),

    caso('productos page=0', '/productos?page=0', (r) => r.status < 500),
    caso('productos limit=-5', '/productos?limit=-5', (r) => r.status < 500),
    caso('productos limit=100000', '/productos?limit=100000', (r, b) =>
      r.status < 500 && (r.status !== 200 || Number(b.limit) <= 100)
    ),
    caso('productos q con %', '/productos?q=%25', (r) => r.status < 500),
    caso('productos q de 2000 chars', `/productos?q=${QRARGO}`, (r) => r.status < 500),

    caso('cxc page=0', '/cxc?page=0', (r) => r.status < 500),
    caso('cxc page=-1', '/cxc?page=-1&limit=25', (r) => r.status < 500),
    caso('cxc limit=999999', '/cxc?limit=999999', (r, b) =>
      r.status < 500 && (r.status !== 200 || Number(b.limit) <= 100)
    ),
    caso('cxc q SQLi', "/cxc?q='%20OR%201=1--", (r) => r.status < 500),

    caso('pagos listado básico', '/pagos?limit=10', (r) => r.status === 200),
    caso('pagos page=0 (control con paginate)', '/pagos?page=0', (r, b) =>
      r.status === 200 && Number(b.page) === 1
    ),
    caso('pagos limit=-5 (control con paginate)', '/pagos?limit=-5', (r, b) =>
      r.status === 200 && Number(b.limit) >= 1
    ),

    caso('cxc export accesible', '/cxc/export', (r) =>
      r.status === 200 && /csv/i.test(r.headers['Content-Type'] || '')
    ),
  ];

  // Métricas de inventario: EMPRESA vs CAJA (subusuario heredado).
  const metricasEmpresa = json(api('GET', '/productos/metricas', token));
  const metricasCaja = json(api('GET', '/productos/metricas', F.users.cajeroA.token));

  const checks = {};
  for (const c of casos) {
    checks[`${c.nombre} (status ${c.res.status})`] = () => c.validar(c.res, c.body);
  }
  checks['GET /productos/metricas devuelve los mismos totales a EMPRESA y CAJA'] = () =>
    Number(metricasCaja.totalProductos) === Number(metricasEmpresa.totalProductos);

  check(null, checks);

  const cincoXX = filas.filter((f) => f.status >= 500);
  console.log(
    `[06] casos=${filas.length} 5xx=${cincoXX.length} ` +
      `metricasEmpresa=${metricasEmpresa.totalProductos} ` +
      `metricasCaja=${metricasCaja.totalProductos}`
  );
  if (cincoXX.length) {
    console.log(
      `[06] 5xx: ${cincoXX.map((f) => `${f.nombre}=${f.status}`).join(', ')}`
    );
  }
}
