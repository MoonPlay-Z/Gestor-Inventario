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
const { containsInsensitive } = require('../utils/textSearch');
const { registrarAuditoria } = require('../utils/auditLog');
const { invalidarCacheVentas } = require('../services/reportesService');
const cxcRouter = require('./cxc');
const {
  ESTADOS_PAGO,
  MOTIVOS_ANULACION_PAGO_VALIDOS,
  DESCRIPCION_ANULACION_PAGO_MIN,
  DESCRIPCION_ANULACION_PAGO_MAX,
  CONFIRMACION_ANULACION_PAGO,
  METODOS_ABONO_VALIDOS,
  esMetodoPagoValido,
  requiereReferenciaMetodo,
  esMetodoFinanciado,
} = require('../config/pagos');

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

const METODOS_VALIDOS = METODOS_ABONO_VALIDOS;

// Forma única de un pago con su factura. Evita que el listado, el historial de
// anulados y la respuesta de anulación devuelvan columnas distintas.
const PAGO_CON_FACTURA_SELECT = {
  id: true,
  facturaId: true,
  monto: true,
  monedaPago: true,
  metodoPago: true,
  referenciaTransaccion: true,
  fechaPago: true,
  notas: true,
  tasaBCV: true,
  estado: true,
  motivoAnulacion: true,
  descripcionAnulacion: true,
  anuladoPor: true,
  fechaAnulacion: true,
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
      cuentaPorCobrar: { select: { id: true } },
    },
  },
};

// El CAJA solo administra sus propias ventas; EMPRESA ve todo su tenant.
// Se aplica en la anulación y en el historial de anulados. `GET /api/pagos`
// conserva su alcance histórico de empresa para no romper consumidores.
const pagoTenantFilter = (req) => {
  if (req.user.rol === 'CAJA') {
    return { factura: { usuarioId: req.user.id } };
  }
  return { factura: facturaTenantFilter(getEmpresaId(req)) };
};

/**
 * Valida el cuerpo de una anulación. La descripción es obligatoria porque es
 * el dato que luego se muestra en el historial y en la auditoría; no se acepta
 * un motivo genérico sin explicación.
 */
function validarAnulacionPago(req) {
  const { motivo, descripcion, codigoAnulacion, confirmacion } = req.body || {};

  if (confirmacion !== CONFIRMACION_ANULACION_PAGO) {
    throw createValidationError(
      `Debes escribir "${CONFIRMACION_ANULACION_PAGO}" para confirmar la anulación`,
      { confirmacion: `Escribe ${CONFIRMACION_ANULACION_PAGO} exactamente` }
    );
  }
  if (!MOTIVOS_ANULACION_PAGO_VALIDOS.includes(motivo)) {
    throw createValidationError(
      `Motivo inválido. Valores permitidos: ${MOTIVOS_ANULACION_PAGO_VALIDOS.join(', ')}`,
      { motivo: 'Seleccione un motivo' }
    );
  }
  if (typeof descripcion !== 'string') {
    throw createValidationError('La descripción de la anulación es obligatoria', {
      descripcion: 'Campo requerido',
    });
  }

  const descripcionLimpia = descripcion.trim();
  if (descripcionLimpia.length < DESCRIPCION_ANULACION_PAGO_MIN) {
    throw createValidationError(
      `La descripción debe tener al menos ${DESCRIPCION_ANULACION_PAGO_MIN} caracteres`,
      { descripcion: `Mínimo ${DESCRIPCION_ANULACION_PAGO_MIN} caracteres` }
    );
  }
  if (descripcionLimpia.length > DESCRIPCION_ANULACION_PAGO_MAX) {
    throw createValidationError(
      `La descripción no puede superar ${DESCRIPCION_ANULACION_PAGO_MAX} caracteres`,
      { descripcion: `Máximo ${DESCRIPCION_ANULACION_PAGO_MAX} caracteres` }
    );
  }

  if (req.user.rol === 'CAJA') {
    const systemVoidCode = process.env.VOID_CODE || '1234';
    if (typeof codigoAnulacion !== 'string' || codigoAnulacion.trim() !== systemVoidCode) {
      throw createBusinessError(
        'Código de anulación inválido. Un usuario de Caja requiere autorización del supervisor.',
        { code: 'CODIGO_ANULACION_INVALIDO' }
      );
    }
  }

  return { motivo, descripcion: descripcionLimpia };
}

