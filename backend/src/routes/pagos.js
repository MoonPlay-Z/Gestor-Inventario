const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { Decimal } = require('decimal.js');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');
const {
  MONEDAS_PAGO,
  convertirAFactura,
  convertirMontoMoneda,
  sumarPagosNormalizados,
  sumarPagosCxcUSD,
  tasaCambioEfectiva,
} = require('../utils/tasaAPI');
const { resolverEmpresaRefId } = require('../utils/empresaContext');
const { tasaBCVPorFecha } = require('../utils/bcvHistorico');
const { toDecimalSeguro } = require('../utils/decimal');
const { lockFactura, lockCuenta } = require('../utils/locks');

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
        // Un solo bloque `select` de nivel superior: Prisma no admite `include`
        // y `select` juntos (devolvía 500 en todos los listados de pagos). Los
        // campos de `factura` van anidados dentro del `select`.
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
    const { facturaId, monto, metodoPago, monedaPago, referenciaTransaccion, fechaPago, notas } = req.body;

    // ── Validaciones ──────────────────────────────────────────────────────────
    if (!facturaId)   throw createValidationError('El ID de factura es obligatorio', { facturaId: 'Campo requerido' });
    if (!metodoPago)  throw createValidationError('El método de pago es obligatorio', { metodoPago: 'Seleccione un método' });
    if (!METODOS_VALIDOS.includes(metodoPago)) {
      throw createValidationError(`Método de pago inválido. Valores permitidos: ${METODOS_VALIDOS.join(', ')}`);
    }

    const montoPago = toDecimalSeguro(monto, 0);
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

    // ── Tasa BCV histórica para la fecha del pago ─────────────────────────────
    // Se resuelve fuera de la transacción: es I/O externo y no debe bloquear la
    // fila de la factura mientras se espera la API del BCV.
    const fechaPagoFinal = fechaPago && !isNaN(new Date(fechaPago).getTime())
      ? new Date(fechaPago)
      : new Date();
    let tasaBCV = null;
    try {
      tasaBCV = await tasaBCVPorFecha(fechaPagoFinal);
    } catch (err) {
      console.warn('No se pudo obtener tasa BCV:', err.message);
    }

    const empresaId = getEmpresaId(req);
    const empresaRefId = await getEmpresaRefId(req);

    // ── Transacción atómica ───────────────────────────────────────────────────
    // La factura se relee DENTRO de la transacción y con bloqueo de fila: si se
    // validara el saldo antes, dos abonos concurrentes leían el mismo pendiente
    // y ambos pasaban (sobrepago por carrera). Con el lock, el segundo espera y
    // ve el saldo ya actualizado.
    const { pago, facturaActualizada, totalPagadoFinal } = await prisma.$transaction(async (tx) => {
      // Orden de bloqueo: factura primero, luego CxC (evita deadlocks con
      // POST /cxc/:id/pago, que sigue el mismo orden).
      await lockFactura(tx, facturaId);

      const factura = await tx.factura.findFirstOrThrow({
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

      const monedaDelPagoTx = monedaPago || factura.moneda || 'USD';
      const totalPagado = await sumarPagosNormalizados(factura.pagos, factura, empresaRefId);
      const totalFactura = new Decimal(factura.total.toString());
      const balancePendiente = totalFactura.sub(totalPagado);
      const montoEnMonedaFactura = await convertirAFactura(
        montoPago,
        monedaDelPagoTx,
        factura,
        empresaRefId
      );

      if (montoEnMonedaFactura.gt(balancePendiente.plus(TOLERANCIA_REDONDEO))) {
        throw createBusinessError(
          `El monto (${montoPago.toFixed(2)} ${monedaDelPagoTx}) excede el balance pendiente (${balancePendiente.toFixed(2)} ${factura.moneda || 'USD'})`
        );
      }
      const montoAplicar = montoEnMonedaFactura.gt(balancePendiente) ? balancePendiente : montoEnMonedaFactura;

      const nuevoTotalPagado = totalPagado.add(montoAplicar);
      const nuevoEstado = nuevoTotalPagado.gte(totalFactura) ? 'PAID' : 'PARTIALLY_PAID';

      const nuevoPago = await tx.pago.create({
        data: {
          facturaId,
          monto:                 montoPago.toFixed(2),
          monedaPago:            monedaDelPagoTx,
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

      // Actualizar CuentaPorCobrar. SIEMPRE en USD: se normaliza con la misma
      // función que usa cxc.js (`sumarPagosCxcUSD`). Antes escribía el total en
      // la moneda de la factura, así que un abono de 1000 Bs sobre una factura
      // VES de 10 USD dejaba montoCobrado=1000 sobre montoOriginal=10.
      const cxc = await tx.cuentaPorCobrar.findUnique({ where: { facturaId } });
      if (cxc) {
        await lockCuenta(tx, cxc.id);

        const cobradoPrevioUSD = await sumarPagosCxcUSD(factura.pagos, factura, empresaRefId);
        const montoAplicarUSD = await convertirMontoMoneda(
          montoAplicar,
          factura.moneda || 'USD',
          'USD',
          await tasaCambioEfectiva(factura, empresaRefId)
        );
        const nuevoCobradoUSD = cobradoPrevioUSD.add(montoAplicarUSD);
        const nuevoPendienteUSD = new Decimal(cxc.montoOriginal.toString()).sub(nuevoCobradoUSD);

        let estadoCxc;
        if (nuevoPendienteUSD.lte(0)) estadoCxc = 'PAID';
        else if (nuevoCobradoUSD.gt(0)) estadoCxc = 'PARTIALLY_PAID';
        else estadoCxc = 'PENDING';

        await tx.cuentaPorCobrar.update({
          where: { id: cxc.id },
          data: {
            montoCobrado: nuevoCobradoUSD.toFixed(2),
            montoPendiente: nuevoPendienteUSD.gt(0) ? nuevoPendienteUSD.toFixed(2) : '0.00',
            estado: estadoCxc,
            ultimaGestion: new Date().toISOString(),
          },
        });
      }

      const totalPagadoFinal = await sumarPagosNormalizados(facturaUpd.pagos, facturaUpd, empresaRefId);
      return { pago: nuevoPago, facturaActualizada: facturaUpd, totalPagadoFinal };
    });

    // Calcular totales para la respuesta
    const balanceFinal = new Decimal(facturaActualizada.total.toString()).sub(totalPagadoFinal);

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
    const empresaRefId = await getEmpresaRefId(req);

    await prisma.$transaction(async (tx) => {
      const pago = await tx.pago.findFirstOrThrow({
        where: {
          id: req.params.id,
          factura: facturaTenantFilter(empresaId),
        },
        select: { id: true, facturaId: true },
      });

      await lockFactura(tx, pago.facturaId);

      // Relectura dentro de la transacción: el listado pudo cambiar entre la
      // lectura previa y el borrado (p. ej. otro pago simultáneo).
      const factura = await tx.factura.findUniqueOrThrow({
        where: { id: pago.facturaId },
        include: { pagos: true },
      });

      if (factura.estado === 'VOIDED') {
        throw createBusinessError('No se puede eliminar un pago de una factura anulada');
      }

      await tx.pago.delete({ where: { id: req.params.id } });

      const otrosPagos = factura.pagos.filter(p => p.id !== req.params.id);
      const totalOtros = await sumarPagosNormalizados(otrosPagos, factura, empresaRefId);
      const totalFactura = new Decimal(factura.total.toString());

      let nuevoEstado;
      if (totalOtros.lte(0))          nuevoEstado = 'PENDING';
      else if (totalOtros.gte(totalFactura)) nuevoEstado = 'PAID';
      else                            nuevoEstado = 'PARTIALLY_PAID';

      await tx.factura.update({ where: { id: factura.id }, data: { estado: nuevoEstado } });

      // CxC en USD, igual que al registrar el pago (misma normalización).
      const cxc = await tx.cuentaPorCobrar.findUnique({ where: { facturaId: factura.id } });
      if (cxc) {
        const totalOtrosUSD = await sumarPagosCxcUSD(otrosPagos, factura, empresaRefId);
        const pendienteUSD = new Decimal(cxc.montoOriginal.toString()).sub(totalOtrosUSD);

        let estadoCxc;
        if (pendienteUSD.lte(0)) estadoCxc = 'PAID';
        else if (totalOtrosUSD.gt(0)) estadoCxc = 'PARTIALLY_PAID';
        else estadoCxc = 'PENDING';

        await tx.cuentaPorCobrar.update({
          where: { id: cxc.id },
          data: {
            montoCobrado: totalOtrosUSD.toFixed(2),
            montoPendiente: pendienteUSD.gt(0) ? pendienteUSD.toFixed(2) : '0.00',
            estado: estadoCxc,
            ultimaGestion: new Date().toISOString()
          }
        });
      }
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
