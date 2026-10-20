import http from 'k6/http';
import { check } from 'k6';
import { BASE } from '../lib/config.js';
import { F } from '../lib/fixtures.js';
import { api, json } from '../lib/http.js';

/**
 * 02 — Idempotencia de POST /api/facturas.
 *
 * 20 peticiones idénticas con el mismo requestId deben producir UNA sola
 * factura. Además el stock debe decrementarse una sola vez.
 *
 * Un fallo aquí puede ser: varias facturas (201 múltiples), stock descontado
 * varias veces, pagos/CxC duplicados o respuestas 200 que no sean idempotentes.
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
  tags: { suite: '02-idempotencia-factura' },
};

export default function () {
  const requestId = `k6-race-${Date.now()}`;
  const token = F.users.empresaA.token;
  const body = JSON.stringify({
    clienteId: F.clientes.A,
    fechaVencimiento: new Date(Date.now() + 15 * 864e5).toISOString(),
    requestId,
    moneda: 'USD',
    items: [{ productoId: F.productos.high, cantidad: 1 }],
  });

  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const reqs = Array.from({ length: 20 }, () => ({
    method: 'POST',
    url: `${BASE}/api/facturas`,
    body,
    params: { headers: auth, tags: { name: 'POST /facturas race' } },
  }));

  const responses = http.batch(reqs);

  const created = responses.filter((r) => r.status === 201);
  const idempotent = responses.filter((r) => r.status === 200);
  const ids = new Set(
    responses
      .filter((r) => r.status === 200 || r.status === 201)
      .map((r) => {
        try {
          return JSON.parse(r.body).id;
        } catch {
          return null;
        }
      })
  );
  const fiveHundreds = responses.filter((r) => r.status >= 500).length;

  check(null, {
    'exactamente una petición crea la factura (201)': () => created.length === 1,
    'las otras 19 responden 200 idempotente': () =>
      idempotent.length === 19 && idempotent.every((r) => json(r).idempotent === true),
    'todas las respuestas apuntan a la misma factura': () => ids.size === 1,
    'sin errores 5xx': () => fiveHundreds === 0,
  });

  const producto = api('GET', `/productos/${F.productos.high}`, token);
  const stockFinal = Number(json(producto).stockActual);
  const stockEsperado = F.initialStock[F.productos.high] - 1;

  check(null, {
    'el stock se descuenta una sola vez': () =>
      Math.abs(stockFinal - stockEsperado) < 1e-6,
  });

  const primera = created[0] ? json(created[0]) : {};
  console.log(
    `[02] created=${created.length} idempotent=${idempotent.length} ` +
      `ids=${ids.size} 5xx=${fiveHundreds} stock=${stockFinal} ` +
      `numeroFactura=${primera.numeroFactura || 'n/a'}`
  );
}
