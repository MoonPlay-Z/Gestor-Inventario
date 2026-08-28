const fs = require('fs');
const path = require('path');
const { PrismaClient: PostgreSqlClient } = require('@prisma/client');
const { PrismaClient: SqliteClient } = require('../src/generated/prisma-sqlite');

const args = Object.fromEntries(process.argv.slice(2).filter((arg) => arg.startsWith('--')).map((arg) => {
  const [key, ...value] = arg.slice(2).split('=');
  return [key, value.join('=')];
}));
const sourceUrl = args.source || process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL;
const targetPath = path.resolve(args.target || path.join(process.env.APPDATA || process.cwd(), 'gestor-inventario-root', 'data', 'gestor-inventario.sqlite'));
const targetUrl = `file:${targetPath}`;
const reportPath = path.resolve(args.report || path.join(path.dirname(targetPath), `reporte-migracion-${new Date().toISOString().replace(/[:.]/g, '-')}.json`));

if (!sourceUrl || !sourceUrl.startsWith('postgres')) {
  throw new Error('Indique una URL PostgreSQL con --source=postgresql://... o SOURCE_DATABASE_URL.');
}

const source = new PostgreSqlClient({ datasources: { db: { url: sourceUrl } } });
const target = new SqliteClient({ datasources: { db: { url: targetUrl } } });
const numericFields = new Set([
  'precioVenta', 'costoCompra', 'tasaImpuesto', 'subtotal', 'impuestoTotal', 'total',
  'tasaCambio', 'precioUnitarioHistorico', 'tasaImpuestoAplicada', 'subtotalLinea',
  'impuestoLinea', 'totalLinea', 'monto', 'montoInicial', 'montoFinal', 'ingresosEfectivo',
  'ingresosBanco', 'precioUnitario', 'totalLinea',
]);
const tables = [
  ['usuario', 'usuarios'],
  ['cliente', 'clientes'],
  ['producto', 'productos'],
  ['factura', 'facturas'],
  ['itemFactura', 'items_factura'],
  ['pago', 'pagos'],
  ['correlativo', 'correlativos'],
  ['cierreCaja', 'cierres_caja'],
  ['cotizacion', 'cotizaciones'],
  ['itemCotizacion', 'items_cotizacion'],
  ['solicitudActivacion', 'solicitudes_activacion'],
];

function normalizeRow(row) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key,
    numericFields.has(key) && value !== null ? Number(value.toString()) : value,
  ]));
}

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    source: sourceUrl.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@'),
    target: targetUrl,
    tables: {},
    errors: [],
  };
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  try {
    await target.$executeRawUnsafe('PRAGMA foreign_keys = OFF');
    await target.$transaction(async (tx) => {
      for (const [model, table] of [...tables].reverse()) {
        await tx[model].deleteMany();
        report.tables[table] = { read: 0, inserted: 0 };
      }
      for (const [model, table] of tables) {
        const rows = await source[model].findMany();
        const normalized = rows.map(normalizeRow);
        for (const row of normalized) await tx[model].create({ data: row });
        report.tables[table] = { read: rows.length, inserted: normalized.length };
      }
    });
    await target.$executeRawUnsafe('PRAGMA foreign_keys = ON');
    const integrity = await target.$queryRawUnsafe('PRAGMA integrity_check');
    const foreignKeys = await target.$queryRawUnsafe('PRAGMA foreign_key_check');
    report.integrityCheck = integrity;
    report.foreignKeyCheck = foreignKeys;
    report.ok = integrity.length === 1 && integrity[0].integrity_check === 'ok' && foreignKeys.length === 0;
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ ok: report.ok, report: reportPath, target: targetPath }, null, 2));
    process.exitCode = report.ok ? 0 : 2;
  } catch (error) {
    report.errors.push(error.message);
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main();
