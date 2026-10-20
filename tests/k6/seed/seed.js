#!/usr/bin/env node
'use strict';

/**
 * Seed de datos aislados para el arnés k6.
 *
 * Crea dos empresas, usuarios con cada rol, productos con stock conocido y
 * facturas en estados concretos. Escribe tests/k6/fixtures.json con IDs y
 * tokens JWT para que los escenarios no tengan que hacer login.
 *
 * Seguridad: exige ALLOW_DESTRUCTIVE_TESTS=true y una DATABASE_URL que parezca
 * de test (localhost, 127.0.0.1, puerto 5433, nombre con "test" o file:).
 * Nunca debe apuntar a producción.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const BACKEND = path.join(ROOT, 'backend');
const FIXTURES_PATH = path.join(__dirname, '..', 'fixtures.json');

// Carga backend/.env sin sobrescribir lo que ya venga por entorno.
try {
  const dotenv = require(require.resolve('dotenv', { paths: [BACKEND] }));
  dotenv.config({ path: path.join(BACKEND, '.env') });
} catch {
  /* dotenv es opcional */
}

const DATABASE_URL = process.env.DATABASE_URL || '';
const JWT_SECRET = process.env.JWT_SECRET;

function fail(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

if (process.env.ALLOW_DESTRUCTIVE_TESTS !== 'true') {
  fail(
    'Este seed borra y recrea datos de prueba. Exporta ALLOW_DESTRUCTIVE_TESTS=true para continuar.'
  );
}

if (!DATABASE_URL) {
  fail('DATABASE_URL no está definida.');
}

const pareceTest =
  DATABASE_URL.startsWith('file:') ||
  /(localhost|127\.0\.0\.1|:5433|_test|\/test|test_)/i.test(DATABASE_URL);

if (!pareceTest) {
  fail(
    `DATABASE_URL no parece una base de pruebas: ${DATABASE_URL}\n` +
      'Por seguridad el seed solo acepta localhost, 127.0.0.1, puerto 5433, file: o nombres con "test".'
  );
}

if (!JWT_SECRET) {
  fail('JWT_SECRET no está definida. Debe coincidir con la del backend.');
}

const isSqlite =
  process.env.DB_PROVIDER === 'sqlite' || DATABASE_URL.startsWith('file:');

if (isSqlite) {
  fail(
    'Este arnés requiere PostgreSQL. SQLite serializa las escrituras y oculta las carreras; ' +
      'además su schema no incluye CuentaPorCobrar. Usa el Postgres efímero del README.'
  );
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
const bcrypt = require(require.resolve('bcrypt', { paths: [BACKEND] }));
const jwt = require(require.resolve('jsonwebtoken', { paths: [BACKEND] }));

const PASSWORD = 'K6Test2026!';
const RATE = 100;
const SHARED_REQUEST_ID = 'k6-shared-request-id';
const now = new Date();
const vencimiento = new Date(Date.now() + 15 * 864e5);
const trialEnd = new Date(Date.now() + 365 * 864e5);

const tokenFor = (usuario) =>
  jwt.sign(
    {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      empresaId: usuario.empresaId,
      empresaRefId: usuario.empresaRefId,
      sessionVersion: usuario.sessionVersion,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

// En SQLite `numeroFactura` no tiene autoincremento en el schema; en Postgres
// sí, pero pasar un valor explícito es válido en ambos. Se usa un rango alto
// para no chocar con la secuencia que consumen las facturas creadas por la API.
let numeroFacturaSiguiente = 900001;

// ─────────────────────────────────────────────────────────────────────────────
// Limpieza de ejecuciones anteriores (solo datos k6_*)
// ─────────────────────────────────────────────────────────────────────────────

async function cleanup() {
  console.log('🧹 Limpiando datos k6 anteriores...');

  const oldUsers = await prisma.usuario.findMany({
    where: { username: { startsWith: 'k6_' } },
    select: { id: true },
  });
  const oldUserIds = oldUsers.map((u) => u.id);

  const oldEmpresas = await prisma.empresa.findMany({
    where: { rif: { startsWith: 'K6-' } },
    select: { id: true },
  });
  const oldEmpresaIds = oldEmpresas.map((e) => e.id);

  if (oldUserIds.length === 0 && oldEmpresaIds.length === 0) {
    console.log('   (nada que limpiar)');
    return;
  }

  const oldFacturas = await prisma.factura.findMany({
    where: {
      OR: [
        { usuarioId: { in: oldUserIds } },
        { empresaId: { in: oldEmpresaIds } },
      ],
    },
    select: { id: true },
  });
  const oldFacturaIds = oldFacturas.map((f) => f.id);

  const oldCxc = oldFacturaIds.length
    ? await prisma.cuentaPorCobrar.findMany({
        where: { facturaId: { in: oldFacturaIds } },
        select: { id: true },
      })
    : [];
  const oldCxcIds = oldCxc.map((c) => c.id);

  await prisma.cotizacion.deleteMany({
    where: {
      OR: [
        { usuarioId: { in: oldUserIds } },
        { empresaId: { in: oldEmpresaIds } },
      ],
    },
  });

  if (oldCxcIds.length) {
    await prisma.gestionCobranza.deleteMany({
      where: { cuentaPorCobrarId: { in: oldCxcIds } },
    });
  }

  if (oldFacturaIds.length) {
    await prisma.pago.deleteMany({ where: { facturaId: { in: oldFacturaIds } } });
    await prisma.cuentaPorCobrar.deleteMany({
      where: { facturaId: { in: oldFacturaIds } },
    });
    await prisma.itemFactura.deleteMany({
      where: { facturaId: { in: oldFacturaIds } },
    });
    await prisma.factura.deleteMany({ where: { id: { in: oldFacturaIds } } });
  }

  await prisma.cierreCaja.deleteMany({
    where: {
      OR: [
        { usuarioId: { in: oldUserIds } },
        { empresaId: { in: oldEmpresaIds } },
      ],
    },
  });

  await prisma.producto.deleteMany({ where: { empresaId: { in: oldUserIds } } });
  await prisma.cliente.deleteMany({ where: { empresaId: { in: oldUserIds } } });
  await prisma.usuario.deleteMany({ where: { id: { in: oldUserIds } } });
  await prisma.empresa.deleteMany({ where: { id: { in: oldEmpresaIds } } });

  console.log('   datos anteriores eliminados');
}

// ─────────────────────────────────────────────────────────────────────────────
// Creación
// ─────────────────────────────────────────────────────────────────────────────

async function crearEmpresa(nombre, rif) {
  return prisma.empresa.create({
    data: {
      nombre,
      rif,
      direccion: 'Dirección de prueba k6',
      email: `k6-${rif.toLowerCase()}@example.test`,
      tasaDolar: RATE,
      tasaDolarModo: 'MANUAL',
      tasaDolarActualizadaEn: now,
      subscriptionStatus: 'lifetime',
      planType: 'lifetime',
      activo: true,
    },
  });
}

async function crearUsuario({ username, nombre, rol, empresaId, empresaRefId, passwordHash }) {
  return prisma.usuario.create({
    data: {
      username,
      passwordHash,
      nombre,
      rol,
      empresaId: empresaId || null,
      empresaRefId: empresaRefId || null,
      subscriptionStatus: 'lifetime',
      trialStartsAt: now,
      trialEndsAt: trialEnd,
      currentPeriodEnd: trialEnd,
      activo: true,
    },
  });
}

async function crearProducto(empresaUsuarioId, { sku, nombre, stock, precio, ...extra }) {
  return prisma.producto.create({
    data: {
      sku,
      nombre,
      stockActual: Number(stock),
      stockMinimo: 0,
      precioVenta: Number(precio),
      costoCompra: 1,
      tasaImpuesto: 0,
      categoria: 'K6',
      unidadMedida: extra.unidadMedida || 'UNIDAD',
      esVentaPorPeso: extra.esVentaPorPeso || false,
      precioPorKilo: extra.precioPorKilo != null ? Number(extra.precioPorKilo) : null,
      toleranciaPeso: null,
      empresaId: empresaUsuarioId,
      activo: true,
    },
  });
}

async function crearFactura({
  key,
  cliente,
  usuario,
  empresa,
  total,
  moneda = 'USD',
  tasa = 1,
  estado = 'PENDING',
  requestId = null,
  pago = null,
  cxc = null,
}) {
  const factura = await prisma.factura.create({
    data: {
      numeroFactura: numeroFacturaSiguiente++,
      clienteId: cliente.id,
      usuarioId: usuario.id,
      empresaId: empresa.id,
      fechaEmision: now,
      fechaVencimiento: vencimiento,
      subtotal: Number(total),
      impuestoTotal: 0,
      total: Number(total),
      estado,
      moneda,
      tasaCambio: Number(tasa),
      requestId,
      observaciones: `K6 fixture ${key}`,
      items: {
        create: [
          {
            productoId: null,
            descripcionHistorica: `K6 item ${key}`,
            cantidad: 1,
            unidadMedida: 'UNIDAD',
            precioUnitarioHistorico: Number(total),
            costoUnitarioHistoricoUSD: 0,
            tasaImpuestoAplicada: 0,
            subtotalLinea: Number(total),
            impuestoLinea: 0,
            totalLinea: Number(total),
          },
        ],
      },
    },
  });

  if (pago) {
    await prisma.pago.create({
      data: {
        facturaId: factura.id,
        monto: Number(pago.monto),
        monedaPago: pago.monedaPago || 'USD',
        metodoPago: pago.metodoPago || 'CASH',
        referenciaTransaccion: pago.referenciaTransaccion || null,
        fechaPago: now,
        notas: `K6 pago fixture ${key}`,
      },
    });
  }

  let cuenta = null;
  if (cxc) {
    cuenta = await prisma.cuentaPorCobrar.create({
      data: {
        empresaId: empresa.id,
        facturaId: factura.id,
        clienteId: cliente.id,
        usuarioId: usuario.id,
        montoOriginal: Number(cxc.original),
        montoCobrado: Number(cxc.cobrado != null ? cxc.cobrado : 0),
        montoPendiente: Number(cxc.pendiente),
        fechaEmision: factura.fechaEmision,
        fechaVencimiento: factura.fechaVencimiento,
        estado: cxc.estado || estado,
        diasVencido: 0,
      },
    });
  }

  return { id: factura.id, numeroFactura: factura.numeroFactura, cxcId: cuenta ? cuenta.id : null };
}

async function main() {
  await cleanup();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  console.log('🏢 Creando empresas y usuarios...');

  const empresaA = await crearEmpresa('K6 Empresa A', 'K6-A-001');
  const empresaB = await crearEmpresa('K6 Empresa B', 'K6-B-001');

  const usuarioA = await crearUsuario({
    username: 'k6_empresa_a',
    nombre: 'K6 Empresa A',
    rol: 'EMPRESA',
    empresaRefId: empresaA.id,
    passwordHash,
  });

  const usuarioB = await crearUsuario({
    username: 'k6_empresa_b',
    nombre: 'K6 Empresa B',
    rol: 'EMPRESA',
    empresaRefId: empresaB.id,
    passwordHash,
  });

  const cajeroA = await crearUsuario({
    username: 'k6_cajero_a',
    nombre: 'K6 Cajero A',
    rol: 'CAJA',
    empresaId: usuarioA.id,
    passwordHash,
  });

  const inventarioA = await crearUsuario({
    username: 'k6_inventario_a',
    nombre: 'K6 Inventario A',
    rol: 'INVENTARIO',
    empresaId: usuarioA.id,
    passwordHash,
  });

  const visorA = await crearUsuario({
    username: 'k6_visor_a',
    nombre: 'K6 Visor A',
    rol: 'VISOR',
    empresaId: usuarioA.id,
    passwordHash,
  });

  const superadmin = await crearUsuario({
    username: 'k6_superadmin',
    nombre: 'K6 Super Admin',
    rol: 'SUPER_ADMIN',
    passwordHash,
  });

  console.log('👥 Creando clientes...');
  const clienteA = await prisma.cliente.create({
    data: {
      razonSocial: 'K6 Cliente A',
      rifCedula: 'K6-CLI-A',
      direccion: 'Av. Test 1',
      telefono: '04140000001',
      correo: 'cliente-a@example.test',
      empresaId: usuarioA.id,
    },
  });

  const clienteB = await prisma.cliente.create({
    data: {
      razonSocial: 'K6 Cliente B',
      rifCedula: 'K6-CLI-B',
      direccion: 'Av. Test 2',
      telefono: '04140000002',
      correo: 'cliente-b@example.test',
      empresaId: usuarioB.id,
    },
  });

  console.log('📦 Creando productos...');
  const prodHigh = await crearProducto(usuarioA.id, {
    sku: 'K6-HIGH',
    nombre: 'K6 Producto Stock Alto',
    stock: 10000,
    precio: 10,
  });
  const prodStock5 = await crearProducto(usuarioA.id, {
    sku: 'K6-STOCK5',
    nombre: 'K6 Producto Stock 5',
    stock: 5,
    precio: 10,
  });
  const prodZero = await crearProducto(usuarioA.id, {
    sku: 'K6-ZERO',
    nombre: 'K6 Producto Sin Stock',
    stock: 0,
    precio: 10,
  });
  const prodKg = await crearProducto(usuarioA.id, {
    sku: 'K6-KG',
    nombre: 'K6 Producto por Peso',
    stock: 100,
    precio: 10,
    esVentaPorPeso: true,
    unidadMedida: 'KILOGRAMO',
    precioPorKilo: 10,
  });
  const prodProbe = await crearProducto(usuarioA.id, {
    sku: 'K6-PROBE',
    nombre: 'K6 Producto Sonda Multi-Tenant',
    stock: 50,
    precio: 10,
  });
  const prodBHigh = await crearProducto(usuarioB.id, {
    sku: 'K6-B-HIGH',
    nombre: 'K6 Producto Empresa B',
    stock: 100,
    precio: 10,
  });

  console.log('🧾 Creando facturas de fixture...');
  const comun = { cliente: clienteA, usuario: usuarioA, empresa: empresaA };

  const fIdemA = await crearFactura({
    ...comun,
    key: 'idempotencia',
    total: '10.00',
    requestId: SHARED_REQUEST_ID,
    cxc: { original: '10.00', pendiente: '10.00' },
  });

  const fPagosRace = await crearFactura({
    ...comun,
    key: 'pagos-race',
    total: '10.00',
    cxc: { original: '10.00', pendiente: '10.00' },
  });

  const fCxcRace = await crearFactura({
    ...comun,
    key: 'cxc-race',
    total: '10.00',
    cxc: { original: '10.00', pendiente: '10.00' },
  });

  const fOverpay = await crearFactura({
    ...comun,
    key: 'overpay',
    total: '10.00',
    cxc: { original: '10.00', pendiente: '10.00' },
  });

  const fUsdPartial = await crearFactura({
    ...comun,
    key: 'usd-partial',
    total: '10.00',
    cxc: { original: '10.00', pendiente: '10.00' },
  });

  const fUsdPaidInVes = await crearFactura({
    ...comun,
    key: 'usd-paid-in-ves',
    total: '10.00',
    cxc: { original: '10.00', pendiente: '10.00' },
  });

  const fVes = await crearFactura({
    ...comun,
    key: 'ves',
    total: '1000.00',
    moneda: 'VES',
    tasa: 100,
    cxc: { original: '10.00', pendiente: '10.00' },
  });

  const fPaid = await crearFactura({
    ...comun,
    key: 'paid',
    total: '10.00',
    estado: 'PAID',
    pago: { monto: '10.00', monedaPago: 'USD', metodoPago: 'CASH' },
    cxc: { original: '10.00', cobrado: '10.00', pendiente: '0.00', estado: 'PAID' },
  });

  const fVoided = await crearFactura({
    ...comun,
    key: 'voided',
    total: '10.00',
    estado: 'VOIDED',
  });

  const fixtures = {
    generatedAt: new Date().toISOString(),
    base: process.env.BASE_URL || 'http://localhost:3001',
    rate: RATE,
    sharedRequestId: SHARED_REQUEST_ID,
    empresas: {
      A: { id: empresaA.id, nombre: empresaA.nombre, rif: empresaA.rif },
      B: { id: empresaB.id, nombre: empresaB.nombre, rif: empresaB.rif },
    },
    users: {
      empresaA: { id: usuarioA.id, username: usuarioA.username, rol: usuarioA.rol, token: tokenFor(usuarioA) },
      empresaB: { id: usuarioB.id, username: usuarioB.username, rol: usuarioB.rol, token: tokenFor(usuarioB) },
      cajeroA: { id: cajeroA.id, username: cajeroA.username, rol: cajeroA.rol, token: tokenFor(cajeroA) },
      inventarioA: { id: inventarioA.id, username: inventarioA.username, rol: inventarioA.rol, token: tokenFor(inventarioA) },
      visorA: { id: visorA.id, username: visorA.username, rol: visorA.rol, token: tokenFor(visorA) },
      superadmin: { id: superadmin.id, username: superadmin.username, rol: superadmin.rol, token: tokenFor(superadmin) },
    },
    clientes: { A: clienteA.id, B: clienteB.id },
    productos: {
      high: prodHigh.id,
      stock5: prodStock5.id,
      zero: prodZero.id,
      kg: prodKg.id,
      probe: prodProbe.id,
      bHigh: prodBHigh.id,
    },
    initialStock: {
      [prodHigh.id]: 10000,
      [prodStock5.id]: 5,
      [prodZero.id]: 0,
      [prodKg.id]: 100,
      [prodProbe.id]: 50,
      [prodBHigh.id]: 100,
    },
    facturas: {
      idemA: fIdemA,
      pagosRace: fPagosRace,
      cxcRace: fCxcRace,
      overpay: fOverpay,
      usdPartial: fUsdPartial,
      usdPaidInVes: fUsdPaidInVes,
      ves: fVes,
      paid: fPaid,
      voided: fVoided,
    },
  };

  fs.writeFileSync(FIXTURES_PATH, JSON.stringify(fixtures, null, 2));

  console.log('\n✅ Fixtures creados');
  console.log(`   Empresa A : ${empresaA.id}`);
  console.log(`   Empresa B : ${empresaB.id}`);
  console.log(`   Fixtures  : ${FIXTURES_PATH}`);
  console.log(`   Contraseña: ${PASSWORD} (solo si necesitas login manual)`);
  console.log('\n   Tokens incluidos en fixtures.json; los escenarios no hacen login.\n');
}

main()
  .catch((err) => {
    console.error('\n❌ Seed falló:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
