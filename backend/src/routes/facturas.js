const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { invalidarCacheVentas } = require('../services/reportesService');
const { requireRole } = require('../middleware/auth');
const { obtenerSiguienteNumeroFactura } = require('../utils/numeracionFacturas');
const { paginate } = require('../utils/pagination');
const { MONEDAS_PAGO, convertirMontoMoneda, sumarPagosNormalizados, normalizarPagoAFactura } = require('../utils/tasaAPI');
const { resolverEmpresaRefId } = require('../utils/empresaContext');
const { tasaParaEmpresa } = require('../utils/tasaAPI');
const { tasaBCVPorFecha } = require('../utils/bcvHistorico');
const { containsInsensitive, extraerTerminosBusqueda } = require('../utils/textSearch');
const { ESTADOS_PAGO } = require('../config/pagos');
const { registrarAuditoria } = require('../utils/auditLog');
const { lockFactura } = require('../utils/locks');
const cxcRouter = require('./cxc');
const {
  MOTIVOS_ANULACION_FACTURA,
  MOTIVOS_ANULACION_FACTURA_VALIDOS,
  DESCRIPCION_ANULACION_FACTURA_MIN,
  DESCRIPCION_ANULACION_FACTURA_MAX,
  CONFIRMACION_ANULACION_FACTURA,
  getMotivoAnulacionFacturaLabel,
  esMotivoAnulacionFacturaValido,
} = require('../constants/anulacionesFactura');
const {
  METODOS_PAGO,
  esMetodoPagoValido,
  requiereReferenciaMetodo,
  esMetodoFinanciado,
} = require('../constants/metodosPago');

// SUPER_ADMIN no genera facturas
router.use(requireRole('EMPRESA', 'CAJA'));

const ESTADOS_FACTURA = ['PENDING', 'PAID', 'PARTIALLY_PAID', 'VOIDED'];
const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;
// Las sub-cuentas (CAJA/INVENTARIO/VISOR) nacen con empresaRefId=NULL, así que
// hay que subir por el Usuario padre para obtener el Empresa real.
const getEmpresaRefId = (req) => resolverEmpresaRefId(req);
const facturaTenantFilter = (empresaId) => ({
  OR: [
    { usuarioId: empresaId },
    { usuario: { empresaId } }
  ]
});

