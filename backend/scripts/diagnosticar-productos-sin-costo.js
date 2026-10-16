/**
 * Diagnóstico: Identifica productos en facturas sin costoCompra o sin SKU
 * Uso: node scripts/diagnosticar-productos-sin-costo.js
 */
const prisma = require('../src/db/prisma');

async function diagnosticar() {
  console.log('\n=== DIAGNÓSTICO: Productos sin costo/SKU en facturas ===\n');

  // Productos activos sin costoCompra o sin SKU
  const productosProblematicos = await prisma.producto.findMany({
    where: {
      OR: [
        { costoCompra: null },
        { sku: null },
        { sku: '' },
      ],
    },
    select: {
      id: true,
      nombre: true,
      sku: true,
      costoCompra: true,
      precioVenta: true,
      unidadMedida: true,
    },
  });

  if (productosProblematicos.length === 0) {
    console.log('✓ No hay productos sin costo o SKU en el inventario.');
  } else {
    console.log(`⚠ ${productosProblematicos.length} producto(s) con problemas:\n`);
    productosProblematicos.forEach(p => {
      console.log(`  • ${p.nombre}`);
      console.log(`    ID: ${p.id}`);
      console.log(`    SKU: ${p.sku || '(vacío)'}`);
      console.log(`    Costo: ${p.costoCompra || '(null)'}`);
      console.log(`    Precio Venta: ${p.precioVenta}`);
      console.log(`    Unidad: ${p.unidadMedida}`);
      console.log('');
    });
  }

  // Items de factura sin productoId
  const itemsSinProducto = await prisma.itemFactura.findMany({
    where: { productoId: null },
    select: {
      descripcionHistorica: true,
      cantidad: true,
      precioUnitarioHistorico: true,
      factura: {
        select: {
          numeroFactura: true,
          fechaEmision: true,
        },
      },
    },
    take: 20,
  });

  if (itemsSinProducto.length === 0) {
    console.log('✓ No hay items de factura sin productoId.');
  } else {
    console.log(`\n⚠ ${itemsSinProducto.length} item(s) de factura sin productoId (primeros 20):\n`);
    itemsSinProducto.forEach(item => {
      console.log(`  • Factura #${item.factura.numeroFactura} (${item.factura.fechaEmision.toISOString()})`);
      console.log(`    Descripción: ${item.descripcionHistorica}`);
      console.log(`    Cantidad: ${item.cantidad}`);
      console.log(`    Precio: ${item.precioUnitarioHistorico}`);
      console.log('');
    });
  }

  // Total de items con productoId pero costoCompra null
  const itemsConProductoSinCosto = await prisma.itemFactura.findMany({
    where: {
      productoId: { not: null },
      producto: { costoCompra: null },
    },
    select: {
      descripcionHistorica: true,
      cantidad: true,
      precioUnitarioHistorico: true,
      producto: { select: { nombre: true, sku: true } },
      factura: { select: { numeroFactura: true, fechaEmision: true } },
    },
    take: 20,
  });

  if (itemsConProductoSinCosto.length === 0) {
    console.log('✓ No hay items con producto pero sin costo de compra.');
  } else {
    console.log(`\n⚠ ${itemsConProductoSinCosto.length} item(s) con producto sin costo (primeros 20):\n`);
    itemsConProductoSinCosto.forEach(item => {
      console.log(`  • Factura #{item.factura.numeroFactura} - ${item.producto.nombre}`);
      console.log(`    SKU: ${item.producto.sku || '(vacío)'}`);
      console.log(`    Cantidad: ${item.cantidad} × Precio: ${item.precioUnitarioHistorico}`);
      console.log('');
    });
  }

  await prisma.$disconnect();
}

diagnosticar().catch(console.error);
