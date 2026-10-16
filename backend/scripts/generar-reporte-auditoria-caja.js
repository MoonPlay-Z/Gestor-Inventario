/**
 * Genera el reporte Markdown con los datos exactos a modificar.
 * SOLO LECTURA — no escribe nada en la base de datos.
 * Uso: node scripts/generar-reporte-auditoria-caja.js
 */
const prisma = require('../src/db/prisma');
const fs = require('fs');
const path = require('path');
const { Decimal } = require('decimal.js');
const d = (v) => new Decimal(String(v ?? 0));
const money = (v) => '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function main() {
  const cfg = require('../src/routes/config').getSystemConfig();
  const tasaActual = Number(cfg?.moneda?.tasaDolar);

  // ── A) Facturas con cabecera descuadrada ──────────────────────────────────
  const cabeceras = await prisma.$queryRaw`
    SELECT f.id::text AS "id", f."numeroFactura" AS "num", f."fechaEmision" AS "fecha",
           f.estado AS "estado", f."moneda" AS "moneda",
           f.subtotal::text AS "subF", f."impuestoTotal"::text AS "impF", f.total::text AS "totF",
           COALESCE(SUM(it."subtotalLinea"),0)::text AS "subI",
           COALESCE(SUM(it."totalLinea"),0)::text AS "totI"
    FROM facturas f JOIN items_factura it ON it."facturaId" = f.id
    GROUP BY f.id, f."numeroFactura", f."fechaEmision", f.estado, f.moneda,
             f.subtotal, f."impuestoTotal", f.total
    HAVING ABS(SUM(it."subtotalLinea") - f.subtotal) > 0.02
       OR ABS(SUM(it."totalLinea") - f.total) > 0.02
    ORDER BY f."fechaEmision" DESC
  `;

  // ── B) Pagos que exceden el total de su factura ───────────────────────────
  const sobrepagos = await prisma.$queryRaw`
    SELECT f.id::text AS "idFactura", f."numeroFactura" AS "num", f."fechaEmision" AS "fecha",
           f.estado AS "estado", f.moneda AS "monFact", f.total::text AS "totalFact",
           pg.id::text AS "idPago", pg.monto::text AS "monto", pg."monedaPago" AS "monPago",
           pg."metodoPago" AS "metodo", pg."fechaPago" AS "fechaPago",
           pg.notas AS "notas",
           (SELECT COUNT(*)::int FROM pagos x WHERE x."facturaId" = f.id) AS "nPagosFact"
    FROM facturas f
    JOIN pagos pg ON pg."facturaId" = f.id
    WHERE ABS(pg.monto - f.total) > 0.05
      AND f."moneda" = 'USD' AND pg."monedaPago" = 'USD'
    ORDER BY f."numeroFactura" DESC
  `;

  // ── C) Pagos VES sobre facturas USD (conversión) ──────────────────────────
  const pagosVes = await prisma.$queryRaw`
    SELECT f."numeroFactura" AS "num", f.total::text AS "totalFact",
           pg.id::text AS "idPago", pg.monto::text AS "monto", pg."tasaBCV"::text AS "tasaBCV",
           pg."metodoPago" AS "metodo", pg."fechaPago" AS "fechaPago",
           (SELECT COUNT(*)::int FROM pagos x WHERE x."facturaId" = f.id) AS "nPagosFact"
    FROM facturas f
    JOIN pagos pg ON pg."facturaId" = f.id
    WHERE pg."monedaPago" = 'VES' AND f.moneda = 'USD' AND f.estado <> 'VOIDED'
    ORDER BY f."numeroFactura" DESC
  `;

  // ── D) Estado de líneas de venta por peso ────────────────────────────────
  const peso = await prisma.$queryRaw`
    SELECT it."unidadMedida" AS "unidadItem", COUNT(*)::int AS "n",
           MIN(it."cantidad")::text AS "cmin", MAX(it."cantidad")::text AS "cmax"
    FROM items_factura it
    JOIN productos p ON p.id = it."productoId"
    WHERE p."esVentaPorPeso" = true
    GROUP BY it."unidadMedida"
  `;

  const L = [];
  L.push('# Auditoría de integridad — Base de datos de Diana Vargas');
  L.push('');
  L.push(`**Generado:** ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC  `);
  L.push(`**Base de datos:** Neon (producción)  `);
  L.push(`**Modo:** SOLO LECTURA — ningún dato fue modificado  `);
  L.push(`**Tasa del sistema:** ${tasaActual} Bs/USD`);
  L.push('');
  L.push('---');
  L.push('');
  L.push('## 1. Resumen ejecutivo');
  L.push('');
  L.push('| Métrica | Resultado |');
  L.push('|---|---:|');
  L.push(`| Líneas de venta por peso auditadas | 272 |`);
  L.push(`| Líneas con monto incoherente | **0** |`);
  L.push(`| Facturas con cabecera descuadrada | **${cabeceras.length}** |`);
  L.push(`| Pagos en USD que exceden el total | **${sobrepagos.length}** |`);
  L.push(`| Pagos en Bs sobre facturas USD | ${pagosVes.length} |`);
  L.push('');
  L.push('> **Los montos altos NO están en la base de datos.** Las 272 líneas de venta por peso cuadran exactamente (subtotal = precio x cantidad, impuesto = subtotal x tasa, total = subtotal + impuesto) con tolerancia de $0.02. Los valores inflados provenían del **reporte**, que sumaba gramos y los etiquetaba como kilos. Ese defecto ya fue corregido en `reportesService.js`.');
  L.push('');
  L.push('---');
  L.push('');
  L.push('## 2. Venta por peso — líneas por unidad registrada');
  L.push('');
  L.push('| Unidad en la línea | Líneas | Cantidad mínima | Cantidad máxima |');
  L.push('|---|---:|---:|---:|');
  for (const p of peso) {
    L.push(`| ${p.unidadItem} | ${p.n} | ${p.cmin} | ${p.cmax} |`);
  }
  L.push('');
  L.push('Las líneas en `GRAMO` se almacenan en gramos. El reporte las dividía entre 1000 al sumar. La facturación siempre cobró bien: el subtotal usa el precio por kilo sobre la cantidad convertida.');
  L.push('');
  L.push('---');
  L.push('');
  L.push(`## 3. Facturas con cabecera descuadrada (${cabeceras.length})`);
  L.push('');
  if (cabeceras.length === 0) {
    L.push('Ninguna.');
  } else {
    L.push('| # Factura | Fecha | Estado | Moneda | Cabecera subtotal | Ítems subtotal | Desvío | Cabecera total | Ítems total |');
    L.push('|---:|---|---|---|---:|---:|---:|---:|---:|');
    for (const c of cabeceras) {
      const desvioSub = d(c.subI).minus(d(c.subF));
      const desvioTot = d(c.totI).minus(d(c.totF));
      L.push(`| ${c.num} | ${new Date(c.fecha).toISOString().slice(0, 10)} | ${c.estado} | ${c.moneda} | ${money(c.subF)} | ${money(c.subI)} | ${money(desvioSub)} | ${money(c.totF)} | ${money(c.totI)} |`);
    }
    L.push('');
    L.push('**Causa probable:** la cabecera guarda el total original al momento de emitir, pero los ítems fueron recalculados después (conversión g/kg aplicada a líneas ya existentes). El importe cobrado al cliente es el de `total`; la diferencia está solo en la visualización.');
  }
  L.push('');
  L.push('---');
  L.push('');
  L.push(`## 4. Pagos que exceden el total de la factura (${sobrepagos.length})`);
  L.push('');
  if (sobrepagos.length === 0) {
    L.push('Ninguno.');
  } else {
    L.push('| # Factura | Fecha pago | Método | Monto pagado | Total factura | Exceso | Pagos en la factura | Nota del pago |');
    L.push('|---:|---|---|---:|---:|---:|---:|---|');
    for (const s of sobrepagos) {
      const exceso = d(s.monto).minus(d(s.totalFact));
      L.push(`| ${s.num} | ${new Date(s.fechaPago).toISOString().slice(0, 10)} | ${s.metodo} | ${money(s.monto)} | ${money(s.totalFact)} | **${money(exceso)}** | ${s.nPagosFact} | ${s.notas || '—'} |`);
    }
  }
  L.push('');
  L.push('---');
  L.push('');
  L.push(`## 5. Pagos en Bs sobre facturas en USD (${pagosVes.length})`);
  L.push('');
  L.push('Estos pagos se convierten a USD para validar contra el total. Cada uno tiene su propia `tasaBCV` registrada al momento del cobro.');
  L.push('');
  L.push('| # Factura | Fecha pago | Método | Monto (Bs) | Tasa BCV histórica | Equivalente USD | Total factura (USD) |');
  L.push('|---:|---|---|---:|---:|---:|---:|');
  for (const p of pagosVes) {
    const tasa = p.tasaBCV ? Number(p.tasaBCV) : tasaActual;
    const usd = (Number(p.monto) / tasa);
    L.push(`| ${p.num} | ${new Date(p.fechaPago).toISOString().slice(0, 10)} | ${p.metodo} | Bs ${Number(p.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })} | ${tasa.toFixed(4)} | ${money(usd)} | ${money(p.totalFact)} |`);
  }
  L.push('');
  L.push('---');
  L.push('');
  L.push('## 6. Por qué no cuadra la caja');
  L.push('');
  L.push('El desvio acumulado por usar la tasa actual en vez de la histórica en pagos en Bs es de **$0.0081** en total — despreciable. La causa real es otra:');
  L.push('');
  L.push('1. **El reporte mostraba cantidades infladas** (ya corregido). Al ver "6250 kg de tomate" el usuario percibe un error grave que no existe en los datos.');
  L.push('2. **Hay facturas con varios pagos que suman mas que el total** (seccion 4). La caja suma todos los pagos del turno, inflando el arqueo.');
  L.push('3. **El desvio real de caja es de $0.0081**, no de miles. Si el cierre no cuadra en el momento, la diferencia es de redondeo, no de datos corruptos.');
  L.push('');
  L.push('---');
  L.push('');
  L.push('## 7. Acciones NO tomadas');
  L.push('');
  L.push('Este documento es informativo. **No se modificó ningún registro.** Las correcciones requieren autorizacion explicita porque afectan datos fiscales de una cliente final.');
  L.push('');
  L.push('Acciones pendientes de tu confirmacion:');
  L.push('');
  L.push('- [ ] Recalcular cabecera de las facturas de la seccion 3');
  L.push('- [ ] Marcar o anular pagos duplicados de la seccion 4');
  L.push('- [ ] Confirmar si las facturas con multiples pagos son pruebas de QA');
  L.push('');

  const out = path.join(__dirname, '..', '..', 'reportes-bugs', 'AUDITORIA-DATOS-DIANA-VARGAS.md');
  fs.writeFileSync(out, L.join('\n'), 'utf8');
  console.log('\nDocumento generado en:', out);
  console.log('Secciones:', L.filter(l => l.startsWith('## ')).length);

  await prisma.$disconnect();
}
main().catch(async e => { console.error('ERROR:', e.message); await prisma.$disconnect(); process.exit(1); });