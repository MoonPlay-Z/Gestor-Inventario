const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { MONEDAS_PAGO, convertirAFactura, sumarPagosNormalizados } = require('../utils/paymentCurrency');
const { resolverEmpresaRefId } = require('../utils/empresaContext');
const { tasaBCVPorFecha } = require('../utils/bcvHistorico');

// Medio centavo de tolerancia: absorber el excedente de redondeo que aparece al
// convertir un abono en Bs a USD (p. ej. 10 Bs = 0.0116 USD contra 0.01 USD).
const TOLERANCIA_REDONDEO = new Decimal('0.005');

// SUPER_ADMIN no gestiona pagos
router.use(requireRole('EMPRESA', 'CAJA'));

const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;
// Sube por el Usuario padre para obtener el id real en `empresas`, necesario
// para resolver la tasa por empresa (las sub-cuentas CAJA tienen empresaRefId=NULL).
const getEmpresaRefId = (req) => resolverEmpresaRefId(req);
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
        select: {
          id: true,
          facturaId: true,
          monto: true,
          monedaPago: true,
          metodoPago: true,
          referenciaTransaccion: true,
          fechaPago: true,
          notas: true,
          tasaBCV: true,
          createdAt: true,
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
    const { facturaId, monto, metodoPago, monedaPago, referenciaTransaccion, fechaPago, notas } = req.body;

    // ── Validaciones ──────────────────────────────────────────────────────────
    if (!facturaId)   throw createValidationError('El ID de factura es obligatorio', { facturaId: 'Campo requerido' });
    if (!metodoPago)  throw createValidationError('El método de pago es obligatorio', { metodoPago: 'Seleccione un método' });
    if (!METODOS_VALIDOS.includes(metodoPago)) {
      throw createValidationError(`Método de pago inválido. Valores permitidos: ${METODOS_VALIDOS.join(', ')}`);
    }

    const montoPago = new Decimal(monto ?? 0);
    if (!montoPago.isFinite() || montoPago.lte(0)) throw createValidationError('El monto del pago debe ser mayor a 0', { monto: 'Debe ser positivo' });
    if (monedaPago !== undefined && !MONEDAS_PAGO.includes(monedaPago)) {
      throw createValidationError('La moneda del pago debe ser USD o VES', { monedaPago: 'Moneda inválida' });
    }

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

    const empresaRefId = await getEmpresaRefId(req);
    const monedaDelPago = monedaPago || factura.moneda || 'USD';
    const totalPagado = await sumarPagosNormalizados(factura.pagos, factura, empresaRefId);
    const totalFactura     = new Decimal(factura.total.toString());
    const balancePendiente = totalFactura.sub(totalPagado);
    const montoEnMonedaFactura = await convertirAFactura(
      montoPago,
      monedaDelPago,
      factura,
      empresaRefId
    );

    if (montoEnMonedaFactura.gt(balancePendiente.plus(TOLERANCIA_REDONDEO))) {
      throw createBusinessError(
        `El monto (${montoPago.toFixed(2)} ${monedaDelPago}) excede el balance pendiente (${balancePendiente.toFixed(2)} ${factura.moneda || 'USD'})`
      );
    }
    const montoAplicar = montoEnMonedaFactura.gt(balancePendiente) ? balancePendiente : montoEnMonedaFactura;

    // ── Determinar nuevo estado de factura ────────────────────────────────────
    const nuevoTotalPagado = totalPagado.add(montoAplicar);
    let nuevoEstado;
    if (nuevoTotalPagado.gte(totalFactura)) {
      nuevoEstado = 'PAID';
    } else {
      nuevoEstado = 'PARTIALLY_PAID';
    }

    // ── Obtener tasa BCV histórica para la fecha del pago ────────────────────
    const fechaPagoFinal = fechaPago && !isNaN(new Date(fechaPago).getTime())
      ? new Date(fechaPago)
      : new Date();
    let tasaBCV = null;
    try {
      tasaBCV = await tasaBCVPorFecha(fechaPagoFinal);
    } catch (err) {
      console.warn('No se pudo obtener tasa BCV:', err.message);
    }

    // ── Transacción atómica ───────────────────────────────────────────────────
    const { pago, facturaActualizada } = await prisma.$transaction(async (tx) => {
      const nuevoPago = await tx.pago.create({
        data: {
          facturaId,
          monto:                 montoPago.toFixed(2),
          monedaPago:            monedaDelPago,
          metodoPago,
          referenciaTransaccion: referenciaTransaccion?.trim() || null,
          fechaPago:             fechaPagoFinal.toISOString(),
          notas:                 notas?.trim() || null,
          tasaBCV:               tasaBCV ? tasaBCV.toFixed(4) : null,
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
              monedaPago: true,
              metodoPago: true,
              fechaPago: true,
            },
          },
        },
      });

      // Actualizar CuentaPorCobrar
      await tx.cuentaPorCobrar.update({
        where: { facturaId },
        data: {
          montoCobrado: nuevoTotalPagado.toFixed(2),
          montoPendiente: totalFactura.sub(nuevoTotalPagado).gt(0)
            ? totalFactura.sub(nuevoTotalPagado).toFixed(2)
            : '0.00',
          estado: nuevoEstado,
          ultimaGestion: new Date().toISOString()
        }
      }).catch(() => {
        // Si no existe CxC, no es error crítico
      });

      return { pago: nuevoPago, facturaActualizada: facturaUpd };
    });

    // Calcular totales para la respuesta
    const totalPagadoFinal = await sumarPagosNormalizados(facturaActualizada.pagos, facturaActualizada, empresaRefId);
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
        monedaPago: true,
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
                monedaPago: true,
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
      // Se calcula fuera de la transacción: la conversión puede requerir I/O
      // (tasa por empresa) y no debe bloquear filas mientras tanto.
      const totalOtros = await sumarPagosNormalizados(otrosPagos, factura, await getEmpresaRefId(req));
      const totalFactura = new Decimal(factura.total.toString());

      let nuevoEstado;
      if (totalOtros.lte(0))          nuevoEstado = 'PENDING';
      else if (totalOtros.gte(totalFactura)) nuevoEstado = 'PAID';
      else                            nuevoEstado = 'PARTIALLY_PAID';

      await tx.factura.update({ where: { id: factura.id }, data: { estado: nuevoEstado } });

      // Actualizar CuentaPorCobrar
      await tx.cuentaPorCobrar.update({
        where: { facturaId: factura.id },
        data: {
          montoCobrado: totalOtros.toFixed(2),
          montoPendiente: totalFactura.sub(totalOtros).gt(0)
            ? totalFactura.sub(totalOtros).toFixed(2)
            : '0.00',
          estado: nuevoEstado,
          ultimaGestion: new Date().toISOString()
        }
      }).catch(() => {});
    });

    res.status(204).send();
  } catch (err) { next(err); }
});

// POST /api/pagos/backfill-tasa-bcv — Asignar tasa BCV a pagos históricos
router.post('/backfill-tasa-bcv', async (req, res, next) => {
  try {
    const { tasaBCVPorFecha } = require('../utils/bcvHistorico');
    const pagosSinTasa = await prisma.pago.findMany({
      where: { tasaBCV: null },
      select: { id: true, fechaPago: true },
      orderBy: { fechaPago: 'asc' },
    });

    let actualizados = 0;
    let sinDatos = 0;

    for (const pago of pagosSinTasa) {
      try {
        const tasa = await tasaBCVPorFecha(pago.fechaPago);
        if (!tasa) { sinDatos++; continue; }
        await prisma.pago.update({
          where: { id: pago.id },
          data: { tasaBCV: tasa.toFixed(4) },
        });
        actualizados++;
      } catch (err) {
        console.error(`Error en pago ${pago.id}:`, err.message);
      }
    }

    res.json({ actualizados, sinDatos, total: pagosSinTasa.length });
  } catch (err) { next(err); }
});

module.exports = router;