// GET /api/facturas
router.get('/', async (req, res, next) => {
  try {
    const { estado, estados, clienteId, usuarioId, q, vencidas, desde, hasta } = req.query;
    // `paginate` normaliza page/limit (clamp page>=1, take 1..100) y evita el
    // 500 que producían page/limit negativos o no numéricos.
    const { skip, take, page, limit } = paginate(req.query, { limit: 25 });
    const hoy  = new Date();

    const empresaId = getEmpresaId(req);
    const where = req.user.rol === 'CAJA'
      ? { usuarioId: req.user.id }
      : { ...facturaTenantFilter(empresaId) };

    if (estados) {
      const estadosFiltro = [...new Set(estados.split(',').map(valor => valor.trim()).filter(Boolean))];
      if (estadosFiltro.length === 0 || estadosFiltro.some(valor => !ESTADOS_FACTURA.includes(valor))) {
        throw createValidationError('El filtro de estados de factura no es válido');
      }
      where.estado = estadosFiltro.length === 1 ? estadosFiltro[0] : { in: estadosFiltro };
    } else if (estado) {
      if (!ESTADOS_FACTURA.includes(estado)) {
        throw createValidationError('El filtro de estado de factura no es válido');
      }
      where.estado = estado;
    }
    if (clienteId) where.clienteId = clienteId;
    // Para CAJA `where.usuarioId` es el aislamiento de tenant: un query param
    // no puede reemplazarlo o la caja vería facturas de otros usuarios.
    if (usuarioId && req.user.rol !== 'CAJA') where.usuarioId = usuarioId;
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
      const terms = extraerTerminosBusqueda(q);
      if (terms.length > 0) {
        // OJO: el filtro de tenant vive en `where.OR` (o en `where.usuarioId`
        // para CAJA). Prisma combina el AND de nivel superior con ese OR, así
        // que se conserva: borrar `where.OR` aquí devolvía facturas de otras
        // empresas al buscar.
        where.AND = [
          ...(where.AND || []),
          ...terms.map(term => ({
            OR: [
              { cliente: { razonSocial: containsInsensitive(term) } },
              { cliente: { rifCedula: containsInsensitive(term) } },
              { usuario: { username: containsInsensitive(term) } },
              { usuario: { nombre: containsInsensitive(term) } },
              // Búsqueda por número de factura (solo si el término es numérico).
              ...(/^\d+$/.test(term) ? [{ numeroFactura: parseInt(term, 10) }] : []),
              {
                items: {
                  some: {
                    OR: [
                      { descripcionHistorica: containsInsensitive(term) },
                      { producto: { sku: containsInsensitive(term) } },
                      { producto: { nombre: containsInsensitive(term) } },
                    ],
                  },
                },
              },
            ],
          })),
        ];
      }
    }

    const [facturas, total] = await Promise.all([
      prisma.factura.findMany({
        where,
        skip,
        take,
        orderBy: { fechaEmision: 'desc' },
        include: {
          cliente: true,
          usuario: { select: { id: true, username: true, nombre: true, rol: true } },
          items: {
            select: {
              descripcionHistorica: true,
              producto: { select: { sku: true, nombre: true } },
            },
          },
          _count: { select: { items: true } },
        },
      }),
      prisma.factura.count({ where }),
    ]);

    const facturaIds = facturas.map(f => f.id);
    const pagos = facturaIds.length > 0
      ? await prisma.pago.findMany({
          where: { facturaId: { in: facturaIds } },
          select: {
            id: true,
            facturaId: true,
            monto: true,
            monedaPago: true,
            metodoPago: true,
            referenciaTransaccion: true,
            fechaPago: true,
            estado: true,
            motivoAnulacion: true,
            descripcionAnulacion: true,
            anuladoPor: true,
            fechaAnulacion: true,
            factura: { select: { moneda: true, tasaCambio: true } },
          },
        })
      : [];
    const pagosMap = new Map();
    const pagosAnuladosMap = new Map();
    const empresaRefIdListado = await getEmpresaRefId(req);
    for (const pago of pagos) {
      if (pago.estado === ESTADOS_PAGO.ANULADO) {
        const anulados = pagosAnuladosMap.get(pago.facturaId) || [];
        anulados.push({
          id: pago.id,
          monto: pago.monto,
          monedaPago: pago.monedaPago,
          metodoPago: pago.metodoPago,
          referenciaTransaccion: pago.referenciaTransaccion,
          fechaPago: pago.fechaPago,
          motivoAnulacion: pago.motivoAnulacion,
          descripcionAnulacion: pago.descripcionAnulacion,
          anuladoPor: pago.anuladoPor,
          fechaAnulacion: pago.fechaAnulacion,
        });
        pagosAnuladosMap.set(pago.facturaId, anulados);
        continue;
      }

      const pagado = pagosMap.get(pago.facturaId) || new Decimal(0);
      const normalizado = await normalizarPagoAFactura(pago, pago.factura, empresaRefIdListado);
      pagosMap.set(pago.facturaId, pagado.add(normalizado));
    }

    // Agregar campos derivados (estaVencida, saldoPendiente y anulaciones)
    const facturasConEstado = facturas.map(f => {
      const totalPagado = pagosMap.get(f.id) || new Decimal(0);
      const saldoPendiente = new Decimal(f.total.toString()).sub(totalPagado);
      
      return {
        ...f,
        estaVencida: ['PENDING', 'PARTIALLY_PAID'].includes(f.estado) && new Date(f.fechaVencimiento) < hoy,
        saldoPendiente: saldoPendiente.toFixed(2),
        totalPagado: totalPagado.toFixed(2),
        pagosAnulados: pagosAnuladosMap.get(f.id) || [],
      };
    });

    res.json({ data: facturasConEstado, total, page, limit });
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
        descripcionAnulacion: true,
        fechaAnulacion: true,
        tasaAnulacion: true,
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
            estado: true,
            motivoAnulacion: true,
            descripcionAnulacion: true,
            anuladoPor: true,
            fechaAnulacion: true,
          },
          orderBy: { fechaPago: 'asc' },
        },
      },
    });

    // Calcular balance pendiente
    const totalPagado = await sumarPagosNormalizados(factura.pagos, factura, await getEmpresaRefId(req));
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
      monedaPago = 'USD', requestId,
    } = req.body;
    const empresaId = req.user?.empresaId || req.user?.id;
    const empresaRefId = await getEmpresaRefId(req);

    // Tasa de la empresa (AUTO: BCV del día; MANUAL: la guardada). Si el
    // cliente no envía `tasaCambio` se usa la vigente: nunca un valor
    // hardcodeado, que produciría facturas con una tasa inexistente.
    const tasaFacturacion = tasaCambio != null
      ? new Decimal(String(tasaCambio))
      : await tasaParaEmpresa(empresaRefId);
    if (!tasaFacturacion.isFinite() || tasaFacturacion.lte(0)) {
      throw createValidationError('La tasa de cambio debe ser mayor a cero');
    }
    if (!['USD', 'VES'].includes(moneda)) {
      throw createValidationError('La moneda de la factura debe ser USD o VES');
    }
    if (metodoPago === 'CASH' && !MONEDAS_PAGO.includes(monedaPago)) {
      throw createValidationError('La moneda del efectivo debe ser USD o VES');
    }

    // ── Idempotencia ──────────────────────────────────────────────────────────
    // Si esta clave ya emitió una factura, se devuelve esa misma factura en
    // lugar de crear otra. Cierra la ventana que deja el guard del frontend:
    // recarga de página, doble toque móvil y reintentos del proxy repiten el
    // POST, y sin esto cada repetición generaba una venta completa (factura,
    //CxC, pago y descuento de stock).
    const requestIdLimpio = typeof requestId === 'string' ? requestId.trim() : '';
    if (requestIdLimpio) {
      if (requestIdLimpio.length > 120) {
        throw createValidationError('El requestId es demasiado largo');
      }
      // `findFirst` con filtro de tenant, no `findUnique` por requestId: el
      // índice único es GLOBAL, así que sin el filtro otra empresa recibía la
      // factura ajena al reutilizar la misma clave (fuga entre inquilinos).
      const existente = await prisma.factura.findFirst({
        where: { requestId: requestIdLimpio, ...facturaTenantFilter(empresaId) },
        include: {
          cliente: { select: { razonSocial: true } },
          pagos: { select: { metodoPago: true, monedaPago: true, monto: true, referenciaTransaccion: true, fechaPago: true } },
          items: true,
        },
      });
      if (existente) {
        console.log(`[facturas] requestId duplicado ${requestIdLimpio} → devuelve factura #${existente.numeroFactura}`);
        return res.status(200).json({ ...existente, idempotent: true });
      }
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
    const esFinanciada = cuotasTotales > 1 || esMetodoFinanciado(metodoPago) || !metodoPago;
    const esPagoContado = Boolean(metodoPago && !esMetodoFinanciado(metodoPago));

    if (metodoPago && !esMetodoPagoValido(metodoPago)) {
      throw createValidationError('Método de pago inválido');
    }
    if (metodoPago && requiereReferenciaMetodo(metodoPago) && !referenciaTransaccion?.trim()) {
      throw createValidationError('La referencia es obligatoria para este método de pago');
    }
    // Financiada no puede ser pagada de contado simultáneamente
    if (esFinanciada && esPagoContado) {
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
        costoUnitarioHistoricoUSD: producto.costoCompra.toString(),
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

    // Tasa BCV del día para el pago de contado. Se resuelve FUERA de la
    // transacción porque es una llamada HTTP externa y no debe mantener
    // bloqueadas las filas de factura/cxC mientras espera la red.
    let tasaBCVPago = null;
    if (metodoPago) {
      try {
        tasaBCVPago = await tasaBCVPorFecha(new Date());
      } catch (err) {
        console.warn('[facturas] No se pudo obtener la tasa BCV:', err.message);
      }
    }

    // ── Transacción atómica ───────────────────────────────────────────────────
    let factura;
    try {
      factura = await prisma.$transaction(async (tx) => {
      const numeroFactura = await obtenerSiguienteNumeroFactura(tx);

      // 1. Crear factura con ítems
      const estadoInicial = esPagoContado ? 'PAID' : 'PENDING';

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
          requestId: requestIdLimpio || null,
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

      // 1.5. Crear CuentaPorCobrar asociada EXCLUSIVAMENTE si es financiada (montos siempre en USD normalizado)
      if (!esPagoContado) {
        const totalFacturaUSD = convertirMontoMoneda(totalFactura, moneda, 'USD', tasaFacturacion);

        await tx.cuentaPorCobrar.create({
          data: {
            empresaId: empresaRefId,
            facturaId: nuevaFactura.id,
            clienteId,
            usuarioId: req.user?.id || null,
            montoOriginal: totalFacturaUSD.toFixed(2),
            montoCobrado: '0.00',
            montoPendiente: totalFacturaUSD.toFixed(2),
            fechaEmision: nuevaFactura.fechaEmision,
            fechaVencimiento: fVencimiento.toISOString(),
            estado: 'PENDING',
            diasVencido: 0
          }
        });
      }

      // 2. Crear el registro de pago inmediato si aplica (CONTADO)
      if (esPagoContado) {
        const monedaRecibida = monedaPago || (
          [METODOS_PAGO.EFECTIVO_VES, METODOS_PAGO.BIOPAGO, METODOS_PAGO.PAGO_MOVIL].includes(metodoPago)
            ? 'VES'
            : [METODOS_PAGO.EFECTIVO_USD, METODOS_PAGO.BINANCE, METODOS_PAGO.CASHEA].includes(metodoPago)
              ? 'USD'
              : moneda
        );
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
            referenciaTransaccion: requiereReferenciaMetodo(metodoPago) ? referenciaTransaccion.trim() : null,
            notas: 'Pago de contado al momento de emisión',
            tasaBCV: tasaBCVPago ? tasaBCVPago.toFixed(4) : null,
          },
          select: {
            id: true,
            monto: true,
            monedaPago: true,
            metodoPago: true,
            referenciaTransaccion: true,
            fechaPago: true,
            tasaBCV: true,
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
    } catch (txErr) {
      // Carrera real: dos peticiones con la misma clave pueden pasar la
      // verificación anterior si llegan lo bastante cerca. El índice único
      // hace que una sola gane; la perdedora recupera la factura ganadora en
      // lugar de reportar un error al cajero.
      if (requestIdLimpio && txErr?.code === 'P2002') {
        // Solo se recupera la factura si pertenece a la MISMA empresa. Si la
        // clave la usó otro inquilino, se propaga el P2002 (409) y nunca se
        // devuelve su factura.
        const yaEmitida = await prisma.factura.findFirst({
          where: { requestId: requestIdLimpio, ...facturaTenantFilter(empresaId) },
          include: {
            cliente: { select: { razonSocial: true } },
            pagos: { select: { metodoPago: true, monedaPago: true, monto: true, referenciaTransaccion: true, fechaPago: true } },
            items: true,
          },
        });
        if (yaEmitida) {
          console.log(`[facturas] carrera de requestId ${requestIdLimpio} → devuelve factura #${yaEmitida.numeroFactura}`);
          return res.status(200).json({ ...yaEmitida, idempotent: true });
        }
      }
      throw txErr;
    }

    // Calcular información de cuotas para la respuesta
    const montoCuota = esFinanciada
      ? totalFactura.div(cuotasTotales).toDecimalPlaces(2).toFixed(2)
      : null;

    invalidarCacheVentas();

    res.status(201).json({
      ...factura,
      totalPagado: esPagoContado ? totalFactura.toFixed(2) : '0.00',
      balancePendiente: esPagoContado ? '0.00' : totalFactura.toFixed(2),
      cuotasTotales,
      montoCuota,
    });
  } catch (err) { next(err); }
});

// PATCH /api/facturas/:id/anular — Anular factura (protocolo de seguridad, auditoría e integridad de tasa)
router.patch('/:id/anular', async (req, res, next) => {
  try {
    const { codigoAnulacion, confirmacion, motivo, descripcion } = req.body || {};
    const userRole = req.user?.rol;

    if (userRole === 'INVENTARIO' || userRole === 'VISOR') {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Tu rol no tiene permisos para anular facturas de venta.'
      });
    }

    // Para el rol CAJA, se requiere código de anulación obligatorio del supervisor
    if (userRole === 'CAJA') {
      const systemVoidCode = process.env.VOID_CODE || '1234';
      if (typeof codigoAnulacion !== 'string' || codigoAnulacion.trim() !== systemVoidCode) {
        return res.status(403).json({
          error: 'Código de anulación inválido',
          message: 'Los usuarios de Caja requieren el código de autorización del supervisor/empresa para anular una venta.',
          fields: { codigoAnulacion: 'Código de supervisor incorrecto' }
        });
      }
    }

    if (typeof confirmacion !== 'string' || confirmacion.trim().toLowerCase() !== CONFIRMACION_ANULACION_FACTURA) {
      throw createValidationError(
        `Debes escribir "${CONFIRMACION_ANULACION_FACTURA}" para confirmar la anulación`,
        { confirmacion: `Escribe ${CONFIRMACION_ANULACION_FACTURA} exactamente` }
      );
    }

    let motivoFinal = typeof motivo === 'string' ? motivo.trim() : '';
    let descripcionFinal = typeof descripcion === 'string' ? descripcion.trim() : '';

    if (esMotivoAnulacionFacturaValido(motivoFinal)) {
      if (!descripcionFinal || descripcionFinal.length < DESCRIPCION_ANULACION_FACTURA_MIN) {
        throw createValidationError(
          `La justificación detallada debe tener al menos ${DESCRIPCION_ANULACION_FACTURA_MIN} caracteres`,
          { descripcion: `Mínimo ${DESCRIPCION_ANULACION_FACTURA_MIN} caracteres explicando por qué se anula` }
        );
      }
      if (descripcionFinal.length > DESCRIPCION_ANULACION_FACTURA_MAX) {
        throw createValidationError(
          `La justificación no puede exceder ${DESCRIPCION_ANULACION_FACTURA_MAX} caracteres`,
          { descripcion: `Máximo ${DESCRIPCION_ANULACION_FACTURA_MAX} caracteres` }
        );
      }
    } else if (motivoFinal.length >= DESCRIPCION_ANULACION_FACTURA_MIN) {
      // Compatibilidad con clientes antiguos que enviaban solo texto libre en "motivo"
      descripcionFinal = motivoFinal;
      motivoFinal = 'OTRO';
    } else {
      throw createValidationError('Debe seleccionar un motivo válido y explicar la justificación', {
        motivo: `Seleccione un motivo válido (${MOTIVOS_ANULACION_FACTURA_VALIDOS.join(', ')})`
      });
    }

    const empresaId = getEmpresaId(req);
    const empresaRefId = await getEmpresaRefId(req);
    const tasaSistemaActual = await tasaParaEmpresa(empresaRefId);

    // Transacción atómica: anular factura + anular pagos + restaurar stock + auditoría
    const anulada = await prisma.$transaction(async (tx) => {
      await lockFactura(tx, req.params.id);

      const factura = await tx.factura.findFirstOrThrow({
        where: {
          id: req.params.id,
          ...facturaTenantFilter(empresaId),
        },
        include: {
          items: true,
          pagos: true,
          cliente: { select: { id: true, razonSocial: true, rifCedula: true } },
        },
      });

      if (factura.estado === 'VOIDED') {
        throw createBusinessError('La factura ya está anulada');
      }

      const fechaAnulacion = new Date();
      // Integridad de tasa: preservar la tasa efectiva exacta de la factura
      const tasaEfectiva = factura.moneda === 'VES' && Number(factura.tasaCambio) > 0
        ? new Decimal(factura.tasaCambio.toString())
        : tasaSistemaActual;

      const totalFacturaUSD = convertirMontoMoneda(
        new Decimal(factura.total.toString()),
        factura.moneda || 'USD',
        'USD',
        tasaEfectiva
      );
      const totalFacturaVES = totalFacturaUSD.mul(tasaEfectiva);

      // 1. Actualizar Factura con motivo estructurado, justificación y congelamiento de tasa
      const updated = await tx.factura.update({
        where: { id: req.params.id },
        data: {
          estado: 'VOIDED',
          anuladoPor: req.user?.nombre || req.user?.username || 'Usuario',
          motivoAnulacion: motivoFinal,
          descripcionAnulacion: descripcionFinal,
          fechaAnulacion,
          tasaAnulacion: tasaEfectiva.toNumber(),
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
          descripcionAnulacion: true,
          fechaAnulacion: true,
          tasaAnulacion: true,
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

      // 2. Anulación lógica de todos los pagos activos asociados
      if (factura.pagos?.length > 0) {
        await tx.pago.updateMany({
          where: {
            facturaId: factura.id,
            estado: { not: ESTADOS_PAGO.ANULADO },
          },
          data: {
            estado: ESTADOS_PAGO.ANULADO,
            motivoAnulacion: 'FACTURA_ANULADA',
            descripcionAnulacion: `Anulado por anulación de Factura #${factura.numeroFactura} (${getMotivoAnulacionFacturaLabel(motivoFinal)}: ${descripcionFinal.slice(0, 80)})`,
            anuladoPor: req.user?.nombre || req.user?.username || 'Usuario',
            fechaAnulacion,
          },
        });
      }

      // 3. Eliminar CuentaPorCobrar asociada si existía
      await tx.cuentaPorCobrar.deleteMany({
        where: { facturaId: req.params.id }
      });

      // 4. Restaurar stock de los productos con verificación de empresa
      for (const item of factura.items) {
        if (item.productoId) {
          const updatedStock = await tx.producto.updateMany({
            where: { id: item.productoId, empresaId },
            data: { stockActual: { increment: Number(item.cantidad) } },
          });
          if (updatedStock.count === 0) {
            throw new Error('No se pudo restaurar el stock del producto porque no pertenece a tu empresa');
          }
        }
      }

      // 5. Registrar en auditoría
      await registrarAuditoria(req, {
        accion: 'FACTURA_ANULADA',
        entidad: 'Factura',
        entidadId: factura.id,
        empresaId: factura.empresaId || empresaRefId,
        datosAnteriores: {
          numeroFactura: factura.numeroFactura,
          estado: factura.estado,
          total: factura.total,
          moneda: factura.moneda,
          tasaCambio: factura.tasaCambio,
        },
        datosNuevos: {
          numeroFactura: factura.numeroFactura,
          estado: 'VOIDED',
          motivoAnulacion: motivoFinal,
          descripcionAnulacion: descripcionFinal,
          anuladoPor: updated.anuladoPor,
          fechaAnulacion,
          tasaAnulacion: tasaEfectiva.toNumber(),
          impactoEconomico: {
            totalUSD: totalFacturaUSD.toFixed(2),
            totalVES: totalFacturaVES.toFixed(2),
          },
          itemsRestaurados: factura.items.length,
          pagosAfectados: factura.pagos.length,
        },
        tx,
      });

      return updated;
    });

    invalidarCacheVentas();
    cxcRouter.invalidarCacheCxcResumen?.();
    res.json(anulada);
  } catch (err) { next(err); }
});

module.exports = router;
