/**
 * Backfill: ingresosEfectivoVES e ingresosBancoVES en cierres históricos.
 *
 * Fuente de datos: el JSON `arqueoDetalle` que ya capturaba el frontend
 * (arqueo.usd/ves). Si un cierre no tiene ese JSON, los campos quedan NULL
 * (desglose no disponible) — no se estima ni se inventa.
 *
 * Uso:
 *   node scripts/backfill-cierre-caja-monedas.js            (dry-run)
 *   node scripts/backfill-cierre-caja-monedas.js --apply    (persiste)
 */
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '..', 'node_modules', '@prisma/client'));
const { Decimal } = require(path.join(__dirname, '..', 'node_modules', 'decimal.js'));

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

function extraerDesglose(cierre) {
  if (!cierre.arqueoDetalle) return null;
  try {
    const d = JSON.parse(cierre.arqueoDetalle);
    const arqueo = d?.arqueo;
    if (!arqueo) return null;

    // USD: todo efectivo es USD; banco es USD por definición del desglose.
    // VES: arqueo.ves.ventasEfectivo es el efectivo en Bs.
    // No hay desglose VES por método bancario en el arqueo → ingresosBancoVES queda NULL.
    const efectivoVES = Number(arqueo?.ves?.ventasEfectivo) || 0;

    return {
      ingresosEfectivoVES: efectivoVES > 0 ? efectivoVES.toFixed(2) : null,
      ingresosBancoVES: null,
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log(APPLY ? '=== APLICANDO backfill ===' : '=== DRY-RING (sin cambios) ===');

  const cierres = await prisma.cierreCaja.findMany({
    where: {
      estado: 'CLOSED',
      OR: [
        { ingresosEfectivoVES: null },
        { ingresosBancoVES: null },
      ],
    },
    select: { id: true, arqueoDetalle: true },
    orderBy: { fechaApertura: 'asc' },
  });

  console.log(`Cierres CLOSED sin desglose VES: ${cierres.length}`);

  let actualizados = 0;
  let sinDatos = 0;

  for (const c of cierres) {
    const d = extraerDesglose(c);
    if (!d) {
      sinDatos++;
      continue;
    }
    if (APPLY) {
      await prisma.cierreCaja.update({
        where: { id: c.id },
        data: {
          ...(d.ingresosEfectivoVES != null ? { ingresosEfectivoVES: d.ingresosEfectivoVES } : {}),
          ...(d.ingresosBancoVES != null ? { ingresosBancoVES: d.ingresosBancoVES } : {}),
        },
      });
    }
    actualizados++;
  }

  console.log(`  Con datos para actualizar: ${actualizados}`);
  console.log(`  Sin arqueoDetalle (quedan NULL): ${sinDatos}`);
  console.log(APPLY ? 'Backfill aplicado.' : 'Dry-run. Reaplica con --apply para persistir.');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
