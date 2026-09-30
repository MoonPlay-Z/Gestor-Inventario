const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');

// SUPER_ADMIN no gestiona pagos
router.use(requireRole('EMPRESA', 'CAJA'));

const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;
const facturaTenantFilter = (empresaId) => ({
  OR: [
    { usuarioId: empresaId },
    { usuario: { empresaId } }
  ]
});

const METODOS_VALIDOS = ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PAYMENT'];

// GET /api/pagos?facturaId= (con paginación)
router.get('/', async (req, res, next) => {
  try {
    const { facturaId } = req.query;
    const { skip, take, page, limit } = paginate(req.query, { limit: 50 });
    const empresaId = getEmpresaId(req);
    const where = {
      factura: facturaTenantFilter(empresaId),
      ...(facturaId ? { facturaId } : {}),
    };

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where,
        skip,
        take,
        orderBy: { fechaPago: 'desc' },
        include: {
          factura: {
            select: {
              id: true,
              numeroFactura: true,
              estado: true,
              total: true,
              moneda: true,
              tasaCambio: true,
              cliente: { select: { id: true, razonSocial: true, rifCedula: true } },
            },
          },
        },
      }),
      prisma.pago.count({ where }),
    ]);
    res.json(paginatedResponse(pagos, total, page, limit));
  } catch (err) { next(err); }
});

// POST /api/pagos — Registrar pago (transacción atómica)
router.post('/', async (req, res, next) => {
  try {
    const { facturaId, monto, metodoPago, referenciaTransaccion, fechaPago, notas } = req.body;

    // ── Validaciones ──────────────────────────────────────────────────────────
    if (!facturaId)   throw createValidationError('El ID de factura es obligatorio', { facturaId: 'Campo requerido' });
    if (!metodoPago)  throw createValidationError('El método de pago es obligatorio', { metodoPago: 'Seleccione un método' });
    if (!METODOS_VALIDOS.includes(metodoPago)) {
      throw createValidationError(`Método de pago inválido. Valores permitidos: ${METODOS_VALIDOS.join(', ')}`);
    }

    const montoPago = new Decimal(monto ?? 0);
    if (montoPago.lte(0)) throw createValidationError('El monto del pago debe ser mayor a 0', { monto: 'Debe ser positivo' });

    // Si el método NO es CASH, la referencia es obligatoria
    if (metodoPago !== 'CASH' && !referenciaTransaccion?.trim()) {
      throw createValidationError('La referencia de transacción es obligatoria para este método de pago', {
        referenciaTransaccion: 'Campo requerido',
      });
    }

    // ── Obtener factura y calcular balance ────────────────────────────────────
    const empresaId = getEmpresaId(req);
    const factura = await prisma.factura.findFirstOrThrow({
      where: {
        id: facturaId,
        ...facturaTenantFilter(empresaId),
      },
      include: { pagos: true },
    });

    if (factura.estado === 'VOIDED') {
      throw createBusinessError('No se puede registrar un pago en una factura anulada');
    }
    if (factura.estado === 'PAID') {
      throw createBusinessError('La factura ya está completamente pagada');
    }

    const totalPagado = factura.pagos.reduce(
      (acc, p) => acc.add(new Decimal(p.monto.toString())),
      new Decimal(0)
    );
    const totalFactura     = new Decimal(factura.total.toString());
    const balancePendiente = totalFactura.sub(totalPagado);

    if (montoPago.gt(balancePendiente)) {
      throw createBusinessError(
        `El monto (${montoPago.toFixed(2)}) excede el balance pendiente (${balancePendiente.toFixed(2)})`
      );
    }

    // ── Determinar nuevo estado de factura ────────────────────────────────────
    const nuevoTotalPagado = totalPagado.add(montoPago);
    let nuevoEstado;
    if (nuevoTotalPagado.gte(totalFactura)) {
      nuevoEstado = 'PAID';
    } else {
      nuevoEstado = 'PARTIALLY_PAID';
    }

    // ── Transacción atómica ───────────────────────────────────────────────────
    const { pago, facturaActualizada } = await prisma.$transaction(async (tx) => {
      const nuevoPago = await tx.pago.create({
        data: {
          facturaId,
          monto:                 montoPago.toFixed(2),
          metodoPago,
          referenciaTransaccion: referenciaTransaccion?.trim() || null,
          fechaPago:             fechaPago ? new Date(fechaPago).toISOString() : new Date().toISOString(),
          notas:                 notas?.trim() || null,
        },
      });

      const facturaUpd = await tx.factura.update({
        where: { id: facturaId },
        data:  { estado: nuevoEstado },
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
          pagos: {
            select: {
              id: true,
              monto: true,
              metodoPago: true,
              fechaPago: true,
            },
          },
        },
      });

      return { pago: nuevoPago, facturaActualizada: facturaUpd };
    });

    // Calcular totales para la respuesta
    const totalPagadoFinal = facturaActualizada.pagos.reduce(
      (acc, p) => acc.add(new Decimal(p.monto.toString())),
      new Decimal(0)
    );
    const balanceFinal = totalFactura.sub(totalPagadoFinal);

    res.status(201).json({
      pago,
      factura: {
        ...facturaActualizada,
        totalPagado: totalPagadoFinal.toFixed(2),
        balancePendiente: balanceFinal.toFixed(2),
      },
    });
  } catch (err) { next(err); }
});

// DELETE /api/pagos/:id — Eliminar pago y revertir estado factura
router.delete('/:id', async (req, res, next) => {
  try {
    const empresaId = getEmpresaId(req);
    const pago = await prisma.pago.findFirstOrThrow({
      where: {
        id: req.params.id,
        factura: facturaTenantFilter(empresaId),
      },
      select: {
        id: true,
        facturaId: true,
        monto: true,
        metodoPago: true,
        referenciaTransaccion: true,
        fechaPago: true,
        notas: true,
        createdAt: true,
        factura: {
          select: {
            id: true,
            numeroFactura: true,
            estado: true,
            total: true,
            moneda: true,
            tasaCambio: true,
            pagos: {
              select: {
                id: true,
                monto: true,
                metodoPago: true,
                fechaPago: true,
              },
            },
          },
        },
      },
    });

    const factura = pago.factura;
    if (factura.estado === 'VOIDED') {
      throw createBusinessError('No se puede eliminar un pago de una factura anulada');
    }

    await prisma.$transaction(async (tx) => {
      await tx.pago.delete({ where: { id: req.params.id } });

      // Recalcular estado
      const otrosPagos = factura.pagos.filter(p => p.id !== req.params.id);
      const totalOtros = otrosPagos.reduce(
        (acc, p) => acc.add(new Decimal(p.monto.toString())),
        new Decimal(0)
      );
      const totalFactura = new Decimal(factura.total.toString());

      let nuevoEstado;
      if (totalOtros.lte(0))          nuevoEstado = 'PENDING';
      else if (totalOtros.gte(totalFactura)) nuevoEstado = 'PAID';
      else                            nuevoEstado = 'PARTIALLY_PAID';

      await tx.factura.update({ where: { id: factura.id }, data: { estado: nuevoEstado } });
    });

    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
