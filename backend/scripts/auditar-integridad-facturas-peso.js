/**
 * AUDITORÍA DE INTEGRIDAD — Datos de Diana Vargas (escritura prohibida)
 *
 * Detecta facturas con montos incoherentes en líneas de productos por peso.
 * NO MODIFICA NADA. Solo informa.
 *
 * Uso: node scripts/auditar-integridad-facturas-peso.js
 */
const prisma = require('../src/db/prisma');
const { Decimal } = require('decimal.js');

const TOL = new Decimal('0.02'); // tolerancia de redondeo

async function main() {
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('  AUDITORÍA DE FACTURAS — VENTA POR PESO');
  console.log('  Modo: SOLO LECTURA (no modifica datos)');
  console.log('══════════════════════════════════════════════════════════════════\n');

  // ── 1. Coherencia de la línea de item ──────────────────────────────────────
  // subtotalLinea debe ser = precioUnitario × cantidad (en la unidad registrada)
  const lineas = await prisma.$queryRaw`
    SELECT
      it.id::text                AS "idItem",
      f.id::text                 AS "facturaId",
      f."numeroFactura"          AS "numFactura",
      f."fechaEmision"           AS "fecha",
      f."estado"                 AS "estado",
      p."esVentaPorPeso"         AS "porPeso",
      it."unidadMedida"          AS "unidadItem",
      p."unidadMedida"           AS "unidadProducto",
      p."precioPorKilo"::text    AS "precioKg",
      it."cantidad"::text         AS "cantidad",
      it."precioUnitarioHistorico"::text AS "precioUnit",
      it."subtotalLinea"::text   AS "subtotal",
      it."impuestoLinea"::text   AS "impuesto",
      it."totalLinea"::text      AS "totalLinea",
      it."tasaImpuestoAplicada"::text AS "tasa"
    FROM items_factura it
    JOIN facturas f ON f.id = it."facturaId"
    JOIN productos p ON p.id = it."productoId"
    WHERE p."esVentaPorPeso" = true
    ORDER BY f."fechaEmision" DESC
  `;

  console.log(`Líneas de venta por peso encontradas: ${lineas.length}\n`);

  const d = (v) => new Decimal(String(v ?? 0));
  const problemas = [];

  for (const L of lineas) {
    const cant = d(L.cantidad);
    const precio = d(L.precioUnit);
    const subtotal = d(L.subtotal);
    const impuesto = d(L.impuesto);
    const total = d(L.totalLinea);
    const tasa = d(L.tasa).div(100);

    const esGramos = L.unidadItem === 'GRAMO';
    // Cantidad en kg, según la unidad registrada
    const cantKg = esGramos ? cant.div(1000) : cant;

    // A) subtotal == precio × cantidad(en kg)
    const subtotalEsperado = precio.mul(cantKg);
    // B) impuesto == subtotal × tasa
    const impuestoEsperado = subtotal.mul(tasa);
    // C) total == subtotal + impuesto
    const totalEsperado = subtotal.add(impuesto);

    const difA = subtotal.sub(subtotalEsperado).abs();
    const difB = impuesto.sub(impuestoEsperado).abs();
    const difC = total.sub(totalEsperado).abs();

    const fallos = [];
    if (difA.gt(TOL)) fallos.push(`subtotal difiere en $${difA.toFixed(2)} (esperado $${subtotalEsperado.toFixed(2)} vs ${subtotal.toFixed(2)})`);
    if (difB.gt(new Decimal('0.02'))) fallos.push(`impuesto difiere en $${difB.toFixed(2)}`);
    if (difC.gt(TOL)) fallos.push(`total difiere en $${difC.toFixed(2)}`);

    if (fallos.length) {
      problemas.push({ L, cantKg, fallos, esGramos });
    }
  }

  console.log('── 1) COHERENCIA DE LÍNEAS ────────────────────────────────────────');
  console.log(`Líneas incoherentes: ${problemas.length} de ${lineas.length}\n`);

  // Agrupar por patrón de fallo
  const porPatron = new Map();
  for (const p of problemas) {
    const clave = p.fallos.map(f => f.split(' difiere')[0]).sort().join(' + ');
    if (!porPatron.has(clave)) porPatron.set(clave, []);
    porPatron.get(clave).push(p);
  }
  for (const [patron, items] of porPatron) {
    console.log(`  [${items.length} líneas] ${patron}`);
    for (const p of items.slice(0, 3)) {
      console.log(`      #${p.L.numFactura} ${p.L.idItem.slice(0,8)} ${p.L.unidadItem} cant=${p.L.cantidad}`);
      p.fallos.forEach(f => console.log(`         → ${f}`));
    }
    if (items.length > 3) console.log(`      ... y ${items.length - 3} más`);
    console.log('');
  }

  // ── 2. Coherencia cabecera vs items ────────────────────────────────────────
  console.log('\n── 2) CABECERA vs ÍTEMS ───────────────────────────────────────────');
  const cabeceras = await prisma.$queryRaw`
    SELECT
      f.id::text AS "idFactura",
      f."numeroFactura" AS "numFactura",
      f."fechaEmision" AS "fecha",
      f."estado" AS "estado",
      f."subtotal"::text AS "subtotalF",
      f."impuestoTotal"::text AS "impuestoF",
      f."total"::text AS "totalF",
      COALESCE(SUM(it."subtotalLinea"),0)::text AS "subtotalItems",
      COALESCE(SUM(it."impuestoLinea"),0)::text AS "impuestoItems",
      COALESCE(SUM(it."totalLinea"),0)::text AS "totalItems"
    FROM facturas f
    JOIN items_factura it ON it."facturaId" = f.id
    GROUP BY f.id, f."numeroFactura", f."fechaEmision", f."estado",
             f."subtotal", f."impuestoTotal", f."total"
    HAVING ABS(SUM(it."subtotalLinea") - f."subtotal") > 0.02
        OR ABS(SUM(it."impuestoLinea") - f."impuestoTotal") > 0.02
        OR ABS(SUM(it."totalLinea") - f."total") > 0.02
    ORDER BY f."fechaEmision" DESC
  `;

  console.log(`Facturas con cabecera que NO cuadra con sus ítems: ${cabeceras.length}\n`);
  for (const c of cabeceras.slice(0, 15)) {
    console.log(`  #${c.numFactura} ${new Date(c.fecha).toISOString().slice(0,10)} ${c.estado}`);
    console.log(`     cabecera: sub=$${c.subtotalF} imp=$${c.impuestoF} tot=$${c.totalF}`);
    console.log(`     items:    sub=$${c.subtotalItems} imp=$${c.impuestoItems} tot=$${c.totalItems}`);
    console.log(`     desvío:   sub=$${(d(c.subtotalItems).minus(d(c.subtotalF))).toFixed(2)} tot=$${(d(c.totalItems).minus(d(c.totalF))).toFixed(2)}`);
  }

  // ── 3. Pagos vs total de factura ──────────────────────────────────────────
  console.log('\n── 3) PAGOS vs TOTAL ──────────────────────────────────────────────');
  const pagos = await prisma.$queryRaw`
    SELECT
      f.id::text AS "idFactura",
      f."numeroFactura" AS "numFactura",
      f."estado" AS "estado",
      f."moneda" AS "monedaFactura",
      f."tasaCambio"::text AS "tasa",
      f."total"::text AS "totalFactura",
      COALESCE(SUM(pg."monto"),0)::text AS "sumaPagos"
    FROM facturas f
    LEFT JOIN pagos pg ON pg."facturaId" = f.id
    GROUP BY f.id, f."numeroFactura", f."estado", f."moneda", f."tasaCambio", f."total"
    HAVING f."estado" = 'PAID'
       AND ABS(COALESCE(SUM(pg."monto"),0) - f."total") > 0.05
    ORDER BY f."numeroFactura" DESC
  `;
  console.log(`Facturas PAID donde los pagos no cuadran con el total: ${pagos.length}\n`);
  for (const p of pagos.slice(0, 15)) {
    console.log(`  #${p.numFactura} total=$${p.totalFactura} pagado=$${p.sumaPagos} dif=$${d(p.sumaPagos).minus(d(p.totalFactura)).toFixed(2)} (${p.monedaFactura})`);
  }

  await prisma.$disconnect();

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(`RESUMEN: ${problemas.length} líneas incoherentes, ${cabeceras.length} cabeceras descuadradas, ${pagos.length} pagos descuadrados`);
  console.log('══════════════════════════════════════════════════════════════════\n');
}

main().catch(async e => { console.error('ERROR:', e.message); await prisma.$disconnect(); process.exit(1); });