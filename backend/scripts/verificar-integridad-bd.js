const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();
const repair = process.argv.includes('--repair');
const reportPath = process.argv.find((arg) => arg.startsWith('--report='))?.slice(9)
  || path.join(__dirname, '..', 'data', `reporte-reparacion-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

async function count(sql) {
  const rows = await prisma.$queryRawUnsafe(sql);
  return Number(rows[0].count);
}

async function audit() {
  const result = {
    generatedAt: new Date().toISOString(),
    mode: repair ? 'repair' : 'check',
    database: process.env.DATABASE_URL?.replace(/:\/\/([^:]+):[^@]+@/, '://$1:***@'),
    checks: {},
    repairs: [],
    errors: [],
  };

  result.checks.tables = await prisma.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name"
  );
  result.checks.foreignKeys = await prisma.$queryRawUnsafe(
    "SELECT conname, conrelid::regclass::text AS table_name FROM pg_constraint WHERE contype='f' ORDER BY conrelid::regclass::text, conname"
  );

  const tables = ['usuarios', 'clientes', 'productos', 'facturas', 'items_factura', 'pagos', 'correlativos', 'cierres_caja', 'cotizaciones', 'items_cotizacion', 'solicitudes_activacion'];
  result.checks.counts = {};
  for (const table of tables) {
    result.checks.counts[table] = await count(`SELECT COUNT(*)::int AS count FROM "${table}"`);
  }

  result.checks.orphans = {
    clientesEmpresa: await count('SELECT COUNT(*)::int AS count FROM clientes c LEFT JOIN usuarios u ON u.id=c."empresaId" WHERE c."empresaId" IS NOT NULL AND u.id IS NULL'),
    productosEmpresa: await count('SELECT COUNT(*)::int AS count FROM productos p LEFT JOIN usuarios u ON u.id=p."empresaId" WHERE u.id IS NULL'),
    facturasCliente: await count('SELECT COUNT(*)::int AS count FROM facturas f LEFT JOIN clientes c ON c.id=f."clienteId" WHERE c.id IS NULL'),
    facturasUsuario: await count('SELECT COUNT(*)::int AS count FROM facturas f LEFT JOIN usuarios u ON u.id=f."usuarioId" WHERE f."usuarioId" IS NOT NULL AND u.id IS NULL'),
    itemsFactura: await count('SELECT COUNT(*)::int AS count FROM items_factura i LEFT JOIN facturas f ON f.id=i."facturaId" WHERE f.id IS NULL'),
    itemsProducto: await count('SELECT COUNT(*)::int AS count FROM items_factura i LEFT JOIN productos p ON p.id=i."productoId" WHERE i."productoId" IS NOT NULL AND p.id IS NULL'),
    pagosFactura: await count('SELECT COUNT(*)::int AS count FROM pagos p LEFT JOIN facturas f ON f.id=p."facturaId" WHERE f.id IS NULL'),
    usuarioEmpresa: await count('SELECT COUNT(*)::int AS count FROM usuarios u LEFT JOIN usuarios e ON e.id=u."empresaId" WHERE u."empresaId" IS NOT NULL AND e.id IS NULL'),
    cotizacionesCliente: await count('SELECT COUNT(*)::int AS count FROM cotizaciones c LEFT JOIN clientes cl ON cl.id=c."clienteId" WHERE cl.id IS NULL'),
    itemsCotizacion: await count('SELECT COUNT(*)::int AS count FROM items_cotizacion i LEFT JOIN cotizaciones c ON c.id=i."cotizacionId" WHERE c.id IS NULL'),
    solicitudUsuario: await count('SELECT COUNT(*)::int AS count FROM solicitudes_activacion s LEFT JOIN usuarios u ON u.id=s."usuarioId" WHERE u.id IS NULL'),
  };

  result.checks.duplicates = {
    usernames: await count('SELECT COUNT(*)::int AS count FROM (SELECT username FROM usuarios GROUP BY username HAVING COUNT(*) > 1) x'),
    productTenantSku: await count('SELECT COUNT(*)::int AS count FROM (SELECT "empresaId", sku FROM productos GROUP BY "empresaId", sku HAVING COUNT(*) > 1) x'),
    clientTenantRif: await count('SELECT COUNT(*)::int AS count FROM (SELECT "empresaId", "rifCedula" FROM clientes GROUP BY "empresaId", "rifCedula" HAVING COUNT(*) > 1) x'),
    invoiceNumbers: await count('SELECT COUNT(*)::int AS count FROM (SELECT "numeroFactura" FROM facturas GROUP BY "numeroFactura" HAVING COUNT(*) > 1) x'),
  };

  result.checks.invalidValues = {
    negativeStock: await count('SELECT COUNT(*)::int AS count FROM productos WHERE "stockActual" < 0 OR "stockMinimo" < 0'),
    negativePrices: await count('SELECT COUNT(*)::int AS count FROM productos WHERE "precioVenta" < 0 OR "costoCompra" < 0'),
    invalidInvoiceAmounts: await count('SELECT COUNT(*)::int AS count FROM facturas WHERE subtotal < 0 OR "impuestoTotal" < 0 OR total < 0'),
    invalidItemAmounts: await count('SELECT COUNT(*)::int AS count FROM items_factura WHERE cantidad <= 0 OR "subtotalLinea" < 0 OR "impuestoLinea" < 0 OR "totalLinea" < 0'),
    invalidPayments: await count('SELECT COUNT(*)::int AS count FROM pagos WHERE monto <= 0'),
  };

  result.checks.invoiceTotals = {
    mismatchedItemSums: await count('SELECT COUNT(*)::int AS count FROM (SELECT f.id FROM facturas f JOIN (SELECT "facturaId", COALESCE(SUM("subtotalLinea"), 0) subtotal, COALESCE(SUM("impuestoLinea"), 0) impuesto, COALESCE(SUM("totalLinea"), 0) total FROM items_factura GROUP BY "facturaId") i ON i."facturaId"=f.id WHERE ABS(f.subtotal-i.subtotal)>0.01 OR ABS(f."impuestoTotal"-i.impuesto)>0.01 OR ABS(f.total-i.total)>0.01) x'),
    paymentsOverTotal: await count('SELECT COUNT(*)::int AS count FROM (SELECT f.id FROM facturas f JOIN (SELECT "facturaId", SUM(monto) monto FROM pagos GROUP BY "facturaId") p ON p."facturaId"=f.id WHERE p.monto > f.total + 0.01) x'),
  };
  result.checks.invoiceTotalDetails = await prisma.$queryRawUnsafe('SELECT f.id, f."numeroFactura", f.subtotal AS stored_subtotal, f."impuestoTotal" AS stored_tax, f.total AS stored_total, i.subtotal AS items_subtotal, i.impuesto AS items_tax, i.total AS items_total FROM facturas f JOIN (SELECT "facturaId", COALESCE(SUM("subtotalLinea"), 0) subtotal, COALESCE(SUM("impuestoLinea"), 0) impuesto, COALESCE(SUM("totalLinea"), 0) total FROM items_factura GROUP BY "facturaId") i ON i."facturaId"=f.id WHERE ABS(f.subtotal-i.subtotal)>0.01 OR ABS(f."impuestoTotal"-i.impuesto)>0.01 OR ABS(f.total-i.total)>0.01');

  if (repair) {
    const invoiceFixes = await prisma.$queryRawUnsafe('SELECT f.id, f.subtotal, f."impuestoTotal", f.total, i.id AS item_id FROM facturas f JOIN items_factura i ON i."facturaId"=f.id WHERE (SELECT COUNT(*) FROM items_factura ix WHERE ix."facturaId"=f.id)=1 AND (SELECT COALESCE(SUM(ix."subtotalLinea"), 0) FROM items_factura ix WHERE ix."facturaId"=f.id) <> f.subtotal');
    for (const invoice of invoiceFixes) {
      const item = await prisma.itemFactura.findUnique({ where: { id: invoice.item_id } });
      if (!item) continue;
      await prisma.itemFactura.update({
        where: { id: item.id },
        data: {
          subtotalLinea: invoice.subtotal,
          impuestoLinea: invoice.impuestoTotal,
          totalLinea: invoice.total,
        },
      });
      result.repairs.push({
        type: 'invoice-item-totals-synchronized',
        invoiceId: invoice.id,
        itemId: item.id,
        before: { subtotalLinea: item.subtotalLinea, impuestoLinea: item.impuestoLinea, totalLinea: item.totalLinea },
        after: { subtotalLinea: invoice.subtotal, impuestoLinea: invoice.impuestoTotal, totalLinea: invoice.total },
      });
    }

    const sequences = await prisma.$queryRawUnsafe("SELECT c.relname AS table_name, a.attname AS column_name, pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), a.attname) AS sequence_name FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 WHERE n.nspname='public' AND c.relkind='r' AND pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), a.attname) IS NOT NULL");
    for (const sequence of sequences) {
      const table = sequence.table_name;
      const column = sequence.column_name;
      const sequenceName = sequence.sequence_name;
      const max = await prisma.$queryRawUnsafe(`SELECT COALESCE(MAX("${column}"), 0)::bigint AS max FROM "${table}"`);
      await prisma.$executeRawUnsafe(`SELECT setval($1::regclass, GREATEST($2::bigint, 1), $2::bigint > 0)`, sequenceName, Number(max[0].max));
      result.repairs.push({ type: 'sequence-synchronized', table, column, sequence: sequenceName, max: Number(max[0].max) });
    }
  }

  const values = [...Object.values(result.checks.orphans), ...Object.values(result.checks.duplicates), ...Object.values(result.checks.invalidValues), ...Object.values(result.checks.invoiceTotals)];
  result.ok = values.every((value) => value === 0);
  return result;
}

(async () => {
  try {
    const report = await audit();
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    console.log(JSON.stringify({ ok: report.ok, mode: report.mode, report: reportPath, repairs: report.repairs.length }, null, 2));
    process.exitCode = report.ok ? 0 : 2;
  } catch (error) {
    console.error(`Integrity audit failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();