import { check } from 'k6';
import { F } from '../lib/fixtures.js';
import { api, apiRaw, json } from '../lib/http.js';

/**
 * 07 — Fuzzing de validación de payloads.
 *
 * Contrato: toda entrada inválida debe producir 4xx. Un 5xx aquí indica que una
 * excepción no controlada (típicamente DecimalError) llegó al error handler.
 *
 * Sospechas concretas del código:
 *   - productos.js hace new Decimal(precioVenta) sin try/catch.
 *   - pagos.js hace new Decimal(monto) sin try/catch.
 *   - cxc.js hace new Decimal(monto) sin try/catch.
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
  tags: { suite: '07-payload-fuzz' },
};

export default function () {
  const token = F.users.empresaA.token;
  const iso = new Date(Date.now() + 15 * 864e5).toISOString();
  const facturaId = F.facturas.overpay.id;
  const cxcId = F.facturas.overpay.cxcId;
  const resultados = [];

  function probar(nombre, method, path, body, esperado = (s) => s >= 400 && s < 500) {
    const res = api(method, path, token, body, { name: `${method} ${path}` });
    resultados.push({ nombre, status: res.status, body: json(res) });
    return { nombre, status: res.status, body: json(res), esperado };
  }

  const casos = [
    // ── Productos ──────────────────────────────────────────────────────────
    probar('producto precio no numérico', 'POST', '/productos', {
      nombre: 'K6 Fuzz producto',
      precioVenta: 'abc',
    }),
    probar('producto precio objeto', 'POST', '/productos', {
      nombre: 'K6 Fuzz producto',
      precioVenta: { a: 1 },
    }),
    probar('producto nombre vacío', 'POST', '/productos', {
      nombre: '',
      precioVenta: 10,
    }),
    probar('producto stock negativo', 'POST', '/productos', {
      nombre: 'K6 Fuzz producto',
      precioVenta: 10,
      stockActual: -1,
    }),
    probar('producto IVA fuera de rango', 'POST', '/productos', {
      nombre: 'K6 Fuzz producto',
      precioVenta: 10,
      tasaImpuesto: 101,
    }),
    probar('producto PUT precio no numérico', 'PUT', `/productos/${F.productos.probe}`, {
      sku: 'K6-PROBE',
      nombre: 'K6 Probe',
      precioVenta: 'abc',
    }),

    // ── Pagos ──────────────────────────────────────────────────────────────
    probar('pago monto no numérico', 'POST', '/pagos', {
      facturaId,
      monto: 'abc',
      metodoPago: 'CASH',
    }),
    probar('pago monto nulo', 'POST', '/pagos', {
      facturaId,
      monto: null,
      metodoPago: 'CASH',
    }),
    probar('pago monto negativo', 'POST', '/pagos', {
      facturaId,
      monto: -1,
      metodoPago: 'CASH',
    }),
    probar('pago monto desbordado', 'POST', '/pagos', {
      facturaId,
      monto: '1e309',
      metodoPago: 'CASH',
    }),
    probar('pago moneda inválida', 'POST', '/pagos', {
      facturaId,
      monto: 1,
      metodoPago: 'CASH',
      monedaPago: 'EUR',
    }),
    probar('pago factura inexistente', 'POST', '/pagos', {
      facturaId: '00000000-0000-0000-0000-000000000000',
      monto: 1,
      metodoPago: 'CASH',
    }, (s) => s === 404 || s === 400),

    // ── Facturas ───────────────────────────────────────────────────────────
    probar('factura items nulos', 'POST', '/facturas', {
      clienteId: F.clientes.A,
      fechaVencimiento: iso,
      requestId: `k6-fuzz-1-${Date.now()}`,
      items: null,
    }),
    probar('factura items vacíos', 'POST', '/facturas', {
      clienteId: F.clientes.A,
      fechaVencimiento: iso,
      requestId: `k6-fuzz-2-${Date.now()}`,
      items: [],
    }),
    probar('factura cantidad no numérica', 'POST', '/facturas', {
      clienteId: F.clientes.A,
      fechaVencimiento: iso,
      requestId: `k6-fuzz-3-${Date.now()}`,
      items: [{ productoId: F.productos.high, cantidad: 'abc' }],
    }),
    probar('factura cantidad desbordada', 'POST', '/facturas', {
      clienteId: F.clientes.A,
      fechaVencimiento: iso,
      requestId: `k6-fuzz-4-${Date.now()}`,
      items: [{ productoId: F.productos.high, cantidad: '1e309' }],
    }),
    probar('factura fecha inválida', 'POST', '/facturas', {
      clienteId: F.clientes.A,
      fechaVencimiento: 'no-es-fecha',
      requestId: `k6-fuzz-5-${Date.now()}`,
      items: [{ productoId: F.productos.high, cantidad: 1 }],
    }),
    probar('factura moneda inválida', 'POST', '/facturas', {
      clienteId: F.clientes.A,
      fechaVencimiento: iso,
      requestId: `k6-fuzz-6-${Date.now()}`,
      moneda: 'EUR',
      items: [{ productoId: F.productos.high, cantidad: 1 }],
    }),
    probar('factura producto inexistente', 'POST', '/facturas', {
      clienteId: F.clientes.A,
      fechaVencimiento: iso,
      requestId: `k6-fuzz-7-${Date.now()}`,
      items: [{ productoId: '00000000-0000-0000-0000-000000000000', cantidad: 1 }],
    }),

    // ── Caja ───────────────────────────────────────────────────────────────
    probar('caja open monto no numérico', 'POST', '/caja/open', {
      montoInicial: 'abc',
    }),
    probar('caja close monto no numérico', 'POST', '/caja/close', {
      montoFinal: 'abc',
    }),

    // ── CxC ────────────────────────────────────────────────────────────────
    probar('cxc monto no numérico', 'POST', `/cxc/${cxcId}/pago`, {
      monto: 'abc',
      metodoPago: 'CASH',
    }),
    probar('cxc monto negativo', 'POST', `/cxc/${cxcId}/pago`, {
      monto: -5,
      metodoPago: 'CASH',
    }),
    probar('cxc moneda inválida', 'POST', `/cxc/${cxcId}/pago`, {
      monto: 1,
      metodoPago: 'CASH',
      monedaPago: 'EUR',
    }),

    // ── Clientes / usuarios ────────────────────────────────────────────────
    probar('cliente RIF inválido', 'POST', '/clientes', {
      razonSocial: 'K6 Fuzz cliente',
      rifCedula: '!!',
    }),
    probar('cliente vacío', 'POST', '/clientes', {}),
    probar('usuario vacío', 'POST', '/usuarios', {}),

    // ── JSON malformado y cuerpo gigante ───────────────────────────────────
    (() => {
      const res = apiRaw('POST', '/productos', token, '{esto no es json', {
        name: 'JSON malformado',
      });
      resultados.push({ nombre: 'JSON malformado', status: res.status });
      return { nombre: 'JSON malformado', status: res.status, esperado: (s) => s >= 400 && s < 500 };
    })(),
    (() => {
      const grande = JSON.stringify({
        nombre: 'x'.repeat(1_200_000),
        precioVenta: 1,
      });
      const res = apiRaw('POST', '/productos', token, grande, {
        name: 'body 1.2MB',
      });
      resultados.push({ nombre: 'body 1.2MB', status: res.status });
      return { nombre: 'body 1.2MB', status: res.status, esperado: (s) => s === 413 || (s >= 400 && s < 500) };
    })(),
  ];

  const checks = {};
  for (const c of casos) {
    checks[`${c.nombre} (status ${c.status})`] = () => c.esperado(c.status);
  }
  check(null, checks);

  const cincoXX = resultados.filter((r) => r.status >= 500);
  console.log(
    `[07] casos=${resultados.length} 5xx=${cincoXX.length} ` +
      `statuses=${JSON.stringify(resultados.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {}))}`
  );
  if (cincoXX.length) {
    console.log(`[07] 5xx: ${cincoXX.map((r) => `${r.nombre}=${r.status}`).join(', ')}`);
  }
}
