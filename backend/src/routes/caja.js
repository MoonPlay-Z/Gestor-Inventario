const express = require('express');
const prisma = require('../db/prisma');
const { Prisma, IS_SQLITE } = require('../db/prisma');
const { tsFrag } = require('../utils/sql');
const Decimal = require('decimal.js').Decimal;
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { tasaParaEmpresa } = require('../utils/tasaAPI');
const { resolverEmpresaRefId } = require('../utils/empresaContext');
const { toDecimalSeguro } = require('../utils/decimal');
const { ESTADOS_PAGO, esMetodoEfectivo } = require('../config/pagos');

const router = express.Router();

// SUPER_ADMIN no abre ni cierra caja
router.use(requireRole('EMPRESA', 'CAJA'));

// Helper: filtro de empresa para el usuario actual
function getEmpresaFilter(req) {
  const empresaId = req.user?.empresaRefId || req.user?.empresaId || null;
  if (!empresaId) return {};
  return {
    OR: [
      { empresaId },
      { usuario: { empresaRefId: empresaId } },
      { usuario: { empresaId } }
    ]
  };
}

// Query compartido para agregar pagos por método y moneda en un turno.
// Corrige el bug de tasaCambio: solo divide por f."tasaCambio" cuando la factura
// fue emitida en VES (donde es una tasa real). En facturas USD (tasaCambio=1)
// se usa la tasa vigente del sistema, evitando que 1000 Bs se lean como 1000 USD.
const buildPagosTurnoSql = ({ fechaApertura, usuarioId, tasaSistema }) => {
  const usuarioFilter = usuarioId ? Prisma.sql`AND f."usuarioId" = ${usuarioId}` : Prisma.empty;
  return Prisma.sql`
    SELECT
      p."metodoPago" AS metodo,
      p."monedaPago" AS moneda,
      CAST(SUM(CASE
        WHEN p."monedaPago" = 'VES' THEN
          CASE WHEN f."moneda" = 'VES' AND f."tasaCambio" > 0
            THEN p."monto" / f."tasaCambio"
            ELSE p."monto" / ${tasaSistema}
          END
        ELSE p."monto"
      END) AS TEXT) AS total_usd,
      CAST(SUM(CASE WHEN p."monedaPago" = 'VES' THEN p."monto" ELSE 0 END) AS TEXT) AS total_ves,
      CAST(SUM(CASE WHEN p."monedaPago" = 'USD' THEN p."monto" ELSE 0 END) AS TEXT) AS total_usd_orig,
      COUNT(*) AS cantidad,
      COUNT(p."referenciaTransaccion") AS con_referencia
    FROM pagos p
    INNER JOIN facturas f ON f."id" = p."facturaId"
    WHERE p."fechaPago" >= ${tsFrag(fechaApertura)}
      AND f."estado" != 'VOIDED'
      AND p."estado" = ${ESTADOS_PAGO.ACTIVO}
      ${usuarioFilter}
    GROUP BY p."metodoPago", p."monedaPago"
  `;
};

// 1. Obtener estado de la caja del usuario actual (o global si es EMPRESA y busca por usuario)
router.get('/status', async (req, res, next) => {
  try {
    const userId = req.query.usuarioId || req.user?.id;

    const where = { estado: 'OPEN' };

    if (req.user.rol === 'EMPRESA') {
      Object.assign(where, getEmpresaFilter(req));
      if (userId) where.usuarioId = userId;
    } else {
      where.usuarioId = userId;
    }

    const cajaAbierta = await prisma.cierreCaja.findFirst({
      where,
      select: {
        id: true,
        usuarioId: true,
        empresaId: true,
        fechaApertura: true,
        fechaCierre: true,
        montoInicial: true,
        montoFinal: true,
        ingresosEfectivo: true,
        ingresosBanco: true,
        ingresosEfectivoVES: true,
        ingresosBancoVES: true,
        estado: true,
        observaciones: true,
        arqueoDetalle: true,
        createdAt: true,
        updatedAt: true,
        usuario: { select: { id: true, username: true, nombre: true, rol: true } },
      },
      orderBy: { fechaApertura: 'desc' }
    });

    res.json(cajaAbierta || { status: 'CLOSED' });
  } catch (err) {
    next(err);
  }
});

