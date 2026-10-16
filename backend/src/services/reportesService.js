/**
 * reportesService — Lógica de cálculo para reportes de ventas, ganancias e inversión
 * 
 * Funciones:
 *   - getVentasReporte: Reporte de ventas por período
 *   - getGananciasReporte: Reporte de ganancias (ingresos - COGS)
 *   - getInversionReporte: Valor del inventario actual
 *   - getProductosTop: Productos más vendidos
 *   - getClientesTop: Clientes con mayor volumen
 *   - getCajaReporte: Desglose de caja por método de pago
 */

const prisma = require('../db/prisma');
const { Prisma } = require('../db/prisma');
const IS_SQLITE = !!require('../db/prisma').IS_SQLITE;
const { tsFrag } = require('../utils/sql');
const Decimal = require('decimal.js').Decimal;
const { getFechasPeriodo, calcularComparacion } = require('../utils/reportesHelpers');

// ═══════════════════════════════════════════════════════════════════════════════
// CACHÉ EN MEMORIA
// ═══════════════════════════════════════════════════════════════════════════════

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCacheKey(req, tipoReporte) {
  const { periodo, fecha, comparar } = req.query;
  const userId = req.user?.id;
  return `reporte:${tipoReporte}:${userId}:${periodo}:${fecha}:${comparar}`;
}

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: NORMALIZACIÓN A USD
// ═══════════════════════════════════════════════════════════════════════════════

// Whitelist de columnas permitidas para normalizarUSD (previene inyección SQL)
const COLUMNAS_PERMITIDAS = new Set([
  'f."total"', 'f."subtotal"', 'f."impuestoTotal"',
  'p."monto"', 'item."subtotalLinea"', 'item."totalLinea"',
]);

/**
 * Genera SQL para normalizar un monto a USD usando la tasa de cambio.
 * @param {string} columna - Nombre de la columna a normalizar (debe estar en whitelist)
 * @param {string} alias - Alias para el resultado
 * @returns {Prisma.Sql} Expresión SQL
 */
