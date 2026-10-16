/**
 * Verificación profunda de ventas de tomate (SOLO LECTURA).
 *
 * Comprueba para cada línea:
 *  - ¿el subtotal corresponde a gramos o a kilos?
 *  - ¿el stock se descontó en gramos o en kilos?
 *  - ¿la cabecera de la factura coincide con la suma de sus ítems?
 */
const prisma = require('../src/db/prisma');
const { Decimal } = require('decimal.js');
const d = (v) => new Decimal(String(v ?? 0));

async function main() {
  const prod = await prisma.producto.findFirst({
    where: { sku: 'PROD-0000961' },
    select: { id: true, nombre: true, sku: true, unidadMedida: true,
              esVentaPorPeso: true, precioPorKilo: true, precioVenta: true, costoCompra: true },
  });

  if (!prod) { console.log('No se encontró el producto con SKU PROD-0000961'); await prisma.$disconnect(); return; }

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`PRODUCTO: ${prod.nombre} (${prod.sku})`);
  console.log(`  unidadMedida configurada: ${prod.unidadMedida}`);
  console.log(`  esVentaPorPeso: ${prod.esVentaPorPeso}`);
  console.log(`  precioPorKilo: ${prod.precioPorKilo}`);
  console.log(`  precioVenta: ${prod.precioVenta}`);
  console.log('══════════════════════════════════════════════════════════════\n');

  const items = await prisma.$queryRaw`
    SELECT it.id::text AS "idItem",
           f."numeroFactura" AS "num",
           f."fechaEmision" AS "fecha",
           f.estado AS "estado",
           f.moneda AS "monedaFact",
           f.total::text AS "totalFactura",
           f.subtotal::text AS "subtotalFactura",
           it."unidadMedida" AS "unidadItem",
           it.cantidad::text AS "cantidad",
           it."precioUnitarioHistorico"::text AS "precioUnit",
           it."subtotalLinea"::text AS "subtotalLinea",
           it."totalLinea"::text AS "totalLinea",
           it."tasaImpuestoAplicada"::text AS "tasa"
    FROM items_factura it
    JOIN facturas f ON f.id = it."facturaId"
    WHERE it."productoId" = ${prod.id}
    ORDER BY f."fechaEmision" ASC
  `;

  console.log(`Líneas de tomate facturadas: ${items.length}\n`);

  let okComoGramos = 0, okComoKilos = 0, incoherentes = 0;
  let sumaGramos = new Decimal(0), sumaKilos = new Decimal(0), sumaSubtotal = new Decimal(0);

  console.log('fact  fecha       unidad    cantidad   precioUnit  subtotal   ¿cuadra como?');
  console.log('-'.repeat(96));

  for (const it of items) {
    const cant = d(it.cantidad);
    const precio = d(it.precioUnit);
    const subt = d(it.subtotalLinea);

    const comoGramos = precio.mul(cant.div(1000));   // 675 g → 0.675 kg × $5
    const comoKilos = precio.mul(cant);               // 675 kg × $5 (absurdo)

    let tipo = '';
    if (subt.sub(comoGramos).abs().lte(new Decimal('0.02'))) { tipo = 'GRAMOS ✓'; okComoGramos++; }
    else if (subt.sub(comoKilos).abs().lte(new Decimal('0.02'))) { tipo = 'KILOS ✓'; okComoKilos++; }
    else { tipo = 'NINGUNO ✗'; incoherentes++; }

    sumaGramos = sumaGramos.plus(cant);
    sumaKilos = sumaKilos.plus(cant.div(1000));
    sumaSubtotal = sumaSubtotal.plus(subt);

    if (it.estado !== 'VOIDED') {
      console.log(
        `#${String(it.num).padEnd(5)}`,
        new Date(it.fecha).toISOString().slice(0, 10),
        String(it.unidadItem).padEnd(9),
        String(it.cantidad).padStart(9),
        ('$' + precio.toFixed(2)).padStart(11),
        ('$' + subt.toFixed(2)).padStart(10),
        '  ' + tipo
      );
    }
  }

  console.log('\n════════ RESUMEN ════════\n');
  console.log(`Líneas que cuadran si cantidad es GRAMOS: ${okComoGramos}`);
  console.log(`Líneas que cuadran si cantidad es KILOS:  ${okComoKilos}`);
  console.log(`Líneas incoherentes:                     ${incoherentes}`);
  console.log('');
  console.log(`Suma cruda de "cantidad":        ${sumaGramos.toFixed(4)}  (lo que veía el reporte)`);
  console.log(`Suma convertida a kilos:         ${sumaKilos.toFixed(4)} kg  (la cifra real)`);
  console.log(`Suma de subtotales facturados:   $${sumaSubtotal.toFixed(2)}`);
  console.log('');

  // Precio implícito real
  const kgReal = sumaKilos;
  if (kgReal.gt(0)) {
    console.log(`Precio real por kg (subtotal/kg): $${sumaSubtotal.div(kgReal).toFixed(4)}`);
    console.log(`precioPorKilo configurado:       $${Number(prod.precioPorKilo).toFixed(4)}`);
  }

  // ── Verificación de stock ───────────────────────────────────────────────
  console.log('\n════════ VERIFICACIÓN DE STOCK ════════\n');
  const stock = await prisma.producto.findUnique({
    where: { id: prod.id },
    select: { stockActual: true, stockMinimo: true },
  });
  console.log(`stockActual actual: ${stock.stockActual} ${prod.unidadMedida}`);
  console.log(`stockMinimo: ${stock.stockMinimo}`);
  console.log('');
  console.log('Si el stock se descontó en gramos, el total descontado sería');
  console.log(`  ${sumaGramos.toFixed(2)} (interpretado como kg = absurdo)`);
  console.log('Si se descontó en kilos, sería');
  console.log(`  ${sumaKilos.toFixed(2)} kg`);

  // ── Cabecera vs ítems en facturas de tomate ────────────────────────────
  console.log('\n════════ CABECERA vs ÍTEMS (facturas con tomate) ════════\n');
  const cab = await prisma.$queryRaw`
    SELECT f."numeroFactura" AS "num",
           f.subtotal::text AS "subF",
           COALESCE(SUM(it."subtotalLinea"),0)::text AS "subItems",
           f.total::text AS "totF",
           COALESCE(SUM(it."totalLinea"),0)::text AS "totItems"
    FROM facturas f
    JOIN items_factura it ON it."facturaId" = f.id
    WHERE f.id IN (SELECT "facturaId" FROM items_factura WHERE "productoId" = ${prod.id})
    GROUP BY f.id, f."numeroFactura", f.subtotal, f.total
    HAVING ABS(SUM(it."subtotalLinea") - f.subtotal) > 0.02
        OR ABS(SUM(it."totalLinea") - f.total) > 0.02
  `;
  if (cab.length === 0) {
    console.log('Todas las cabeceras cuadran con sus ítems.');
  } else {
    for (const c of cab) {
      console.log(`#${c.num}: cabecera sub=$${c.subF} tot=$${c.totF} | items sub=$${c.subItems} tot=$${c.totItems}`);
    }
  }

  await prisma.$disconnect();
}
main().catch(async e => { console.error('ERROR:', e.message); await prisma.$disconnect(); process.exit(1); });