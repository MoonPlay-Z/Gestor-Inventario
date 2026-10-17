const express = require('express');
const prisma = require('../db/prisma');
const Decimal = require('decimal.js').Decimal;
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { obtenerSiguienteNumeroFactura } = require('../utils/numeracionFacturas');
const { obtenerSiguienteNumeroCotizacion } = require('../utils/numeracionCotizaciones');
const { convertirMontoMoneda, tasaParaEmpresa } = require('../utils/tasaAPI');
const { tasaBCVPorFecha } = require('../utils/bcvHistorico');
const { resolverEmpresaRefId } = require('../utils/empresaContext');

const router = express.Router();

// SUPER_ADMIN no genera cotizaciones
router.use(requireRole('EMPRESA', 'CAJA'));

const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;
// Las sub-cuentas CAJA tienen empresaRefId=NULL; hay que resolver el Empresa
// subiendo por el Usuario padre (ver utils/empresaContext).
const getEmpresaRefId = (req) => resolverEmpresaRefId(req);

// 1. Obtener todas las cotizaciones (con paginación)
router.get('/', async (req, res, next) => {
  try {
    const { q, estado } = req.query;
    const { skip, take, page, limit } = paginate(req.query, { limit: 25 });
    const empresaId = getEmpresaId(req);
    const where = { OR: [{ usuarioId: empresaId }, { usuario: { empresaId } }] };
    if (estado) where.estado = estado;
    if (q) {
      where.AND = [
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
          factura: { select: { numeroFactura: true } },
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
      where: { id, OR: [{ usuarioId: empresaId }, { usuario: { empresaId } }] },
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
        // `direccion` la usa ReceiptModal al imprimir el presupuesto.
        cliente: { select: { id: true, razonSocial: true, rifCedula: true, direccion: true } },
        // Se incluye para que la vista de impresión pueda mostrar el número
        // de factura cuando la cotización ya fue convertida.
        factura: { select: { id: true, numeroFactura: true } },
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

    // Un id inexistente o ajeno a la empresa es un 404, no un error de validación.
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
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
    const empresaRefId = await getEmpresaRefId(req);

    if (!clienteId) throw createValidationError('El cliente es obligatorio');
    if (!Array.isArray(items) || items.length === 0) {
      throw createValidationError('Debe agregar al menos un producto');
    }
    if (!['USD', 'VES'].includes(moneda)) {
      throw createValidationError('La moneda de la cotización debe ser USD o VES');
    }

    const diasValidez = Number(validezDias);
    if (!Number.isFinite(diasValidez) || diasValidez <= 0 || diasValidez > 365) {
      throw createValidationError('La vigencia debe ser un número de días entre 1 y 365');
    }

    const fechaEmision = new Date();
    const fechaValidez = new Date(fechaEmision);
    fechaValidez.setDate(fechaValidez.getDate() + diasValidez);

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

      // La cantidad debe ser un entero positivo. No se usa `parseInt(x) || 1`
      // porque convierte silenciosamente 0, negativos y decimals en 1.
      const cantidad = Number(item.cantidad);
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw createValidationError('La cantidad de cada ítem debe ser un número entero mayor a cero', {
          cantidad: 'Cantidad inválida',
        });
      }

      let nombre = item.descripcion;
      let precioU = new Decimal(item.precio ?? 0);
      // `item.tasa ?? 16` en vez de `||`: con `||`, una tasa de 0% caería al
      // default de 16% y aplicaría IVA a productos exentos.
      let tasa = new Decimal(item.tasa ?? 16);

      if (item.productoId) {
        const prod = productoMap.get(item.productoId);
        if (!prod) throw createValidationError(`Producto con ID ${item.productoId} no encontrado`);
        nombre = prod.nombre;
        precioU = new Decimal(prod.precioVenta.toString());
        tasa = new Decimal(prod.tasaImpuesto.toString());
      }

      if (precioU.lt(0)) throw createValidationError('El precio no puede ser negativo');

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

    // El correlativo se consume dentro de la misma transacción que el INSERT de
    // la cotización: si la creación falla, el número no queda gastado.
    const cotizacion = await prisma.$transaction(async (tx) => {
      const numero = await obtenerSiguienteNumeroCotizacion(tx);

      return tx.cotizacion.create({
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
    const empresaRefId = await getEmpresaRefId(req);
    const cotizacion = await prisma.cotizacion.findFirst({
      where: { id, OR: [{ usuarioId: empresaId }, { usuario: { empresaId } }] },
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

    if (!cotizacion) throw createBusinessError('Cotización no encontrada');
    if (['ACCEPTED', 'CONVERTED'].includes(cotizacion.estado)) {
      throw createBusinessError('La cotización ya fue convertida a factura');
    }

    const METODOS_VALIDOS = ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PAYMENT', 'PAGO_MOVIL'];
    if (metodoPago !== undefined && metodoPago !== null && !METODOS_VALIDOS.includes(metodoPago)) {
      throw createValidationError(`Método de pago inválido. Valores permitidos: ${METODOS_VALIDOS.join(', ')}`);
    }
    if (metodoPago && metodoPago !== 'CASH' && !referenciaTransaccion?.trim()) {
      throw createValidationError('La referencia de transacción es obligatoria para este método de pago', {
        referenciaTransaccion: 'Campo requerido',
      });
    }

    // Validar productos y stock de la cotización en una sola query (evita N+1).
    // Se carga también tasaImpuesto porque cada producto puede tener una tasa
    // distinta (0%, 8%, 16%...): usar una tasa fija inflaría o reduciría el IVA
    // de la factura y, con ello, el reporte de ganancias.
    const itemsConProducto = cotizacion.items.filter(i => i.productoId);
    const productoMap = new Map();
    if (itemsConProducto.length > 0) {
      const productoIds = [...new Set(itemsConProducto.map(i => i.productoId))];
      const productosDB = await prisma.producto.findMany({
        where: { id: { in: productoIds }, empresaId, activo: true },
        select: { id: true, nombre: true, stockActual: true, tasaImpuesto: true },
      });
      for (const p of productosDB) productoMap.set(p.id, p);

      for (const item of itemsConProducto) {
        const prod = productoMap.get(item.productoId);
        if (!prod) throw createBusinessError(`El producto "${item.descripcion}" ya no existe`);
        if (prod.stockActual < item.cantidad) {
          throw createBusinessError(`Stock insuficiente para "${prod.nombre}": disponible ${prod.stockActual}, requerido ${item.cantidad}`);
        }
      }
    }

    // Descomponer cada línea en subtotal / impuesto / total siguiendo la misma
    // convención que POST /api/facturas: `precioUnitario` en la cotización es
    // SIN IVA, así que el subtotal se recalcula desde ahí en lugar de reutilizar
    // `totalLinea` (que sí incluye IVA).
    const TASA_POR_DEFECTO = new Decimal(16);
    const itemsFactura = cotizacion.items.map((item) => {
      const tasa = item.productoId && productoMap.has(item.productoId)
        ? new Decimal(productoMap.get(item.productoId).tasaImpuesto.toString())
        : TASA_POR_DEFECTO;
      const cantidad = new Decimal(item.cantidad.toString());
      const subtotalLinea = new Decimal(item.precioUnitario.toString()).mul(cantidad);
      const impuestoLinea = subtotalLinea.mul(tasa).div(100);
      const totalLinea = subtotalLinea.add(impuestoLinea);
      return {
        productoId: item.productoId,
        descripcionHistorica: item.descripcion,
        cantidad: item.cantidad,
        precioUnitarioHistorico: item.precioUnitario,
        tasaImpuestoAplicada: tasa.toFixed(2),
        subtotalLinea: subtotalLinea.toFixed(2),
        impuestoLinea: impuestoLinea.toFixed(2),
        totalLinea: totalLinea.toFixed(2),
      };
    });

    // Recalcular los totales de la factura a partir de las líneas descompuestas
    // para que subtotal / impuestoTotal / total siempre cuadren entre sí.
    const subtotalCalculado = itemsFactura.reduce(
      (acc, i) => acc.add(new Decimal(i.subtotalLinea)), new Decimal(0));
    const impuestoCalculado = itemsFactura.reduce(
      (acc, i) => acc.add(new Decimal(i.impuestoLinea)), new Decimal(0));

    // Fecha de vencimiento a 15 días si no se especifica
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 15);

    const totalFactura = subtotalCalculado.add(impuestoCalculado);
    // `factura.tasaCambio` solo es una tasa VES↔USD real cuando la factura se
    // emite en VES; el default del schema es 1.0. Se guarda la tasa vigente del
    // sistema para que la factura quede autodescriptiva y `tasaCambioEfectiva`
    // no tenga que recurrir al fallback global al leerla.
    const tasaFacturacion = cotizacion.moneda === 'VES'
      ? await tasaParaEmpresa(empresaRefId)
      : new Decimal(1);
    const totalFacturaUSD = convertirMontoMoneda(
      totalFactura, cotizacion.moneda, 'USD', tasaFacturacion
    );

    // Tasa BCV del día de la conversión. Se resuelve fuera de la transacción
    // porque es una llamada HTTP externa y no debe bloquear la fila.
    let tasaBCV = null;
    try {
      tasaBCV = await tasaBCVPorFecha(new Date());
    } catch (err) {
      console.warn('[cotizaciones] No se pudo obtener la tasa BCV:', err.message);
    }

    // Crear la factura dentro de una transacción atómica
    const factura = await prisma.$transaction(async (tx) => {
      // Re-verificar el estado DENTRO de la transacción: la comprobación inicial
      // ocurre fuera, así que dos peticiones simultáneas podrían pasar ambas y
      // generar dos facturas para la misma cotización. El updateMany solo
      // afecta a la fila que sigue en PENDING, por lo que la segunda
      // transacción revierte.
      const marcador = await tx.cotizacion.updateMany({
        where: { id: cotizacion.id, estado: { notIn: ['ACCEPTED', 'CONVERTED'] }, facturaId: null },
        data: { estado: 'CONVERTING' },
      });
      if (marcador.count === 0) {
        throw createBusinessError('La cotización ya fue convertida a factura');
      }

      const numeroFactura = await obtenerSiguienteNumeroFactura(tx);
      const nuevaFactura = await tx.factura.create({
        data: {
          numeroFactura,
          clienteId: cotizacion.clienteId,
          usuarioId: req.user?.id || null,
          empresaId: empresaRefId,
          fechaVencimiento: fechaVencimiento.toISOString(),
          subtotal: subtotalCalculado.toFixed(2),
          impuestoTotal: impuestoCalculado.toFixed(2),
          total: totalFactura.toFixed(2),
          estado: metodoPago ? 'PAID' : 'PENDING',
          moneda: cotizacion.moneda,
          tasaCambio: tasaFacturacion.toNumber(),
          observaciones: `Convertida desde Cotización #${String(cotizacion.numero).padStart(5, '0')}`,
          items: { create: itemsFactura }
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

      // Crear CuentaPorCobrar asociada (montos siempre en USD normalizado).
      // Sin esto la factura tampoco aparecería en el módulo de cobranza.
      const estadoCxC = metodoPago ? 'PAID' : 'PENDING';
      await tx.cuentaPorCobrar.create({
        data: {
          empresaId: empresaRefId,
          facturaId: nuevaFactura.id,
          clienteId: cotizacion.clienteId,
          usuarioId: req.user?.id || null,
          montoOriginal: totalFacturaUSD.toFixed(2),
          montoCobrado: metodoPago ? totalFacturaUSD.toFixed(2) : '0.00',
          montoPendiente: metodoPago ? '0.00' : totalFacturaUSD.toFixed(2),
          fechaEmision: nuevaFactura.fechaEmision,
          fechaVencimiento: fechaVencimiento.toISOString(),
          estado: estadoCxC,
          diasVencido: 0,
        }
      });

      // Crear pago si se especificó método de pago
      if (metodoPago) {
        await tx.pago.create({
          data: {
            facturaId: nuevaFactura.id,
            monto: nuevaFactura.total,
            monedaPago: cotizacion.moneda,
            metodoPago,
            referenciaTransaccion: metodoPago === 'CASH' ? null : referenciaTransaccion,
            // Tasa BCV del día, igual que registra POST /api/pagos.
            tasaBCV: tasaBCV ? tasaBCV.toFixed(4) : null,
            notas: 'Pago recibido al convertir cotización en venta'
          }
        });
      }

      // Decrementar stock (con verificación atómica dentro de la transacción)
      for (const item of cotizacion.items) {
        if (item.productoId) {
          const updated = await tx.producto.updateMany({
            where: {
              id: item.productoId,
              empresaId,
              stockActual: { gte: Number(item.cantidad) },
            },
            data: { stockActual: { decrement: Number(item.cantidad) } },
          });
          if (updated.count === 0) {
            const producto = await tx.producto.findFirst({
              where: { id: item.productoId, empresaId },
              select: { nombre: true, stockActual: true },
            });
            if (!producto) {
              throw createBusinessError('No se pudo actualizar el stock del producto porque no pertenece a tu empresa');
            }
            throw createBusinessError(
              `Stock insuficiente para "${producto.nombre}": disponible ${producto.stockActual}, solicitado ${item.cantidad}`
            );
          }
        }
      }

      // Marcar cotización como ACEPTADA y guardar referencia a la factura
      await tx.cotizacion.update({
        where: { id: cotizacion.id },
        data: { estado: 'ACCEPTED', facturaId: nuevaFactura.id },
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
