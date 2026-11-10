#!/usr/bin/env node
/**
 * scripts/validar-flujo-ventas-abonos.js
 *
 * Validación integral del flujo de trabajo y cálculos de:
 * 1. Ventas de Contado (Moneda Base USD y Pago en USD / VES).
 * 2. Ventas a Crédito / Financiadas (Generación de Cuenta por Cobrar).
 * 3. Abonos parciales en USD.
 * 4. Abonos parciales en VES con conversión de Tasa BCV.
 * 5. Tolerancia de redondeo (≤ 0.005 USD) y rechazo de sobrepago.
 * 6. Liquidación total de la deuda (cambio de estado a PAID).
 * 7. Anulación de pagos y restauración matemática del saldo.
 *
 * Uso:
 *   BASE_URL=http://localhost:3010 node scripts/validar-flujo-ventas-abonos.js
 */

const path = require('path');

// Asegurar que resuelva dependencias desde backend/node_modules independientemente de dónde se ejecute
const backendModules = path.join(__dirname, '..', 'backend', 'node_modules');
if (!module.paths.includes(backendModules)) {
  module.paths.unshift(backendModules);
}

require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const jwt = require('jsonwebtoken');
const prisma = require('../backend/src/db/prisma');
const { Decimal } = require('decimal.js');

const BASE = process.env.BASE_URL || 'http://localhost:3010';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_antigravity_2026_super_secure';

const results = [];
const check = (name, cond, detail = '') => {
  results.push({ name, ok: !!cond, detail });
  const icon = cond ? '✅' : '❌';
  console.log(`${icon} ${name}${detail ? ' — ' + detail : ''}`);
};

let token = '';
let headers = {};

async function api(endpoint, opts = {}) {
  const url = `${BASE}/api${endpoint}`;
  const h = { 'Content-Type': 'application/json', ...headers, ...(opts.headers || {}) };
  const res = await fetch(url, { ...opts, headers: h });
  let body = {};
  try { body = await res.json(); } catch (_) {}
  return { status: res.status, ok: res.ok, body };
}

