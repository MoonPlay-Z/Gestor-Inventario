/**
 * Backfill: asignar tasaBCV a pagos históricos según su fechaPago.
 *
 * Uso:
 *   node scripts/backfill-pagos-tasa-bcv.js            (dry-run)
 *   node scripts/backfill-pagos-tasa-bcv.js --apply    (persiste)
 */

const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '..', 'node_modules', '@prisma/client'));
const { tasaBCVPorFecha } = require('../src/utils/bcvHistorico');

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

async function main() {
  console.log(APPLY ? '=== APLICANDO backfill de tasa BCV ===' : '=== DRY-RUN (sin cambios) ===');

  // Obtener pagos sin tasaBCV
  const pagos = await prisma.pago.findMany({
    where: { tasaBCV: null },
    select: { id: true, fechaPago: true },
    orderBy: { fechaPago: 'asc' },
  });

  console.log(`Pagos sin tasaBCV: ${pagos.length}`);

  let actualizados = 0;
  let sinDatos = 0;
  let errores = 0;

  for (const pago of pagos) {
    try {
      const tasa = await tasaBCVPorFecha(pago.fechaPago);
      if (!tasa) {
        sinDatos++;
        continue;
      }
      if (APPLY) {
        await prisma.pago.update({
          where: { id: pago.id },
          data: { tasaBCV: tasa.toFixed(4) },
        });
      }
      actualizados++;
    } catch (err) {
      errores++;
      console.error(`  Error en pago ${pago.id}: ${err.message}`);
    }
  }

  console.log(`  Con tasa asignada: ${actualizados}`);
  console.log(`  Sin datos BCV disponibles: ${sinDatos}`);
  console.log(`  Errores: ${errores}`);
  console.log(APPLY ? 'Backfill aplicado.' : 'Dry-run. Reaplica con --apply para persistir.');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
