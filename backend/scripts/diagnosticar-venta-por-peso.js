/**
 * Diagnóstico: ítems de factura con venta por peso.
 * Busca líneas donde la unidad registrada no cuadre con la magnitud del monto,
 *典型的 symptom: 6250 kg vendidos por $135.
 *
 * Uso: node scripts/diagnosticar-venta-por-peso.js
 */
const prisma = require('../src/db/prisma');
const { Decimal } = require('decimal.js');

async function main() {
  const pesos = await prisma.producto.findMany({
    where: { esVentaPorPeso: true, activo: true },
    select: {
      id: true, nombre: true, sku: true, unidadMedida: true,
      precioVenta: true, costoCompra: true, stockActual: true,
      precioPorKilo: true,
    },
  });

  console.log(`\nProductos con venta por peso: ${pesos.length}\n`);
  if (pesos.length === 0) {
    console.log('No hay productos con esVentaPorPeso=true.');
    await prisma.$disconnect();
    return;
  }

  console.log('sku'.padEnd(14), 'nombre'.padEnd(24), 'unidad'.padEnd(11), 'precioVenta'.padStart(11), 'precioPorKilo'.padStart(14), 'stock');
  for (const p of pesos) {
    console.log(
      String(p.sku).padEnd(14),
      String(p.nombre).slice(0, 23).padEnd(24),
      String(p.unidadMedida).padEnd(11),
      String(p.precioVenta).padStart(11),
      String(p.precioPorKilo ?? '—').padStart(14),
      String(p.stockActual)
    );
  }

  // Analiza los ítems facturados de estos productos
  const ids = pesos.map(p => p.id);
  const items = await prisma.itemFactura.findMany({
    where: { productoId: { in: ids } },
    select: {
      cantidad: true,
      unidadMedida: true,
      precioUnitarioHistorico: true,
      subtotalLinea: true,
      descripcionHistorica: true,
      factura: { select: { numeroFactura: true, fechaEmision: true, estado: true } },
      producto: { select: { nombre: true, sku: true, precioPorKilo: true, precioVenta: true } },
    },
    orderBy: { cantidad: 'desc' },
    take: 40,
  });

  console.log(`\n=== Últimos ${items.length} ítems facturados por peso (ordenados por cantidad) ===\n`);
  for (const it of items) {
    const cant = Number(it.cantidad);
    const subt = Number(it.subtotalLinea);
    const precio = Number(it.precioUnitarioHistorico);
    // Precio implícito por unidad
    const impl = cant > 0 ? subt / cant : 0;
    console.log(
      `#${String(it.factura.numeroFactura).padEnd(6)}`,
      String(it.producto.nombre).slice(0, 20).padEnd(21),
      `cant=${String(cant).padStart(10)}`,
      `unid=${String(it.unidadMedida).padEnd(11)}`,
      `subtotal=$${String(subt.toFixed(2)).padStart(10)}`,
      `implícito=$${impl.toFixed(4)}`.padEnd(20),
      `precioPorKilo=${it.producto.precioPorKilo ?? '—'}`
    );
  }

  // Sospechosos: cantidad > 1 y el subtotal NO escala con un precio por kg razonable
  console.log('\n=== Sospechosos (posible doble conversión o gramos sin convertir) ===\n');
  const sospechosos = items.filter(it => {
    const cant = Number(it.cantidad);
    const subt = Number(it.subtotalLinea);
    const precio = Number(it.precioUnitarioHistorico);
    // Si el precio unitario histórico ya es el precio por kilo y la cantidad es
    // enorme, es consistente; el problema sería el subtotal.
    return cant > 1000 || (cant > 1 && subt / cant < 0.01);
  });
  if (sospechosos.length === 0) {
    console.log('Ningún ítem claramente sospechoso por magnitud.');
  }
  for (const s of sospechosos) {
    const cant = Number(s.cantidad);
    const subt = Number(s.subtotalLinea);
    console.log(`#${s.factura.numeroFactura} ${s.producto.nombre}: ${cant} ${s.unidadMedida} → $${subt}`);
  }

  await prisma.$disconnect();
}

main().catch(async e => { console.error('Error:', e.message); await prisma.$disconnect(); process.exit(1); });