// GET /api/pagos/anulados — Historial de pagos anulados con su descripción
router.get('/anulados', async (req, res, next) => {
  try {
    const { q, motivo, desde, hasta } = req.query;
    const { skip, take, page, limit } = paginate(req.query, { limit: 25 });
    const where = {
      estado: ESTADOS_PAGO.ANULADO,
      ...pagoTenantFilter(req),
    };

    if (motivo) {
      if (!MOTIVOS_ANULACION_PAGO_VALIDOS.includes(motivo)) {
        throw createValidationError('El filtro de motivo de anulación no es válido');
      }
      where.motivoAnulacion = motivo;
    }

    const rango = {};
    if (desde) {
      const fecha = new Date(desde);
      if (isNaN(fecha.getTime())) throw createValidationError('La fecha "desde" no es válida');
      rango.gte = fecha;
    }
    if (hasta) {
      const fecha = new Date(hasta);
      if (isNaN(fecha.getTime())) throw createValidationError('La fecha "hasta" no es válida');
      rango.lte = fecha;
    }
    if (Object.keys(rango).length > 0) where.fechaAnulacion = rango;

    if (q) {
      const terms = q.trim().split(/\s+/).filter(Boolean);
      if (terms.length > 0) {
        where.AND = terms.map(term => ({
          OR: [
            { descripcionAnulacion: containsInsensitive(term) },
            { motivoAnulacion: containsInsensitive(term) },
            { referenciaTransaccion: containsInsensitive(term) },
            { anuladoPor: containsInsensitive(term) },
            { factura: { cliente: { razonSocial: containsInsensitive(term) } } },
            { factura: { cliente: { rifCedula: containsInsensitive(term) } } },
            ...(/^\d+$/.test(term) ? [{ factura: { numeroFactura: parseInt(term, 10) } }] : []),
          ],
        }));
      }
    }

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where,
        skip,
        take,
        orderBy: [{ fechaAnulacion: 'desc' }, { fechaPago: 'desc' }],
        select: PAGO_CON_FACTURA_SELECT,
      }),
      prisma.pago.count({ where }),
    ]);

    res.json(paginatedResponse(pagos, total, page, limit));
  } catch (err) { next(err); }
});

