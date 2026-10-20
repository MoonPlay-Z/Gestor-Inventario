import { check } from 'k6';
import { F } from '../lib/fixtures.js';
import { api, json } from '../lib/http.js';

/**
 * 08 — Aislamiento multi-tenant y autorización por rol.
 *
 * Cualquier 2xx con datos de otra empresa es un fallo crítico. También busca
 * endpoints que olvidaron requireRole (p. ej. POST /api/config no lo tiene).
 *
 * Caso especial: requestId es @unique global en Factura. El branch de
 * idempotencia hace findUnique({ where: { requestId } }) sin filtrar tenant.
 * Si la empresa B reutiliza un requestId de A, podría recibir la factura de A.
 */
export const options = {
  scenarios: {
    tenant: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '2m',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
  },
  tags: { suite: '08-multitenant' },
};

export default function () {
  const tokenA = F.users.empresaA.token;
  const tokenB = F.users.empresaB.token;
  const tokenCaja = F.users.cajeroA.token;
  const tokenVisor = F.users.visorA.token;
  const tokenInventario = F.users.inventarioA.token;
  const tokenSuper = F.users.superadmin.token;

  const resultados = [];

  function registrar(nombre, res, ok) {
    resultados.push({ nombre, status: res.status, body: json(res) });
    return { nombre, res, body: json(res), ok };
  }

  function denegado(nombre, method, path, token, body) {
    const res = api(method, path, token, body, { name: `${method} ${path}` });
    return registrar(nombre, res, res.status >= 400 && res.status < 500);
  }

  function prohibido(nombre, method, path, token, body) {
    const res = api(method, path, token, body, { name: `${method} ${path}` });
    return registrar(nombre, res, res.status === 403);
  }

  const iso = new Date(Date.now() + 15 * 864e5).toISOString();

  const casos = [
    // ── Empresa B contra recursos de A ─────────────────────────────────────
    denegado('B lee cliente de A', 'GET', `/clientes/${F.clientes.A}`, tokenB),
    denegado('B lee factura de A', 'GET', `/facturas/${F.facturas.idemA.id}`, tokenB),
    denegado('B lee CxC de A', 'GET', `/cxc/${F.facturas.idemA.cxcId}`, tokenB),
    denegado('B lee producto de A', 'GET', `/productos/${F.productos.probe}`, tokenB),
    denegado('B busca por código un producto de A', 'GET', '/productos/lookup/K6-HIGH', tokenB),
    denegado('B actualiza producto de A', 'PUT', `/productos/${F.productos.probe}`, tokenB, {
      sku: 'K6-PROBE',
      nombre: 'K6 Probe HACK',
      precioVenta: 1,
    }),
    denegado('B elimina producto de A', 'DELETE', `/productos/${F.productos.probe}`, tokenB),
    denegado('B registra pago en factura de A', 'POST', '/pagos', tokenB, {
      facturaId: F.facturas.idemA.id,
      monto: 1,
      metodoPago: 'CASH',
    }),
    denegado('B abona a CxC de A', 'POST', `/cxc/${F.facturas.idemA.cxcId}/pago`, tokenB, {
      monto: 1,
      metodoPago: 'CASH',
    }),

    // ── Fuga vía requestId global ──────────────────────────────────────────
    (() => {
      const res = api('POST', '/facturas', tokenB, {
        clienteId: F.clientes.B,
        fechaVencimiento: iso,
        requestId: F.sharedRequestId,
        items: [{ productoId: F.productos.bHigh, cantidad: 1 }],
      });
      const body = json(res);
      const sinFuga =
        res.status >= 400 && res.status < 500
          ? true
          : !(res.status === 200 && body.clienteId === F.clientes.A);
      return registrar(
        'B no recibe la factura de A al reutilizar requestId',
        res,
        sinFuga
      );
    })(),

    // ── Listados: B no ve datos de A ───────────────────────────────────────
    (() => {
      const res = api('GET', `/facturas?clienteId=${F.clientes.A}&limit=100`, tokenB);
      const body = json(res);
      const data = Array.isArray(body.data) ? body.data : [];
      return registrar(
        'B no lista facturas del cliente de A',
        res,
        data.every((f) => f.clienteId !== F.clientes.A)
      );
    })(),
    (() => {
      const res = api('GET', `/cxc/cliente/${F.clientes.A}`, tokenB);
      const body = json(res);
      const data = Array.isArray(body) ? body : Array.isArray(body.data) ? body.data : [];
      return registrar(
        'B no lista CxC del cliente de A',
        res,
        data.length === 0
      );
    })(),

    // ── Autorización por rol ───────────────────────────────────────────────
    denegado('CAJA no accede a ganancias', 'GET', '/reportes/ganancias', tokenCaja),
    prohibido('CAJA no crea usuarios', 'POST', '/usuarios', tokenCaja, {}),
    // POST /api/config no tiene requireRole en config.js. Con body vacío debe
    // responder 403 por autorización, no 400 por validación.
    prohibido('CAJA no guarda configuración global', 'POST', '/config', tokenCaja, {}),
    prohibido('VISOR no emite facturas', 'POST', '/facturas', tokenVisor, {
      clienteId: F.clientes.A,
      fechaVencimiento: iso,
      items: [{ productoId: F.productos.high, cantidad: 1 }],
    }),
    prohibido('INVENTARIO no emite facturas', 'POST', '/facturas', tokenInventario, {
      clienteId: F.clientes.A,
      fechaVencimiento: iso,
      items: [{ productoId: F.productos.high, cantidad: 1 }],
    }),
    prohibido('SUPER_ADMIN no gestiona inventario', 'GET', '/productos', tokenSuper),
  ];

  const checks = {};
  for (const c of casos) {
    checks[`${c.nombre} (status ${c.res.status})`] = () => c.ok;
  }
  check(null, checks);

  const malos = casos.filter((c) => !c.ok);
  console.log(
    `[08] casos=${casos.length} fallos=${malos.length} ` +
      `statuses=${JSON.stringify(casos.reduce((a, c) => ((a[c.res.status] = (a[c.res.status] || 0) + 1), a), {}))}`
  );
  if (malos.length) {
    console.log(
      `[08] fallos: ${malos.map((c) => `${c.nombre}=${c.res.status}`).join(', ')}`
    );
  }
}