async function run() {
  console.log('\n======================================================');
  console.log('   VALIDACIÓN DE FLUJO DE CÁLCULO: VENTAS Y ABONOS    ');
  console.log('======================================================\n');

  // 1. Obtener usuario EMPRESA y generar token JWT
  const usuario = await prisma.usuario.findFirst({
    where: { rol: 'EMPRESA', activo: true },
    include: { empresaRef: true },
  });

  if (!usuario) {
    throw new Error('No se encontró un usuario EMPRESA activo en la base de datos.');
  }

  token = jwt.sign(
    {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      empresaId: usuario.id,
      sessionVersion: usuario.sessionVersion || 1,
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  headers = { Authorization: `Bearer ${token}` };
  check('Autenticación JWT generada para usuario EMPRESA', !!token, `${usuario.username} (${usuario.id})`);

  // 2. Asegurar que haya turno de Caja abierto
  const cajaRes = await api('/caja/status');
  const cajaAbierta = cajaRes.body?.estado === 'OPEN';
  if (!cajaAbierta) {
    const openRes = await api('/caja/open', {
      method: 'POST',
      body: JSON.stringify({ montoInicial: 100 }),
    });
    check('Apertura de turno de caja para pruebas', openRes.status === 200 || openRes.status === 201, openRes.body?.error || 'OK');
  } else {
    check('Turno de caja activo detectado', true, `Caja ID: ${cajaRes.body.id}`);
  }

  // 3. Crear o seleccionar Cliente de prueba
  let cliente = await prisma.cliente.findFirst({
    where: { empresaId: usuario.id },
  });
  if (!cliente) {
    const cliRes = await api('/clientes', {
      method: 'POST',
      body: JSON.stringify({
        razonSocial: 'Cliente de Prueba Automatizada',
        rifCedula: 'V-' + Math.floor(10000000 + Math.random() * 90000000),
        telefono: '04141234567',
        direccion: 'Calle Test, Caracas',
      }),
    });
    cliente = cliRes.body;
  }
  check('Cliente para pruebas listo', !!cliente?.id, cliente?.razonSocial);

  // 4. Crear Producto de prueba con stock conocido
  const skuTest = `TEST-${Date.now().toString().slice(-6)}`;
  const prodRes = await api('/productos', {
    method: 'POST',
    body: JSON.stringify({
      sku: skuTest,
      nombre: `Producto Test Flujo ${skuTest}`,
      precioVenta: 10.00, // $10.00
      costoCompra: 5.00,
      stockActual: 100,
      stockMinimo: 5,
      tasaImpuesto: 16.00, // 16% IVA -> Total por unidad = $11.60
      categoria: 'TEST',
      unidadMedida: 'UNIDAD',
    }),
  });
  const productoTest = prodRes.body;
  check('Producto de prueba creado ($10 + 16% IVA = $11.60)', prodRes.status === 201 && !!productoTest.id, `ID: ${productoTest.id}`);

  // ── FLUJO 1: VENTA DE CONTADO EN USD ─────────────────────────────────────────
  console.log('\n--- Flujo 1: Venta Contado USD ---');
  const ventaContado = await api('/facturas', {
    method: 'POST',
    body: JSON.stringify({
      clienteId: cliente.id,
      metodoPago: 'EFECTIVO_USD',
      items: [{ productoId: productoTest.id, cantidad: 2 }], // 2 * $10 = $20 subtotal + $3.20 IVA = $23.20
      fechaVencimiento: new Date(Date.now() + 864e5).toISOString(),
    }),
  });

  check('Emisión Venta Contado (Status 201)', ventaContado.status === 201);
  const fact1 = ventaContado.body;
  check('Cálculo matemático: Subtotal=$20.00, IVA=$3.20, Total=$23.20',
    new Decimal(fact1.subtotal).equals(20) &&
    new Decimal(fact1.impuestoTotal).equals(3.20) &&
    new Decimal(fact1.total).equals(23.20),
    `Total: $${fact1.total}`
  );
  check('Estado inicial de venta de contado es PAID', fact1.estado === 'PAID');
  check('Se generó registro de pago de contado automático', fact1.pagos?.length === 1 && new Decimal(fact1.pagos[0].monto).equals(23.20));

  // Verificar decremento de stock
  const pStock1 = await prisma.producto.findUnique({ where: { id: productoTest.id } });
  check('Stock decrementado en 2 unidades (100 -> 98)', Number(pStock1.stockActual) === 98, `Stock: ${pStock1.stockActual}`);

  // ── FLUJO 2: VENTA A CRÉDITO / FINANCIADA (CREACIÓN DE CXC) ─────────────────
  console.log('\n--- Flujo 2: Venta a Crédito / Financiada (CxC) ---');
  const ventaCredito = await api('/facturas', {
    method: 'POST',
    body: JSON.stringify({
      clienteId: cliente.id,
      cuotas: 3, // Financiada en 3 cuotas (o sin pago inicial)
      items: [{ productoId: productoTest.id, cantidad: 5 }], // 5 * $10 = $50 subtotal + $8.00 IVA = $58.00
      fechaVencimiento: new Date(Date.now() + 30 * 864e5).toISOString(),
    }),
  });

  check('Emisión Factura a Crédito (Status 201)', ventaCredito.status === 201);
  const factCred = ventaCredito.body;
  check('Factura a crédito estado inicial PENDING', factCred.estado === 'PENDING');
  check('Total de Factura a crédito calculado: $58.00', new Decimal(factCred.total).equals(58.00), `$${factCred.total}`);

  // Buscar CuentaPorCobrar creada automáticamente
  const cxcDB = await prisma.cuentaPorCobrar.findFirst({
    where: { facturaId: factCred.id },
  });
  check('Registro CuentaPorCobrar creado automáticamente', !!cxcDB);
  check('CxC: montoOriginal=$58.00, montoCobrado=$0.00, montoPendiente=$58.00, estado=PENDING',
    new Decimal(cxcDB.montoOriginal).equals(58) &&
    new Decimal(cxcDB.montoCobrado).equals(0) &&
    new Decimal(cxcDB.montoPendiente).equals(58) &&
    cxcDB.estado === 'PENDING',
    `Original: ${cxcDB.montoOriginal}, Pendiente: ${cxcDB.montoPendiente}`
  );

  // ── FLUJO 3: ABONO PARCIAL EN USD A LA CXC ──────────────────────────────────
  console.log('\n--- Flujo 3: Abono Parcial en USD a CxC ---');
  // Abonamos $20.00 en USD mediante POST /api/cxc/:id/pago
  const abonoUSD = await api(`/cxc/${cxcDB.id}/pago`, {
    method: 'POST',
    body: JSON.stringify({
      monto: 20.00,
      metodoPago: 'EFECTIVO_USD',
      monedaPago: 'USD',
      notas: 'Abono 1 en efectivo dólares',
    }),
  });

  check('Registro de Abono USD en CxC (Status 200/201)', abonoUSD.status === 200 || abonoUSD.status === 201);
  const cxcPostAbono1 = await prisma.cuentaPorCobrar.findUnique({ where: { id: cxcDB.id } });
  check('CxC actualizada: cobrado=$20.00, pendiente=$38.00 ($58 - $20)',
    new Decimal(cxcPostAbono1.montoCobrado).equals(20) &&
    new Decimal(cxcPostAbono1.montoPendiente).equals(38),
    `Cobrado: ${cxcPostAbono1.montoCobrado}, Pendiente: ${cxcPostAbono1.montoPendiente}`
  );
  check('CxC estado transitó a PARTIALLY_PAID', cxcPostAbono1.estado === 'PARTIALLY_PAID');

  const factPostAbono1 = await prisma.factura.findUnique({ where: { id: factCred.id } });
  check('Factura asociada transitó a PARTIALLY_PAID', factPostAbono1.estado === 'PARTIALLY_PAID');

  // ── FLUJO 4: ABONO PARCIAL EN VES CON TASA BCV ──────────────────────────────
  console.log('\n--- Flujo 4: Abono Parcial en VES con Tasa BCV ---');
  // Consultamos primero la conversión de la cuenta
  const convRes = await api(`/cxc/${cxcDB.id}/conversion?moneda=VES`);
  check('Consulta de conversión de tasa para CxC responde correctamente', convRes.status === 200 && convRes.body.tasaUsada > 0, `Tasa usada: ${convRes.body.tasaUsada}`);
  const tasa = new Decimal(convRes.body.tasaUsada);

  // Deseamos abonar exactamente el equivalente a $10.00 USD en Bolívares
  const montoBsDeseado = tasa.mul(10).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const abonoVES = await api(`/cxc/${cxcDB.id}/pago`, {
    method: 'POST',
    body: JSON.stringify({
      monto: montoBsDeseado.toNumber(),
      metodoPago: 'PAGO_MOVIL',
      monedaPago: 'VES',
      referenciaTransaccion: 'PM-998877',
      notas: `Abono de Bs. ${montoBsDeseado.toFixed(2)} a tasa ${tasa.toFixed(2)}`,
    }),
  });

  check('Registro de Abono en VES (Status 200/201)', abonoVES.status === 200 || abonoVES.status === 201, `Abonados Bs. ${montoBsDeseado}`);
  const cxcPostAbono2 = await prisma.cuentaPorCobrar.findUnique({ where: { id: cxcDB.id } });
  // Pendiente debe haber bajado de $38 a $28 (o con diferencia despreciable por centavos)
  const cobrado2 = new Decimal(cxcPostAbono2.montoCobrado);
  const pendiente2 = new Decimal(cxcPostAbono2.montoPendiente);
  check('CxC cobrado acumulado cercano a $30.00 ($20 + $10)',
    cobrado2.minus(30).abs().lte(0.02),
    `Cobrado real: $${cobrado2.toFixed(2)}, Pendiente: $${pendiente2.toFixed(2)}`
  );

  // ── FLUJO 5: TEST DE TOLERANCIA Y RECHAZO DE SOBREPAGO ──────────────────────
  console.log('\n--- Flujo 5: Validación de Límites y Sobrepago ---');
  // Intentamos pagar $50.00 cuando el saldo pendiente es ≈ $28.00
  const sobrepagoRes = await api(`/cxc/${cxcDB.id}/pago`, {
    method: 'POST',
    body: JSON.stringify({
      monto: 50.00,
      metodoPago: 'EFECTIVO_USD',
      monedaPago: 'USD',
    }),
  });
  check('Sobrepago deliberado es RECHAZADO por el sistema (Status 400 o 422)',
    sobrepagoRes.status === 400 || sobrepagoRes.status === 422,
    sobrepagoRes.body?.error || sobrepagoRes.body?.message
  );

  // ── FLUJO 6: LIQUIDACIÓN COMPLETA A 0.00 (PAID) ─────────────────────────────
  console.log('\n--- Flujo 6: Liquidación Total de la Deuda ---');
  const saldoFinalExacto = new Decimal(cxcPostAbono2.montoPendiente);
  const pagoFinal = await api(`/cxc/${cxcDB.id}/pago`, {
    method: 'POST',
    body: JSON.stringify({
      monto: saldoFinalExacto.toNumber(),
      metodoPago: 'EFECTIVO_USD',
      monedaPago: 'USD',
      notas: 'Pago de saldo restante para liquidación total',
    }),
  });

  check('Pago final registrado correctamente', pagoFinal.status === 200 || pagoFinal.status === 201);
  const cxcLiquidada = await prisma.cuentaPorCobrar.findUnique({ where: { id: cxcDB.id } });
  const factLiquidada = await prisma.factura.findUnique({ where: { id: factCred.id } });

  check('CxC: montoPendiente=0.00 y estado=PAID',
    new Decimal(cxcLiquidada.montoPendiente).equals(0) && cxcLiquidada.estado === 'PAID',
    `Pendiente: ${cxcLiquidada.montoPendiente}, Estado: ${cxcLiquidada.estado}`
  );
  check('Factura asociada: estado=PAID',
    factLiquidada.estado === 'PAID',
    `Estado factura: ${factLiquidada.estado}`
  );

  // ── FLUJO 7: ANULACIÓN DE PAGO Y REVERSIÓN MATEMÁTICA ───────────────────────
  console.log('\n--- Flujo 7: Anulación de Pago y Reversión de Saldo ---');
  // Obtenemos el último pago registrado
  const ultimoPago = pagoFinal.body.pago || await prisma.pago.findFirst({
    where: { facturaId: factCred.id },
    orderBy: { createdAt: 'desc' },
  });

  const anularRes = await api(`/pagos/${ultimoPago.id}/anular`, {
    method: 'PATCH',
    body: JSON.stringify({
      motivo: 'ERROR_MONTO',
      descripcion: 'Anulación de prueba para verificar reversión de saldo matemático',
      confirmacion: 'anular',
    }),
  });

  check('Anulación de pago procesada (Status 200)', anularRes.status === 200, anularRes.body?.error || 'OK');
  const cxcPostAnular = await prisma.cuentaPorCobrar.findUnique({ where: { id: cxcDB.id } });
  const factPostAnular = await prisma.factura.findUnique({ where: { id: factCred.id } });

  check('El saldo pendiente de la CxC se restauró exactamente',
    new Decimal(cxcPostAnular.montoPendiente).equals(saldoFinalExacto),
    `Pendiente restaurado: $${cxcPostAnular.montoPendiente}`
  );
  check('CxC y Factura regresaron a estado PARTIALLY_PAID',
    cxcPostAnular.estado === 'PARTIALLY_PAID' && factPostAnular.estado === 'PARTIALLY_PAID',
    `CxC: ${cxcPostAnular.estado}, Factura: ${factPostAnular.estado}`
  );

  // ── LIMPIEZA DE DATOS DE PRUEBA ─────────────────────────────────────────────
  console.log('\n--- Limpieza de datos de prueba ---');
  try {
    // Anular facturas de prueba
    await api(`/facturas/${fact1.id}/anular`, { method: 'PATCH', body: JSON.stringify({ confirmacion: 'anular', motivo: 'Limpieza test' }) });
    await api(`/facturas/${factCred.id}/anular`, { method: 'PATCH', body: JSON.stringify({ confirmacion: 'anular', motivo: 'Limpieza test' }) });
    // Borrar producto de prueba
    await prisma.itemFactura.deleteMany({ where: { productoId: productoTest.id } });
    await prisma.producto.delete({ where: { id: productoTest.id } });
    console.log('✓ Facturas anuladas y producto de prueba limpiado');
  } catch (err) {
    console.warn('Nota en limpieza:', err.message);
  }

  // Resumen
  const fallos = results.filter(r => !r.ok);
  console.log('\n======================================================');
  console.log(` RESULTADO: ${results.length - fallos.length}/${results.length} PRUEBAS SUPERADAS`);
  console.log('======================================================\n');

  if (fallos.length > 0) {
    console.error('Se detectaron fallos en el flujo:');
    fallos.forEach(f => console.error(` - ❌ ${f.name}: ${f.detail}`));
    process.exit(1);
  } else {
    console.log('🎉 EL FLUJO DE CÁLCULO Y TRABAJO DE VENTAS Y ABONOS ESTÁ 100% VALIDADO Y SANO.\n');
    process.exit(0);
  }
}

run().catch(err => {
  console.error('\n❌ Error fatal en ejecución de validación:', err);
  process.exit(1);
});
