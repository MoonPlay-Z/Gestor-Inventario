import { check } from 'k6';
import { F } from '../lib/fixtures.js';
import { api, json, warmupBcv } from '../lib/http.js';

/**
 * 09 — Conversión de moneda y tasa por empresa.
 *
 * Tasa fija: 100 Bs/USD (modo MANUAL).
 *
 * Escenarios:
 *   1. Factura USD 10 + abono de 500 Bs => 5 USD.
 *   2. Abono de 500.4 Bs (5.004 USD) sobre 5 pendientes => se acepta por la
 *      tolerancia de medio centavo y se aplica solo 5.
 *   3. Abono de 1001 Bs (10.01 USD) sobre 10 pendientes => se rechaza.
 *   4. Factura VES 1000 pagada con 1000 Bs => PAID.
 *   5. Factura USD 10 pagada con 1000 Bs => PAID usando la tasa de la empresa
 *      (no tasaCambio=1, que leería 1000 USD y rechazaría el pago).
 */
export const options = {
  scenarios: {
    monedas: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '3m',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
  },
  tags: { suite: '09-monedas-tasa' },
};

export default function () {
  const token = F.users.empresaA.token;
  const resultados = [];

  function paso(nombre, res, ok) {
    const body = json(res);
    resultados.push({ nombre, status: res.status, body });
    return { nombre, res, body, ok };
  }

  function pagar(nombre, facturaKey, monto, monedaPago, metodoPago, ref) {
    const factura = F.facturas[facturaKey];
    const res = api('POST', '/pagos', token, {
      facturaId: factura.id,
      monto,
      metodoPago,
      monedaPago,
      referenciaTransaccion: metodoPago === 'CASH' ? undefined : ref,
    });
    return paso(nombre, res, res.status === 201);
  }

  function cxc(id) {
    return json(api('GET', `/cxc/${id}`, token));
  }

  // Tasa determinista: modo MANUAL y 100 Bs/USD.
  const modo = api('PUT', '/tasa', token, { modo: 'MANUAL' });
  const tasa = api('PUT', '/tasa', token, { tasaDolar: 100 });
  warmupBcv(token);

  const tasaActual = json(api('GET', '/tasa', token));

  check(null, {
    'la tasa de la empresa queda en 100': () =>
      Number(tasaActual.tasa) === 100 && tasaActual.modo === 'MANUAL',
  });

  // 1. Abono parcial en Bs sobre factura USD.
  const p1 = pagar('abono 500 Bs sobre USD 10', 'usdPartial', 500, 'VES', 'BANK_TRANSFER', 'K6-VES-1');
  const c1 = cxc(F.facturas.usdPartial.cxcId);

  check(null, {
    'abono 500 Bs aceptado': () => p1.res.status === 201,
    'la CxC queda con 5 cobrados': () => Number(c1.montoCobrado) === 5,
    'la CxC queda con 5 pendientes': () => Number(c1.montoPendiente) === 5,
  });

  // 2. Abono con excedente de redondeo (0.004 USD) => se acepta y se topa.
  const p2 = pagar('abono 500.4 Bs sobre 5 USD pendientes', 'usdPartial', 500.4, 'VES', 'BANK_TRANSFER', 'K6-VES-2');
  const c2 = cxc(F.facturas.usdPartial.cxcId);

  check(null, {
    'excedente de 0.004 USD se acepta por tolerancia': () => p2.res.status === 201,
    'se cobran los 10 USD completos': () => Number(c2.montoCobrado) === 10,
    'la CxC queda saldada': () => Number(c2.montoPendiente) === 0,
  });

  // 3. Excedente superior a medio centavo => rechazo.
  const p3 = pagar('abono 1001 Bs sobre 10 USD pendientes', 'overpay', 1001, 'VES', 'BANK_TRANSFER', 'K6-VES-3');
  const c3 = cxc(F.facturas.overpay.cxcId);

  check(null, {
    'excedente de 0.01 USD se rechaza': () => p3.res.status === 400,
    'la CxC rechazada sigue con 10 pendientes': () => Number(c3.montoPendiente) === 10,
  });

  // 4. Factura emitida en VES.
  const p4 = pagar('factura VES 1000 pagada con 1000 Bs', 'ves', 1000, 'VES', 'CASH');
  const f4 = json(api('GET', `/facturas/${F.facturas.ves.id}`, token));
  const c4 = cxc(F.facturas.ves.cxcId);

  check(null, {
    'factura VES pagada': () => p4.res.status === 201 && f4.estado === 'PAID',
    'total pagado en VES es 1000': () => Number(f4.totalPagado) === 1000,
    'CxC de factura VES saldada en USD': () => Number(c4.montoPendiente) === 0,
  });

  // 5. Factura USD pagada en Bs: debe usar la tasa de la empresa, no 1.
  const p5 = pagar('factura USD 10 pagada con 1000 Bs', 'usdPaidInVes', 1000, 'VES', 'BANK_TRANSFER', 'K6-VES-5');
  const f5 = json(api('GET', `/facturas/${F.facturas.usdPaidInVes.id}`, token));
  const c5 = cxc(F.facturas.usdPaidInVes.cxcId);

  check(null, {
    'factura USD acepta pago en Bs con tasa de empresa': () => p5.res.status === 201,
    'el pago se guarda en Bs': () => p5.body.pago?.monedaPago === 'VES',
    'factura USD queda PAID': () => f5.estado === 'PAID',
    'total pagado en USD es 10': () => Number(f5.totalPagado) === 10,
    'CxC de factura USD saldada': () => Number(c5.montoPendiente) === 0,
  });

  console.log(
    `[09] tasa=${tasaActual.tasa}/${tasaActual.modo} ` +
      `usdPartial=${JSON.stringify({ estado: c2.estado, cobrado: c2.montoCobrado, pendiente: c2.montoPendiente })} ` +
      `overpay=${p3.res.status} ves=${f4.estado}/${f4.totalPagado} ` +
      `usdEnBs=${f5.estado}/${c5.montoPendiente}`
  );
}
