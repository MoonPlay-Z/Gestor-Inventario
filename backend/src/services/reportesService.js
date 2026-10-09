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

/**
 * Genera SQL para normalizar un monto a USD usando la tasa de cambio.
 * @param {string} columna - Nombre de la columna a normalizar
 * @param {string} alias - Alias para el resultado
 * @returns {Prisma.Sql} Expresión SQL
 */
function normalizarUSD(columna, alias) {
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

  if (fecha && !FORMATOS_FECHA[periodo].test(fecha)) {
    const err = new Error(`Formato de fecha inválido para período ${periodo}. Formato esperado: ${FORMATOS_FECHA[periodo]}`);
    err.status = 400;
    throw err;
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
      return Prisma.sql`AND (${Prisma.join(condiciones, ' OR ')})`;
    }
  }

  return Prisma.empty;
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
    total: Number(row.total_usd || 0).toFixed(2),
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

  // Ingresos totales (ventas)
  const ingresos = await prisma.$queryRaw`
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
  `;

  // COGS (Costo de productos vendidos)
  const cogs = await prisma.$queryRaw`
    SELECT
      COALESCE(SUM(
        if."cantidad" * p."costoCompra"
      ), 0) AS costo_vendido
    FROM items_factura if
    INNER JOIN productos p ON p.id = if."productoId"
    INNER JOIN facturas f ON f.id = if."facturaId"
    WHERE f."fechaEmision" >= ${tsFrag(inicio)}
      AND f."fechaEmision" <= ${tsFrag(fin)}
      AND f."estado" != 'VOIDED'
      ${whereClause}
  `;

  const ingresosTotal = new Decimal(ingresos[0]?.total_usd || 0);
  const costoVendido = new Decimal(cogs[0]?.costo_vendido || 0);
  const gananciaBruta = ingresosTotal.minus(costoVendido);
  const margen = ingresosTotal.gt(0)
    ? gananciaBruta.dividedBy(ingresosTotal).times(100)
    : new Decimal(0);

  // Comparación
  let comparacion = null;
  if (comparar === 'true') {
    const ingresosAnterior = await prisma.$queryRaw`
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
        ${whereClause}
    `;

    const cogsAnterior = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(
          if."cantidad" * p."costoCompra"
        ), 0) AS costo_vendido
      FROM items_factura if
      INNER JOIN productos p ON p.id = if."productoId"
      INNER JOIN facturas f ON f.id = if."facturaId"
      WHERE f."fechaEmision" >= ${tsFrag(inicioAnterior)}
        AND f."fechaEmision" <= ${tsFrag(finAnterior)}
        AND f."estado" != 'VOIDED'
        ${whereClause}
    `;

    const gananciaAnterior = new Decimal(ingresosAnterior[0]?.total_usd || 0)
      .minus(new Decimal(cogsAnterior[0]?.costo_vendido || 0));

    comparacion = {
      ...calcularComparacion(gananciaBruta.toNumber(), gananciaAnterior.toNumber()),
      gananciaAnterior: gananciaAnterior.toFixed(2),
    };
  }

  return {
    periodo,
    etiqueta,
    ingresosTotales: ingresosTotal.toFixed(2),
    costoVendido: costoVendido.toFixed(2),
    gananciaBruta: gananciaBruta.toFixed(2),
    margen: margen.toFixed(2),
    comparacion,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTE DE INVERSIÓN (Valor del Inventario)
// ═══════════════════════════════════════════════════════════════════════════════

async function getInversionReporte(req) {
  // Los productos están asociados al usuario EMPRESA a través de empresaId
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

  // Valor total del inventario (los productos no tienen moneda/tasaCambio)
  const valorTotal = await prisma.$queryRaw`
    SELECT
      COALESCE(SUM("stockActual" * "costoCompra"), 0) AS valor_total,
      COUNT(*) AS total_productos,
      COUNT(CASE WHEN "stockActual" > 0 THEN 1 END) AS con_stock,
      COUNT(CASE WHEN "stockActual" = 0 THEN 1 END) AS sin_stock
    FROM productos
    WHERE "empresaId" = ${empresaId}
      AND activo = true
  `;

  // Top 5 productos con mayor inversión
  const productosMasInvertidos = await prisma.$queryRaw`
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
  `;

  // Inversión por categoría
  const inversionPorCategoria = await prisma.$queryRaw`
    SELECT
      COALESCE(categoria, 'General') AS categoria,
      COALESCE(SUM("stockActual" * "costoCompra"), 0) AS valor
    FROM productos
    WHERE "empresaId" = ${empresaId}
      AND activo = true
    GROUP BY categoria
    ORDER BY valor DESC
  `;

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
    GROUP BY p.id, p.nombre, p.sku
    ORDER BY cantidad_vendida DESC
    LIMIT ${limitNum}
  `;

  return productos.map(p => ({
    nombre: p.nombre,
    sku: p.sku,
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
  getInversionReporte,
  getProductosTop,
  getClientesTop,
  getCajaReporte,
  getImpuestosReporte,
};
