/**
 * migrar-cxc.js — Crea registros CuentaPorCobrar para facturas pendientes existentes.
 *
 * Uso:
 *   cd backend
 *   node scripts/migrar-cxc.js
 *
 * El script es idempotente: si ya existe un CxC para una factura, lo omite.
 */

const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('decimal.js');

const prisma = new PrismaClient();

async function main() {
  console.log('=== Migración de Cuentas por Cobrar ===\n');

  // 1. Buscar facturas pendientes o parcialmente pagadas SIN CxC asociado
  const facturas = await prisma.factura.findMany({
    where: {
      estado: { in: ['PENDING', 'PARTIALLY_PAID'] },
      cuentaPorCobrar: null
    },
    include: {
      pagos: true,
      cliente: { select: { id: true } },
      usuario: { select: { id: true } }
    }
  });

  console.log(`Facturas pendientes sin CxC: ${facturas.length}`);

  if (facturas.length === 0) {
    console.log('\n✓ No hay facturas por migrar. Todas las facturas pendientes ya tienen CxC asociado.');
    await prisma.$disconnect();
    return;
  }

  // 2. Crear registros CxC
  let creadas = 0;
  let omitidas = 0;
  let errores = 0;
  let sinEmpresa = 0;

  for (const factura of facturas) {
    try {
      // Calcular monto cobrado (normalizado a USD)
      const totalCobrado = factura.pagos.reduce((acc, pago) => {
        const monto = new Decimal(pago.monto.toString());
        if (pago.monedaPago === 'VES' && factura.tasaCambio > 0) {
          return acc.add(monto.div(new Decimal(factura.tasaCambio.toString())));
        }
        return acc.add(monto);
      }, new Decimal(0));

      const montoOriginal = new Decimal(factura.total.toString());
      const montoPendiente = montoOriginal.sub(totalCobrado);

      // Determinar estado
      let estado;
      if (montoPendiente.lte(0)) estado = 'PAID';
      else if (totalCobrado.gt(0)) estado = 'PARTIALLY_PAID';
      else estado = 'PENDING';

      // Calcular días vencido
      const hoy = new Date();
      const venc = new Date(factura.fechaVencimiento);
      const diasVencido = Math.ceil((hoy - venc) / (1000 * 60 * 60 * 24));

      // Resolver empresaId (algunas facturas lo tienen null)
      let empresaId = factura.empresaId;
      if (!empresaId && factura.usuarioId) {
        const usuario = await prisma.usuario.findUnique({
          where: { id: factura.usuarioId },
          select: { empresaRefId: true, empresaId: true }
        });
        empresaId = usuario?.empresaRefId || usuario?.empresaId || undefined;
      }

      // Verificar que el empresaId existe en la tabla empresas
      if (empresaId) {
        const empresaExiste = await prisma.empresa.findUnique({
          where: { id: empresaId },
          select: { id: true }
        });
        if (!empresaExiste) {
          sinEmpresa++;
          console.warn(`  ⚠ Factura #${factura.numeroFactura} → empresaId ${empresaId} no existe (omitida)`);
          continue;
        }
      }

      await prisma.cuentaPorCobrar.create({
        data: {
          empresaId,
          facturaId: factura.id,
          clienteId: factura.clienteId,
          usuarioId: factura.usuarioId,
          montoOriginal: montoOriginal.toFixed(2),
          montoCobrado: totalCobrado.toFixed(2),
          montoPendiente: montoPendiente.gt(0) ? montoPendiente.toFixed(2) : '0.00',
          fechaEmision: factura.fechaEmision,
          fechaVencimiento: factura.fechaVencimiento,
          estado,
          diasVencido: Math.max(0, diasVencido)
        }
      });

      creadas++;
      console.log(`  ✓ Factura #${factura.numeroFactura} → CxC creada (pendiente: $${montoPendiente.toFixed(2)})`);
    } catch (err) {
      if (err.code === 'P2002') {
        omitidas++;
        console.log(`  ⊘ Factura #${factura.numeroFactura} → ya tiene CxC (omitida)`);
      } else {
        errores++;
        console.error(`  ✗ Factura #${factura.numeroFactura} → ERROR: ${err.message}`);
      }
    }
  }

  // 3. Resumen final
  console.log('\n=== Resumen de migración ===');
  console.log(`  Creadas:      ${creadas}`);
  console.log(`  Omitidas:    ${omitidas}`);
  console.log(`  Sin empresa:  ${sinEmpresa}`);
  console.log(`  Errores:      ${errores}`);
  console.log(`  Total:        ${facturas.length}`);

  // 4. Verificación
  const totalCxC = await prisma.cuentaPorCobrar.count();
  const totalPendientes = await prisma.cuentaPorCobrar.count({
    where: { estado: { in: ['PENDING', 'PARTIALLY_PAID'] } }
  });

  console.log(`\n  Total CxC en BD: ${totalCxC}`);
  console.log(`  CxC pendientes:  ${totalPendientes}`);

  console.log('\n✓ Migración completada.');

  await prisma.$disconnect();
}

main()
  .catch((err) => {
    console.error('\n✗ Error fatal durante la migración:', err);
    prisma.$disconnect();
    process.exit(1);
  });
