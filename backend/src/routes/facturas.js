const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { invalidarCacheVentas } = require('../services/reportesService');
const { requireRole } = require('../middleware/auth');
const { obtenerSiguienteNumeroFactura } = require('../utils/numeracionFacturas');
const { MONEDAS_PAGO, convertirMontoMoneda, normalizarPagoAFactura } = require('../utils/paymentCurrency');

// SUPER_ADMIN no genera facturas
router.use(requireRole('EMPRESA', 'CAJA'));

const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;
// empresaRefId ya viene en req.user desde authMiddleware (no necesita query adicional)
const getEmpresaRefId = (req) => req.user?.empresaRefId || null;
const facturaTenantFilter = (empresaId) => ({
  OR: [
    { usuarioId: empresaId },
    { usuario: { empresaId } }
  ]
});

// GET /api/facturas
router.get('/', async (req, res, next) => {
  try {
    const { estado, estados, clienteId, usuarioId, q, page = 1, limit = 25, vencidas, desde, hasta } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const hoy  = new Date();

    const empresaId = getEmpresaId(req);
    const where = req.user.rol === 'CAJA'
      ? { usuarioId: req.user.id }
      : { ...facturaTenantFilter(empresaId) };

    if (estados) {
      const estadosFiltro = [...new Set(estados.split(',').map(valor => valor.trim()).filter(Boolean))];
      const estadosValidos = ['PENDING', 'PAID', 'PARTIALLY_PAID', 'VOIDED'];
      if (estadosFiltro.length === 0 || estadosFiltro.some(valor => !estadosValidos.includes(valor))) {
        throw createValidationError('El filtro de estados de factura no es válido');
      }
      where.estado = estadosFiltro.length === 1 ? estadosFiltro[0] : { in: estadosFiltro };
    } else if (estado) {
      where.estado = estado;
    }
    if (clienteId) where.clienteId = clienteId;
    if (usuarioId) where.usuarioId = usuarioId;
    if (vencidas === 'true') {
      where.estado            = { in: ['PENDING', 'PARTIALLY_PAID'] };
      where.fechaVencimiento  = { lt: hoy.toISOString() };
    }
    if (desde || hasta) {
      const d = desde ? new Date(desde) : null;
      const h = hasta ? new Date(hasta) : null;
      if ((desde && isNaN(d)) || (hasta && isNaN(h))) {
        return res.status(400).json({ error: 'Parámetros de fecha inválidos', message: 'desde/hasta deben ser fechas ISO válidas' });
      }
      where.fechaEmision = {};
      if (d) where.fechaEmision.gte = d;
      if (h) where.fechaEmision.lte = h;
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
        },
      }),
      prisma.factura.count({ where }),
    ]);

    const facturaIds = facturas.map(f => f.id);
    const pagos = facturaIds.length > 0
      ? await prisma.pago.findMany({
          where: { facturaId: { in: facturaIds } },
          select: { facturaId: true, monto: true, monedaPago: true, factura: { select: { moneda: true, tasaCambio: true } } },
        })
      : [];
    const pagosMap = new Map();
    for (const pago of pagos) {
      const pagado = pagosMap.get(pago.facturaId) || new Decimal(0);
      pagosMap.set(pago.facturaId, pagado.add(normalizarPagoAFactura(pago, pago.factura)));
    }

    // Agregar campos derivados (estaVencida y saldoPendiente)
    const facturasConEstado = facturas.map(f => {
      const totalPagado = pagosMap.get(f.id) || new Decimal(0);
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
        ...(req.user.rol === 'CAJA'
          ? { usuarioId: req.user.id }
          : facturaTenantFilter(empresaId)),
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
        tasaCambio: true,
        cuotasTotales: true,
        observaciones: true,
        anuladoPor: true,
        motivoAnulacion: true,
        createdAt: true,
        updatedAt: true,
        cliente: { select: { id: true, razonSocial: true, rifCedula: true, direccion: true, telefono: true, correo: true } },
        usuario: { select: { id: true, username: true, nombre: true, rol: true } },
        items: {
          select: {
            id: true,
            productoId: true,
            descripcionHistorica: true,
            unidadMedida: true,
            cantidad: true,
            precioUnitarioHistorico: true,
            tasaImpuestoAplicada: true,
            subtotalLinea: true,
            impuestoLinea: true,
            totalLinea: true,
            producto: { select: { id: true, sku: true, nombre: true, stockActual: true } },
          },
        },
        pagos: {
          select: {
            id: true,
            monto: true,
            monedaPago: true,
            metodoPago: true,
            referenciaTransaccion: true,
            fechaPago: true,
            notas: true,
          },
          orderBy: { fechaPago: 'asc' },
        },
      },
    });

    // Calcular balance pendiente
    const totalPagado = factura.pagos.reduce(
      (acc, p) => acc.add(normalizarPagoAFactura(p, factura)),
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
    const {
      clienteId, items, fechaVencimiento, observaciones, metodoPago,
      referenciaTransaccion, cuotas, moneda = 'USD', tasaCambio,
      monedaPago = 'USD',
    } = req.body;
    const empresaId = req.user?.empresaId || req.user?.id;
    const empresaRefId = getEmpresaRefId(req);

    // Una factura en VES sin tasa de cambio explícita quedaría normalizada incorrectamente a USD
    if (moneda === 'VES' && (tasaCambio === undefined || tasaCambio === null || tasaCambio === '')) {
      throw createValidationError('La tasa de cambio es obligatoria para facturas en VES', { tasaCambio: 'Ingrese la tasa' });
    }
    const tasaFacturacion = new Decimal(tasaCambio ?? 1);
    if (!tasaFacturacion.isFinite() || tasaFacturacion.lte(0)) {
      throw createValidationError('La tasa de cambio debe ser mayor a cero');
    }
    if (!['USD', 'VES'].includes(moneda)) {
      throw createValidationError('La moneda de la factura debe ser USD o VES');
    }
    if (metodoPago === 'CASH' && !MONEDAS_PAGO.includes(monedaPago)) {
      throw createValidationError('La moneda del efectivo debe ser USD o VES');
    }

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

    if (metodoPago && !['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PAYMENT', 'PAGO_MOVIL'].includes(metodoPago)) {
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
      const cantidadNumerica = Number(item.cantidad);
      if (
        (typeof item.cantidad !== 'number' && typeof item.cantidad !== 'string') ||
        (typeof item.cantidad === 'string' && !item.cantidad.trim()) ||
        !Number.isFinite(cantidadNumerica) ||
        cantidadNumerica <= 0
      ) {
        throw createValidationError(`La cantidad debe ser mayor a 0 para todos los ítems`);
      }

      const producto = productoMap[item.productoId];
      if (!producto) {
        throw createValidationError(`El producto con ID "${item.productoId}" no existe o está inactivo`);
      }
      
      // Validar stock con soporte para venta por peso (kg/g)
      const cantidadSolicitada = parseFloat(item.cantidad);
      const unidadPeso = item.unidadPeso || 'kg'; // Unidad de peso enviada por el frontend
      let cantidadEnKg = cantidadSolicitada;
      
      // Si el producto es venta por peso y la unidad es gramos, convertir a kg
      if (producto.esVentaPorPeso && unidadPeso === 'g') {
        cantidadEnKg = cantidadSolicitada / 1000;
      }
      
      const stockActual = parseFloat(producto.stockActual);
      if (stockActual < cantidadEnKg) {
        throw createBusinessError(
          `Stock insuficiente para "${producto.nombre}": disponible ${stockActual} kg, solicitado ${cantidadEnKg} kg (${cantidadSolicitada} ${unidadPeso})`
        );
      }
    }

    // ── Calcular totales con Decimal.js ───────────────────────────────────────
    const itemsCalculados = items.map(item => {
      const producto  = productoMap[item.productoId];
      const unidadPeso = item.unidadPeso || 'kg';
      
      // Determinar precio y cantidad según el tipo de venta
      let precioBase, cantidadParaCalculo;
      
      if (producto.esVentaPorPeso) {
        // Venta por peso: el precio es por kg
        precioBase = new Decimal(producto.precioPorKilo?.toString() || producto.precioVenta.toString());
        // Convertir a kg si es necesario
        cantidadParaCalculo = unidadPeso === 'g' 
          ? new Decimal(item.cantidad).div(1000) 
          : new Decimal(item.cantidad);
      } else {
        // Venta normal por unidad
        precioBase = new Decimal(producto.precioVenta.toString());
        cantidadParaCalculo = new Decimal(item.cantidad);
      }
      
      const precio = moneda === 'VES' ? precioBase.mul(tasaFacturacion) : precioBase;
      const tasa = new Decimal(producto.tasaImpuesto.toString()).div(100);

      const subtotalLinea = precio.mul(cantidadParaCalculo);
      const impuestoLinea = subtotalLinea.mul(tasa);
      const totalLinea    = subtotalLinea.add(impuestoLinea);

      return {
        productoId:              producto.id,
        descripcionHistorica:    producto.nombre,
        // Siempre se registra en la unidad base: kg para venta por peso
        cantidad:                producto.esVentaPorPeso
          ? (unidadPeso === 'g' ? new Decimal(item.cantidad).div(1000).toNumber() : new Decimal(item.cantidad).toNumber())
          : parseFloat(item.cantidad),
        unidadMedida:            producto.esVentaPorPeso ? 'KILOGRAMO' : producto.unidadMedida,
        precioUnitarioHistorico: precio.toFixed(2),
        tasaImpuestoAplicada:    producto.tasaImpuesto.toString(),
        subtotalLinea:           subtotalLinea.toFixed(2),
        impuestoLinea:           impuestoLinea.toFixed(2),
        totalLinea:              totalLinea.toFixed(2),
        _productoId:             producto.id,
        _cantidad:               producto.esVentaPorPeso
          ? (unidadPeso === 'g' ? parseFloat(item.cantidad) / 1000 : parseFloat(item.cantidad))
          : parseFloat(item.cantidad),
      };
    });

    const subtotalTotal    = itemsCalculados.reduce((acc, i) => acc.add(new Decimal(i.subtotalLinea)), new Decimal(0));
    const impuestoTotalSum = itemsCalculados.reduce((acc, i) => acc.add(new Decimal(i.impuestoLinea)), new Decimal(0));
    const totalFactura     = subtotalTotal.add(impuestoTotalSum);

    // ── Transacción atómica ───────────────────────────────────────────────────
    const factura = await prisma.$transaction(async (tx) => {
      const numeroFactura = await obtenerSiguienteNumeroFactura(tx);

      // 1. Crear factura con ítems
      let estadoInicial = 'PENDING';
      if (metodoPago) estadoInicial = 'PAID';
      else if (esFinanciada) estadoInicial = 'PENDING'; // primer cuota pendiente

      const nuevaFactura = await tx.factura.create({
        data: {
          numeroFactura,
          clienteId,
          usuarioId:    req.user?.id || null,
          empresaId:    empresaRefId,
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
          tasaCambio: true,
          cuotasTotales: true,
          observaciones: true,
          cliente: { select: { id: true, razonSocial: true, rifCedula: true } },
          usuario: { select: { id: true, username: true, nombre: true, rol: true } },
          items: {
            select: {
              id: true,
              productoId: true,
              descripcionHistorica: true,
              unidadMedida: true,
              cantidad: true,
              precioUnitarioHistorico: true,
              tasaImpuestoAplicada: true,
              subtotalLinea: true,
              impuestoLinea: true,
              totalLinea: true,
            },
          },
          pagos: {
            select: {
              id: true,
              monto: true,
              monedaPago: true,
              metodoPago: true,
              fechaPago: true,
            },
          },
        },
      });

      // 2. Crear el registro de pago inmediato si aplica (CONTADO)
      if (metodoPago) {
        const monedaRecibida = metodoPago === 'CASH' ? monedaPago : moneda;
        const montoRecibido = convertirMontoMoneda(
          totalFactura,
          moneda,
          monedaRecibida,
          tasaFacturacion
        );
        const pagoCreado = await tx.pago.create({
          data: {
            facturaId: nuevaFactura.id,
            monto: montoRecibido.toDecimalPlaces(2).toFixed(2),
            monedaPago: monedaRecibida,
            metodoPago,
            referenciaTransaccion: metodoPago === 'CASH' ? null : referenciaTransaccion,
            notas: 'Pago de contado al momento de emisión',
          },
          select: {
            id: true,
            monto: true,
            monedaPago: true,
            metodoPago: true,
            referenciaTransaccion: true,
            fechaPago: true,
          },
        });
        nuevaFactura.pagos = [pagoCreado];
      }

      // 3. Decrementar stock de cada producto (con verificación atómica dentro de la transacción)
      for (const item of itemsCalculados) {
        const updated = await tx.producto.updateMany({
          where: {
            id: item._productoId,
            empresaId,
            stockActual: { gte: Number(item._cantidad) }, // Solo decrementa si hay stock suficiente
          },
          data:  { stockActual: { decrement: Number(item._cantidad) } },
        });
        if (updated.count === 0) {
          // Verificar si el producto existe o si no hay stock
          const producto = await tx.producto.findFirst({
            where: { id: item._productoId, empresaId },
            select: { nombre: true, stockActual: true },
          });
          if (!producto) {
            throw createBusinessError('No se pudo actualizar el stock del producto porque no pertenece a tu empresa');
          }
          throw createBusinessError(
            `Stock insuficiente para "${producto.nombre}": disponible ${producto.stockActual}, solicitado ${item._cantidad}`
          );
        }
      }

      return nuevaFactura;
    });

    // Calcular información de cuotas para la respuesta
    const montoCuota = esFinanciada
      ? totalFactura.div(cuotasTotales).toDecimalPlaces(2).toFixed(2)
      : null;

    invalidarCacheVentas();

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
      select: {
        id: true,
        estado: true,
        items: {
          select: {
            id: true,
            productoId: true,
            cantidad: true,
          },
        },
        pagos: {
          select: {
            id: true,
            monto: true,
          },
        },
      },
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
          tasaCambio: true,
          cuotasTotales: true,
          observaciones: true,
          anuladoPor: true,
          motivoAnulacion: true,
          createdAt: true,
          updatedAt: true,
          cliente: { select: { id: true, razonSocial: true, rifCedula: true } },
          usuario: { select: { id: true, username: true, nombre: true } },
          items: {
            select: {
              id: true,
              productoId: true,
              descripcionHistorica: true,
              unidadMedida: true,
              cantidad: true,
              precioUnitarioHistorico: true,
              tasaImpuestoAplicada: true,
              subtotalLinea: true,
              impuestoLinea: true,
              totalLinea: true,
            },
          },
        },
      });

      // Restaurar stock de los productos
      for (const item of factura.items) {
        if (item.productoId) {
          const updated = await tx.producto.updateMany({
            where: { id: item.productoId, empresaId },
            data: { stockActual: { increment: Number(item.cantidad) } },
          });
          if (updated.count === 0) {
            throw new Error('No se pudo restaurar el stock del producto porque no pertenece a tu empresa');
          }
        }
      }

      return updated;
    });

    invalidarCacheVentas();
    res.json(anulada);
  } catch (err) { next(err); }
});

module.exports = router;
