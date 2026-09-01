const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');

// GET /api/productos
router.get('/', async (req, res, next) => {
  try {
    const { q, soloActivos = 'true', stockBajo, page = 1, limit, limite } = req.query;
    const pageNumber = parseInt(page) || 1;
    const take = parseInt(limit ?? limite) || 25;
    const skip = (pageNumber - 1) * take;
    const empresaId = req.user.empresaId || req.user.id;

    const where = { empresaId };
    if (soloActivos === 'true') where.activo = true;
    if (q) {
      const terms = q.split(' ').filter(t => t.length > 0);
      where.AND = terms.map(term => ({
        OR: [
          { sku: { contains: term, mode: 'insensitive' } },
          { nombre: { contains: term, mode: 'insensitive' } },
          { descripcion: { contains: term, mode: 'insensitive' } },
          { categoria: { contains: term, mode: 'insensitive' } },
        ]
      }));
    }

    let [productos, total] = await Promise.all([
      prisma.producto.findMany({
        where,
        skip,
        take,
        orderBy: { nombre: 'asc' },
      }),
      prisma.producto.count({ where }),
    ]);

    // Agregar campo derivado stockBajoMinimo
    productos = productos.map(p => ({
      ...p,
      stockBajoMinimo: p.stockActual <= p.stockMinimo,
    }));

    if (stockBajo === 'true') {
      productos = productos.filter(p => p.stockBajoMinimo);
      total = productos.length;
    }

    res.json({ data: productos, total, page: parseInt(page), limit: take });
  } catch (err) { next(err); }
});

