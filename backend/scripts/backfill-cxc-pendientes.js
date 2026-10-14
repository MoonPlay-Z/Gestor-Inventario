/**
 * Backfill: crea la CuentaPorCobrar de las facturas que no la tienen.
 *
 * Causa: las sub-cuentas CAJA nacen con `empresaRefId = NULL` y su
 * `empresaId` apunta al Usuario padre. `cuentas_por_cobrar.empresaId` es
 * `NOT NULL`, así que la creación de la CxC fallaba y esas facturas quedaron
 * sin su cuenta por cobrar. El defecto de código ya está corregido en
 * `utils/empresaContext.js`; este script recupera los registros históricos.
 *
 * Solo actúa sobre facturas NO pagadas y sin cuenta asociada. Las ya pagadas
 * no generan deuda, por lo que no se les crea una CxC.
 *
 * Uso:
 *   node scripts/backfill-cxc-pendientes.js            (dry-run)
 *   node scripts/backfill-cxc-pendientes.js --apply    (persiste)
 */
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '..', 'node_modules', '@prisma/client'));
const Decimal = require(path.join(__dirname, '..', 'node_modules', 'decimal.js')).Decimal;
const { convertirMontoMoneda } = require('../src/utils/paymentCurrency');

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

/** Resuelve el Empresa de un usuario subiendo por el Usuario padre. */
async function resolverEmpresa(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, empresaRefId: true, empresaId: true },
  });
  if (!usuario) return null;
  if (usuario.empresaRefId) return usuario.empresaRefId;
  if (!usuario.empresaId) return null;

  const padre = await prisma.usuario.findUnique({
    where: { id: usuario.empresaId },
    select: { empresaRefId: true },
  });
  return padre?.empresaRefId || null;
}

async function main() {
  console.log(APPLY ? '=== APLICANDO backfill de CxC ===' : '=== DRY-RUN (sin cambios) ===');

  const facturas = await prisma.$queryRaw`
    SELECT f.id, f."numeroFactura" AS numero, f."fechaEmision", f."fechaVencimiento",
           f.total, f.moneda, f."tasaCambio", f.estado,
           f."clienteId", f."usuarioId",
           (SELECT COALESCE(SUM(p.monto), 0)
              FROM pagos p
              JOIN facturas fp ON fp.id = p."facturaId"
             WHERE p."facturaId" = f.id
               AND (fp.moneda = 'VES' AND fp."tasaCambio" > 0 OR fp.moneda <> 'VES')) AS _no_usado
    FROM facturas f
    LEFT JOIN cuentas_por_cobrar x ON x."facturaId" = f.id
    WHERE x.id IS NULL
      AND f.estado IN ('PENDING', 'PARTIALLY_PAID')
    ORDER BY f."fechaEmision" ASC
  `;

  console.log(`Facturas sin CxC y con saldo pendiente: ${facturas.length}\n`);

  let creadas = 0, omitidas = 0, errores = 0;

  for (const f of facturas) {
    // Cuánto se ha cobrado ya, normalizado a USD con la misma regla de
    // paymentCurrency: la tasa de la factura solo es real si es VES.
    const pagos = await prisma.pago.findMany({
      where: { facturaId: f.id },
      select: { monto: true, monedaPago: true },
    });

    const tasa = f.moneda === 'VES' && Number(f.tasaCambio) > 0
      ? new Decimal(f.tasaCambio.toString())
      : null;

    const totalUSD = convertirMontoMoneda(f.total, f.moneda, 'USD', tasa);
    const cobradoUSD = pagos.reduce((acc, p) => {
      const moneda = p.monedaPago || f.moneda || 'USD';
      return acc.add(convertirMontoMoneda(p.monto, moneda, 'USD', tasa));
    }, new Decimal(0));

    const pendienteUSD = totalUSD.minus(cobradoUSD);
    const estado = pendienteUSD.lte(0.005) ? 'PAID' : (cobradoUSD.gt(0.005) ? 'PARTIALLY_PAID' : 'PENDING');

    const empresaId = await resolverEmpresa(f.usuarioId);
    if (!empresaId) {
      omitidas++;
      console.log(`  #${f.numero}: sin empresa resoluble (omitida)`);
      continue;
    }

    const linea = `  #${f.numero}  ${String(f.total).padStart(8)}  cobrado ${cobradoUSD.toFixed(2)}  pendiente ${pendienteUSD.toFixed(2)}  → ${estado}`;

    if (estado === 'PAID') {
      omitidas++;
      console.log(`${linea}  (ya cubierta, no se crea CxC)`);
      continue;
    }

    if (APPLY) {
      try {
        await prisma.cuentaPorCobrar.create({
          data: {
            empresaId,
            facturaId: f.id,
            clienteId: f.clienteId,
            usuarioId: f.usuarioId,
            montoOriginal: totalUSD.toFixed(2),
            montoCobrado: cobradoUSD.toFixed(2),
            montoPendiente: pendienteUSD.toFixed(2),
            fechaEmision: f.fechaEmision,
            fechaVencimiento: f.fechaVencimiento,
            estado,
            diasVencido: 0,
          },
        });
        creadas++;
        console.log(`${linea}  ✓ creada`);
      } catch (e) {
        errores++;
        console.log(`${linea}  ✗ ${e.message}`);
      }
    } else {
      creadas++;
      console.log(`${linea}  (pendiente de aplicar)`);
    }
  }

  console.log(`\n  Creadas:      ${creadas}`);
  console.log(`  Omitidas:     ${omitidas}`);
  console.log(`  Errores:      ${errores}`);
  console.log(APPLY ? '\nBackfill aplicado.' : '\nDry-run. Reaplica con --apply para persistir.');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
