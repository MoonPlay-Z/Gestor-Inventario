const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { IS_SQLITE } = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');
const { toDecimalSeguro } = require('../utils/decimal');
const { aUnidadBase } = require('../utils/unidades');
const { resolverEmpresaRefId } = require('../utils/empresaContext');
const { tasaParaEmpresa } = require('../utils/tasaAPI');
const { paginate } = require('../utils/pagination');
const { containsInsensitive, extraerTerminosBusqueda } = require('../utils/textSearch');

const UNIDADES_VALIDAS = [
  'UNIDAD', 'KILOGRAMO', 'GRAMO', 'LITRO', 'MILILITRO',
  'METRO', 'CENTIMETRO', 'BULTO', 'PAQUETE', 'CAJA',
  'SACO', 'BOTELLA', 'LATA', 'DOCENA', 'MEDIA_DOCENA',
];

// Fragmento de búsqueda de texto portable: PostgreSQL soporta ILIKE, SQLite
// no (rompía con `near "ILIKE": syntax error` al filtrar stock bajo/costo).
const likeFrag = (columna, indice) => IS_SQLITE
  ? `LOWER(${columna}) LIKE LOWER($${indice})`
  : `${columna} ILIKE $${indice}`;

// SUPER_ADMIN no gestiona inventario
router.use(requireRole('EMPRESA', 'CAJA', 'INVENTARIO'));

