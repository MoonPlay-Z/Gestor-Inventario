import http from 'k6/http';
import { check } from 'k6';
import { BASE } from '../lib/config.js';
import { F } from '../lib/fixtures.js';
import { api, json, statusSummary } from '../lib/http.js';

/**
 * 03 — Sobreventa de stock (oversell).
 *
 * El producto de prueba tiene 5 unidades. Se lanzan 20 facturas concurrentes
 * de 1 unidad. El servidor no puede vender más de 5 ni dejar stock negativo.
 *
 * La validación de stock de facturas.js usa updateMany con
 * `stockActual >= cantidad`, que debería ser atómico. Este test busca
 * regresiones (p. ej. volver a leer y luego escribir, o transacciones sin
 * aislamiento).
 */
export const options = {
  scenarios: {
    race: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '1m',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
  },
  tags: { suite: '03-oversell-stock' },
};

const STOCK_INICIAL = 5;
const CONCURRENTES = 20;

export default function () {
  const token = F.users.empresaA.token;
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const base = `k6-oversell-${Date.now()}`;

  const reqs = Array.from({ length: CONCURRENTES }, (_, i) => ({
    method: 'POST',
    url: `${BASE}/api/facturas`,
    body: JSON.stringify({
      clienteId: F.clientes.A,
      fechaVencimiento: new Date(Date.now() + 15 * 864e5).toISOString(),
      requestId: `${base}-${i}`,
      moneda: 'USD',
      items: [{ productoId: F.productos.stock5, cantidad: 1 }],
    }),
    params: { headers: auth, tags: { name: 'POST /facturas oversell' } },
  }));

  const responses = http.batch(reqs);

  const creadas = responses.filter((r) => r.status === 201).length;
  const rechazadas = responses.filter((r) => r.status === 400 || r.status === 409).length;
  const cincoXX = responses.filter((r) => r.status >= 500).length;

  const producto = api('GET', `/productos/${F.productos.stock5}`, token);
  const stockFinal = Number(json(producto).stockActual);

  check(null, {
    'no se venden más unidades que el stock disponible': () =>
      creadas <= STOCK_INICIAL,
    'el stock nunca queda negativo': () => stockFinal >= 0,
    'el stock final coincide con las ventas aceptadas': () =>
      Math.abs(stockFinal - (STOCK_INICIAL - creadas)) < 1e-6,
    'todas las rechazadas son 4xx (no 5xx)': () => cincoXX === 0,
  });

  console.log(
    `[03] statuses=${JSON.stringify(statusSummary(responses))} ` +
      `creadas=${creadas} rechazadas=${rechazadas} stockFinal=${stockFinal}`
  );
}
