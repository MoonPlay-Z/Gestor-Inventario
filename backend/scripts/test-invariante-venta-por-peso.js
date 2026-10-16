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

  // ── 4. getProductosTop debe devolver cantidades normalizadas ───────────────
  console.log(`\n[4] Coherencia de getProductosTop (productos más vendidos)`);
  const { getProductosTop } = require('../src/services/reportesService');
  const empresa = await prisma.usuario.findFirst({
    where: { rol: 'EMPRESA', facturas: { some: {} } },
    select: { id: true, rol: true },
  });

  if (!empresa) {
    console.log('    (omitido: no hay usuario EMPRESA con facturas)');
  } else {
    // getProductosTop ahora pagina: devuelve {data, total, totalPages}
    const r = await getProductosTop({
      query: { periodo: 'anual', fecha: String(new Date().getFullYear()), page: '1', limit: '100' },
      user: empresa,
    });
    const top = r?.data || [];

    if (!Array.isArray(r?.data) || typeof r?.totalPages !== 'number') {
      console.log('    ✗ La respuesta no sigue el formato paginado {data, total, totalPages}');
      fallos++;
    }

    // Referencia calculada de forma independiente, sin usar el helper.
    const referencia = new Map();
    for (const a of agregados) {
      referencia.set(a.nombre, d(a.cantidad));
    }

    let topIncoherentes = 0;
    for (const p of top) {
      const esp = referencia.get(p.nombre);
      if (!esp) continue;
      const dif = d(p.cantidadVendida).minus(esp).abs();
      if (dif.gt(new Decimal('0.05'))) {
        if (topIncoherentes < 8) {
          console.log(`    ✗ ${p.nombre}: getProductosTop dice ${d(p.cantidadVendida).toFixed(2)} ${p.unidad}, correcto ${esp.toFixed(2)}`);
        }
        topIncoherentes++;
      }
    }

    if (topIncoherentes === 0) {
      console.log(`    ✓ Los ${top.length} productos del ranking cuadran con la cantidad normalizada`);
    } else {
      console.log(`    ✗ ${topIncoherentes} productos del ranking con cantidad sin normalizar`);
      fallos += topIncoherentes;
    }
  }

  // ── 5. Las tres cifras de ganancia deben usar la misma base ─────────────────
  // El PDF/CSV muestran la ganancia en tres sitios: la tarjeta de resumen, la
  // fila TOTAL de la tabla por producto y el total del detalle por factura.
  // Cada unochnet de ellos tenía su propia fórmula y se contradecían. Aquí se
  // comprueba que hoy salen de la misma agregación.
  console.log(`\n[5] Coherencia entre las tres cifras de ganancia del reporte`);
  const { getGananciasReporte, getDetalleVentasReporte } = require('../src/services/reportesService');
  const conFacturas = await prisma.usuario.findFirst({
    where: { rol: 'EMPRESA', facturas: { some: {} } },
    select: { id: true, rol: true, empresaRefId: true },
  });

  if (!conFacturas) {
    console.log('    (omitido: no hay usuario EMPRESA con facturas)');
  } else {
    const anio = String(new Date().getFullYear());
    for (const [periodo, fecha] of [['anual', anio], ['mensual', `${anio}-10`]]) {
      const g = await getGananciasReporte({ query: { periodo, fecha }, user: conFacturas });
      if (g.gananciaBruta === null) {
        console.log(`    (${periodo}: sin costo histórico, omitido)`);
        continue;
      }

      const suma = (campo) => g.gananciaPorProducto.reduce((a, p) => a.plus(d(p[campo])), new Decimal(0));
      const descuadresResumen = [
        ['ingresos tarjeta vs tabla', d(g.ingresosTotales).minus(suma('ingresos'))],
        ['costo tarjeta vs tabla', d(g.costoVendido).minus(suma('costo'))],
        ['ganancia tarjeta vs tabla', d(g.gananciaBruta).minus(suma('ganancia'))],
        // Identidad aritmética: ingresos = costo + ganancia.
        ['ingresos - costo - ganancia',
          d(g.ingresosTotales).minus(g.costoVendido).minus(g.gananciaBruta)],
      ].filter(([, dif]) => dif.abs().gt(TOL));

      if (descuadresResumen.length === 0) {
        console.log(`    ✓ ${periodo}: ingresos, costo y ganancia de la tarjeta cuadran con la tabla por producto` +
          ` ($${g.ingresosTotales} / $${g.costoVendido} / $${g.gananciaBruta})`);
      } else {
        for (const [nombre, dif] of descuadresResumen) {
          console.log(`    ✗ ${periodo}: ${nombre} difiere en $${dif.toFixed(2)}`);
        }
        fallos += descuadresResumen.length;
      }

      // El detalle por factura: se recorre entero y se compara factura por
      // factura contra un cálculo de referencia hecho en SQL con la definición
      // correcta (subtotalLinea − costo). Comparar solo el total exigiría una
      // tolerancia de medio cent por factura y dejaría pasar cualquier fórmula
      // que se desvíe poco en agregado. Factura por factura la tolerancia es de
      // un centavo y sí detecta el cambio.
      let lineas = [];
      const primera = await getDetalleVentasReporte({
        query: { periodo, fecha, page: '1', limit: '200' }, user: conFacturas,
      });
      lineas = [...primera.detalle];
      for (let p = 2; p <= (primera.paginacion?.totalPages || 1); p++) {
        const r = await getDetalleVentasReporte({
          query: { periodo, fecha, page: String(p), limit: '200' }, user: conFacturas,
        });
        lineas = lineas.concat(r.detalle);
      }

      const { getFechasPeriodo } = require('../src/utils/reportesHelpers');
      const { tsFrag } = require('../src/utils/sql');
      const { Prisma } = require('../src/db/prisma');
      const { cantidadEnKgSQL } = require('../src/services/unidades');
      const { inicio, fin } = getFechasPeriodo(periodo, fecha);
      // La referencia debe normalizar gramos a kilos igual que el servicio;
      // sin esto el costo de una línea de 675 g saldría 1000 veces mayor.
      const cantidadKg = Prisma.raw(cantidadEnKgSQL('it'));
      {
        const referencia = await prisma.$queryRaw`
          SELECT f."numeroFactura" AS numero,
                 COALESCE(SUM(
                   CASE
                     WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
                     THEN it."subtotalLinea" / f."tasaCambio"
                     ELSE it."subtotalLinea"
                   END
                 ), 0)
                 - COALESCE(SUM(
                   CASE
                     WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
                     THEN COALESCE(p."costoCompra",0) * ${cantidadKg} / f."tasaCambio"
                     ELSE COALESCE(p."costoCompra",0) * ${cantidadKg}
                   END
                 ), 0) AS ganancia_ref
          FROM facturas f
          JOIN items_factura it ON it."facturaId" = f.id
          LEFT JOIN productos p ON p.id = it."productoId"
          WHERE f."fechaEmision" >= ${tsFrag(inicio)}
            AND f."fechaEmision" <= ${tsFrag(fin)}
            AND f."estado" <> 'VOIDED'
            AND it."productoId" IS NOT NULL
            AND p."costoCompra" IS NOT NULL
          GROUP BY f."numeroFactura"`;

        const refMap = new Map(referencia.map(r => [Number(r.numero), d(r.ganancia_ref)]));
        const toleranciaFactura = new Decimal('0.015');
        let descuadradas = [];
        for (const l of lineas) {
          if (l.costoDesconocido || l.ganancia === null) continue;
          const esp = refMap.get(Number(l.facturaId));
          if (esp === undefined) continue;
          if (d(l.ganancia).minus(esp).abs().gt(toleranciaFactura)) {
            descuadradas.push({ id: l.facturaId, api: d(l.ganancia), esp });
          }
        }

        if (descuadradas.length === 0) {
          console.log(`    ✓ ${periodo}: las ${lineas.length} facturas del detalle cuadran con la referencia (subtotalLinea − costo)`);
        } else {
          console.log(`    ✗ ${periodo}: ${descuadradas.length} facturas del detalle no cuadran con la referencia:`);
          for (const x of descuadradas.slice(0, 5)) {
            console.log(`        #${x.id}: API $${x.api.toFixed(2)} vs referencia $${x.esp.toFixed(2)}`);
          }
          fallos += descuadradas.length;
        }
      }
    }
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