#!/usr/bin/env node
'use strict';

/**
 * Verificación de invariantes post-ejecución.
 *
 * k6 solo ve códigos HTTP; este script lee la base de datos y comprueba que las
 * operaciones concurrentes no dejaron estados imposibles:
 *
 *   - stock negativo o descontado más de una vez,
 *   - pagos que suman más que la factura,
 *   - CxC descuadradas,
 *   - más de una caja OPEN por usuario,
 *   - requestId duplicados,
 *   - facturas sin CxC.
 *
 * Uso: node tests/k6/verify/verify.js
 * Sale con código 1 si hay fallos.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const BACKEND = path.join(ROOT, 'backend');
const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures.json');

try {
  const dotenv = require(require.resolve('dotenv', { paths: [BACKEND] }));
  dotenv.config({ path: path.join(BACKEND, '.env') });
} catch {
  /* opcional */
}

const DATABASE_URL = process.env.DATABASE_URL || '';
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida.');
  process.exit(1);
}

// Verificación de solo lectura, pero no debe inspeccionar una base que no sea
// de pruebas: el arnés solo tiene sentido contra los datos que creó el seed.
const pareceTest =
  DATABASE_URL.startsWith('file:') ||
  /(localhost|127\.0\.0\.1|:5433|_test|\/test|test_)/i.test(DATABASE_URL);
if (!pareceTest) {
  console.error(
    `❌ DATABASE_URL no parece de pruebas: ${DATABASE_URL.replace(/:.*@/, '://***@')}\n` +
      '   Abortando para no leer datos de producción.'
  );
  process.exit(1);
}

const isSqlite =
  process.env.DB_PROVIDER === 'sqlite' || DATABASE_URL.startsWith('file:');

if (isSqlite) {
  console.error(
    '❌ Este arnés requiere PostgreSQL. SQLite serializa las escrituras y oculta las carreras.'
  );
  process.exit(1);
}

function loadPrismaClient() {
  if (isSqlite) {
    const mod = require(path.join(BACKEND, 'src/generated/prisma-sqlite'));
    return new mod.PrismaClient();
  }
  const mod = require(require.resolve('@prisma/client', { paths: [BACKEND] }));
  return new mod.PrismaClient();
}

const prisma = loadPrismaClient();

let fallos = 0;
let comprobaciones = 0;

