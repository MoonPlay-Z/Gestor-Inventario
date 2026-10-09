const express = require('express');
const prisma = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { requireRole } = require('../middleware/auth');
const { createBusinessError } = require('../middleware/errorHandler');
const { invalidarCacheVentas } = require('../services/reportesService');

const router = express.Router();
const validUnits = [
  'UNIDAD', 'KILOGRAMO', 'GRAMO', 'LITRO', 'MILILITRO', 'METRO', 'CENTIMETRO',
  'BULTO', 'PAQUETE', 'CAJA', 'SACO', 'BOTELLA', 'LATA', 'DOCENA', 'MEDIA_DOCENA',
];
const validPaymentMethods = ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PAYMENT', 'PAGO_MOVIL'];
const unitGroups = [
  { KILOGRAMO: 1000, GRAMO: 1 },
  { LITRO: 1000, MILILITRO: 1 },
  { METRO: 100, CENTIMETRO: 1 },
];

const quantityInBaseUnit = (quantity, unit, baseUnit) => {
  if (unit === baseUnit) return quantity;
  const group = unitGroups.find((units) => units[unit] && units[baseUnit]);
  if (!group) return null;
  return quantity.mul(group[unit]).div(group[baseUnit]);
};

const sumPaymentAmounts = (amounts) => (
  [...amounts.values()].reduce((sum, amount) => sum.add(amount), new Decimal(0))
);

const rebalancePaymentAmounts = (amounts, targetTotal) => {
  const entries = [...amounts.entries()];
  const currentTotal = sumPaymentAmounts(amounts);
  const targetCents = targetTotal.mul(100).toDecimalPlaces(0);
  let assignedCents = new Decimal(0);

  return new Map(entries.map(([id, amount], index) => {
    const adjustedCents = index === entries.length - 1
      ? targetCents.sub(assignedCents)
      : currentTotal.isZero()
        ? new Decimal(0)
        : targetCents.mul(amount).div(currentTotal).toDecimalPlaces(0, Decimal.ROUND_DOWN);
    assignedCents = assignedCents.add(adjustedCents);
    return [id, adjustedCents.div(100)];
  }));
};

router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Ruta no disponible' });
  }
  next();
});
router.use(requireRole('EMPRESA', 'SUPER_ADMIN'));

const tenantFilter = (req) => {
  const empresaId = req.user.empresaId || req.user.id;
  return { OR: [{ usuarioId: empresaId }, { usuario: { empresaId } }] };
};

const facturaInclude = {
  items: {
    select: {
      id: true,
      productoId: true,
      descripcionHistorica: true,
      cantidad: true,
      unidadMedida: true,
      precioUnitarioHistorico: true,
      tasaImpuestoAplicada: true,
      totalLinea: true,
      producto: { select: { id: true, empresaId: true, unidadMedida: true, esVentaPorPeso: true } },
    },
  },
  pagos: {
    select: { id: true, monto: true, metodoPago: true, referenciaTransaccion: true },
    orderBy: { fechaPago: 'asc' },
  },
};

const facturaSelect = {
  id: true,
  numeroFactura: true,
  cliente: { select: { razonSocial: true, rifCedula: true } },
  fechaEmision: true,
  fechaVencimiento: true,
  subtotal: true,
  impuestoTotal: true,
  total: true,
  moneda: true,
  tasaCambio: true,
  estado: true,
  observaciones: true,
  ...facturaInclude,
};