function normalizarUSD(columna, alias) {
  if (!COLUMNAS_PERMITIDAS.has(columna)) {
    throw new Error(`Columna no permitida para normalizarUSD: ${columna}`);
  }
  return Prisma.sql`COALESCE(SUM(
    CASE
      WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
      THEN ${Prisma.raw(columna)} / f."tasaCambio"
      ELSE ${Prisma.raw(columna)}
    END
  ), 0) AS ${Prisma.raw(alias)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE PARÁMETROS
// ═══════════════════════════════════════════════════════════════════════════════

const PERIODOS_VALIDOS = ['diario', 'semanal', 'mensual', 'anual'];

const FORMATOS_FECHA = {
  diario: /^\d{4}-\d{2}-\d{2}$/,
  semanal: /^\d{4}-\d{2}-\d{2}$/,
  mensual: /^\d{4}-\d{2}$/,
  anual: /^\d{4}$/,
};

/**
 * Valida los parámetros de entrada para los reportes.
 * @param {string} periodo - Período solicitado
 * @param {string} fecha - Fecha de referencia
 * @throws {Error} Si los parámetros no son válidos
 */
function validarParametros(periodo, fecha) {
  if (!PERIODOS_VALIDOS.includes(periodo)) {
    const err = new Error(`Periodo no válido: ${periodo}. Valores permitidos: ${PERIODOS_VALIDOS.join(', ')}`);
    err.status = 400;
    throw err;
  }

  if (fecha) {
    let fechaValida = FORMATOS_FECHA[periodo].test(fecha);
    if (fechaValida && (periodo === 'diario' || periodo === 'semanal')) {
      const [year, month, day] = fecha.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      fechaValida = year >= 1000 && date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
    } else if (fechaValida && periodo === 'mensual') {
      const [year, month] = fecha.split('-').map(Number);
      fechaValida = year >= 1000 && month >= 1 && month <= 12;
    } else if (fechaValida && periodo === 'anual') {
      fechaValida = Number(fecha) >= 1000;
    }
    if (!fechaValida) {
      const err = new Error(`Fecha inválida para período ${periodo}. Formato esperado: ${FORMATOS_FECHA[periodo]}`);
      err.status = 400;
      throw err;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILTROS DE TENANT (Seguros - sin inyección SQL)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Helper: construye el filtro de tenant según el rol del usuario.
 * CAJA solo ve sus propias ventas; EMPRESA/SUPER_ADMIN ven toda la empresa.
 * @returns {Object} Filtro para Prisma
 */
function getTenantFilter(req) {
  const empresaRefId = req.user?.empresaRefId || null;
  const usuarioId = req.user?.id;

  if (req.user.rol === 'CAJA') {
    if (!usuarioId) {
      throw new Error('Usuario CAJA sin ID de usuario');
    }
    return { usuarioId };
  }

  if (!usuarioId) return {};

  // EMPRESA y SUPER_ADMIN ven:
  // 1. Sus propias facturas (usuarioId = usuarioId)
  // 2. Facturas de subusuarios CAJA (usuario.empresaId = usuarioId)
  // 3. Facturas de usuarios con empresaRefId = empresaRefId (si existe)
  const condiciones = [
    { usuarioId },
    { usuario: { empresaId: usuarioId } },
  ];

  if (empresaRefId) {
    condiciones.push({ usuario: { empresaRefId } });
  }

  return {
    OR: condiciones,
  };
}

/**
 * Construye una cláusula SQL segura usando Prisma.sql para evitar inyección SQL.
 * @param {Object} tenantFilter - Filtro de tenant
 * @returns {Prisma.Sql} Cláusula SQL segura
 */
function buildTenantSql(tenantFilter) {
  if (tenantFilter.usuarioId) {
    return Prisma.sql`AND f."usuarioId" = ${tenantFilter.usuarioId}`;
  }

  if (tenantFilter.OR && tenantFilter.OR.length > 0) {
    const condiciones = [];

    for (const cond of tenantFilter.OR) {
      if (cond.usuarioId) {
        condiciones.push(Prisma.sql`f."usuarioId" = ${cond.usuarioId}`);
      }
      if (cond.usuario?.empresaId) {
        condiciones.push(Prisma.sql`f."usuarioId" IN (SELECT id FROM usuarios WHERE "empresaId" = ${cond.usuario.empresaId})`);
      }
      if (cond.usuario?.empresaRefId) {
        condiciones.push(Prisma.sql`f."usuarioId" IN (SELECT id FROM usuarios WHERE "empresaRefId" = ${cond.usuario.empresaRefId})`);
      }
    }

    if (condiciones.length > 0) {
      // Combinar condiciones con OR
      return Prisma.sql`AND (${Prisma.join(condiciones, ' OR ')})`;
    }
  }

  return Prisma.empty;
}

/**
 * Normaliza un monto a USD usando la tasa de cambio de la factura.
 * Si la factura está en VES y tiene tasaCambio, divide; si no, usa el monto directo.
 */
function normalizarAUSD(monto, moneda, tasaCambio) {
  const m = new Decimal(monto.toString());
  if (moneda === 'VES' && tasaCambio && Number(tasaCambio) > 0) {
    return m.dividedBy(new Decimal(tasaCambio.toString()));
  }
  return m;
}

async function getProductosConPerdida(inicio, fin, tenantFilter) {
  const whereClause = buildTenantSql(tenantFilter);
  const ventaUSD = `(CASE
    WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
    THEN item."subtotalLinea" / f."tasaCambio"
    ELSE item."subtotalLinea"
  END)`;
  const gananciaUSD = `(CASE
    WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
    THEN (item."precioUnitarioHistorico" - COALESCE(p."costoCompra", 0)) * item."cantidad" / f."tasaCambio"
    ELSE (item."precioUnitarioHistorico" - COALESCE(p."costoCompra", 0)) * item."cantidad"
  END)`;

  const rows = await prisma.$queryRaw`
    SELECT
      f."numeroFactura" AS factura_id,
      f."fechaEmision" AS fecha_hora,
      cliente."razonSocial" AS cliente,
      item."descripcionHistorica" AS producto,
      item."cantidad" AS cantidad,
      item."unidadMedida" AS unidad,
      ${Prisma.raw(ventaUSD)} AS subtotal_usd,
      ${Prisma.raw(gananciaUSD)} AS ganancia_usd
    FROM items_factura item
    INNER JOIN facturas f ON f.id = item."facturaId"
    INNER JOIN clientes cliente ON cliente.id = f."clienteId"
    LEFT JOIN productos p ON p.id = item."productoId"
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      AND item."productoId" IS NOT NULL
      ${whereClause}
      AND ${Prisma.raw(gananciaUSD)} < 0
    ORDER BY f."fechaEmision" ASC, f."numeroFactura" ASC
  `;

  return rows.map(row => ({
    facturaId: Number(row.factura_id),
    fechaHora: row.fecha_hora,
    cliente: row.cliente || '—',
    producto: row.producto || '—',
    cantidad: row.cantidad.toString(),
    unidad: row.unidad,
    subtotal: new Decimal(row.subtotal_usd.toString()).toFixed(2),
    ganancia: new Decimal(row.ganancia_usd.toString()).toFixed(2),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTE DE VENTAS
// ═══════════════════════════════════════════════════════════════════════════════

async function getVentasReporte(req) {
  const { periodo = 'mensual', fecha, comparar = 'false' } = req.query;
  validarParametros(periodo, fecha);

  // Verificar caché
  const cacheKey = getCacheKey(req, 'ventas');
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const { inicio, fin, inicioAnterior, finAnterior, etiqueta } = getFechasPeriodo(periodo, fecha);
  const tenantFilter = getTenantFilter(req);

  // Consulta principal: totales del período actual y agrupación en paralelo
  const [totalesActual, agrupacion] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        COUNT(*) AS cantidad_facturas,
        ${normalizarUSD('f."total"', 'total_usd')},
        ${normalizarUSD('f."impuestoTotal"', 'impuestos_usd')},
        ${normalizarUSD('f."subtotal"', 'subtotal_usd')}
      FROM facturas f
      WHERE f."fechaEmision" >= ${tsFrag(inicio)}
        AND f."fechaEmision" <= ${tsFrag(fin)}
        AND f."estado" != 'VOIDED'
        ${buildTenantSql(tenantFilter)}
    `,
    getAgrupacionVentas(periodo, inicio, fin, tenantFilter)
  ]);

  // Comparación con período anterior
  let comparacion = null;
  if (comparar === 'true') {
    const totalesAnterior = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(
          CASE
            WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
            THEN f."total" / f."tasaCambio"
            ELSE f."total"
          END
        ), 0) AS total_usd
      FROM facturas f
      WHERE f."fechaEmision" >= ${tsFrag(inicioAnterior)}
        AND f."fechaEmision" <= ${tsFrag(finAnterior)}
        AND f."estado" != 'VOIDED'
        ${buildTenantSql(tenantFilter)}
    `;

    const totalActual = Number(totalesActual[0]?.total_usd || 0);
    const totalAnterior = Number(totalesAnterior[0]?.total_usd || 0);
    comparacion = {
      ...calcularComparacion(totalActual, totalAnterior),
      totalAnterior: totalAnterior.toFixed(2),
    };
  }

  const totalUSD = new Decimal(totalesActual[0]?.total_usd || 0);
  const impuestosUSD = new Decimal(totalesActual[0]?.impuestos_usd || 0);
  const subtotalUSD = new Decimal(totalesActual[0]?.subtotal_usd || 0);
  const cantidad = Number(totalesActual[0]?.cantidad_facturas || 0);

  const resultado = {
    periodo,
    etiqueta,
    total: totalUSD.toFixed(2),
    impuestos: impuestosUSD.toFixed(2),
    subtotal: subtotalUSD.toFixed(2),
    cantidadFacturas: cantidad,
    promedioVenta: cantidad > 0 ? totalUSD.dividedBy(cantidad).toFixed(2) : '0.00',
    agrupacion,
    comparacion,
  };

  // Guardar en caché
  setCachedData(cacheKey, resultado);

  return resultado;
}

/**
 * Agrupa ventas por día, semana o mes según el período.
 */
async function getAgrupacionVentas(periodo, inicio, fin, tenantFilter) {
  let groupBy, selectExpr;

  // Expresiones de agrupación por período (PostgreSQL vs SQLite)
  const trunc = (unit) => IS_SQLITE
    ? (unit === 'hour' ? `strftime('%Y-%m-%dT%H:00:00', f."fechaEmision"/1000, 'unixepoch')`
      : unit === 'day' ? `strftime('%Y-%m-%d', f."fechaEmision"/1000, 'unixepoch')`
      : unit === 'week' ? `strftime('%Y-W%W', f."fechaEmision"/1000, 'unixepoch')`
      : `strftime('%Y-%m', f."fechaEmision"/1000, 'unixepoch')`)
    : `DATE_TRUNC('${unit}', f."fechaEmision")`;

  switch (periodo) {
    case 'diario':
      selectExpr = trunc('hour');
      groupBy = trunc('hour');
      break;
    case 'semanal':
      selectExpr = trunc('day');
      groupBy = trunc('day');
      break;
    case 'mensual':
      selectExpr = trunc('week');
      groupBy = trunc('week');
      break;
    case 'anual':
      selectExpr = trunc('month');
      groupBy = trunc('month');
      break;
    default:
      selectExpr = trunc('day');
      groupBy = trunc('day');
  }

  const whereClause = buildTenantSql(tenantFilter);

  const resultados = await prisma.$queryRaw`
    SELECT
      ${Prisma.raw(selectExpr)} AS periodo,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN f."total" / f."tasaCambio"
          ELSE f."total"
        END
      ), 0) AS total_usd,
      COUNT(*) AS cantidad
    FROM facturas f
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      ${whereClause}
    GROUP BY ${Prisma.raw(groupBy)}
    ORDER BY periodo ASC
  `;

  return resultados.map(row => ({
    fecha: row.periodo,
    total: new Decimal(row.total_usd || 0).toFixed(2),
    cantidad: Number(row.cantidad),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTE DE GANANCIAS
// ═══════════════════════════════════════════════════════════════════════════════

async function getGananciasReporte(req) {
  const { periodo = 'mensual', fecha, comparar = 'false' } = req.query;
  validarParametros(periodo, fecha);
  const { inicio, fin, inicioAnterior, finAnterior, etiqueta } = getFechasPeriodo(periodo, fecha);
  const tenantFilter = getTenantFilter(req);
  const whereClause = buildTenantSql(tenantFilter);

  const ETIQUETA_GANANCIA = {
    diario: 'Ganancia del Día',
    semanal: 'Ganancia de la Semana',
    mensual: 'Ganancia del Mes',
    anual: 'Ganancia del Año',
  };

  const [ingresos, cogsData, productosSinCosto] = await Promise.all([
    prisma.$queryRaw`
    SELECT
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN f."total" / f."tasaCambio"
          ELSE f."total"
        END
      ), 0) AS total_usd
    FROM facturas f
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      ${whereClause}
    `,

    prisma.$queryRaw`
    SELECT
      COUNT(DISTINCT f.id) AS facturas_con_costo,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN (item."precioUnitarioHistorico" - COALESCE(p."costoCompra", 0)) * item."cantidad" / f."tasaCambio"
          ELSE (item."precioUnitarioHistorico" - COALESCE(p."costoCompra", 0)) * item."cantidad"
        END
      ), 0) AS ganancia_total,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN item."subtotalLinea" / f."tasaCambio"
          ELSE item."subtotalLinea"
        END
      ), 0) AS subtotal_vendido,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN COALESCE(p."costoCompra", 0) * item."cantidad" / f."tasaCambio"
          ELSE COALESCE(p."costoCompra", 0) * item."cantidad"
        END
      ), 0) AS costo_vendido
    FROM items_factura item
    INNER JOIN facturas f ON f.id = item."facturaId"
    LEFT JOIN productos p ON p.id = item."productoId"
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      ${whereClause}
      AND item."productoId" IS NOT NULL
    `,

    prisma.$queryRaw`
      SELECT COUNT(DISTINCT f.id) AS facturas_sin_costo
      FROM facturas f
      INNER JOIN items_factura item ON item."facturaId" = f.id
      WHERE f."fechaEmision" >= ${tsFrag(inicio)}
        AND f."fechaEmision" <= ${tsFrag(fin)}
        AND f."estado" != 'VOIDED'
        ${whereClause}
        AND item."productoId" IS NULL
    `,
  ]);

  const ingresosTotal = new Decimal(ingresos[0]?.total_usd || 0);
  const gananciaTotal = new Decimal(cogsData[0]?.ganancia_total || 0);
  const subtotalVentas = new Decimal(cogsData[0]?.subtotal_vendido || 0);
  const costoVendido = new Decimal(cogsData[0]?.costo_vendido || 0);
  const facturasConCosto = Number(cogsData[0]?.facturas_con_costo || 0);
  const facturasSinCosto = Number(productosSinCosto[0]?.facturas_sin_costo || 0);
  const gananciaDisponible = facturasConCosto > 0 || facturasSinCosto === 0;
  const margen = gananciaDisponible && ingresosTotal.gt(0)
    ? gananciaTotal.dividedBy(ingresosTotal).times(100)
    : null;
  const productosConPerdida = await getProductosConPerdida(inicio, fin, tenantFilter);

  let comparacion = null;
  if (comparar === 'true') {
    const cogsAnterior = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(
          CASE
            WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
            THEN (item."precioUnitarioHistorico" - COALESCE(p."costoCompra", 0)) * item."cantidad" / f."tasaCambio"
            ELSE (item."precioUnitarioHistorico" - COALESCE(p."costoCompra", 0)) * item."cantidad"
          END
        ), 0) AS ganancia_total
      FROM items_factura item
      INNER JOIN facturas f ON f.id = item."facturaId"
      LEFT JOIN productos p ON p.id = item."productoId"
      WHERE f."fechaEmision" >= ${tsFrag(inicioAnterior)}
        AND f."fechaEmision" <= ${tsFrag(finAnterior)}
        AND f."estado" != 'VOIDED'
        ${whereClause}
        AND item."productoId" IS NOT NULL
    `;

    const gananciaAnterior = new Decimal(cogsAnterior[0]?.ganancia_total || 0);

    comparacion = {
      ...calcularComparacion(gananciaTotal.toNumber(), gananciaAnterior.toNumber()),
      gananciaAnterior: gananciaAnterior.toFixed(2),
    };
  }

  const gananciaPorProducto = await getGananciaPorProducto(inicio, fin, tenantFilter);

  return {
    periodo,
    etiqueta,
    etiquetaGanancia: ETIQUETA_GANANCIA[periodo] || 'Ganancia',
    ingresosTotales: ingresosTotal.toFixed(2),
    costoVendido: costoVendido.toFixed(2),
    gananciaBruta: gananciaDisponible ? gananciaTotal.toFixed(2) : null,
    margen: margen?.toFixed(2) ?? null,
    facturasConCosto,
    facturasSinCosto,
    productosConPerdida,
    gananciaPorProducto,
    comparacion,
  };
}