// GET /api/productos/lookup/:codigo — Visor de Precios / Consulta Rápida
router.get('/lookup/:codigo', async (req, res, next) => {
  try {
    const rawCodigo = (req.params.codigo || '').trim();
    if (!rawCodigo) throw createValidationError('Código requerido');

    const isSuperAdmin = req.user.rol === 'SUPER_ADMIN';
    const empresaId = req.user.empresaRefId || req.user.empresaId || req.user.id;

    const baseWhere = { activo: true };
    if (!isSuperAdmin && empresaId) {
      baseWhere.empresaId = empresaId;
    }

    // 1. Buscar por SKU exacto o ID exacto
    let producto = await prisma.producto.findFirst({
      where: {
        ...baseWhere,
        OR: [
          { sku: { equals: rawCodigo, mode: 'insensitive' } },
          { id: rawCodigo }
        ]
      }
    });

    // 2. Si no hay coincidencia exacta, buscar por coincidencia parcial en SKU o Nombre
    if (!producto) {
      producto = await prisma.producto.findFirst({
        where: {
          ...baseWhere,
          OR: [
            { sku: { contains: rawCodigo, mode: 'insensitive' } },
            { nombre: { contains: rawCodigo, mode: 'insensitive' } },
            { descripcion: { contains: rawCodigo, mode: 'insensitive' } },
            { categoria: { contains: rawCodigo, mode: 'insensitive' } }
          ]
        }
      });
    }

    // 3. Si no hay coincidencia y el usuario no es superadmin, intentar fallback buscando en la BD por si el producto pertenecía a su empresa padre
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

    let tasaBcv = 36.5;
    try {
      const configRoute = require('./config');
      if (configRoute.getSystemConfig) {
        tasaBcv = configRoute.getSystemConfig().moneda?.tasaDolar || 36.5;
      }
    } catch (_) {}

    const precioUsd = Number(producto.precioVenta);
    const precioVes = precioUsd * tasaBcv;

    res.json({
      ...producto,
      precioUsd,
      precioVes,
      tasaBcv,
      stockBajoMinimo: producto.stockActual <= producto.stockMinimo
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

// GET /api/productos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const empresaId = req.user.empresaId || req.user.id;
    const producto = await prisma.producto.findFirstOrThrow({
      where: { id: req.params.id, empresaId }
    });
    res.json({ ...producto, stockBajoMinimo: producto.stockActual <= producto.stockMinimo });
  } catch (err) { next(err); }
});

// POST /api/productos
router.post('/', async (req, res, next) => {
  try {
    const { sku, nombre, descripcion, imagenUrl, stockActual, stockMinimo, precioVenta, costoCompra, tasaImpuesto, categoria } = req.body;

    // Validaciones
    if (!nombre?.trim())  throw createValidationError('El nombre es obligatorio', { nombre: 'Campo requerido' });

    const precio = new Decimal(precioVenta ?? 0);
    const costo  = new Decimal(costoCompra ?? 0);
    const tasa   = new Decimal(tasaImpuesto ?? 16);
    const stock  = parseInt(stockActual ?? 0);
    const smin   = parseInt(stockMinimo ?? 5);

    if (precio.lte(0))   throw createValidationError('El precio debe ser mayor a 0', { precioVenta: 'Debe ser positivo' });
    if (costo.lt(0))     throw createValidationError('El costo no puede ser negativo', { costoCompra: 'Debe ser no negativo' });
    if (tasa.lt(0) || tasa.gt(100)) throw createValidationError('La tasa de impuesto debe estar entre 0 y 100', { tasaImpuesto: 'Rango inválido' });
    if (stock < 0)       throw createValidationError('El stock no puede ser negativo', { stockActual: 'No puede ser negativo' });
    if (smin < 0)        throw createValidationError('El stock mínimo no puede ser negativo', { stockMinimo: 'No puede ser negativo' });

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
        stockActual: stock,
        stockMinimo: smin,
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
    const { sku, nombre, descripcion, imagenUrl, stockActual, stockMinimo, precioVenta, costoCompra, tasaImpuesto, activo, categoria } = req.body;

    if (!sku?.trim())    throw createValidationError('El SKU es obligatorio');
    if (!nombre?.trim()) throw createValidationError('El nombre es obligatorio');

    const precio = new Decimal(precioVenta ?? 0);
    const costo  = new Decimal(costoCompra ?? 0);
    const tasa   = new Decimal(tasaImpuesto ?? 16);
    const stock  = parseInt(stockActual ?? 0);
    const smin   = parseInt(stockMinimo ?? 5);

    if (precio.lte(0))   throw createValidationError('El precio debe ser mayor a 0');
    if (costo.lt(0))     throw createValidationError('El costo no puede ser negativo');
    if (tasa.lt(0) || tasa.gt(100)) throw createValidationError('La tasa de impuesto debe estar entre 0 y 100');
    if (stock < 0)       throw createValidationError('El stock no puede ser negativo');

    const empresaId = req.user.empresaId || req.user.id;
    const producto = await prisma.producto.updateMany({
      where: { id: req.params.id, empresaId },
      data: {
        sku: sku.trim().toUpperCase(),
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        imagenUrl: imagenUrl?.trim() || null,
        stockActual: stock,
        stockMinimo: smin,
        precioVenta: precio.toFixed(2),
        costoCompra: costo.toFixed(2),
        tasaImpuesto: tasa.toFixed(2),
        categoria: categoria?.trim() || 'General',
        activo: activo !== undefined ? Boolean(activo) : undefined,
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
    const { cantidad, operacion = 'set' } = req.body;
    const qty = parseInt(cantidad);

    if (isNaN(qty)) throw createValidationError('La cantidad debe ser un número entero');

    const empresaId = req.user.empresaId || req.user.id;
    const producto = await prisma.producto.findFirstOrThrow({ where: { id: req.params.id, empresaId } });

    let nuevoStock;
    if (operacion === 'add')      nuevoStock = producto.stockActual + qty;
    else if (operacion === 'sub') nuevoStock = producto.stockActual - qty;
    else                          nuevoStock = qty; // 'set'

    if (nuevoStock < 0) throw createBusinessError('El stock resultante no puede ser negativo');

    const actualizado = await prisma.producto.updateMany({
      where: { id: req.params.id, empresaId },
      data: { stockActual: nuevoStock },
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
