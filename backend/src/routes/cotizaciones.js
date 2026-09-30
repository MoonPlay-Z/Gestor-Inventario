const express = require('express');
const prisma = require('../db/prisma');
const Decimal = require('decimal.js').Decimal;
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');

const router = express.Router();

// SUPER_ADMIN no genera cotizaciones
router.use(requireRole('EMPRESA', 'CAJA'));

const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;
// empresaRefId ya viene en req.user desde authMiddleware (no necesita query adicional)
const getEmpresaRefId = (req) => req.user?.empresaRefId || null;

// 1. Obtener todas las cotizaciones (con paginación)
router.get('/', async (req, res, next) => {
  try {
    const { q, estado } = req.query;
    const { skip, take, page, limit } = paginate(req.query, { limit: 25 });
    const empresaId = getEmpresaId(req);
    const where = { usuario: { empresaId } };
    if (estado) where.estado = estado;
    if (q) {
      where.AND = [
        { usuario: { empresaId } },
        {
          OR: [
            { cliente: { razonSocial: { contains: q, mode: 'insensitive' } } },
            { cliente: { rifCedula: { contains: q, mode: 'insensitive' } } }
          ]
        }
      ];
    }

    const [cotizaciones, total] = await Promise.all([
      prisma.cotizacion.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          numero: true,
          clienteId: true,
          usuarioId: true,
          empresaId: true,
          fechaEmision: true,
          fechaValidez: true,
          subtotal: true,
          impuestoTotal: true,
          total: true,
          moneda: true,
          estado: true,
          cliente: { select: { id: true, razonSocial: true, rifCedula: true } },
          _count: { select: { items: true } },
        },
        orderBy: { fechaEmision: 'desc' }
      }),
      prisma.cotizacion.count({ where }),
    ]);

    res.json(paginatedResponse(cotizaciones, total, page, limit));
  } catch (err) {
    next(err);
  }
});

// 2. Obtener una cotización por ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const empresaId = getEmpresaId(req);
    const cotizacion = await prisma.cotizacion.findFirst({
      where: { id, usuario: { empresaId } },
      select: {
        id: true,
        numero: true,
        clienteId: true,
        usuarioId: true,
        empresaId: true,
        fechaEmision: true,
        fechaValidez: true,
        subtotal: true,
        impuestoTotal: true,
        total: true,
        moneda: true,
        estado: true,
        cliente: { select: { id: true, razonSocial: true, rifCedula: true } },
        items: {
          select: {
            id: true,
            productoId: true,
            descripcion: true,
            cantidad: true,
            precioUnitario: true,
            totalLinea: true,
            producto: { select: { id: true, sku: true, nombre: true } },
          },
        },
      }
    });

    if (!cotizacion) throw createValidationError('Cotización no encontrada');
    res.json(cotizacion);
  } catch (err) {
    next(err);
  }
});

// 3. Crear Cotización
router.post('/', async (req, res, next) => {
  try {
    const { clienteId, items, validezDias = 15, moneda = 'USD' } = req.body;
    const empresaId = req.user.empresaId || req.user.id;
    const empresaRefId = getEmpresaRefId(req);

    if (!clienteId) throw createValidationError('El cliente es obligatorio');
    if (!items || items.length === 0) throw createValidationError('Debe agregar al menos un producto');

    const fechaEmision = new Date();
    const fechaValidez = new Date(fechaEmision);
    fechaValidez.setDate(fechaValidez.getDate() + parseInt(validezDias));

    // ── Cargar todos los productos en una sola query (evita N+1) ────────────────
    const productoIds = [...new Set(items.filter(i => i.productoId).map(i => i.productoId))];
    const productosDB = productoIds.length > 0
      ? await prisma.producto.findMany({
          where: { id: { in: productoIds }, empresaId, activo: true },
          select: { id: true, nombre: true, precioVenta: true, tasaImpuesto: true },
        })
      : [];
    const productoMap = new Map(productosDB.map(p => [p.id, p]));

    let subtotalTotal = new Decimal(0);
    let impuestoTotal = new Decimal(0);
    const itemsData = [];

    for (const item of items) {
      if (!item.productoId && !item.descripcion) throw createValidationError('Cada ítem debe tener producto o descripción');

      let nombre = item.descripcion;
      let precioU = new Decimal(item.precio || 0);
      let tasa = new Decimal(item.tasa || 16);

      if (item.productoId) {
        const prod = productoMap.get(item.productoId);
        if (!prod) throw createValidationError(`Producto con ID ${item.productoId} no encontrado`);
        nombre = prod.nombre;
        precioU = new Decimal(prod.precioVenta.toString());
        tasa = new Decimal(prod.tasaImpuesto.toString());
      }

      const cantidad = parseInt(item.cantidad) || 1;
      const subL = precioU.mul(cantidad);
      const impL = subL.mul(tasa).div(100);
      const totL = subL.add(impL);

      subtotalTotal = subtotalTotal.add(subL);
      impuestoTotal = impuestoTotal.add(impL);

      itemsData.push({
        productoId: item.productoId || null,
        descripcion: nombre,
        cantidad: cantidad,
        precioUnitario: precioU.toFixed(2),
        totalLinea: totL.toFixed(2)
      });
    }

    const ultimaCotizacion = await prisma.cotizacion.findFirst({
      orderBy: { numero: 'desc' },
      select: { numero: true },
    });
    const numero = (ultimaCotizacion?.numero || 0) + 1;

    const cotizacion = await prisma.cotizacion.create({
      data: {
        numero,
        clienteId,
        usuarioId: req.user?.id || null,
        empresaId: empresaRefId,
        fechaEmision: fechaEmision.toISOString(),
        fechaValidez: fechaValidez.toISOString(),
        moneda,
        subtotal: subtotalTotal.toFixed(2),
        impuestoTotal: impuestoTotal.toFixed(2),
        total: subtotalTotal.add(impuestoTotal).toFixed(2),
        items: {
          create: itemsData
        }
      },
      include: { items: true, cliente: true }
    });

    res.status(201).json(cotizacion);
  } catch (err) {
    next(err);
  }
});