async function getGananciaPorProducto(inicio, fin, tenantFilter) {
  const whereClause = buildTenantSql(tenantFilter);

  const rows = await prisma.$queryRaw`
    SELECT
      p.id AS producto_id,
      p.nombre,
      p.sku,
      p."unidadMedida" AS unidad_medida,
      SUM(item."cantidad") AS cantidad_vendida,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN item."subtotalLinea" / f."tasaCambio"
          ELSE item."subtotalLinea"
        END
      ), 0) AS ingresos_usd,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN (item."precioUnitarioHistorico" - COALESCE(p."costoCompra", 0)) * item."cantidad" / f."tasaCambio"
          ELSE (item."precioUnitarioHistorico" - COALESCE(p."costoCompra", 0)) * item."cantidad"
        END
      ), 0) AS ganancia_usd,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN COALESCE(p."costoCompra", 0) * item."cantidad" / f."tasaCambio"
          ELSE COALESCE(p."costoCompra", 0) * item."cantidad"
        END
      ), 0) AS costo_usd
    FROM items_factura item
    INNER JOIN facturas f ON f.id = item."facturaId"
    LEFT JOIN productos p ON p.id = item."productoId"
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      ${whereClause}
    GROUP BY p.id, p.nombre, p.sku, p."unidadMedida"
    ORDER BY ganancia_usd DESC
  `;

  const productosData = rows.map(row => ({
    productoId: row.producto_id,
    nombre: row.nombre,
    sku: row.sku,
    unidad: row.unidad_medida,
    cantidadVendida: Number(row.cantidad_vendida).toFixed(2),
    ingresos: new Decimal(row.ingresos_usd.toString()).toFixed(2),
    costo: new Decimal(row.costo_usd.toString()).toFixed(2),
    ganancia: new Decimal(row.ganancia_usd.toString()).toFixed(2),
  }));

  const itemsSinProducto = await prisma.$queryRaw`
    SELECT
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN item."subtotalLinea" / f."tasaCambio"
          ELSE item."subtotalLinea"
        END
      ), 0) AS ingresos_usd,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN (item."precioUnitarioHistorico" - 0) * item."cantidad" / f."tasaCambio"
          ELSE (item."precioUnitarioHistorico" - 0) * item."cantidad"
        END
      ), 0) AS ganancia_usd,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN 0 * item."cantidad" / f."tasaCambio"
          ELSE 0 * item."cantidad"
        END
      ), 0) AS costo_usd,
      COALESCE(SUM(item."cantidad"), 0) AS cantidad_vendida
    FROM items_factura item
    INNER JOIN facturas f ON f.id = item."facturaId"
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      AND item."productoId" IS NULL
      ${whereClause}
  `;

  const sinProducto = itemsSinProducto[0];
  const tieneSinProducto = Number(sinProducto?.ingresos_usd) > 0 || Number(sinProducto?.ganancia_usd) > 0;

  if (tieneSinProducto) {
    productosData.push({
      productoId: null,
      nombre: 'Productos sin clasificar',
      sku: '—',
      unidad: '—',
      cantidadVendida: Number(sinProducto.cantidad_vendida || 0).toFixed(2),
      ingresos: new Decimal(sinProducto.ingresos_usd.toString()).toFixed(2),
      costo: new Decimal(sinProducto.costo_usd.toString()).toFixed(2),
      ganancia: new Decimal(sinProducto.ganancia_usd.toString()).toFixed(2),
    });
  }

  return productosData;
}

