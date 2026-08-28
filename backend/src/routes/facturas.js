const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;
const facturaTenantFilter = (empresaId) => ({
  OR: [
    { usuarioId: empresaId },
    { usuario: { empresaId } }
  ]
});

// GET /api/facturas
router.get('/', async (req, res, next) => {
  try {
    const { estado, clienteId, usuarioId, q, page = 1, limit = 25, vencidas } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const hoy  = new Date();

    const empresaId = getEmpresaId(req);
    const where = { ...facturaTenantFilter(empresaId) };

    if (estado)    where.estado    = estado;
    if (clienteId) where.clienteId = clienteId;
    if (usuarioId) where.usuarioId = usuarioId;
    if (vencidas === 'true') {
      where.estado            = { in: ['PENDING', 'PARTIALLY_PAID'] };
      where.fechaVencimiento  = { lt: hoy.toISOString() };
    }
    if (q) {
      where.AND = [
        facturaTenantFilter(empresaId),
        {
          OR: [
            { cliente: { razonSocial: { contains: q, mode: 'insensitive' } } },
            { cliente: { rifCedula:   { contains: q, mode: 'insensitive' } } },
          ]
        }
      ];
      delete where.OR;
    }

    const [facturas, total] = await Promise.all([
      prisma.factura.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { fechaEmision: 'desc' },
        include: {
          cliente: true,
          usuario: { select: { id: true, username: true, nombre: true, rol: true } },
          _count: { select: { items: true } },
          pagos: { select: { monto: true } },
        },
      }),
      prisma.factura.count({ where }),
    ]);

    // Agregar campos derivados (estaVencida y saldoPendiente)
    const facturasConEstado = facturas.map(f => {
      const totalPagado = f.pagos.reduce((acc, p) => acc.add(new Decimal(p.monto.toString())), new Decimal(0));
      const saldoPendiente = new Decimal(f.total.toString()).sub(totalPagado);
      
      return {
        ...f,
        estaVencida: ['PENDING', 'PARTIALLY_PAID'].includes(f.estado) && new Date(f.fechaVencimiento) < hoy,
        saldoPendiente: saldoPendiente.toNumber(),
      };
    });

    res.json({ data: facturasConEstado, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
});

// GET /api/facturas/:id
router.get('/:id', async (req, res, next) => {
  try {
    const empresaId = getEmpresaId(req);
    const factura = await prisma.factura.findFirstOrThrow({
      where: {
        id: req.params.id,
        ...facturaTenantFilter(empresaId),
      },
      include: {
        cliente: true,
        usuario: { select: { id: true, username: true, nombre: true, rol: true } },
        items: {
          include: { producto: { select: { id: true, sku: true, nombre: true, stockActual: true } } },
        },
        pagos: { orderBy: { fechaPago: 'asc' } },
      },
    });

    // Calcular balance pendiente
    const totalPagado = factura.pagos.reduce(
      (acc, p) => acc.add(new Decimal(p.monto.toString())),
      new Decimal(0)
    );
    const balancePendiente = new Decimal(factura.total.toString()).sub(totalPagado);
    const hoy = new Date();

    res.json({
      ...factura,
      totalPagado: totalPagado.toFixed(2),
      balancePendiente: balancePendiente.toFixed(2),
      estaVencida: ['PENDING', 'PARTIALLY_PAID'].includes(factura.estado) && new Date(factura.fechaVencimiento) < hoy,
    });
  } catch (err) { next(err); }
});

// POST /api/facturas — Emisión de factura (transacción atómica)
router.post('/', async (req, res, next) => {
  try {
    const { clienteId, items, fechaVencimiento, observaciones, metodoPago, referenciaTransaccion, cuotas, moneda = 'USD', tasaCambio = 1 } = req.body;
    const empresaId = req.user?.empresaId || req.user?.id;

    const tasaFacturacion = new Decimal(tasaCambio);

    // ── Validaciones básicas ──────────────────────────────────────────────────
    if (!clienteId) throw createValidationError('El cliente es obligatorio', { clienteId: 'Seleccione un cliente' });
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createValidationError('La factura debe tener al menos un ítem');
    }
    if (!fechaVencimiento) throw createValidationError('La fecha de vencimiento es obligatoria');

    const fVencimiento = new Date(fechaVencimiento);
    if (isNaN(fVencimiento.getTime())) throw createValidationError('La fecha de vencimiento es inválida');

    const cuotasTotales = [2, 3, 4].includes(parseInt(cuotas)) ? parseInt(cuotas) : 1;
    const esFinanciada = cuotasTotales > 1;

    if (metodoPago && !['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PAYMENT'].includes(metodoPago)) {
      throw createValidationError('Método de pago inválido');
    }
    if (metodoPago && metodoPago !== 'CASH' && !referenciaTransaccion) {
      throw createValidationError('La referencia es obligatoria para pagos electrónicos');
    }
    // Financiada no puede ser pagada de contado simultáneamente
    if (esFinanciada && metodoPago) {
      throw createValidationError('Una factura financiada no puede marcarse como pagada al contado en el mismo acto');
    }

    // ── Cargar y validar productos ────────────────────────────────────────────
    const productoIds = [...new Set(items.map(i => i.productoId))];
    const productosDB = await prisma.producto.findMany({
      where: { id: { in: productoIds }, activo: true, empresaId },
    });

    const productoMap = Object.fromEntries(productosDB.map(p => [p.id, p]));

    // Validar existencia y stock
    for (const item of items) {
      if (!item.productoId) throw createValidationError('Todos los ítems deben tener un producto');
      if (!item.cantidad || parseInt(item.cantidad) <= 0) {
        throw createValidationError(`La cantidad debe ser mayor a 0 para todos los ítems`);
      }

      const producto = productoMap[item.productoId];
      if (!producto) {
        throw createValidationError(`El producto con ID "${item.productoId}" no existe o está inactivo`);
      }
      if (producto.stockActual < parseInt(item.cantidad)) {
        throw createBusinessError(
          `Stock insuficiente para "${producto.nombre}": disponible ${producto.stockActual}, solicitado ${item.cantidad}`
        );
      }
    }

    // ── Calcular totales con Decimal.js ───────────────────────────────────────
    const itemsCalculados = items.map(item => {
      const producto  = productoMap[item.productoId];
      // Si la moneda es VES, se multiplica por la tasa. Si es USD, la tasa suele ser 1.
      const precioBase  = new Decimal(producto.precioVenta.toString());
      const precio      = precioBase.mul(tasaFacturacion);
      const cantidad  = new Decimal(parseInt(item.cantidad));
      const tasa      = new Decimal(producto.tasaImpuesto.toString()).div(100);

      const subtotalLinea = precio.mul(cantidad);
      const impuestoLinea = subtotalLinea.mul(tasa);
      const totalLinea    = subtotalLinea.add(impuestoLinea);

      return {
        productoId:              producto.id,
        descripcionHistorica:    producto.nombre,
        cantidad:                parseInt(item.cantidad),
        precioUnitarioHistorico: precio.toFixed(2),
        tasaImpuestoAplicada:    producto.tasaImpuesto.toString(),
        subtotalLinea:           subtotalLinea.toFixed(2),
        impuestoLinea:           impuestoLinea.toFixed(2),
        totalLinea:              totalLinea.toFixed(2),
        _productoId:             producto.id,
        _cantidad:               parseInt(item.cantidad),
      };
    });

    const subtotalTotal    = itemsCalculados.reduce((acc, i) => acc.add(new Decimal(i.subtotalLinea)), new Decimal(0));
    const impuestoTotalSum = itemsCalculados.reduce((acc, i) => acc.add(new Decimal(i.impuestoLinea)), new Decimal(0));
    const totalFactura     = subtotalTotal.add(impuestoTotalSum);

    // ── Transacción atómica ───────────────────────────────────────────────────
    const factura = await prisma.$transaction(async (tx) => {
      const ultimaFactura = await tx.factura.findFirst({
        orderBy: { numeroFactura: 'desc' },
        select: { numeroFactura: true },
      });
      const numeroFactura = (ultimaFactura?.numeroFactura || 0) + 1;

      // 1. Crear factura con ítems
      let estadoInicial = 'PENDING';
      if (metodoPago) estadoInicial = 'PAID';
      else if (esFinanciada) estadoInicial = 'PENDING'; // primer cuota pendiente

      const nuevaFactura = await tx.factura.create({
        data: {
          numeroFactura,
          clienteId,
          usuarioId:     req.user?.id || null, // Caja/Operador que emite la venta
          fechaVencimiento: fVencimiento.toISOString(),
          subtotal:      subtotalTotal.toFixed(2),
          impuestoTotal: impuestoTotalSum.toFixed(2),
          total:         totalFactura.toFixed(2),
          estado:        estadoInicial,
          moneda:        moneda,
          tasaCambio:    tasaFacturacion.toNumber(),
          cuotasTotales: cuotasTotales,
          observaciones: observaciones?.trim() || null,
          items: {
            create: itemsCalculados.map(({ _productoId, _cantidad, ...item }) => item),
          },
        },
        include: {
          cliente: true,
          usuario: { select: { id: true, username: true, nombre: true, rol: true } },
          items:   true,
          pagos:   true,
        },
      });

      // 2. Crear el registro de pago inmediato si aplica (CONTADO)
      if (metodoPago) {
        await tx.pago.create({
          data: {
            facturaId: nuevaFactura.id,
            monto: totalFactura.toFixed(2),
            metodoPago,
            referenciaTransaccion: metodoPago === 'CASH' ? null : referenciaTransaccion,
            notas: 'Pago de contado al momento de emisión',
          }
        });
      }

      // 3. Decrementar stock de cada producto
      for (const item of itemsCalculados) {
        const updated = await tx.producto.updateMany({
          where: { id: item._productoId, empresaId },
          data:  { stockActual: { decrement: item._cantidad } },
        });
        if (updated.count === 0) {
          throw new Error('No se pudo actualizar el stock del producto porque no pertenece a tu empresa');
        }
      }

      return nuevaFactura;
    });

    // Calcular información de cuotas para la respuesta
    const montoCuota = esFinanciada
      ? totalFactura.div(cuotasTotales).toDecimalPlaces(2).toFixed(2)
      : null;

    res.status(201).json({
      ...factura,
      totalPagado: metodoPago ? totalFactura.toFixed(2) : '0.00',
      balancePendiente: metodoPago ? '0.00' : totalFactura.toFixed(2),
      cuotasTotales,
      montoCuota,
    });
  } catch (err) { next(err); }
});