// 4. Convertir Cotización a Factura
router.post('/:id/convert', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { metodoPago, referenciaTransaccion } = req.body;

    const empresaId = getEmpresaId(req);
    const empresaRefId = getEmpresaRefId(req);
    const cotizacion = await prisma.cotizacion.findFirst({
      where: { id, usuario: { empresaId } },
      select: {
        id: true,
        numero: true,
        clienteId: true,
        usuarioId: true,
        empresaId: true,
        fechaEmision: true,
        fechaValidez: true,
        subtotal: true,
        impuestoTotal: true,
        total: true,
        moneda: true,
        estado: true,
        cliente: { select: { id: true, razonSocial: true, rifCedula: true } },
        items: {
          select: {
            id: true,
            productoId: true,
            descripcion: true,
            cantidad: true,
            precioUnitario: true,
            totalLinea: true,
          },
        },
      },
    });

    if (!cotizacion) throw createValidationError('Cotización no encontrada');
    if (cotizacion.estado === 'ACCEPTED') throw createBusinessError('La cotización ya fue convertida a factura');

    // Validar productos y stock de la cotización en una sola query (evita N+1)
    const itemsConProducto = cotizacion.items.filter(i => i.productoId);
    if (itemsConProducto.length > 0) {
      const productoIds = [...new Set(itemsConProducto.map(i => i.productoId))];
      const productosDB = await prisma.producto.findMany({
        where: { id: { in: productoIds }, empresaId, activo: true },
        select: { id: true, nombre: true, stockActual: true },
      });
      const productoMap = new Map(productosDB.map(p => [p.id, p]));

      for (const item of itemsConProducto) {
        const prod = productoMap.get(item.productoId);
        if (!prod) throw createBusinessError(`El producto "${item.descripcion}" ya no existe`);
        if (prod.stockActual < item.cantidad) {
          throw createBusinessError(`Stock insuficiente para "${prod.nombre}": disponible ${prod.stockActual}, requerido ${item.cantidad}`);
        }
      }
    }

    // Fecha de vencimiento a 15 días si no se especifica
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);

    // Crear la factura dentro de una transacción atómica
    const factura = await prisma.$transaction(async (tx) => {
      const ultimaFactura = await tx.factura.findFirst({
        orderBy: { numeroFactura: 'desc' },
        select: { numeroFactura: true },
      });
      const nuevaFactura = await tx.factura.create({
        data: {
          numeroFactura: (ultimaFactura?.numeroFactura || 0) + 1,
          clienteId: cotizacion.clienteId,
          usuarioId: req.user?.id || null,
          empresaId: empresaRefId,
          fechaVencimiento: fechaVencimiento.toISOString(),
          subtotal: cotizacion.subtotal,
          impuestoTotal: cotizacion.impuestoTotal,
          total: cotizacion.total,
          estado: metodoPago ? 'PAID' : 'PENDING',
          moneda: cotizacion.moneda,
          observaciones: `Convertida desde Cotización #${String(cotizacion.numero).padStart(5, '0')}`,
          items: {
            create: cotizacion.items.map(item => ({
              productoId: item.productoId,
              descripcionHistorica: item.descripcion,
              cantidad: item.cantidad,
              precioUnitarioHistorico: item.precioUnitario,
              tasaImpuestoAplicada: 16.00,
              subtotalLinea: item.totalLinea,
              impuestoLinea: 0,
              totalLinea: item.totalLinea
            }))
          }
        },
        select: {
          id: true,
          numeroFactura: true,
          clienteId: true,
          usuarioId: true,
          empresaId: true,
          fechaEmision: true,
          fechaVencimiento: true,
          subtotal: true,
          impuestoTotal: true,
          total: true,
          estado: true,
          moneda: true,
          observaciones: true,
          cliente: { select: { id: true, razonSocial: true, rifCedula: true } },
          items: {
            select: {
              id: true,
              productoId: true,
              descripcionHistorica: true,
              cantidad: true,
              precioUnitarioHistorico: true,
              tasaImpuestoAplicada: true,
              subtotalLinea: true,
              impuestoLinea: true,
              totalLinea: true,
            },
          },
        }
      });

      // Crear pago si se especificó método de pago
      if (metodoPago) {
        await tx.pago.create({
          data: {
            facturaId: nuevaFactura.id,
            monto: cotizacion.total,
            metodoPago,
            referenciaTransaccion: metodoPago === 'CASH' ? null : referenciaTransaccion,
            notas: 'Pago recibido al convertir cotización en venta'
          }
        });
      }

      // Decrementar stock
      for (const item of cotizacion.items) {
        if (item.productoId) {
          await tx.producto.update({
            where: { id: item.productoId },
            data: { stockActual: { decrement: item.cantidad } }
          });
        }
      }

      // Marcar cotización como ACEPTADA
      await tx.cotizacion.update({
        where: { id: cotizacion.id },
        data: { estado: 'ACCEPTED' },
        select: { id: true, estado: true }
      });

      return nuevaFactura;
    });

    res.json({ message: 'Cotización convertida a factura con éxito', factura });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