async function getDetalleVentasReporte(req) {
  const { periodo = 'mensual', fecha, page: pageStr, limit: limitStr } = req.query;
  validarParametros(periodo, fecha);
  const { inicio, fin, etiqueta } = getFechasPeriodo(periodo, fecha);
  const tenantFilter = getTenantFilter(req);
  const puedeVerGanancia = req.user?.rol !== 'CAJA';
  const productosConPerdida = puedeVerGanancia
    ? await getProductosConPerdida(inicio, fin, tenantFilter)
    : [];

  // Paginación: limitar el número de facturas cargadas para evitar respuestas masivas
  const page = Math.max(1, parseInt(pageStr) || 1);
  const limit = Math.min(Math.max(1, parseInt(limitStr) || 50), 200);
  const skip = (page - 1) * limit;

  const where = {
    fechaEmision: { gte: new Date(inicio), lte: new Date(fin) },
    estado: { not: 'VOIDED' },
    ...tenantFilter,
  };

  const [facturas, total] = await Promise.all([
    prisma.factura.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fechaEmision: 'asc' },
      select: {
        id: true,
        numeroFactura: true,
        fechaEmision: true,
        total: true,
        moneda: true,
        tasaCambio: true,
        cliente: { select: { razonSocial: true } },
        pagos: { select: { referenciaTransaccion: true } },
        items: {
          select: {
            descripcionHistorica: true,
            cantidad: true,
            subtotalLinea: true,
            costoUnitarioHistoricoUSD: true,
            producto: { select: { nombre: true } },
          },
        },
      },
    }),
    prisma.factura.count({ where }),
  ]);

  let totalIngresos = new Decimal(0);
  let gananciaTotal = new Decimal(0);
  let facturasSinCosto = 0;
  let facturasConCosto = 0;

  const detalle = [];
  for (const factura of facturas) {
    const tasaCambio = factura.tasaCambio;
    const totalFacturaUSD = normalizarAUSD(factura.total, factura.moneda, tasaCambio);
    totalIngresos = totalIngresos.plus(totalFacturaUSD);

    let ganancia = new Decimal(0);
    let costoDesconocido = false;

    if (puedeVerGanancia) {
      for (const item of factura.items) {
        if (!item.productoId) {
          costoDesconocido = true;
          continue;
        }
        const producto = await prisma.producto.findUnique({
          where: { id: item.productoId },
          select: { costoCompra: true },
        });
        const costoCompra = producto?.costoCompra;
        if (costoCompra === null || costoCompra === undefined) {
          costoDesconocido = true;
          continue;
        }
        const precioUnitario = new Decimal(item.precioUnitarioHistorico.toString());
        const costo = new Decimal(costoCompra.toString());
        const cantidad = new Decimal(item.cantidad.toString());
        ganancia = ganancia.plus(precioUnitario.minus(costo).times(cantidad));
      }
      if (costoDesconocido) {
        facturasSinCosto += 1;
      } else {
        gananciaTotal = gananciaTotal.plus(ganancia);
        facturasConCosto += 1;
      }
    }

    const referencias = [...new Set(
      factura.pagos.map((pago) => pago.referenciaTransaccion?.trim()).filter(Boolean)
    )];
    const productos = [...new Set(
      factura.items.map((item) => item.descripcionHistorica || item.producto?.nombre).filter(Boolean)
    )];

    detalle.push({
      facturaId: factura.numeroFactura,
      referencia: referencias.join(', ') || '—',
      cliente: factura.cliente?.razonSocial || '—',
      producto: productos.join(', ') || '—',
      fechaHora: factura.fechaEmision,
      montoTotal: totalFacturaUSD.toFixed(2),
      ganancia: puedeVerGanancia && !costoDesconocido ? ganancia.toFixed(2) : null,
      costoDesconocido: puedeVerGanancia && costoDesconocido,
    });
  }

  return {
    periodo,
    etiqueta,
    moneda: 'USD',
    totalIngresos: totalIngresos.toFixed(2),
    gananciaTotal: puedeVerGanancia
      ? (facturasConCosto === 0 && facturasSinCosto > 0 ? null : gananciaTotal.toFixed(2))
      : null,
    facturasConCosto,
    facturasSinCosto,
    productosConPerdida,
    detalle,
    paginacion: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTE DE INVERSIÓN (Valor del Inventario)
// ═══════════════════════════════════════════════════════════════════════════════

async function getInversionReporte(req) {
  const empresaId = req.user?.id || null;

  if (!empresaId) {
    return {
      valorInventario: '0.00',
      totalProductos: 0,
      productosConStock: 0,
      productosSinStock: 0,
      productosMasInvertidos: [],
      inversionPorCategoria: [],
    };
  }

  const [valorTotal, productosMasInvertidos, inversionPorCategoria] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        COALESCE(SUM("stockActual" * "costoCompra"), 0) AS valor_total,
        COUNT(*) AS total_productos,
        COUNT(CASE WHEN "stockActual" > 0 THEN 1 END) AS con_stock,
        COUNT(CASE WHEN "stockActual" = 0 THEN 1 END) AS sin_stock
      FROM productos
      WHERE "empresaId" = ${empresaId}
        AND activo = true
    `,
    prisma.$queryRaw`
      SELECT
        nombre,
        "stockActual" AS stock,
        "costoCompra" AS costo_unitario,
        ("stockActual" * "costoCompra") AS valor_total
      FROM productos
      WHERE "empresaId" = ${empresaId}
        AND activo = true
        AND "stockActual" > 0
      ORDER BY valor_total DESC
      LIMIT 5
    `,
    prisma.$queryRaw`
      SELECT
        COALESCE(categoria, 'General') AS categoria,
        COALESCE(SUM("stockActual" * "costoCompra"), 0) AS valor
      FROM productos
      WHERE "empresaId" = ${empresaId}
        AND activo = true
      GROUP BY categoria
      ORDER BY valor DESC
    `,
  ]);

  return {
    valorInventario: Number(valorTotal[0]?.valor_total || 0).toFixed(2),
    totalProductos: Number(valorTotal[0]?.total_productos || 0),
    productosConStock: Number(valorTotal[0]?.con_stock || 0),
    productosSinStock: Number(valorTotal[0]?.sin_stock || 0),
    productosMasInvertidos: productosMasInvertidos.map(p => ({
      nombre: p.nombre,
      stock: Number(p.stock),
      costoUnitario: Number(p.costo_unitario).toFixed(2),
      valorTotal: Number(p.valor_total).toFixed(2),
    })),
    inversionPorCategoria: inversionPorCategoria.map(c => ({
      categoria: c.categoria,
      valor: Number(c.valor).toFixed(2),
    })),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTOS MÁS VENDIDOS
// ═══════════════════════════════════════════════════════════════════════════════

async function getProductosTop(req) {
  const { periodo = 'mensual', fecha, limit = '10' } = req.query;
  validarParametros(periodo, fecha);
  const { inicio, fin } = getFechasPeriodo(periodo, fecha);
  const tenantFilter = getTenantFilter(req);
  const whereClause = buildTenantSql(tenantFilter);
  const limitNum = Math.min(parseInt(limit) || 10, 50);

  const productos = await prisma.$queryRaw`
    SELECT
      p.nombre,
      p.sku,
      p."unidadMedida" AS unidad_medida,
      SUM(if."cantidad") AS cantidad_vendida,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN if."totalLinea" / f."tasaCambio"
          ELSE if."totalLinea"
        END
      ), 0) AS ingresos_usd
    FROM items_factura if
    INNER JOIN productos p ON p.id = if."productoId"
    INNER JOIN facturas f ON f.id = if."facturaId"
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      ${whereClause}
    GROUP BY p.id, p.nombre, p.sku, p."unidadMedida"
    ORDER BY cantidad_vendida DESC
    LIMIT ${limitNum}
  `;

  return productos.map(p => ({
    nombre: p.nombre,
    sku: p.sku,
    unidad: p.unidad_medida,
    cantidadVendida: Number(p.cantidad_vendida),
    ingresos: Number(p.ingresos_usd || 0).toFixed(2),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENTES TOP
// ═══════════════════════════════════════════════════════════════════════════════

async function getClientesTop(req) {
  const { periodo = 'mensual', fecha, limit = '10' } = req.query;
  validarParametros(periodo, fecha);
  const { inicio, fin } = getFechasPeriodo(periodo, fecha);
  const tenantFilter = getTenantFilter(req);
  const whereClause = buildTenantSql(tenantFilter);
  const limitNum = Math.min(parseInt(limit) || 10, 50);

  const clientes = await prisma.$queryRaw`
    SELECT
      c."razonSocial" AS nombre,
      c."rifCedula" AS rif,
      COUNT(f.id) AS cantidad_facturas,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN f."total" / f."tasaCambio"
          ELSE f."total"
        END
      ), 0) AS total_compras_usd
    FROM facturas f
    INNER JOIN clientes c ON c.id = f."clienteId"
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      ${whereClause}
    GROUP BY c.id, c."razonSocial", c."rifCedula"
    ORDER BY total_compras_usd DESC
    LIMIT ${limitNum}
  `;

  return clientes.map(c => ({
    nombre: c.nombre,
    rif: c.rif,
    cantidadFacturas: Number(c.cantidad_facturas),
    totalCompras: Number(c.total_compras_usd || 0).toFixed(2),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTE DE CAJA
// ═══════════════════════════════════════════════════════════════════════════════

async function getCajaReporte(req) {
  const { periodo = 'mensual', fecha } = req.query;
  validarParametros(periodo, fecha);
  const { inicio, fin } = getFechasPeriodo(periodo, fecha);
  const tenantFilter = getTenantFilter(req);
  const whereClause = buildTenantSql(tenantFilter);

  const pagos = await prisma.$queryRaw`
    SELECT
      p."metodoPago" AS metodo,
      p."monedaPago" AS moneda,
      COALESCE(SUM(p."monto"), 0) AS total_recibido,
      COALESCE(SUM(
        CASE
          WHEN p."monedaPago" = 'VES' AND f."tasaCambio" > 0
          THEN p."monto" / f."tasaCambio"
          ELSE p."monto"
        END
      ), 0) AS total_usd,
      COUNT(*) AS cantidad
    FROM pagos p
    INNER JOIN facturas f ON f.id = p."facturaId"
    WHERE p."fechaPago" >= ${tsFrag(inicio)}
      AND p."fechaPago" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      ${whereClause}
    GROUP BY p."metodoPago", p."monedaPago"
    ORDER BY total_usd DESC
  `;

  const totales = pagos.reduce((acc, p) => {
    acc.total += Number(p.total_usd || 0);
    acc.cantidad += Number(p.cantidad);
    return acc;
  }, { total: 0, cantidad: 0 });

  return {
    periodo,
    desglose: pagos.map(p => ({
      metodo: p.metodo,
      moneda: p.moneda,
      metodoLabel: getMetodoLabel(p.metodo, p.moneda),
      total: Number(p.total_recibido || 0).toFixed(2),
      totalUSD: Number(p.total_usd || 0).toFixed(2),
      cantidad: Number(p.cantidad),
    })),
    totalGeneral: totales.total.toFixed(2),
    totalTransacciones: totales.cantidad,
  };
}

function getMetodoLabel(metodo, moneda) {
  const labels = {
    CASH: 'Efectivo',
    BANK_TRANSFER: 'Transferencia',
    CREDIT_CARD: 'Tarjeta Crédito',
    MOBILE_PAYMENT: 'Pago Móvil',
    PAGO_MOVIL: 'Pago Móvil',
  };
  const label = labels[metodo] || metodo;
  return moneda ? `${label} (${moneda === 'VES' ? 'Bs.' : 'USD'})` : label;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTE DE IMPUESTOS
// ═══════════════════════════════════════════════════════════════════════════════

async function getImpuestosReporte(req) {
  const { periodo = 'mensual', fecha } = req.query;
  validarParametros(periodo, fecha);
  const { inicio, fin } = getFechasPeriodo(periodo, fecha);
  const tenantFilter = getTenantFilter(req);
  const whereClause = buildTenantSql(tenantFilter);

  const impuestos = await prisma.$queryRaw`
    SELECT
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN f."impuestoTotal" / f."tasaCambio"
          ELSE f."impuestoTotal"
        END
      ), 0) AS total_impuestos,
      COALESCE(SUM(
        CASE
          WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
          THEN f."subtotal" / f."tasaCambio"
          ELSE f."subtotal"
        END
      ), 0) AS base_imponible
    FROM facturas f
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      ${whereClause}
  `;

  const totalImpuestos = Number(impuestos[0]?.total_impuestos || 0);
  const baseImponible = Number(impuestos[0]?.base_imponible || 0);

  return {
    periodo,
    totalImpuestos: totalImpuestos.toFixed(2),
    baseImponible: baseImponible.toFixed(2),
    tasaEfectiva: baseImponible > 0 ? ((totalImpuestos / baseImponible) * 100).toFixed(2) : '0.00',
  };
}

function invalidarCacheVentas() {
  for (const key of cache.keys()) {
    if (key.startsWith('reporte:ventas:')) cache.delete(key);
  }
}

module.exports = {
  invalidarCacheVentas,
  getVentasReporte,
  getGananciasReporte,
  getDetalleVentasReporte,
  getInversionReporte,
  getProductosTop,
  getClientesTop,
  getCajaReporte,
  getImpuestosReporte,
};