router.get('/', async (req, res, next) => {
  try {
    const codigo = String(req.query.codigo || '').trim().replace(/^#/, '');
    if (!/^\d+$/.test(codigo) || !Number.isSafeInteger(Number(codigo))) {
      return res.status(400).json({ error: 'Introduce un código de factura válido' });
    }

    const factura = await prisma.factura.findFirst({
      where: {
        numeroFactura: Number(codigo),
        ...(req.user.rol === 'SUPER_ADMIN' ? {} : tenantFilter(req)),
      },
      select: {
        ...facturaSelect,
        items: {
          select: {
            ...facturaInclude.items.select,
            producto: { select: { unidadMedida: true, esVentaPorPeso: true } },
          },
        },
      },
    });

    if (!factura) return res.status(404).json({ error: 'No se encontró una factura con ese código' });
    res.json(factura);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const allowedFields = ['fechaVencimiento', 'observaciones', 'items', 'pagos'];
    const fields = Object.keys(req.body || {});
    if (!fields.length || fields.some((field) => !allowedFields.includes(field))) {
      return res.status(400).json({ error: 'Solo se permite editar vencimiento, observaciones, cantidades, unidades, precios y referencias de pago' });
    }

    const factura = await prisma.factura.findFirst({
      where: {
        id: req.params.id,
        ...(req.user.rol === 'SUPER_ADMIN' ? {} : tenantFilter(req)),
      },
      include: facturaInclude,
    });
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    const data = {};
    if (Object.hasOwn(req.body, 'fechaVencimiento')) {
      const fechaValue = req.body.fechaVencimiento;
      const fecha = new Date(`${fechaValue}T12:00:00`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaValue) || Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== fechaValue) {
        return res.status(400).json({ error: 'La fecha de vencimiento no es válida' });
      }
      data.fechaVencimiento = fecha;
    }
    if (Object.hasOwn(req.body, 'observaciones')) {
      if (req.body.observaciones !== null && typeof req.body.observaciones !== 'string') {
        return res.status(400).json({ error: 'Las observaciones deben ser texto' });
      }
      if (req.body.observaciones?.length > 1000) {
        return res.status(400).json({ error: 'Las observaciones no pueden superar 1000 caracteres' });
      }
      data.observaciones = req.body.observaciones?.trim() || null;
    }

    let calculatedItems;
    if (Object.hasOwn(req.body, 'items')) {
      if (!Array.isArray(req.body.items) || req.body.items.length !== factura.items.length) {
        return res.status(400).json({ error: 'Debes enviar cada línea con su cantidad, unidad y precio' });
      }

      const submittedItems = new Map();
      for (const item of req.body.items) {
        if (!item.id || submittedItems.has(item.id) || !validUnits.includes(item.unidadMedida)) {
          return res.status(400).json({ error: 'Las líneas o unidades enviadas no son válidas' });
        }
        let precio;
        let cantidad;
        try {
          precio = new Decimal(item.precioUnitarioHistorico);
          cantidad = new Decimal(item.cantidad);
        } catch { return res.status(400).json({ error: 'La cantidad o el precio de una línea no es válido' }); }

        if (!precio.isFinite() || precio.isNegative() || precio.greaterThan(99999999)) {
          return res.status(400).json({ error: 'El precio debe ser un valor positivo válido' });
        }
        if (!cantidad.isFinite() || cantidad.lte(0) || cantidad.decimalPlaces() > 4 || cantidad.greaterThan(99999999)) {
          return res.status(400).json({ error: 'La cantidad debe ser positiva y tener como máximo 4 decimales' });
        }
        if (item.unidadMedida === 'GRAMO' && !cantidad.isInteger()) {
          return res.status(400).json({ error: 'La cantidad en gramos debe ser un número entero' });
        }
        submittedItems.set(item.id, { precio, cantidad, unidadMedida: item.unidadMedida });
      }
      if (factura.items.some((item) => !submittedItems.has(item.id))) {
        return res.status(400).json({ error: 'Las líneas enviadas no corresponden a esta factura' });
      }

      calculatedItems = factura.items.map((item) => {
        const submitted = submittedItems.get(item.id);
        const { precio, cantidad, unidadMedida } = submitted;
        const quantityChanged = !cantidad.equals(item.cantidad) || unidadMedida !== item.unidadMedida;
        const priceChanged = !precio.equals(item.precioUnitarioHistorico);
        const baseUnit = item.producto?.esVentaPorPeso ? 'KILOGRAMO' : item.producto?.unidadMedida;
        const newBaseQuantity = item.producto
          ? quantityInBaseUnit(cantidad, unidadMedida, baseUnit)
          : cantidad;
        const oldBaseQuantity = item.producto
          ? quantityInBaseUnit(new Decimal(item.cantidad), item.unidadMedida, baseUnit)
          : new Decimal(item.cantidad);

        if ((!newBaseQuantity || !oldBaseQuantity) && quantityChanged) {
          throw createBusinessError(`No hay una conversión segura entre ${item.unidadMedida} y la unidad base del producto`);
        }
        if (quantityChanged && !item.producto) {
          throw createBusinessError('No se puede cambiar la cantidad porque el producto original ya no está disponible');
        }
        if (factura.estado === 'VOIDED' && (quantityChanged || priceChanged)) {
          throw createBusinessError('No se pueden cambiar precios o cantidades de una factura anulada');
        }

        const cantidadParaCalculo = newBaseQuantity || cantidad;
        const subtotalLinea = precio.mul(cantidadParaCalculo).toDecimalPlaces(2);
        const impuestoLinea = subtotalLinea.mul(item.tasaImpuestoAplicada).div(100).toDecimalPlaces(2);
        return {
          id: item.id,
          descripcionHistorica: item.descripcionHistorica,
          producto: item.producto,
          precioUnitarioHistorico: precio,
          // Normalizar almacenamiento a la unidad base (kg para venta por peso)
          cantidad: (item.producto && newBaseQuantity) ? newBaseQuantity : cantidad,
          unidadMedida: item.producto ? baseUnit : unidadMedida,
          stockDelta: oldBaseQuantity && newBaseQuantity ? oldBaseQuantity.sub(newBaseQuantity) : null,
          subtotalLinea,
          impuestoLinea,
          totalLinea: subtotalLinea.add(impuestoLinea).toDecimalPlaces(2),
        };
      });

      data.subtotal = calculatedItems.reduce((sum, item) => sum.add(item.subtotalLinea), new Decimal(0));
      data.impuestoTotal = calculatedItems.reduce((sum, item) => sum.add(item.impuestoLinea), new Decimal(0));
      data.total = calculatedItems.reduce((sum, item) => sum.add(item.totalLinea), new Decimal(0));
    }

    let submittedPaymentAmounts;
    if (Object.hasOwn(req.body, 'pagos')) {
      if (!Array.isArray(req.body.pagos)) {
        return res.status(400).json({ error: 'La lista de pagos no es válida' });
      }
      const paymentIds = new Set(factura.pagos.map((pago) => pago.id));
      const submittedPayments = new Set();
      submittedPaymentAmounts = new Map();
      for (const pago of req.body.pagos) {
        if (!paymentIds.has(pago.id) || submittedPayments.has(pago.id)) {
          return res.status(400).json({ error: 'El pago no pertenece a esta factura' });
        }
        if (pago.referenciaTransaccion !== null && typeof pago.referenciaTransaccion !== 'string') {
          return res.status(400).json({ error: 'La referencia de pago debe ser texto' });
        }
        if (pago.referenciaTransaccion?.length > 200) {
          return res.status(400).json({ error: 'La referencia no puede superar 200 caracteres' });
        }
        if (pago.metodoPago && !validPaymentMethods.includes(pago.metodoPago)) {
          return res.status(400).json({ error: 'El método de pago no es válido' });
        }
        let monto;
        try { monto = new Decimal(pago.monto); }
        catch { return res.status(400).json({ error: 'El monto del pago no es válido' }); }
        if (!monto.isFinite() || monto.isNegative() || monto.decimalPlaces() > 2 || monto.greaterThan('9999999999.99')) {
          return res.status(400).json({ error: 'El monto del pago debe ser positivo y tener máximo 2 decimales' });
        }
        submittedPayments.add(pago.id);
        submittedPaymentAmounts.set(pago.id, monto);
      }
      if (submittedPayments.size !== paymentIds.size) {
        return res.status(400).json({ error: 'Debes enviar las referencias de todos los pagos' });
      }
    }

    const totalFactura = calculatedItems ? data.total : new Decimal(factura.total);
    let paymentAmountsToPersist = submittedPaymentAmounts || new Map(
      factura.pagos.map((pago) => [pago.id, new Decimal(pago.monto)])
    );
    let totalPagado = sumPaymentAmounts(paymentAmountsToPersist);
    const requiresRebalance = totalPagado.greaterThan(totalFactura);
    if (requiresRebalance && paymentAmountsToPersist.size > 0) {
      paymentAmountsToPersist = rebalancePaymentAmounts(paymentAmountsToPersist, totalFactura);
      totalPagado = sumPaymentAmounts(paymentAmountsToPersist);
    }
    if (factura.estado !== 'VOIDED' && (calculatedItems || submittedPaymentAmounts)) {
      data.estado = totalPagado.isZero()
        ? 'PENDING'
        : totalPagado.greaterThanOrEqualTo(totalFactura) ? 'PAID' : 'PARTIALLY_PAID';
    }

    const updated = await prisma.$transaction(async (tx) => {
      for (const item of calculatedItems || []) {
        if (!item.stockDelta || item.stockDelta.isZero()) continue;
        if (item.stockDelta.isPositive()) {
          const stockUpdated = await tx.producto.updateMany({
            where: { id: item.producto.id, empresaId: item.producto.empresaId },
            data: { stockActual: { increment: Number(item.stockDelta) } },
          });
          if (!stockUpdated.count) {
            throw createBusinessError(`No se pudo ajustar el stock de "${item.descripcionHistorica}"`);
          }
        } else {
          const stockUpdated = await tx.producto.updateMany({
            where: {
              id: item.producto.id,
              empresaId: item.producto.empresaId,
              stockActual: { gte: Number(item.stockDelta.abs()) },
            },
            data: { stockActual: { decrement: Number(item.stockDelta.abs()) } },
          });
          if (!stockUpdated.count) {
            throw createBusinessError(`Stock insuficiente para aumentar la cantidad de "${item.descripcionHistorica}"`);
          }
        }
      }

      if (calculatedItems) {
        await Promise.all(calculatedItems.map((item) => tx.itemFactura.update({
          where: { id: item.id },
          data: {
            precioUnitarioHistorico: item.precioUnitarioHistorico,
            cantidad: item.cantidad,
            unidadMedida: item.unidadMedida,
            subtotalLinea: item.subtotalLinea,
            impuestoLinea: item.impuestoLinea,
            totalLinea: item.totalLinea,
          },
        })));
      }
      if (Object.hasOwn(req.body, 'pagos') || requiresRebalance) {
        const paymentDetails = new Map((req.body.pagos || []).map((pago) => [pago.id, pago]));
        await Promise.all([...paymentAmountsToPersist].map(([id, monto]) => {
          const pago = paymentDetails.get(id);
          return tx.pago.update({
            where: { id },
            data: {
              monto,
              ...(pago?.metodoPago ? { metodoPago: pago.metodoPago } : {}),
              ...(pago ? { referenciaTransaccion: pago.referenciaTransaccion?.trim() || null } : {}),
            },
          });
        }));
      }
      return tx.factura.update({ where: { id: req.params.id }, data, select: facturaSelect });
    });

    invalidarCacheVentas();
    res.json(updated);
  } catch (err) { next(err); }
});

module.exports = router;