// PATCH /api/facturas/:id/anular — Anular factura (requiere código para rol CAJA)
router.patch('/:id/anular', async (req, res, next) => {
  try {
    const { codigoAnulacion, motivo } = req.body;
    const userRole = req.user?.rol;

    if (userRole === 'INVENTARIO') {
      return res.status(403).json({ error: 'Acceso denegado: El personal de inventario no tiene permiso para anular facturas.' });
    }

    // Para el rol CAJA, se requiere código de anulación obligatorio
    if (userRole === 'CAJA') {
      const systemVoidCode = process.env.VOID_CODE || '1234';
      if (!codigoAnulacion || codigoAnulacion.trim() !== systemVoidCode) {
        return res.status(403).json({
          error: 'Código de anulación inválido',
          message: 'Los usuarios de Caja requieren el código de autorización del supervisor/empresa para anular una venta.'
        });
      }
    }

    const empresaId = getEmpresaId(req);
    const factura = await prisma.factura.findFirstOrThrow({
      where: {
        id: req.params.id,
        ...facturaTenantFilter(empresaId),
      },
      include: { items: true, pagos: true },
    });

    if (factura.estado === 'VOIDED') {
      return res.status(400).json({ error: 'La factura ya está anulada' });
    }

    // Transacción: anular factura + restaurar stock
    const anulada = await prisma.$transaction(async (tx) => {
      const updated = await tx.factura.update({
        where: { id: req.params.id },
        data: {
          estado: 'VOIDED',
          anuladoPor: req.user?.nombre || req.user?.username || 'Anónimo',
          motivoAnulacion: motivo?.trim() || 'Anulación solicitada por la caja',
        },
        include: {
          cliente: true,
          usuario: { select: { id: true, username: true, nombre: true } },
          items: true,
        },
      });

      // Restaurar stock de los productos
      for (const item of factura.items) {
        if (item.productoId) {
          const updated = await tx.producto.updateMany({
            where: { id: item.productoId, empresaId },
            data: { stockActual: { increment: item.cantidad } },
          });
          if (updated.count === 0) {
            throw new Error('No se pudo restaurar el stock del producto porque no pertenece a tu empresa');
          }
        }
      }

      return updated;
    });

    res.json(anulada);
  } catch (err) { next(err); }
});

module.exports = router;
