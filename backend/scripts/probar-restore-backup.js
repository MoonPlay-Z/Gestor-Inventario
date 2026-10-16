/**
 * Prueba del ciclo export → restore de un backup con líneas de venta por peso.
 *
 * Verifica que un ítem guardado en GRAMO sobreviva el round-trip y conserve
 * su unidad. El restore se ejecuta dentro de una transacción que se revierte
 * al final: no deja datos en la base.
 *
 * Uso: node scripts/probar-restore-backup.js
 */
const prisma = require('../src/db/prisma');

async function main() {
  // ── 1.datos reales con venta por peso en gramos ──────────────────────
  const original = await prisma.itemFactura.findFirst({
    where: { unidadMedida: 'GRAMO' },
    orderBy: { createdAt: 'desc' },
    include: { factura: { select: { id: true, numeroFactura: true } } },
  });

  if (!original) {
    console.log('No hay ítems en GRAMO para probar.');
    await prisma.$disconnect();
    return;
  }

  console.log('\n═══ ÍTEM DE PRUEBA (origen en la base) ═══\n');
  console.log(`  id:            ${original.id}`);
  console.log(`  cantidad:      ${original.cantidad}`);
  console.log(`  unidadMedida:  ${original.unidadMedida}   ← clave del bug`);
  console.log(`  precioUnit:    ${original.precioUnitarioHistorico}`);
  console.log(`  costoUnitUSD:  ${original.costoUnitarioHistoricoUSD}`);
  console.log(`  factura:       #${original.factura.numeroFactura}`);

  // ── 2. Simular el EXPORT (el export usa findMany() sin select) ────────────
  const exportado = await prisma.itemFactura.findMany({
    where: { id: original.id },
  });
  const payload = exportado[0];

  console.log('\n═══ EXPORT ═══\n');
  console.log(`  ¿unidadMedida en el JSON?              ${'unidadMedida' in payload ? 'SÍ' : 'NO'}`);
  console.log(`  ¿pesoReal?                             ${'pesoReal' in payload ? 'SÍ' : 'NO'}`);
  console.log(`  ¿costoUnitarioHistoricoUSD?            ${'costoUnitarioHistoricoUSD' in payload ? 'SÍ' : 'NO'}`);

  // ── 3. Ejecutar el RESTORE en una transacción que se revierte ─────────────
  // Replica exactamente el bloque de backup.js POST /import.
  let restaurado = null;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.itemFactura.delete({ where: { id: payload.id } });

      await tx.itemFactura.create({
        data: {
          id: payload.id,
          facturaId: payload.facturaId,
          productoId: payload.productoId,
          descripcionHistorica: payload.descripcionHistorica,
          cantidad: payload.cantidad,
          unidadMedida: payload.unidadMedida || 'UNIDAD',
          pesoReal: payload.pesoReal ?? null,
          precioUnitarioHistorico: payload.precioUnitarioHistorico,
          costoUnitarioHistoricoUSD: payload.costoUnitarioHistoricoUSD ?? null,
          tasaImpuestoAplicada: payload.tasaImpuestoAplicada,
          subtotalLinea: payload.subtotalLinea,
          impuestoLinea: payload.impuestoLinea,
          totalLinea: payload.totalLinea,
          createdAt: new Date(payload.createdAt).toISOString(),
        },
      });

      // Leemos lo que quedó dentro de la misma transacción.
      restaurado = await tx.itemFactura.findUnique({ where: { id: payload.id } });

      // Forzamos el rollback: lanzamos para no dejar rastro.
      throw new Error('__ROLLBACK_TEST__');
    });
  } catch (e) {
    if (!e.message.includes('__ROLLBACK_TEST__')) throw e;
  }

  // ── 4. Verificar ─────────────────────────────────────────────────────────
  console.log('\n═══ RESULTADO DEL RESTORE ═══\n');
  console.log(`  cantidad:      ${restaurado.cantidad}`);
  console.log(`  unidadMedida:  ${restaurado.unidadMedida}   ${restaurado.unidadMedida === 'GRAMO' ? '✓ CONSERVADA' : '✗ PERDIDA'}`);
  console.log(`  precioUnit:    ${restaurado.precioUnitarioHistorico}`);
  console.log(`  costoUnitUSD:  ${restaurado.costoUnitarioHistoricoUSD}`);

  const ok = restaurado.unidadMedida === 'GRAMO'
    && String(restaurado.cantidad) === String(original.cantidad);

  console.log(`\n  RESULTADO: ${ok ? 'PASS — la unidad sobrevive el round-trip' : 'FAIL — se perdió información'}`);

  // ── 5. Confirmar que la base quedó intacta ───────────────────────────────
  const actual = await prisma.itemFactura.findUnique({ where: { id: original.id } });
  console.log(`\n  Base intacta tras el rollback: ${actual ? 'SÍ' : 'NO (ÍTEM PERDIDO)'}`);
  console.log(`  unidadMedida actual en base:   ${actual?.unidadMedida}`);

  await prisma.$disconnect();
  process.exit(ok && actual ? 0 : 1);
}

main().catch(async e => {
  console.error('ERROR:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});