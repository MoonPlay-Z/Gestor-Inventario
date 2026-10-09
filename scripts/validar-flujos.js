#!/usr/bin/env node
/**
 * Validación de flujos críticos del POS contra la API HTTP.
 * Uso: API_USER=<usuario> API_PASS=<contraseña> ALLOW_DESTRUCTIVE_TESTS=true node scripts/validar-flujos.js
 */
const BASE = process.env.BASE_URL || 'http://localhost:3001';
const USER = process.env.API_USER;
const PASS = process.env.API_PASS;

if (!USER || !PASS) {
  throw new Error('Configura API_USER y API_PASS para ejecutar la validación');
}
if (process.env.ALLOW_DESTRUCTIVE_TESTS !== 'true') {
  throw new Error('La validación crea ventas y modifica caja; configura ALLOW_DESTRUCTIVE_TESTS=true para continuar');
}

let token = '';
const results = [];
const check = (name, cond, detail = '') => {
  results.push({ name, ok: !!cond, detail });
  console.log(`${cond ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
};

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, { ...opts, headers });
  let body = {};
  try { body = await res.json(); } catch {}
  return { status: res.status, body };
}

async function main() {
  // ── Login ──
  const login = await api('/auth/login', { method: 'POST', body: JSON.stringify({ username: USER, password: PASS }) });
  check('Inicio de sesión', login.status === 200 && !!login.body.token, `status ${login.status}`);
  token = login.body.token;

  // ── Productos ──
  const prods = await api('/productos?limit=100');
  const tomate = prods.body.data?.find(p => p.sku === 'TOMATE');
  const arroz = prods.body.data?.find(p => p.sku === 'ARROZ');
  check('Productos cargados', prods.status === 200 && !!tomate && !!arroz, `tomate: ${tomate?.stockActual}`);

  const bodegonId = (await api('/clientes?limit=5')).body.data?.[0]?.id;
  const cliente = (await api('/clientes?limit=5')).body.data?.[0];
  check('Cliente existe', !!cliente, cliente ? cliente.razonSocial : 'NO');

  // ── Venta por peso en gramos ──
  const stockAntesTomate = Number(tomate.stockActual);
  const fv = new Date(Date.now() + 15 * 864e5).toISOString();
  const v1 = await api('/facturas', {
    method: 'POST',
    body: JSON.stringify({
      clienteId: cliente.id, fechaVencimiento: fv, metodoPago: 'CASH',
      items: [{ productoId: tomate.id, cantidad: 500, unidadPeso: 'g' }, { productoId: arroz.id, cantidad: 2 }],
    }),
  });
  check('Venta 500g + 2 unidades', v1.status === 201, `total ${v1.body.total}`);
  const itTomate = v1.body.items?.find(i => i.descripcionHistorica === tomate.nombre);
  check('Ítem tomate en KILOGRAMO', itTomate?.unidadMedida === 'KILOGRAMO' && Number(itTomate.cantidad) === 0.5, JSON.stringify([itTomate?.cantidad, itTomate?.unidadMedida]));

  let prods2 = (await api('/productos?limit=100')).body.data;
  const t2 = prods2.find(p => p.sku === 'TOMATE');
  const a2 = prods2.find(p => p.sku === 'ARROZ');
  check('Stock tomate −0.5kg', Math.abs(Number(t2.stockActual) - (stockAntesTomate - 0.5)) < 1e-6, `${t2.stockActual}`);
  check('Stock arroz −2', Math.abs(Number(a2.stockActual) - (Number(arroz.stockActual) - 2)) < 1e-6, `${a2.stockActual}`);

  // ── Anulación restaura stock ──
  const anular = await api(`/facturas/${v1.body.id}/anular`, { method: 'PATCH', body: JSON.stringify({ motivo: 'test' }) });
  check('Anular factura', anular.status === 200, `estado ${anular.body.estado}`);
  prods2 = (await api('/productos?limit=100')).body.data;
  check('Stock tomate restaurado', Math.abs(Number(prods2.find(p => p.sku === 'TOMATE').stockActual) - stockAntesTomate) < 1e-6);

  // ── Cotización → conversión ──
  const cot = await api('/cotizaciones', {
    method: 'POST',
    body: JSON.stringify({ clienteId: cliente.id, items: [{ productoId: tomate.id, cantidad: 1 }, { productoId: arroz.id, cantidad: 1 }] }),
  });
  check('Cotización creada', cot.status === 201 || cot.status === 200, `num ${cot.body.numero}`);
  const cve = await api(`/cotizaciones/${cot.body.id}/convert`, { method: 'POST', body: JSON.stringify({ metodoPago: 'BANK_TRANSFER', referenciaTransaccion: 'REF1' }) });
  check('Cotización convertida', cve.status === 200 && cve.body.factura, cve.body.message || cve.body.error);
  const cve2 = await api(`/cotizaciones/${cot.body.id}/convert`, { method: 'POST', body: JSON.stringify({ metodoPago: 'BANK_TRANSFER', referenciaTransaccion: 'REF1' }) });
  check('Doble conversión bloqueada', cve2.status === 400 || cve2.status === 409, `status ${cve2.status}`);
  prods2 = (await api('/productos?limit=100')).body.data;
  check('Stock tras conversión', Math.abs(Number(prods2.find(p => p.sku === 'TOMATE').stockActual) - (stockAntesTomate - 1)) < 1e-6);

  // ── Caja ──
  const statusCaja = await api('/caja/status');
  check('Estado caja', statusCaja.status === 200, statusCaja.body.status);
  if (statusCaja.body.status === 'OPEN') {
    await api('/caja/close', { method: 'POST', body: JSON.stringify({ montoFinal: 0 }) });
  }
  let open = await api('/caja/open', { method: 'POST', body: JSON.stringify({ montoInicial: 50 }) });
  check('Abrir caja', open.status === 200 || open.status === 201, open.body.error || 'abierta');
  const close = await api('/caja/close', { method: 'POST', body: JSON.stringify({ montoFinal: 60 }) });
  check('Cerrar caja', close.status === 200, close.body.error || 'cerrada');

  // ── Reportes ──
  for (const r of ['ventas', 'ganancias', 'inversion', 'productos-top', 'clientes-top', 'caja', 'impuestos']) {
    const res = await api(`/reportes/${r}`);
    check(`Reporte /reportes/${r}`, res.status === 200, `status ${res.status}`);
  }

  const fail = results.filter(r => !r.ok);
  console.log(`\n${results.length - fail.length}/${results.length} OK`);
  process.exit(fail.length ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
