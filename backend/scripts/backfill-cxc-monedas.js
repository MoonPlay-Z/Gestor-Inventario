/**
 * Backfill: normalizar a USD los saldos de CuentaPorCobrar de facturas en Bs.
 *
 * Bug corregido: `POST /api/pagos` escribía `montoCobrado`/`montoPendiente` en
 * la moneda de la factura, por lo que una CxC de una factura VES quedaba con
 * `montoOriginal = 10` (USD) y `montoCobrado = 1000` (Bs). Este script recalcula
 * esos campos desde los pagos, normalizando a USD con la tasa de la factura.
 *
 * Alcance:
 *   - Solo toca CxC de facturas emitidas en VES (en las USD el importe ya era
 *     USD y no hay nada que reparar).
 *   - NO borra ni modifica pagos. Es idempotente: si ya cuadra, no escribe.
 *   - Lista aparte las facturas VES sobrepagadas para conciliación manual.
 *
 * Uso (desde backend/):
 *   node scripts/backfill-cxc-monedas.js           (dry-run)
 *   node scripts/backfill-cxc-monedas.js --apply   (persiste)
 */
const { Decimal } = require('decimal.js');
const prisma = require('../src/db/prisma');

const APPLY = process.argv.includes('--apply');
const TOLERANCIA = new Decimal('0.011');

const aDecimal = (v) => new Decimal(v === undefined || v === null || v === '' ? 0 : String(v));

async function main() {
  console.log(APPLY ? '=== APLICANDO ===' : '=== DRY-RUN (sin cambios) ===');

  const cuentas = await prisma.cuentaPorCobrar.findMany({
    include: {
      factura: {
        select: {
          id: true,
          numeroFactura: true,
          moneda: true,
          tasaCambio: true,
          total: true,
          pagos: { select: { monto: true, monedaPago: true } },
        },
      },
    },
  });

  let revisadas = 0;
  let desajustadas = 0;
  let actualizadas = 0;

  for (const c of cuentas) {
    const f = c.factura;
    if (!f || f.moneda !== 'VES') continue;

    const tasa = aDecimal(f.tasaCambio);
    if (!tasa.isFinite() || tasa.lte(0)) continue;
    revisadas++;

    let cobradoUSD = new Decimal(0);
    for (const p of f.pagos) {
      const monto = aDecimal(p.monto);
      cobradoUSD = cobradoUSD.add(p.monedaPago === 'VES' ? monto.div(tasa) : monto);
    }

    const original = aDecimal(c.montoOriginal);
    const pendienteUSD = original.sub(cobradoUSD);
    const pendiente = pendienteUSD.gt(0) ? pendienteUSD : new Decimal(0);
    const estado = pendiente.lte(0) ? 'PAID' : (cobradoUSD.gt(0) ? 'PARTIALLY_PAID' : 'PENDING');

    const cobradoActual = aDecimal(c.montoCobrado);
    if (cobradoActual.sub(cobradoUSD).abs().lte(TOLERANCIA)) continue;

    desajustadas++;
    console.log(
      `  CxC ${c.id} (factura #${f.numeroFactura}): ` +
      `cobrado ${cobradoActual.toFixed(2)} → ${cobradoUSD.toFixed(2)}, ` +
      `pendiente ${aDecimal(c.montoPendiente).toFixed(2)} → ${pendiente.toFixed(2)}, ` +
      `estado ${c.estado} → ${estado}`
    );

    if (APPLY) {
      await prisma.cuentaPorCobrar.update({
        where: { id: c.id },
        data: {
          montoCobrado: cobradoUSD.toFixed(2),
          montoPendiente: pendiente.toFixed(2),
          estado,
        },
      });
      actualizadas++;
    }
  }

  console.log(
    `\nCxC de facturas VES revisadas: ${revisadas} | desajustadas: ${desajustadas} | ` +
    `${APPLY ? `actualizadas: ${actualizadas}` : 'actualizadas: 0 (dry-run)'}`
  );

  // ── Reporte informativo: facturas VES sobrepagadas ──────────────────────────
  // No se corrige automáticamente: un sobrepago real requiere decisión del
  // negocio (nota de crédito, devolución); un borrado automático de pagos
  // destruiría evidencia.
  const facturas = await prisma.factura.findMany({
    where: { moneda: 'VES' },
    select: {
      numeroFactura: true,
      tasaCambio: true,
      total: true,
      pagos: { select: { monto: true, monedaPago: true } },
    },
  });

  const sobrepagadas = [];
  for (const f of facturas) {
    const tasa = aDecimal(f.tasaCambio);
    if (!tasa.isFinite() || tasa.lte(0)) continue;
    let pagado = new Decimal(0);
    for (const p of f.pagos) {
      const monto = aDecimal(p.monto);
      pagado = pagado.add(p.monedaPago === 'VES' ? monto : monto.mul(tasa));
    }
    if (pagado.gt(aDecimal(f.total).add(TOLERANCIA))) {
      sobrepagadas.push(`#${f.numeroFactura}: pagado ${pagado.toFixed(2)} vs total ${aDecimal(f.total).toFixed(2)}`);
    }
  }

  if (sobrepagadas.length) {
    console.log(`\n⚠ Facturas VES sobrepagadas (requieren conciliación manual): ${sobrepagadas.length}`);
    sobrepagadas.slice(0, 50).forEach((s) => console.log(`  ${s}`));
    if (sobrepagadas.length > 50) console.log(`  ... y ${sobrepagadas.length - 50} más`);
  } else {
    console.log('\nSin facturas VES sobrepagadas.');
  }

  console.log(APPLY ? '\nBackfill aplicado.' : '\nDry-run. Reaplica con --apply para persistir.');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
