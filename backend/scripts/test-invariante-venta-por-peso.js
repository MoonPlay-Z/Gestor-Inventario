#!/usr/bin/env node
/**
 * Test de invariante — venta por peso.
 *
 * Comprueba sobre datos reales que cada línea de venta por peso cumple:
 *
 *   subtotalLinea ≈ precioUnitario × cantidadEnUnidadProducto
 *
 * donde cantidadEnUnidadProducto convierte gramos a kilos. Si alguien
 * rompe la conversión en los reportes, este test falla.
 *
 * Verifica además que los totales por producto del reporte sean coherentes
 * con el precio configurado.
 *
 * Uso: node scripts/test-invariante-venta-por-peso.js
 * Salida: exit 0 si todo cuadra, 1 si hay violaciones.
 */
const prisma = require('../src/db/prisma');
const { cantidadEnKg } = require('../src/services/unidades');
const { Decimal } = require('decimal.js');

const d = (v) => new Decimal(String(v ?? 0));
const TOL = new Decimal('0.02');

async function main() {
  console.log('\n═══ TEST DE INVARIANTE: VENTA POR PESO ═══\n');

  let fallos = 0;

  // ── 1. Cada línea debe cuadrar: subtotal = precio × cantidad normalizada ──
  const lineas = await prisma.$queryRaw`
    SELECT it.id::text AS "idItem",
           it.cantidad::text AS "cantidad",
           it."unidadMedida" AS "unidad",
           it."precioUnitarioHistorico"::text AS "precio",
           it."subtotalLinea"::text AS "subtotal",
           p."esVentaPorPeso" AS "porPeso"
    FROM items_factura it
    JOIN productos p ON p.id = it."productoId"
    WHERE p."esVentaPorPeso" = true
  `;

  console.log(`[1] Líneas de venta por peso: ${lineas.length}`);
  const violaciones = [];
  for (const L of lineas) {
    const cantidadKg = cantidadEnKg(L.cantidad, L.unidad, L.porPeso);
    const esperado = d(L.precio).mul(cantidadKg);
    const real = d(L.subtotal);
    if (real.minus(esperado).abs().gt(TOL)) {
      violaciones.push({ L, cantidadKg, esperado, real });
    }
  }

  if (violaciones.length === 0) {
    console.log(`    ✓ Todas cuadran (subtotal = precio × cantidad normalizada)`);
  } else {
    console.log(`    ✗ ${violaciones.length} violaciones:\n`);
    for (const v of violaciones.slice(0, 10)) {
      console.log(`      cantidad=${v.L.cantidad} ${v.L.unidad} (${v.cantidadKg} kg)`);
      console.log(`        esperado $${v.esperado.toFixed(2)} | real $${v.real.toFixed(2)}`);
    }
    fallos += violaciones.length;
  }

  // ── 2. El reporte agregado no debe exceder el rango físico plausible ──────
  console.log(`\n[2] Coherencia del reporte agregado`);
  const agregados = await prisma.$queryRaw`
    SELECT p.nombre AS "nombre",
           p."precioPorKilo"::text AS "precioKg",
           p."unidadMedida" AS "unidadProducto",
           SUM(it."subtotalLinea")::text AS "ingresos",
           SUM(
             CASE
               WHEN it."unidadMedida" = 'GRAMO' THEN it.cantidad / 1000
               ELSE it.cantidad
             END
           )::text AS "cantidad"
    FROM items_factura it
    JOIN productos p ON p.id = it."productoId"
    JOIN facturas f ON f.id = it."facturaId"
    WHERE p."esVentaPorPeso" = true AND f.estado <> 'VOIDED'
    GROUP BY p.id, p.nombre, p."precioPorKilo", p."unidadMedida"
    ORDER BY 5 DESC
    LIMIT 30
  `;

  let incoherentes = 0;
  for (const a of agregados) {
    const cant = d(a.cantidad);
    const ing = d(a.ingresos);
    const precioKg = d(a.precioKg);
    // El subtotal de la línea ya usa el precio por kilo sobre la cantidad
    // normalizada, así que ingresos/cantidad debe aproximar precioPorKilo.
    const implicito = cant.gt(0) ? ing.div(cant) : d(0);
    if (precioKg.gt(0) && implicito.gt(0)) {
      const desvRel = implicito.minus(precioKg).abs().div(precioKg);
      if (desvRel.gt(new Decimal('0.05'))) {
        if (incoherentes < 10) {
          console.log(`    ✗ ${a.nombre}: implícito $${implicito.toFixed(3)} vs precioPorKilo $${precioKg} (${cant} ${a.unidadProducto})`);
        }
        incoherentes++;
      }
    }
  }

  if (incoherentes === 0) {
    console.log(`    ✓ Los ${agregados.length} productos principales cuadran con su precioPorKilo`);
  } else {
    console.log(`    ✗ ${incoherentes} productos con precio implícito inconsistente`);
    fallos += incoherentes;
  }

  // ── 3. Detectar el síntoma clásico: cantidades ≥ 1000 en productos pesados ──
  console.log(`\n[3] Detección de cantidades sin normalizar`);
  const sospechoso = agregados.filter(a => d(a.cantidad).gt(1000));
  if (sospechoso.length === 0) {
    console.log(`    ✓ Ningún producto pesa más de 1000 unidades (síntoma del bug ausente)`);
  } else {
    console.log(`    ✗ ${sospechoso.length} productos con cantidad > 1000: ` +
      sospechoso.map(s => `${s.nombre} (${d(s.cantidad).toFixed(0)} ${s.unidadProducto})`).join(', '));
    fallos += sospechoso.length;
  }

  console.log(`\n${fallos === 0 ? '✓ TODAS LAS INVARIANTES SE CUMPLEN' : `✗ ${fallos} violaciones`}\n`);

  await prisma.$disconnect();
  process.exit(fallos === 0 ? 0 : 1);
}

main().catch(async e => {
  console.error('ERROR:', e.message);
  await prisma.$disconnect();
  process.exit(1);
});