// 2. Abrir Caja (para el usuario actual)
router.post('/open', async (req, res, next) => {
  try {
    const { montoInicial, observaciones } = req.body;
    const userId = req.user?.id;

    if (!userId) throw createValidationError('Usuario no autenticado');

    // `new Decimal('abc')` lanza DecimalError y `new Decimal(null)` también,
    // lo que devolvía un 500. Se convierte a texto y se valida antes de construir.
    const montoInicialDecimal = toDecimalSeguro(montoInicial, 0);
    if (!montoInicialDecimal.isFinite() || montoInicialDecimal.lt(0)) {
      throw createValidationError('El monto inicial debe ser un número positivo');
    }

    const empresaId = await resolverEmpresaRefId(req);

    const nuevaCaja = await prisma.$transaction(async (tx) => {
      // Bloquea la fila del usuario para serializar aperturas concurrentes del
      // mismo cajero y evitar dos cajas OPEN por condición de carrera. SQLite no
      // soporta FOR UPDATE: allí las escrituras ya se serializan.
      if (!IS_SQLITE) {
        await tx.$queryRaw`SELECT id FROM usuarios WHERE id = ${userId} FOR UPDATE`;
      }

      const cajaAbierta = await tx.cierreCaja.findFirst({
        where: {
          usuarioId: userId,
          estado: 'OPEN'
        }
      });

      if (cajaAbierta) {
        throw createBusinessError(
          `Ya tienes una caja abierta desde el ${new Date(cajaAbierta.fechaApertura).toLocaleString('es-VE')}. Debes cerrarla antes de abrir una nueva.`,
          {
            code: 'CAJA_YA_ABIERTA',
            cajaId: cajaAbierta.id,
            fechaApertura: cajaAbierta.fechaApertura,
            usuarioId: userId,
          }
        );
      }

      return await tx.cierreCaja.create({
        data: {
          usuarioId: userId,
          empresaId,
          montoInicial: montoInicialDecimal.toFixed(2),
          observaciones: observaciones?.trim() || null
        },
        include: {
          usuario: { select: { id: true, username: true, nombre: true } }
        }
      });
    });

    res.status(201).json(nuevaCaja);
  } catch (err) {
    next(err);
  }
});