// GET /api/productos/metricas - Métricas agregadas del inventario
router.get('/metricas', async (req, res, next) => {
  try {
    // El tenant es el usuario EMPRESA padre; las sub-cuentas (CAJA/INVENTARIO)
    // tienen su propio `id` y `empresaId` apunta al padre. Usar `req.user.id`
    // dejaba a las sub-cuentas con métricas en 0 pese a tener inventario.
    const empresaId = req.user.empresaId || req.user.id;

    if (!empresaId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const metricas = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM("stockActual" * "precioVenta"), 0) AS valor_total_venta,
        COALESCE(SUM("stockActual" * "costoCompra"), 0) AS valor_total_costo,
        COALESCE(SUM("stockActual" * ("precioVenta" - "costoCompra")), 0) AS ganancia_potencial,
        COUNT(*) AS total_productos,
        COUNT(CASE WHEN "stockActual" > 0 THEN 1 END) AS productos_con_stock,
        COUNT(CASE WHEN "stockActual" = 0 THEN 1 END) AS productos_sin_stock,
        COUNT(CASE WHEN "stockActual" <= "stockMinimo" THEN 1 END) AS productos_stock_bajo
      FROM productos
      WHERE "empresaId" = ${empresaId}
        AND activo = true
    `;

    res.json({
      valorTotalVenta: new Decimal(metricas[0]?.valor_total_venta || 0).toFixed(2),
      valorTotalCosto: new Decimal(metricas[0]?.valor_total_costo || 0).toFixed(2),
      gananciaPotencial: new Decimal(metricas[0]?.ganancia_potencial || 0).toFixed(2),
      totalProductos: Number(metricas[0]?.total_productos || 0),
      productosConStock: Number(metricas[0]?.productos_con_stock || 0),
      productosSinStock: Number(metricas[0]?.productos_sin_stock || 0),
      productosStockBajo: Number(metricas[0]?.productos_stock_bajo || 0),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/productos/integridad — Validación de integridad del inventario
router.get('/integridad', async (req, res, next) => {
  try {
    const empresaId = req.user.empresaId || req.user.id;

    if (!empresaId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Ejecutar todas las validaciones en paralelo
    const [
      stockNegativo,
      costoMayorVenta,
      ivaSinTasa,
      precioCero,
      costoCero,
      skuDuplicados,
      sinCategoria,
      sinUnidadMedida,
      ventaPesoSinPrecioKilo,
      stockMinimoInvalido,
      productosInactivosConStock,
      totalProductos,
    ] = await Promise.all([
      // 1. Productos con stock negativo
      prisma.$queryRaw`
        SELECT id, sku, nombre, "stockActual", "stockMinimo", "unidadMedida"
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND "stockActual" < 0
        ORDER BY "stockActual" ASC
      `,

      // 2. Productos con costo mayor a precio de venta (pérdida garantizada)
      prisma.$queryRaw`
        SELECT id, sku, nombre, "precioVenta", "costoCompra",
               ("costoCompra" - "precioVenta") AS perdida_unitaria
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND "costoCompra" > "precioVenta"
        ORDER BY perdida_unitaria DESC
      `,

      // 3. Productos con IVA > 0 pero tasaImpuesto = 0 (inconsistencia)
      prisma.$queryRaw`
        SELECT id, sku, nombre, "tasaImpuesto"
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND "tasaImpuesto" = 0
          AND "precioVenta" > 0
        ORDER BY nombre ASC
      `,

      // 4. Productos con precio de venta = 0 o NULL
      prisma.$queryRaw`
        SELECT id, sku, nombre, "precioVenta"
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND ("precioVenta" IS NULL OR "precioVenta" <= 0)
        ORDER BY nombre ASC
      `,

      // 5. Productos con costo = 0 (puede ser válido pero vale la pena revisar)
      prisma.$queryRaw`
        SELECT id, sku, nombre, "costoCompra", "precioVenta"
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND ("costoCompra" IS NULL OR "costoCompra" = 0)
        ORDER BY nombre ASC
      `,

      // 6. SKUs duplicados dentro de la misma empresa
      prisma.$queryRaw`
        SELECT sku, COUNT(*) as cantidad, array_agg(id) as ids, array_agg(nombre) as nombres
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
        GROUP BY sku
        HAVING COUNT(*) > 1
        ORDER BY cantidad DESC
      `,

      // 7. Productos sin categoría (NULL o vacío)
      prisma.$queryRaw`
        SELECT id, sku, nombre, categoria
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND (categoria IS NULL OR categoria = '')
        ORDER BY nombre ASC
      `,

      // 8. Productos sin unidad de medida
      prisma.$queryRaw`
        SELECT id, sku, nombre, "unidadMedida"
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND ("unidadMedida" IS NULL OR "unidadMedida" = '')
        ORDER BY nombre ASC
      `,

      // 9. Productos "venta por peso" sin precio por kilo
      prisma.$queryRaw`
        SELECT id, sku, nombre, "esVentaPorPeso", "precioPorKilo", "unidadMedida"
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND "esVentaPorPeso" = true
          AND ("precioPorKilo" IS NULL OR "precioPorKilo" <= 0)
        ORDER BY nombre ASC
      `,

      // 10. Stock mínimo inválido (negativo)
      prisma.$queryRaw`
        SELECT id, sku, nombre, "stockActual", "stockMinimo"
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND ("stockMinimo" < 0)
        ORDER BY "stockMinimo" ASC
      `,

      // 11. Productos inactivos que aún tienen stock > 0
      prisma.$queryRaw`
        SELECT id, sku, nombre, "stockActual", "stockMinimo"
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = false
          AND "stockActual" > 0
        ORDER BY "stockActual" DESC
      `,

      // 12. Total de productos para estadísticas
      prisma.$queryRaw`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN activo = true THEN 1 END) as activos,
          COUNT(CASE WHEN activo = false THEN 1 END) as inactivos
        FROM productos
        WHERE "empresaId" = ${empresaId}
      `,
    ]);

    // Formatear resultados
    const validaciones = [
      {
        codigo: 'STOCK_NEGATIVO',
        titulo: 'Stock negativo',
        descripcion: 'Productos con cantidad en inventario menor a cero',
        severidad: 'critica',
        cantidad: stockNegativo.length,
        datos: stockNegativo.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          stockActual: Number(p.stockActual),
          stockMinimo: Number(p.stockMinimo),
          unidadMedida: p.unidadMedida,
        })),
      },
      {
        codigo: 'COSTO_MAYOR_VENTA',
        titulo: 'Costo mayor a precio de venta',
        descripcion: 'Cada venta genera pérdida (costo > precio)',
        severidad: 'alta',
        cantidad: costoMayorVenta.length,
        datos: costoMayorVenta.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          precioVenta: Number(p.precioVenta),
          costoCompra: Number(p.costoCompra),
          perdidaUnitaria: Number(p.perdida_unitaria),
        })),
      },
      {
        codigo: 'IVA_SIN_TASA',
        titulo: 'Productos con IVA pero tasa en 0%',
        descripcion: 'Productos que deberían tener IVA pero la tasa está en 0',
        severidad: 'media',
        cantidad: ivaSinTasa.length,
        datos: ivaSinTasa.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          tasaImpuesto: Number(p.tasaImpuesto),
        })),
      },
      {
        codigo: 'PRECIO_CERO',
        titulo: 'Precio de venta en cero o nulo',
        descripcion: 'Productos que no pueden venderse por falta de precio',
        severidad: 'critica',
        cantidad: precioCero.length,
        datos: precioCero.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          precioVenta: Number(p.precioVenta || 0),
        })),
      },
      {
        codigo: 'COSTO_CERO',
        titulo: 'Costo de compra en cero',
        descripcion: 'Productos sin costo registrado (ganancia inflada en reportes)',
        severidad: 'baja',
        cantidad: costoCero.length,
        datos: costoCero.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          costoCompra: Number(p.costoCompra || 0),
          precioVenta: Number(p.precioVenta),
        })),
      },
      {
        codigo: 'SKU_DUPLICADO',
        titulo: 'SKUs duplicados',
        descripcion: 'Mismo SKU asignado a múltiples productos',
        severidad: 'critica',
        cantidad: skuDuplicados.length,
        datos: skuDuplicados.map(p => ({
          sku: p.sku,
          cantidad: Number(p.cantidad),
          ids: p.ids,
          nombres: p.nombres,
        })),
      },
      {
        codigo: 'SIN_CATEGORIA',
        titulo: 'Productos sin categoría',
        descripcion: 'Productos sin clasificar (dificulta reportes y filtros)',
        severidad: 'baja',
        cantidad: sinCategoria.length,
        datos: sinCategoria.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          categoria: p.categoria,
        })),
      },
      {
        codigo: 'SIN_UNIDAD_MEDIDA',
        titulo: 'Productos sin unidad de medida',
        descripcion: 'Falta unidad de medida (requerida para stock y ventas)',
        severidad: 'media',
        cantidad: sinUnidadMedida.length,
        datos: sinUnidadMedida.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          unidadMedida: p.unidadMedida,
        })),
      },
      {
        codigo: 'VENTA_PESO_SIN_PRECIO_KILO',
        titulo: 'Venta por peso sin precio por kilo',
        descripcion: 'Productos marcados como venta por peso pero sin precio/kg',
        severidad: 'alta',
        cantidad: ventaPesoSinPrecioKilo.length,
        datos: ventaPesoSinPrecioKilo.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          esVentaPorPeso: p.esVentaPorPeso,
          precioPorKilo: Number(p.precioPorKilo || 0),
          unidadMedida: p.unidadMedida,
        })),
      },
      {
        codigo: 'STOCK_MINIMO_INVALIDO',
        titulo: 'Stock mínimo negativo',
        descripcion: 'El stock mínimo no puede ser negativo',
        severidad: 'media',
        cantidad: stockMinimoInvalido.length,
        datos: stockMinimoInvalido.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          stockActual: Number(p.stockActual),
          stockMinimo: Number(p.stockMinimo),
        })),
      },
      {
        codigo: 'INACTIVOS_CON_STOCK',
        titulo: 'Productos inactivos con stock',
        descripcion: 'Productos desactivados que aún tienen inventario',
        severidad: 'baja',
        cantidad: productosInactivosConStock.length,
        datos: productosInactivosConStock.map(p => ({
          id: p.id,
          sku: p.sku,
          nombre: p.nombre,
          stockActual: Number(p.stockActual),
          stockMinimo: Number(p.stockMinimo),
        })),
      },
    ];

    const resumen = {
      totalProductos: Number(totalProductos[0]?.total || 0),
      productosActivos: Number(totalProductos[0]?.activos || 0),
      productosInactivos: Number(totalProductos[0]?.inactivos || 0),
      totalAlertas: validaciones.reduce((sum, v) => sum + v.cantidad, 0),
      porSeveridad: {
        critica: validaciones.filter(v => v.severidad === 'critica').reduce((sum, v) => sum + v.cantidad, 0),
        alta: validaciones.filter(v => v.severidad === 'alta').reduce((sum, v) => sum + v.cantidad, 0),
        media: validaciones.filter(v => v.severidad === 'media').reduce((sum, v) => sum + v.cantidad, 0),
        baja: validaciones.filter(v => v.severidad === 'baja').reduce((sum, v) => sum + v.cantidad, 0),
      },
      estadoGeneral: 'ok',
    };

    // Determinar estado general
    if (resumen.porSeveridad.critica > 0) resumen.estadoGeneral = 'critico';
    else if (resumen.porSeveridad.alta > 0) resumen.estadoGeneral = 'atencion';
    else if (resumen.porSeveridad.media > 0) resumen.estadoGeneral = 'advertencia';

    res.json({
      resumen,
      validaciones,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/productos/alertas — Sistema de alertas de inventario
router.get('/alertas', async (req, res, next) => {
  try {
    const empresaId = req.user.empresaId || req.user.id;

    const [conIva, costoMayorAVenta] = await Promise.all([
      prisma.$queryRaw`
        SELECT id, sku, nombre, "tasaImpuesto", "precioVenta", "costoCompra", "unidadMedida"
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND "tasaImpuesto" > 0
        ORDER BY nombre ASC
      `,
      prisma.$queryRaw`
        SELECT id, sku, nombre, "tasaImpuesto", "precioVenta", "costoCompra", "unidadMedida",
          ("costoCompra" - "precioVenta") AS diferencia
        FROM productos
        WHERE "empresaId" = ${empresaId}
          AND activo = true
          AND "costoCompra" > "precioVenta"
        ORDER BY diferencia DESC
      `,
    ]);

    res.json({
      conIva: conIva.map(p => ({
        id: p.id,
        sku: p.sku,
        nombre: p.nombre,
        tasaImpuesto: Number(p.tasaImpuesto),
        precioVenta: Number(p.precioVenta),
        costoCompra: Number(p.costoCompra),
        unidadMedida: p.unidadMedida,
      })),
      costoMayorAVenta: costoMayorAVenta.map(p => ({
        id: p.id,
        sku: p.sku,
        nombre: p.nombre,
        tasaImpuesto: Number(p.tasaImpuesto),
        precioVenta: Number(p.precioVenta),
        costoCompra: Number(p.costoCompra),
        unidadMedida: p.unidadMedida,
        diferencia: Number(p.diferencia),
      })),
    });
  } catch (err) { next(err); }
});

// GET /api/productos
router.get('/', async (req, res, next) => {
  try {
    const { q, soloActivos = 'true', stockBajo, categoria, alertaIva, alertaCostoVenta, limite } = req.query;
    // `paginate` normaliza page/limit (clamp page>=1, take 1..100). Se conserva
    // el alias histórico `limite` (usado por el POS) mapeándolo a `limit`.
    const { skip, take, page: pageNumber, limit } = paginate(
      { ...req.query, limit: req.query.limit ?? limite },
      { limit: 25 }
    );
    const empresaId = req.user.empresaId || req.user.id;

    // Si se solicita alertaCostoVenta O stockBajo, usamos raw SQL para poder
    // filtrar a nivel de BD (comparación campo-a-campo) con paginación correcta.
    const necesitaRawSql = alertaCostoVenta === 'true' || stockBajo === 'true';

    if (necesitaRawSql) {
      // Construir WHERE dinámico
      const condiciones = ['"empresaId" = $1'];
      const params = [empresaId];
      let paramIndex = 2;

      if (soloActivos === 'true') {
        condiciones.push('activo = true');
      }
      if (categoria) {
        condiciones.push(`categoria = $${paramIndex++}`);
        params.push(categoria);
      }
      if (alertaIva === 'true') {
        condiciones.push('"tasaImpuesto" > 0');
      }
      if (alertaCostoVenta === 'true') {
        condiciones.push('"costoCompra" > "precioVenta"');
      }
      if (stockBajo === 'true') {
        condiciones.push('"stockActual" <= "stockMinimo"');
      }
      if (q) {
        const terms = extraerTerminosBusqueda(q);
        if (terms.length > 0) {
          const orCondiciones = terms.map(() => {
            const idx = paramIndex++;
            return `(${likeFrag('sku', idx)} OR ${likeFrag('nombre', idx)} OR ${likeFrag('descripcion', idx)} OR ${likeFrag('categoria', idx)})`;
          }).join(' AND ');
          condiciones.push(`(${orCondiciones})`);
          terms.forEach(t => params.push(`%${t}%`));
        }
      }

      const whereSql = condiciones.join(' AND ');

      const selectCols = `
        id, sku, nombre, descripcion, "imagenUrl", "unidadMedida", "esVentaPorPeso",
        "precioPorKilo", "toleranciaPeso", "stockActual", "stockMinimo", "precioVenta",
        "costoCompra", "tasaImpuesto", categoria, activo, "empresaId", "createdAt", "updatedAt"
      `;

      const productosRaw = await prisma.$queryRawUnsafe(
        `SELECT ${selectCols} FROM productos WHERE ${whereSql} ORDER BY nombre ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        ...params,
        take,
        skip
      );

      const totalRaw = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) AS count FROM productos WHERE ${whereSql}`,
        ...params
      );

      const productos = productosRaw.map(p => ({
        ...p,
        stockBajoMinimo: Number(p.stockActual) <= Number(p.stockMinimo),
      }));

      return res.json({ data: productos, total: Number(totalRaw[0].count), page: pageNumber, limit: take });
    }

    // Sin stockBajo ni alertaCostoVenta: usar Prisma ORM normal
    const where = { empresaId };
    if (soloActivos === 'true') where.activo = true;
    if (categoria) where.categoria = categoria;
    if (alertaIva === 'true') where.tasaImpuesto = { gt: 0 };
    if (q) {
      const terms = extraerTerminosBusqueda(q);
      where.AND = terms.map(term => ({
        OR: [
          { sku: containsInsensitive(term) },
          { nombre: containsInsensitive(term) },
          { descripcion: containsInsensitive(term) },
          { categoria: containsInsensitive(term) },
        ]
      }));
    }

    let [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        skip,
        take,
        orderBy: { nombre: 'asc' },
        select: {
          id: true,
          sku: true,
          nombre: true,
          descripcion: true,
          imagenUrl: true,
          unidadMedida: true,
          esVentaPorPeso: true,
          precioPorKilo: true,
          toleranciaPeso: true,
          stockActual: true,
          stockMinimo: true,
          precioVenta: true,
          costoCompra: true,
          tasaImpuesto: true,
          categoria: true,
          activo: true,
          empresaId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.producto.count({ where }),
    ]);

    // Agregar campo derivado stockBajoMinimo
    productos = productos.map(p => ({
      ...p,
      stockBajoMinimo: Number(p.stockActual) <= Number(p.stockMinimo),
    }));

    res.json({ data: productos, total, page: pageNumber, limit });
  } catch (err) { next(err); }
});

// GET /api/productos/lookup/:codigo — Visor de Precios / Consulta Rápida
router.get('/lookup/:codigo', async (req, res, next) => {
  try {
    const rawCodigo = (req.params.codigo || '').trim();
    if (!rawCodigo) throw createValidationError('Código requerido');

    const isSuperAdmin = req.user.rol === 'SUPER_ADMIN';
    // `Producto.empresaId` referencia a `Usuario` (relación "EmpresaProductos"),
    // NO a `empresas`. Usar `empresaRefId` hacía que el EMPRESA no encontrara
    // nada al escanear un código de barras.
    const empresaId = req.user.empresaId || req.user.id;

    const baseWhere = { activo: true };
    if (!isSuperAdmin && empresaId) {
      baseWhere.empresaId = empresaId;
    }

    // Una sola query con OR para búsqueda exacta y parcial (evita 3 queries secuenciales)
    let producto = await prisma.producto.findFirst({
      where: {
        ...baseWhere,
        OR: [
          { sku: { equals: rawCodigo, mode: 'insensitive' } },
          { id: rawCodigo },
          { sku: { contains: rawCodigo, mode: 'insensitive' } },
          { nombre: { contains: rawCodigo, mode: 'insensitive' } },
          { descripcion: { contains: rawCodigo, mode: 'insensitive' } },
          { categoria: { contains: rawCodigo, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        // Priorizar coincidencias exactas de SKU
        sku: 'asc',
      }
    });

    // Fallback: buscar en la empresa padre si no se encontró
    if (!producto && req.user.empresaId) {
      producto = await prisma.producto.findFirst({
        where: {
          activo: true,
          empresaId: req.user.empresaId,
          OR: [
            { sku: { contains: rawCodigo, mode: 'insensitive' } },
            { nombre: { contains: rawCodigo, mode: 'insensitive' } }
          ]
        }
      });
    }

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Tasa vigente de la empresa (AUTO: BCV del día; MANUAL: la guardada).
    // Se resuelve por empresa: usar la tasa global servía la de otro tenant.
    const tasaBcv = await tasaParaEmpresa(await resolverEmpresaRefId(req));

    const precioUsd = new Decimal(producto.precioVenta.toString());
    const precioVes = precioUsd.mul(tasaBcv);

    res.json({
      ...producto,
      precioUsd,
      precioVes,
      tasaBcv: Number(tasaBcv.toString()),
      stockBajoMinimo: Number(producto.stockActual) <= Number(producto.stockMinimo)
    });
  } catch (err) { next(err); }
});

// GET /api/productos/next-sku
router.get('/next-sku', async (req, res, next) => {
  try {
    let corr = await prisma.correlativo.findUnique({ where: { nombre: 'SKU' } });
    const nextVal = corr ? corr.valor + 1 : 1;
    res.json({ sku: `PROD-${String(nextVal).padStart(5, '0')}` });
  } catch (err) { next(err); }
});

// GET /api/productos/categorias — categorías reales de la empresa.
// El selector de inventario solo veía las categorías de la página cargada,
// así que las que quedaban fuera de los primeros 20 productos no se podían
// filtrar.
router.get('/categorias', async (req, res, next) => {
  try {
    const empresaId = req.user.empresaId || req.user.id;
    const filas = await prisma.producto.findMany({
      where: { empresaId, activo: true },
      distinct: ['categoria'],
      select: { categoria: true },
      orderBy: { categoria: 'asc' },
    });
    res.json(filas.map(f => f.categoria).filter(Boolean));
  } catch (err) { next(err); }
});

// GET /api/productos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const empresaId = req.user.empresaId || req.user.id;
    const producto = await prisma.producto.findFirstOrThrow({
      where: { id: req.params.id, empresaId },
      select: {
        id: true,
        sku: true,
        nombre: true,
        descripcion: true,
        imagenUrl: true,
        stockActual: true,
        stockMinimo: true,
        precioVenta: true,
        costoCompra: true,
        tasaImpuesto: true,
        categoria: true,
        activo: true,
        empresaId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ ...producto, stockBajoMinimo: Number(producto.stockActual) <= Number(producto.stockMinimo) });
  } catch (err) { next(err); }
});

// POST /api/productos
router.post('/', async (req, res, next) => {
  try {
    const { 
      sku, nombre, descripcion, imagenUrl, 
      stockActual, stockMinimo, 
      precioVenta, costoCompra, tasaImpuesto, 
      categoria,
      // ── NUEVOS CAMPOS ──
      unidadMedida = 'UNIDAD',
      esVentaPorPeso = false,
      precioPorKilo,
      toleranciaPeso
    } = req.body;

    // Validaciones
    if (!nombre?.trim())  throw createValidationError('El nombre es obligatorio', { nombre: 'Campo requerido' });

    const precio = toDecimalSeguro(precioVenta, 0);
    const costo  = toDecimalSeguro(costoCompra, 0);
    const tasa   = toDecimalSeguro(tasaImpuesto, 16);
    const stock  = toDecimalSeguro(stockActual, 0);
    const smin   = toDecimalSeguro(stockMinimo, 5);

    // `isFinite` cubre el caso no numérico: `toDecimalSeguro` devuelve NaN en
    // vez de lanzar, y NaN no cumple las comparaciones (antes daba 500).
    if (!precio.isFinite() || precio.lte(0))   throw createValidationError('El precio debe ser mayor a 0', { precioVenta: 'Debe ser positivo' });
    if (!costo.isFinite() || costo.lt(0))     throw createValidationError('El costo no puede ser negativo', { costoCompra: 'Debe ser no negativo' });
    if (!tasa.isFinite() || tasa.lt(0) || tasa.gt(100)) throw createValidationError('La tasa de impuesto debe estar entre 0 y 100', { tasaImpuesto: 'Rango inválido' });
    if (!stock.isFinite() || stock.lt(0))     throw createValidationError('El stock no puede ser negativo', { stockActual: 'No puede ser negativo' });
    if (!smin.isFinite() || smin.lt(0))      throw createValidationError('El stock mínimo no puede ser negativo', { stockMinimo: 'No puede ser negativo' });

    // ── VALIDACIONES DE UNIDAD DE MEDIDA ──
    if (!UNIDADES_VALIDAS.includes(unidadMedida)) {
      throw createValidationError('Unidad de medida inválida', { 
        unidadMedida: 'Debe ser una unidad válida' 
      });
    }

    // Validar venta por peso
    if (esVentaPorPeso && !['KILOGRAMO', 'GRAMO'].includes(unidadMedida)) {
      throw createValidationError('La venta por peso solo permite unidades de peso', {
        unidadMedida: 'Debe ser KILOGRAMO o GRAMO'
      });
    }

    // Validar precio por kilo si es venta por peso
    if (esVentaPorPeso) {
      const precioKilo = toDecimalSeguro(precioPorKilo, 0);
      if (!precioKilo.isFinite() || precioKilo.lte(0)) {
        throw createValidationError('El precio por kilo debe ser mayor a 0 para venta por peso', {
          precioPorKilo: 'Debe ser positivo'
        });
      }
    }

    // Validar tolerancia de peso (solo si se proporciona)
    if (toleranciaPeso !== undefined && toleranciaPeso !== null && toleranciaPeso !== '') {
      const tolerancia = toDecimalSeguro(toleranciaPeso, 0);
      if (!tolerancia.isFinite() || tolerancia.lt(0) || tolerancia.gt(100)) {
        throw createValidationError('La tolerancia de peso debe estar entre 0 y 100', {
          toleranciaPeso: 'Rango inválido'
        });
      }
    }

    let finalSku = sku?.trim();
    if (!finalSku) {
      // Generar SKU
      const correlativo = await prisma.correlativo.upsert({
        where: { nombre: 'SKU' },
        update: { valor: { increment: 1 } },
        create: { nombre: 'SKU', valor: 1 },
      });
      finalSku = `PROD-${String(correlativo.valor).padStart(5, '0')}`;
    }

    const empresaId = req.user.empresaId || req.user.id;
    const producto = await prisma.producto.create({
      data: {
        sku: finalSku.toUpperCase(),
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        imagenUrl: imagenUrl?.trim() || null,
        // ── NUEVOS CAMPOS ──
        unidadMedida,
        esVentaPorPeso,
        precioPorKilo: esVentaPorPeso ? toDecimalSeguro(precioPorKilo, 0).toFixed(2) : null,
        toleranciaPeso: toleranciaPeso !== undefined && toleranciaPeso !== null && toleranciaPeso !== ''
          ? toDecimalSeguro(toleranciaPeso, 0).toFixed(2)
          : null,
        // ── CAMPOS EXISTENTES ──
        stockActual: stock.toFixed(4),
        stockMinimo: smin.toFixed(4),
        precioVenta: precio.toFixed(2),
        costoCompra: costo.toFixed(2),
        tasaImpuesto: tasa.toFixed(2),
        categoria: categoria?.trim() || 'General',
        empresaId,
      },
    });
    res.status(201).json(producto);
  } catch (err) { next(err); }
});

// PUT /api/productos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const {
      sku, nombre, descripcion, imagenUrl, stockActual, stockMinimo,
      precioVenta, costoCompra, tasaImpuesto, activo, categoria,
      unidadMedida, esVentaPorPeso, precioPorKilo, toleranciaPeso,
    } = req.body;

    if (!sku?.trim())    throw createValidationError('El SKU es obligatorio');
    if (!nombre?.trim()) throw createValidationError('El nombre es obligatorio');

    const precio = toDecimalSeguro(precioVenta, 0);
    const costo  = toDecimalSeguro(costoCompra, 0);
    const tasa   = toDecimalSeguro(tasaImpuesto, 16);
    const stock  = toDecimalSeguro(stockActual, 0);
    const smin   = toDecimalSeguro(stockMinimo, 5);

    if (!precio.isFinite() || precio.lte(0))   throw createValidationError('El precio debe ser mayor a 0');
    if (!costo.isFinite() || costo.lt(0))     throw createValidationError('El costo no puede ser negativo');
    if (!tasa.isFinite() || tasa.lt(0) || tasa.gt(100)) throw createValidationError('La tasa de impuesto debe estar entre 0 y 100');
    if (!stock.isFinite() || !smin.isFinite() || stock.lt(0) || smin.lt(0))       throw createValidationError('El stock no puede ser negativo');

    if (unidadMedida !== undefined && !UNIDADES_VALIDAS.includes(unidadMedida)) {
      throw createValidationError('Unidad de medida inválida', {
        unidadMedida: 'Debe ser una unidad válida',
      });
    }
    if (esVentaPorPeso && !['KILOGRAMO', 'GRAMO'].includes(unidadMedida)) {
      throw createValidationError('La venta por peso solo permite unidades de peso', {
        unidadMedida: 'Debe ser KILOGRAMO o GRAMO',
      });
    }
    if (esVentaPorPeso) {
      const precioKilo = toDecimalSeguro(precioPorKilo, 0);
      if (!precioKilo.isFinite() || precioKilo.lte(0)) {
        throw createValidationError('El precio por kilo debe ser mayor a 0 para venta por peso', {
          precioPorKilo: 'Debe ser positivo',
        });
      }
    }
    if (toleranciaPeso !== undefined && toleranciaPeso !== null && toleranciaPeso !== '') {
      const tolerancia = toDecimalSeguro(toleranciaPeso, 0);
      if (!tolerancia.isFinite() || tolerancia.lt(0) || tolerancia.gt(100)) {
        throw createValidationError('La tolerancia de peso debe estar entre 0 y 100', {
          toleranciaPeso: 'Rango inválido',
        });
      }
    }

    const empresaId = req.user.empresaId || req.user.id;
    const producto = await prisma.producto.updateMany({
      where: { id: req.params.id, empresaId },
      data: {
        sku: sku.trim().toUpperCase(),
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        imagenUrl: imagenUrl?.trim() || null,
        stockActual: stock.toFixed(4),
        stockMinimo: smin.toFixed(4),
        precioVenta: precio.toFixed(2),
        costoCompra: costo.toFixed(2),
        tasaImpuesto: tasa.toFixed(2),
        categoria: categoria?.trim() || 'General',
        activo: activo !== undefined ? Boolean(activo) : undefined,
        unidadMedida,
        esVentaPorPeso: esVentaPorPeso !== undefined ? Boolean(esVentaPorPeso) : undefined,
        precioPorKilo: esVentaPorPeso === undefined && precioPorKilo === undefined
          ? undefined
          : esVentaPorPeso ? toDecimalSeguro(precioPorKilo, 0).toFixed(2) : null,
        toleranciaPeso: esVentaPorPeso === undefined && toleranciaPeso === undefined
          ? undefined
          : toleranciaPeso === undefined || toleranciaPeso === null || toleranciaPeso === ''
            ? null
            : toDecimalSeguro(toleranciaPeso, 0).toFixed(2),
      },
    });
    if (producto.count === 0) {
      throw createBusinessError('Producto no encontrado o no pertenece a tu empresa');
    }
    res.json(await prisma.producto.findFirst({ where: { id: req.params.id, empresaId } }));
  } catch (err) { next(err); }
});

// PATCH /api/productos/:id/stock — Ajuste manual de stock
router.patch('/:id/stock', async (req, res, next) => {
  try {
    const { cantidad, operacion = 'set', unidadMedida } = req.body;
    // NaN como default: omitir la cantidad es un error de validación, no un 0
    // silencioso que podría dejar el stock en cero.
    const qty = toDecimalSeguro(cantidad, NaN);

    if (!qty.isFinite() || qty.lt(0)) throw createValidationError('La cantidad debe ser un número válido no negativo');

    const empresaId = req.user.empresaId || req.user.id;
    const producto = await prisma.producto.findFirstOrThrow({ where: { id: req.params.id, empresaId } });

    // Normalizar a la unidad base del producto (kg para venta por peso)
    let qtyBase;
    try {
      qtyBase = aUnidadBase(qty, unidadMedida || producto.unidadMedida, producto);
    } catch (e) {
      throw createValidationError(e.message);
    }

    let nuevoStock;
    if (operacion === 'add')      nuevoStock = new Decimal(producto.stockActual.toString()).plus(qtyBase);
    else if (operacion === 'sub') nuevoStock = new Decimal(producto.stockActual.toString()).minus(qtyBase);
    else                          nuevoStock = qtyBase; // 'set'

    if (nuevoStock.lt(0)) throw createBusinessError('El stock resultante no puede ser negativo');

    const actualizado = await prisma.producto.updateMany({
      where: { id: req.params.id, empresaId },
      data: { stockActual: nuevoStock.toFixed(4) },
    });
    if (actualizado.count === 0) {
      throw createBusinessError('Producto no encontrado o no pertenece a tu empresa');
    }
    res.json(await prisma.producto.findUnique({ where: { id: req.params.id } }));
  } catch (err) { next(err); }
});

// DELETE /api/productos/:id — Soft delete (desactivar)
router.delete('/:id', async (req, res, next) => {
  try {
    const empresaId = req.user.empresaId || req.user.id;
    const resultado = await prisma.producto.updateMany({
      where: { id: req.params.id, empresaId },
      data: { activo: false },
    });
    if (resultado.count === 0) {
      throw createBusinessError('Producto no encontrado o no pertenece a tu empresa');
    }
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