// GET /api/pagos?facturaId= (con paginación)
router.get('/', async (req, res, next) => {
  try {
    const { facturaId, estado } = req.query;
    const { skip, take, page, limit } = paginate(req.query, { limit: 50 });
    const empresaId = getEmpresaId(req);
    const where = {
      factura: facturaTenantFilter(empresaId),
      ...(facturaId ? { facturaId } : {}),
    };

    if (estado) {
      if (!Object.values(ESTADOS_PAGO).includes(estado)) {
        throw createValidationError('El filtro de estado de pago no es válido');
      }
      where.estado = estado;
    }

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where,
        skip,
        take,
        orderBy: { fechaPago: 'desc' },
        // Un solo bloque `select` de nivel superior: Prisma no admite `include`
        // y `select` juntos (devolvía 500 en todos los listados de pagos). Los
        // campos de `factura` van anidados dentro del `select`.
        select: PAGO_CON_FACTURA_SELECT,
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
    if (!esMetodoPagoValido(metodoPago) || esMetodoFinanciado(metodoPago)) {
      throw createValidationError(`Método de pago inválido. Valores permitidos: ${METODOS_VALIDOS.join(', ')}`);
    }

    const montoPago = toDecimalSeguro(monto, 0);
    if (!montoPago.isFinite() || montoPago.lte(0)) throw createValidationError('El monto del pago debe ser mayor a 0', { monto: 'Debe ser positivo' });
    if (monedaPago !== undefined && !MONEDAS_PAGO.includes(monedaPago)) {
      throw createValidationError('La moneda del pago debe ser USD o VES', { monedaPago: 'Moneda inválida' });
    }

    // Si el método exige referencia, es obligatoria
    if (requiereReferenciaMetodo(metodoPago) && !referenciaTransaccion?.trim()) {
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
          referenciaTransaccion: requiereReferenciaMetodo(metodoPago) ? referenciaTransaccion.trim() : null,
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
              estado: true,
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
        const montoAplicarUSD = convertirMontoMoneda(
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
    cxcRouter.invalidarCacheCxcResumen?.();

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

// PATCH /api/pagos/:id/anular — Anular un pago sin borrarlo
// La factura y la CxC se recalculan con los pagos ACTIVOS restantes. La fila
// original se conserva con motivo, descripción, autor y fecha de anulación.
router.patch('/:id/anular', async (req, res, next) => {
  try {
    const { motivo, descripcion } = validarAnulacionPago(req);
    const empresaRefId = await getEmpresaRefId(req);

    const resultado = await prisma.$transaction(async (tx) => {
      const pagoRef = await tx.pago.findFirstOrThrow({
        where: { id: req.params.id, ...pagoTenantFilter(req) },
        select: { id: true, facturaId: true },
      });

      await lockFactura(tx, pagoRef.facturaId);

      const factura = await tx.factura.findUniqueOrThrow({
        where: { id: pagoRef.facturaId },
        select: {
          id: true,
          numeroFactura: true,
          usuarioId: true,
          empresaId: true,
          clienteId: true,
          total: true,
          moneda: true,
          tasaCambio: true,
          estado: true,
        },
      });

      if (factura.estado === 'VOIDED') {
        throw createBusinessError('No se puede anular un pago de una factura anulada');
      }

      const pagoAntes = await tx.pago.findUniqueOrThrow({ where: { id: pagoRef.id } });
      const pagosDeFactura = await tx.pago.findMany({
        where: { facturaId: factura.id },
        select: { id: true, monto: true, monedaPago: true, estado: true },
      });
      // El pago que se está anulando todavía figura ACTIVO en esta lectura:
      // se excluye explícitamente para que el recálculo no lo cuente.
      const pagosActivos = pagosDeFactura.filter(
        pago => pago.id !== pagoRef.id && pago.estado !== ESTADOS_PAGO.ANULADO
      );
      const totalPagado = await sumarPagosNormalizados(pagosActivos, factura, empresaRefId);

      // Un reintento (doble clic) no debe volver a escribir ni duplicar auditoría.
      if (pagoAntes.estado === ESTADOS_PAGO.ANULADO) {
        const pago = await tx.pago.findUniqueOrThrow({
          where: { id: pagoRef.id },
          select: PAGO_CON_FACTURA_SELECT,
        });
        const cuenta = await tx.cuentaPorCobrar.findUnique({
          where: { facturaId: factura.id },
        });
        return { pago, factura, cuenta, totalPagado, yaAnulado: true };
      }

      const pagoAnulado = await tx.pago.update({
        where: { id: pagoRef.id },
        data: {
          estado: ESTADOS_PAGO.ANULADO,
          motivoAnulacion: motivo,
          descripcionAnulacion: descripcion,
          anuladoPor: req.user?.nombre || req.user?.username || 'Usuario',
          fechaAnulacion: new Date(),
        },
        select: PAGO_CON_FACTURA_SELECT,
      });

      await registrarAuditoria(req, {
        accion: 'PAGO_ANULADO',
        entidad: 'Pago',
        entidadId: pagoAnulado.id,
        empresaId: factura.empresaId || empresaRefId,
        datosAnteriores: pagoAntes,
        datosNuevos: pagoAnulado,
        tx,
      });

      const totalFactura = new Decimal(factura.total.toString());
      let nuevoEstadoFactura;
      if (totalPagado.gte(totalFactura)) nuevoEstadoFactura = 'PAID';
      else if (totalPagado.gt(0)) nuevoEstadoFactura = 'PARTIALLY_PAID';
      else nuevoEstadoFactura = 'PENDING';

      const facturaActualizada = await tx.factura.update({
        where: { id: factura.id },
        data: { estado: nuevoEstadoFactura },
        select: {
          id: true,
          numeroFactura: true,
          usuarioId: true,
          empresaId: true,
          total: true,
          moneda: true,
          tasaCambio: true,
          estado: true,
        },
      });

      // Actualizar o crear CuentaPorCobrar.
      // Si la factura era de contado y el pago se anula por FRAUDE o inconsistencia,
      // la factura reabre como PENDING/PARTIALLY_PAID y se genera la CuentaPorCobrar
      // para que administración y cobranzas pueda gestionar la recuperación del saldo.
      let cuentaActualizada = null;
      const cxc = await tx.cuentaPorCobrar.findUnique({
        where: { facturaId: factura.id },
      });
      if (cxc) {
        await lockCuenta(tx, cxc.id);
        const cobradoUSD = await sumarPagosCxcUSD(pagosActivos, factura, empresaRefId);
        const pendienteUSD = new Decimal(cxc.montoOriginal.toString()).sub(cobradoUSD);

        let estadoCxc;
        if (pendienteUSD.lte(0)) estadoCxc = 'PAID';
        else if (cobradoUSD.gt(0)) estadoCxc = 'PARTIALLY_PAID';
        else estadoCxc = 'PENDING';

        cuentaActualizada = await tx.cuentaPorCobrar.update({
          where: { id: cxc.id },
          data: {
            montoCobrado: cobradoUSD.toFixed(2),
            montoPendiente: pendienteUSD.gt(0) ? pendienteUSD.toFixed(2) : '0.00',
            estado: estadoCxc,
            ultimaGestion: new Date().toISOString(),
          },
        });
      } else if (nuevoEstadoFactura !== 'PAID') {
        const cobradoUSD = await sumarPagosCxcUSD(pagosActivos, factura, empresaRefId);
        const tasaUsada = await tasaCambioEfectiva(factura, empresaRefId);
        const totalFacturaUSD = convertirMontoMoneda(factura.total, factura.moneda || 'USD', 'USD', tasaUsada);
        const pendienteUSD = totalFacturaUSD.sub(cobradoUSD);

        cuentaActualizada = await tx.cuentaPorCobrar.create({
          data: {
            empresaId: factura.empresaId || empresaRefId,
            facturaId: factura.id,
            clienteId: factura.clienteId,
            usuarioId: req.user?.id || factura.usuarioId || null,
            montoOriginal: totalFacturaUSD.toFixed(2),
            montoCobrado: cobradoUSD.toFixed(2),
            montoPendiente: pendienteUSD.gt(0) ? pendienteUSD.toFixed(2) : '0.00',
            fechaEmision: new Date(),
            fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            estado: nuevoEstadoFactura,
            notas: `Generada automáticamente tras anulación de pago (${motivo}: ${descripcion.slice(0, 80)})`,
            diasVencido: 0,
          },
        });
      }

      return {
        pago: pagoAnulado,
        factura: facturaActualizada,
        cuenta: cuentaActualizada,
        totalPagado,
        yaAnulado: false,
      };
    });

    if (!resultado.yaAnulado) {
      invalidarCacheVentas();
      cxcRouter.invalidarCacheCxcResumen?.();
    }

    const totalFactura = new Decimal(resultado.factura.total.toString());
    const balancePendiente = totalFactura.sub(resultado.totalPagado);
    res.json({
      pago: resultado.pago,
      factura: {
        ...resultado.factura,
        totalPagado: resultado.totalPagado.toFixed(2),
        balancePendiente: balancePendiente.gt(0) ? balancePendiente.toFixed(2) : '0.00',
      },
      cuenta: resultado.cuenta
        ? {
            ...resultado.cuenta,
            montoOriginal: new Decimal(resultado.cuenta.montoOriginal.toString()).toFixed(2),
            montoCobrado: new Decimal(resultado.cuenta.montoCobrado.toString()).toFixed(2),
            montoPendiente: new Decimal(resultado.cuenta.montoPendiente.toString()).toFixed(2),
          }
        : null,
      yaAnulado: resultado.yaAnulado,
    });
  } catch (err) { next(err); }
});

// La eliminación física quedó prohibida: rompía la trazabilidad contable.
// Se responde 405 para que un cliente antiguo no borre un pago por accidente.
router.delete('/:id', (req, res) => {
  res.set('Allow', 'PATCH');
  res.status(405).json({
    error: 'Método no permitido',
    message: 'Los pagos no se eliminan. Usa PATCH /api/pagos/:id/anular con motivo y descripción.',
  });
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
