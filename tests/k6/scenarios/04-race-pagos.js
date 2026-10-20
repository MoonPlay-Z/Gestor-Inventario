import http from 'k6/http';
import { check } from 'k6';
import { BASE } from '../lib/config.js';
import { F } from '../lib/fixtures.js';
import { api, json, statusSummary, warmupBcv } from '../lib/http.js';

/**
 * 04 — Carrera de pagos (sobrepago).
 *
 * Se lanzan 10 pagos simultáneos por el saldo exacto de una factura de 10 USD.
 * El servidor debe aceptar exactamente uno; los otros 9 deben rechazarse por
 * exceder el saldo.
 *
 * Se prueba por las dos puertas de entrada:
 *   - POST /api/pagos
 *   - POST /api/cxc/:id/pago
 *
 * Ambas leen el saldo FUERA de la transacción y sin bloquear la fila, así que
 * dos peticiones concurrentes pueden validar contra el mismo pendiente e
 * insertar dos pagos.
 */
export const options = {
  scenarios: {
    race: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '3m',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
  },
  tags: { suite: '04-race-pagos' },
};

const CONCURRENTES = 10;

function pagoBody(facturaId, ref) {
  return {
    facturaId,
    monto: 10,
    metodoPago: 'BANK_TRANSFER',
    monedaPago: 'USD',
    referenciaTransaccion: ref,
  };
}

export default function () {
  const token = F.users.empresaA.token;
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Evita que los 10 pagos concurrentes esperen 8 s cada uno al BCV.
  warmupBcv(token);

  // ── Puerta 1: POST /api/pagos ─────────────────────────────────────────────
  const pagos = http.batch(
    Array.from({ length: CONCURRENTES }, (_, i) => ({
      method: 'POST',
      url: `${BASE}/api/pagos`,
      body: JSON.stringify(pagoBody(F.facturas.pagosRace.id, `k6-pago-${i}`)),
      params: { headers: auth, tags: { name: 'POST /pagos race' } },
    }))
  );

  // ── Puerta 2: POST /api/cxc/:id/pago ─────────────────────────────────────
  const abonos = http.batch(
    Array.from({ length: CONCURRENTES }, (_, i) => ({
      method: 'POST',
      url: `${BASE}/api/cxc/${F.facturas.cxcRace.cxcId}/pago`,
      body: JSON.stringify({
        monto: 10,
        metodoPago: 'BANK_TRANSFER',
        monedaPago: 'USD',
        referenciaTransaccion: `k6-cxc-${i}`,
      }),
      params: { headers: auth, tags: { name: 'POST /cxc/pago race' } },
    }))
  );

  const okPagos = pagos.filter((r) => r.status === 201).length;
  const okAbonos = abonos.filter((r) => r.status === 201).length;
  const cincoXX = [...pagos, ...abonos].filter((r) => r.status >= 500).length;

  const facturaPagos = json(api('GET', `/facturas/${F.facturas.pagosRace.id}`, token));
  const facturaCxc = json(api('GET', `/facturas/${F.facturas.cxcRace.id}`, token));
  const cxc = json(api('GET', `/cxc/${F.facturas.cxcRace.cxcId}`, token));

  check(null, {
    'solo un pago directo es aceptado': () => okPagos === 1,
    'solo un abono desde CxC es aceptado': () => okAbonos === 1,
    'la factura pagada queda PAID': () => facturaPagos.estado === 'PAID',
    'la factura abonada desde CxC queda PAID': () => facturaCxc.estado === 'PAID',
    'la factura directa tiene un solo pago': () =>
      Array.isArray(facturaPagos.pagos) && facturaPagos.pagos.length === 1,
    'la factura desde CxC tiene un solo pago': () =>
      Array.isArray(facturaCxc.pagos) && facturaCxc.pagos.length === 1,
    'el total pagado no supera el total de la factura': () =>
      Number(facturaPagos.totalPagado) <= 10.011,
    'la CxC queda saldada (pendiente 0)': () =>
      Number(cxc.montoPendiente) === 0,
    'la CxC no cobra más de lo original': () =>
      Number(cxc.montoCobrado) <= 10.011,
    'sin errores 5xx': () => cincoXX === 0,
  });

  console.log(
    `[04] /pagos=${JSON.stringify(statusSummary(pagos))} ` +
      `/cxc/pago=${JSON.stringify(statusSummary(abonos))} ` +
      `facturaPagos=${JSON.stringify({
        estado: facturaPagos.estado,
        totalPagado: facturaPagos.totalPagado,
        pagos: facturaPagos.pagos?.length,
      })} cxcPendiente=${cxc.montoPendiente}`
  );
}