// 3. Obtener previsión de cierre de la caja actual del usuario
router.get('/preview', async (req, res, next) => {
  try {
    const userId = req.query.usuarioId || req.user?.id;

    const where = { estado: 'OPEN' };

    if (req.user.rol === 'EMPRESA') {
      Object.assign(where, getEmpresaFilter(req));
      if (userId) where.usuarioId = userId;
    } else {
      where.usuarioId = userId;
    }

    const cajaAbierta = await prisma.cierreCaja.findFirst({
      where,
      select: {
        id: true,
        usuarioId: true,
        empresaId: true,
        fechaApertura: true,
        fechaCierre: true,
        montoInicial: true,
        montoFinal: true,
        ingresosEfectivo: true,
        ingresosBanco: true,
        ingresosEfectivoVES: true,
        ingresosBancoVES: true,
        estado: true,
        observaciones: true,
        arqueoDetalle: true,
        createdAt: true,
        updatedAt: true,
        usuario: { select: { id: true, username: true, nombre: true } },
      },
      orderBy: { fechaApertura: 'desc' }
    });

    if (!cajaAbierta) {
      throw createValidationError('No hay ninguna caja abierta para este usuario.');
    }

    const fechaApertura = new Date(cajaAbierta.fechaApertura).toISOString();
    const usuarioId = cajaAbierta.usuarioId;

    const tasaSistema = await tasaParaEmpresa(await resolverEmpresaRefId(req));
    const pagosAgregados = await prisma.$queryRaw(buildPagosTurnoSql({
      fechaApertura,
      usuarioId,
      tasaSistema,
    }));

    let efectivoUSD = new Decimal(0);
    let pagoMovilUSD = new Decimal(0);
    let puntoUSD = new Decimal(0);
    let transferenciaUSD = new Decimal(0);
    let efectivoVES = new Decimal(0);
    let pagoMovilVES = new Decimal(0);
    let puntoVES = new Decimal(0);
    let transferenciaVES = new Decimal(0);
    let efectivoUSDRecibido = new Decimal(0);
    let efectivoVESRecibido = new Decimal(0);
    let totalTransacciones = 0;
    let totalConReferencia = 0;

    for (const row of pagosAgregados) {
      const monto = new Decimal(row.total_usd || 0);
      const montoVES = new Decimal(row.total_ves || 0);
      totalTransacciones += Number(row.cantidad);
      totalConReferencia += Number(row.con_referencia || 0);
      const esVES = row.moneda === 'VES';

      switch (row.metodo) {
        case 'CASH':
        case 'EFECTIVO_USD':
        case 'EFECTIVO_VES':
          efectivoUSD = efectivoUSD.add(monto);
          efectivoVES = efectivoVES.add(montoVES);
          efectivoUSDRecibido = efectivoUSDRecibido.add(new Decimal(row.total_usd_orig || 0));
          efectivoVESRecibido = efectivoVESRecibido.add(montoVES);
          break;
        case 'MOBILE_PAYMENT':
        case 'PAGO_MOVIL':
          pagoMovilUSD = pagoMovilUSD.add(monto);
          esVES ? pagoMovilVES = pagoMovilVES.add(montoVES) : null;
          break;
        case 'CREDIT_CARD':
        case 'TARJETA_CREDITO':
        case 'TARJETA_DEBITO':
        case 'BIOPAGO':
          puntoUSD = puntoUSD.add(monto);
          esVES ? puntoVES = puntoVES.add(montoVES) : null;
          break;
        case 'BANK_TRANSFER':
        case 'TRANSFERENCIA':
        case 'BINANCE':
        case 'CASHEA':
          transferenciaUSD = transferenciaUSD.add(monto);
          esVES ? transferenciaVES = transferenciaVES.add(montoVES) : null;
          break;
        default:
          if (esMetodoEfectivo(row.metodo)) {
            efectivoUSD = efectivoUSD.add(monto);
            efectivoVES = efectivoVES.add(montoVES);
          } else {
            transferenciaUSD = transferenciaUSD.add(monto);
            esVES ? transferenciaVES = transferenciaVES.add(montoVES) : null;
          }
      }
    }

    // Tasa vigente del sistema para conversión VES→USD en el frontend
    const tasaCambio = tasaSistema.toNumber();

    const ingresosBancoUSD = pagoMovilUSD.add(puntoUSD).add(transferenciaUSD);
    const ingresosEfectivoUSD = efectivoUSD;
    const montoInicialUSD = new Decimal(cajaAbierta.montoInicial.toString());
    const montoEsperadoEfectivo = montoInicialUSD.add(ingresosEfectivoUSD);

    res.json({
      caja: cajaAbierta,
      montoInicialUSD: montoInicialUSD.toFixed(2),
      desglose: {
        efectivo:     efectivoUSD.toFixed(2),
        pagoMovil:    pagoMovilUSD.toFixed(2),
        punto:        puntoUSD.toFixed(2),
        transferencia: transferenciaUSD.toFixed(2),
      },
      ingresosEfectivoUSD: ingresosEfectivoUSD.toFixed(2),
      ingresosBancoUSD: ingresosBancoUSD.toFixed(2),
      totalIngresosUSD: ingresosEfectivoUSD.add(ingresosBancoUSD).toFixed(2),
      montoEsperadoCajaUSD: montoEsperadoEfectivo.toFixed(2),
      totalTransacciones,
      tasaCambio,
      desgloseVES: {
        efectivo:     efectivoVES.toFixed(2),
        pagoMovil:    pagoMovilVES.toFixed(2),
        punto:        puntoVES.toFixed(2),
        transferencia: transferenciaVES.toFixed(2),
      },
      efectivoRecibido: {
        USD: efectivoUSDRecibido.toFixed(2),
        VES: efectivoVESRecibido.toFixed(2),
      },
      verificados: {
        totalConReferencia,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 4. Cerrar Caja
router.post('/close', async (req, res, next) => {
  try {
    const { montoFinal, observaciones, usuarioId, arqueoDetalle } = req.body;
    const userId = req.user?.id;

    let arqueoDetalleStr = null;
    if (arqueoDetalle !== undefined && arqueoDetalle !== null) {
      try {
        arqueoDetalleStr = typeof arqueoDetalle === 'string' ? arqueoDetalle : JSON.stringify(arqueoDetalle);
      } catch {
        throw createValidationError('arqueoDetalle debe ser un objeto JSON válido');
      }
    }

    let montoFinalDecimal;
    if (montoFinal !== undefined && montoFinal !== null && montoFinal !== '') {
      montoFinalDecimal = toDecimalSeguro(montoFinal, 0);
      if (!montoFinalDecimal.isFinite() || montoFinalDecimal.lt(0)) {
        throw createValidationError('El monto final debe ser un número positivo');
      }
    }

    const cajaCerrada = await prisma.$transaction(async (tx) => {
      const where = { estado: 'OPEN' };

      if (req.user.rol !== 'EMPRESA') {
        where.usuarioId = userId;
      } else {
        Object.assign(where, getEmpresaFilter(req));
        // Sin `usuarioId` explícito, la EMPRESA cierra SU propia caja, igual que
        // /status y /preview. Antes tomaba la más reciente de toda la empresa y
        // podía cerrar por error el turno de un cajero (y escribirle el montoFinal).
        where.usuarioId = usuarioId || req.user.id;
      }

      const cajaAbierta = await tx.cierreCaja.findFirst({
        where,
        orderBy: { fechaApertura: 'desc' }
      });

      if (!cajaAbierta) {
        throw createValidationError('No hay ninguna caja abierta para cerrar.');
      }

      const fechaApertura = new Date(cajaAbierta.fechaApertura).toISOString();
      const cajaUsuarioId = cajaAbierta.usuarioId;

      const tasaSistema = await tasaParaEmpresa(await resolverEmpresaRefId(req));
      const pagosAgregados = await tx.$queryRaw(buildPagosTurnoSql({
        fechaApertura,
        usuarioId: cajaUsuarioId,
        tasaSistema,
      }));

      let ingresosEfectivoUSD = new Decimal(0);
      let ingresosBancoUSD = new Decimal(0);
      let ingresosEfectivoVES = new Decimal(0);
      let ingresosBancoVES = new Decimal(0);

      for (const row of pagosAgregados) {
        const usd = new Decimal(row.total_usd || 0);
        const ves = new Decimal(row.total_ves || 0);
        if (esMetodoEfectivo(row.metodo)) {
          ingresosEfectivoUSD = ingresosEfectivoUSD.add(usd);
          ingresosEfectivoVES = ingresosEfectivoVES.add(ves);
        } else {
          ingresosBancoUSD = ingresosBancoUSD.add(usd);
          ingresosBancoVES = ingresosBancoVES.add(ves);
        }
      }

      // Validación de montoFinal: recalcular desde arqueoDetalle y advertir si difiere
      let advertenciaMonto = null;
      try {
        const arqueo = typeof arqueoDetalle === 'string'
          ? JSON.parse(arqueoDetalle || '{}')
          : (arqueoDetalle || {});
        const contadoUSD = Number(arqueo?.arqueo?.usd?.contado) || 0;
        const contadoVES = Number(arqueo?.arqueo?.ves?.contado) || 0;
        const montoRecalculado = contadoUSD + (tasaSistema.gt(0) ? contadoVES / tasaSistema.toNumber() : 0);
        if (montoFinalDecimal && Math.abs(montoRecalculado - montoFinalDecimal.toNumber()) > 0.01) {
          advertenciaMonto = `montoFinal enviado (${montoFinalDecimal.toFixed(2)}) difiere del recalculado (${montoRecalculado.toFixed(2)})`;
        }
      } catch { /* si no hay arqueoDetalle, omitir validación */ }

      const finalMonto = montoFinalDecimal !== undefined
        ? montoFinalDecimal
        : new Decimal(cajaAbierta.montoInicial.toString()).add(ingresosEfectivoUSD);

      // `updateMany` con `estado: 'OPEN'` como condición: si dos peticiones de
      // cierre pasan a la vez, la segunda espera el lock de fila y, al reevaluar
      // la condición tras el commit de la primera, afecta 0 filas. Así se evita
      // el doble cierre (antes ambas devolvían 200 y reescribían el arqueo).
      const cerrados = await tx.cierreCaja.updateMany({
        where: { id: cajaAbierta.id, estado: 'OPEN' },
        data: {
          fechaCierre: new Date().toISOString(),
          montoFinal: finalMonto.toFixed(2),
          ingresosEfectivo: ingresosEfectivoUSD.toFixed(2),
          ingresosBanco: ingresosBancoUSD.toFixed(2),
          ingresosEfectivoVES: ingresosEfectivoVES.gt(0) ? ingresosEfectivoVES.toFixed(2) : null,
          ingresosBancoVES: ingresosBancoVES.gt(0) ? ingresosBancoVES.toFixed(2) : null,
          estado: 'CLOSED',
          observaciones: observaciones
            ? `${cajaAbierta.observaciones ? cajaAbierta.observaciones + '\n' : ''}${observaciones}${advertenciaMonto ? ` ⚠ ${advertenciaMonto}` : ''}`
            : (cajaAbierta.observaciones || advertenciaMonto ? `${cajaAbierta.observaciones ? cajaAbierta.observaciones + '\n' : ''}${advertenciaMonto || ''}`.trim() || null : null),
          ...(arqueoDetalleStr ? { arqueoDetalle: arqueoDetalleStr } : {}),
        },
      });

      if (cerrados.count === 0) {
        throw createBusinessError('La caja ya fue cerrada por otra operación concurrente.');
      }

      return await tx.cierreCaja.findUnique({
        where: { id: cajaAbierta.id },
        select: {
          id: true,
          usuarioId: true,
          empresaId: true,
          fechaApertura: true,
          fechaCierre: true,
          montoInicial: true,
          montoFinal: true,
          ingresosEfectivo: true,
          ingresosBanco: true,
          ingresosEfectivoVES: true,
          ingresosBancoVES: true,
          estado: true,
        }
      });
    });

    res.json(cajaCerrada);
  } catch (err) {
    next(err);
  }
});

// 5. Historial de Cierres de Caja (con paginación)
router.get('/', async (req, res, next) => {
  try {
    const { usuarioId } = req.query;
    const { skip, take, page, limit } = paginate(req.query, { limit: 50 });
    const empresaScope = req.user?.empresaRefId || req.user?.empresaId || null;
    const where = {};

    if (req.user.rol === 'SUPER_ADMIN') {
      if (usuarioId) where.usuarioId = usuarioId;
    } else if (req.user.rol === 'EMPRESA') {
      const empresaFilter = {
        OR: [
          { empresaId: empresaScope },
          { usuario: { empresaRefId: empresaScope } },
          { usuario: { empresaId: empresaScope } }
        ]
      };

      if (usuarioId) {
        where.AND = [
          { usuarioId },
          empresaFilter
        ];
      } else {
        Object.assign(where, empresaFilter);
      }
    } else {
      where.usuarioId = req.user.id;
    }

    const [cierres, total] = await Promise.all([
      prisma.cierreCaja.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          usuarioId: true,
          empresaId: true,
          fechaApertura: true,
          fechaCierre: true,
          montoInicial: true,
          montoFinal: true,
          ingresosEfectivo: true,
          ingresosBanco: true,
          ingresosEfectivoVES: true,
          ingresosBancoVES: true,
          estado: true,
          observaciones: true,
        arqueoDetalle: true,
          createdAt: true,
          updatedAt: true,
          usuario: { select: { id: true, username: true, nombre: true, rol: true, empresaId: true, empresaRefId: true } },
        },
        orderBy: { fechaApertura: 'desc' },
      }),
      prisma.cierreCaja.count({ where }),
    ]);
    res.json(paginatedResponse(cierres, total, page, limit));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