function check(nombre, condicion, detalle = '') {
  comprobaciones++;
  if (condicion) {
    console.log(`✅ ${nombre}${detalle ? ` — ${detalle}` : ''}`);
  } else {
    fallos++;
    console.log(`❌ ${nombre}${detalle ? ` — ${detalle}` : ''}`);
  }
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pagoEnMonedaFactura(pago, factura, empresaRate) {
  const monto = num(pago.monto);
  if (factura.moneda === 'VES') {
    // En facturas VES, un pago en USD se convierte con la tasa de la factura.
    return pago.monedaPago === 'VES'
      ? monto
      : monto * num(factura.tasaCambio);
  }
  // En facturas USD, tasaCambio NO es una tasa real (default 1). Para pagos en
  // Bs hay que usar la tasa de la empresa.
  if (pago.monedaPago === 'VES') {
    const tasa = empresaRate > 0 ? empresaRate : num(factura.tasaCambio) || 1;
    return monto / tasa;
  }
  return monto;
}

async function main() {
  if (!fs.existsSync(FIXTURES_PATH)) {
    console.error(
      `❌ No existe ${FIXTURES_PATH}. Ejecuta primero tests/k6/seed/seed.js.`
    );
    process.exit(1);
  }

  const fixtures = JSON.parse(fs.readFileSync(FIXTURES_PATH, 'utf8'));
  const empresaIds = [fixtures.empresas.A.id, fixtures.empresas.B.id];
  const userIds = Object.values(fixtures.users).map((u) => u.id);

  const empresas = await prisma.empresa.findMany({
    where: { id: { in: empresaIds } },
    select: { id: true, tasaDolar: true },
  });
  const tasas = new Map(empresas.map((e) => [e.id, num(e.tasaDolar)]));

  const facturas = await prisma.factura.findMany({
    where: {
      OR: [{ empresaId: { in: empresaIds } }, { usuarioId: { in: userIds } }],
    },
    include: {
      pagos: true,
      items: true,
      cuentaPorCobrar: true,
    },
  });

  console.log(`\n🔎 ${facturas.length} facturas de prueba analizadas\n`);

  // ── 1. Stock ───────────────────────────────────────────────────────────────
  const idsProductos = Object.keys(fixtures.initialStock);
  const productos = await prisma.producto.findMany({
    where: { id: { in: idsProductos } },
  });
  const productoPorId = new Map(productos.map((p) => [p.id, p]));

  const itemsPorProducto = new Map();
  for (const f of facturas) {
    if (f.estado === 'VOIDED') continue; // anular restaura stock
    for (const item of f.items) {
      if (!item.productoId) continue;
      itemsPorProducto.set(
        item.productoId,
        (itemsPorProducto.get(item.productoId) || 0) + num(item.cantidad)
      );
    }
  }

  for (const [productoId, inicial] of Object.entries(fixtures.initialStock)) {
    const producto = productoPorId.get(productoId);
    const sku = producto ? producto.sku : productoId;

    check(`producto ${sku} sigue existiendo`, !!producto);
    if (!producto) continue;

    const stock = num(producto.stockActual);
    const vendido = itemsPorProducto.get(productoId) || 0;
    const esperado = inicial - vendido;

    check(`stock ${sku} >= 0`, stock >= 0, `stock=${stock}`);
    check(
      `stock ${sku} coincide con ventas (inicial ${inicial} - vendido ${vendido})`,
      Math.abs(stock - esperado) < 1e-4,
      `stock=${stock} esperado=${esperado}`
    );
  }

  // ── 2. Pagos vs total de factura ───────────────────────────────────────────
  for (const f of facturas) {
    const empresaRate = tasas.get(f.empresaId) || 0;
    const pagado = f.pagos.reduce(
      (acc, p) => acc + pagoEnMonedaFactura(p, f, empresaRate),
      0
    );
    const total = num(f.total);

    // Invariante principal: la suma de pagos nunca puede exceder el total,
    // sea cual sea el estado. Un sobrepago es el síntoma de la carrera.
    check(
      `factura ${f.numeroFactura} pagos no exceden el total`,
      pagado <= total + 0.011,
      `pagado=${pagado.toFixed(4)} total=${total}`
    );

    if (f.estado === 'PAID') {
      check(
        `factura ${f.numeroFactura} PAID está cubierta`,
        pagado >= total - 0.011,
        `pagado=${pagado.toFixed(4)} total=${total}`
      );
    } else if (f.estado === 'PENDING') {
      check(
        `factura ${f.numeroFactura} PENDING no tiene sobrepago`,
        pagado <= total + 0.011,
        `pagado=${pagado.toFixed(4)} total=${total}`
      );
    } else if (f.estado === 'PARTIALLY_PAID') {
      check(
        `factura ${f.numeroFactura} PARTIALLY_PAID tiene saldo`,
        pagado > 0.005 && pagado < total - 0.005,
        `pagado=${pagado.toFixed(4)} total=${total}`
      );
    }
  }

  // ── 3. Cuentas por cobrar ──────────────────────────────────────────────────
  for (const f of facturas) {
    if (f.estado === 'VOIDED') continue; // anular elimina la CxC

    const c = f.cuentaPorCobrar;
    check(`factura ${f.numeroFactura} tiene CxC`, !!c);
    if (!c) continue;

    const original = num(c.montoOriginal);
    const cobrado = num(c.montoCobrado);
    const pendiente = num(c.montoPendiente);

    check(
      `CxC ${c.id} cuadra (cobrado + pendiente = original)`,
      Math.abs(cobrado + pendiente - original) <= 0.011,
      `${cobrado} + ${pendiente} vs ${original}`
    );
    check(`CxC ${c.id} no tiene pendiente negativo`, pendiente >= -0.005, `pendiente=${pendiente}`);
    check(
      `CxC ${c.id} PAID tiene pendiente 0`,
      c.estado !== 'PAID' || pendiente <= 0.005,
      `estado=${c.estado} pendiente=${pendiente}`
    );
    check(
      `CxC ${c.id} PENDING no tiene cobros`,
      c.estado !== 'PENDING' || cobrado <= 0.005,
      `estado=${c.estado} cobrado=${cobrado}`
    );
    check(
      `CxC ${c.id} pertenece a la misma empresa que la factura`,
      !f.empresaId || c.empresaId === f.empresaId,
      `cxc=${c.empresaId} factura=${f.empresaId}`
    );

    // CuentaPorCobrar SIEMPRE guarda montos en USD: en una factura emitida en
    // Bs, el original debe ser total / tasaCambio y no el total en Bs. Detecta
    // el bug en que /pagos escribía el monto cobrado en la moneda de la factura.
    if (f.moneda === 'VES' && num(f.tasaCambio) > 0) {
      const originalEsperado = num(f.total) / num(f.tasaCambio);
      check(
        `CxC ${c.id} de factura VES guarda montoOriginal en USD`,
        Math.abs(original - originalEsperado) <= 0.02,
        `original=${original} esperado=${originalEsperado.toFixed(2)}`
      );
    }
  }

  // ── 4. Cajas ───────────────────────────────────────────────────────────────
  const abiertas = await prisma.cierreCaja.groupBy({
    by: ['usuarioId'],
    where: { estado: 'OPEN', usuarioId: { in: userIds } },
    _count: { _all: true },
  });

  const duplicadas = abiertas.filter((g) => g._count._all > 1);
  check(
    'ningún usuario tiene más de una caja OPEN',
    duplicadas.length === 0,
    duplicadas.map((g) => `${g.usuarioId}=${g._count._all}`).join(', ')
  );

  const cajas = await prisma.cierreCaja.findMany({
    where: { usuarioId: { in: userIds } },
  });
  for (const caja of cajas) {
    check(
      `caja ${caja.id} tiene montos no negativos`,
      ['montoInicial', 'montoFinal', 'ingresosEfectivo', 'ingresosBanco'].every(
        (campo) => caja[campo] == null || num(caja[campo]) >= 0
      )
    );
  }

  // ── 5. Idempotencia ────────────────────────────────────────────────────────
  const conRequestId = facturas.filter(
    (f) => typeof f.requestId === 'string' && f.requestId.startsWith('k6-')
  );
  const porRequestId = new Map();
  for (const f of conRequestId) {
    porRequestId.set(f.requestId, (porRequestId.get(f.requestId) || 0) + 1);
  }
  const duplicados = [...porRequestId.entries()].filter(([, n]) => n > 1);
  check(
    'ningún requestId k6-* está duplicado',
    duplicados.length === 0,
    duplicados.map(([id, n]) => `${id}=${n}`).join(', ')
  );

  // ── 6. Integridad básica ───────────────────────────────────────────────────
  const idsFacturas = new Set(facturas.map((f) => f.id));
  const cxcHuerfanas = await prisma.cuentaPorCobrar.findMany({
    where: { empresaId: { in: empresaIds } },
    select: { id: true, facturaId: true },
  });
  check(
    'todas las CxC de prueba apuntan a una factura existente',
    cxcHuerfanas.every((c) => idsFacturas.has(c.facturaId)),
    cxcHuerfanas.filter((c) => !idsFacturas.has(c.facturaId)).map((c) => c.id).join(', ')
  );

  const pagosDePrueba = await prisma.pago.findMany({
    where: { factura: { empresaId: { in: empresaIds } } },
    select: { id: true, facturaId: true },
  });
  check(
    'no hay pagos huérfanos en facturas de prueba',
    pagosDePrueba.every((p) => idsFacturas.has(p.facturaId)),
    pagosDePrueba.filter((p) => !idsFacturas.has(p.facturaId)).map((p) => p.id).join(', ')
  );

  console.log(
    `\n${fallos === 0 ? '✅' : '❌'} ${comprobaciones - fallos}/${comprobaciones} invariantes OK\n`
  );
  process.exitCode = fallos === 0 ? 0 : 1;
}

main()
  .catch((err) => {
    console.error('\n❌ verify falló:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
