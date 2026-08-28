const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../src/generated/prisma-sqlite');

const databaseUrl = process.env.DATABASE_URL || `file:${path.join(process.env.APPDATA || process.cwd(), 'gestor-inventario-root', 'data', 'gestor-inventario.sqlite')}`;
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const serialize = (value) => JSON.stringify(value, (_key, item) => typeof item === 'bigint' ? Number(item) : item, null, 2);

(async () => {
  const report = { generatedAt: new Date().toISOString(), database: databaseUrl, checks: {}, errors: [] };
  try {
    report.checks.integrity = await prisma.$queryRawUnsafe('PRAGMA integrity_check');
    report.checks.foreignKeys = await prisma.$queryRawUnsafe('PRAGMA foreign_key_check');
    report.checks.foreignKeysEnabled = await prisma.$queryRawUnsafe('PRAGMA foreign_keys');
    report.checks.counts = {};
    for (const model of ['usuario', 'cliente', 'producto', 'factura', 'itemFactura', 'pago', 'cierreCaja', 'cotizacion', 'itemCotizacion', 'solicitudActivacion']) {
      report.checks.counts[model] = await prisma[model].count();
    }
    report.ok = report.checks.integrity[0]?.integrity_check === 'ok'
      && report.checks.foreignKeys.length === 0
      && Number(report.checks.foreignKeysEnabled[0]?.foreign_keys) === 1;
    const reportPath = process.env.REPORT_PATH || path.join(path.dirname(databaseUrl.replace(/^file:/, '')), `reporte-integridad-sqlite-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${serialize(report)}\n`, 'utf8');
    console.log(JSON.stringify({ ok: report.ok, report: reportPath }, null, 2));
    process.exitCode = report.ok ? 0 : 2;
  } catch (error) {
    report.errors.push(error.message);
    console.error(`SQLite integrity check failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
