const express = require('express');
const prisma = require('../db/prisma');
const { Prisma } = require('../db/prisma');
const { tsFrag } = require('../utils/sql');
const Decimal = require('decimal.js').Decimal;
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');
const { requireRole } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');

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

    const montoInicialNum = montoInicial !== undefined ? Number(montoInicial) : 0;
    if (isNaN(montoInicialNum) || montoInicialNum < 0) {
      throw createValidationError('El monto inicial debe ser un número positivo');
    }

    const empresaId = req.user?.empresaRefId || null;

    const nuevaCaja = await prisma.$transaction(async (tx) => {
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
          montoInicial: montoInicialNum,
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
    const usuarioFilter = usuarioId ? Prisma.sql`AND f."usuarioId" = ${usuarioId}` : Prisma.empty;

    const pagosAgregados = await prisma.$queryRaw`
      SELECT
        p."metodoPago" AS metodo,
        p."monedaPago" AS moneda,
        CAST(SUM(CASE
          WHEN p."monedaPago" = 'VES' AND f."tasaCambio" > 0
          THEN p."monto" / f."tasaCambio"
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
        ${usuarioFilter}
      GROUP BY p."metodoPago", p."monedaPago"
    `;

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
          efectivoUSD = efectivoUSD.add(monto);
          efectivoVES = efectivoVES.add(montoVES);
          efectivoUSDRecibido = efectivoUSDRecibido.add(new Decimal(row.total_usd_orig || 0));
          efectivoVESRecibido = efectivoVESRecibido.add(montoVES);
          break;
        case 'MOBILE_PAYMENT': pagoMovilUSD  = pagoMovilUSD.add(monto);  esVES ? pagoMovilVES = pagoMovilVES.add(montoVES) : null;  break;
        case 'CREDIT_CARD':    puntoUSD      = puntoUSD.add(monto);      esVES ? puntoVES = puntoVES.add(montoVES) : null;      break;
        case 'BANK_TRANSFER':  transferenciaUSD = transferenciaUSD.add(monto); esVES ? transferenciaVES = transferenciaVES.add(montoVES) : null; break;
        case 'PAGO_MOVIL':     pagoMovilUSD  = pagoMovilUSD.add(monto);  esVES ? pagoMovilVES = pagoMovilVES.add(montoVES) : null;  break;
        default:               efectivoUSD   = efectivoUSD.add(monto);   esVES ? efectivoVES = efectivoVES.add(montoVES) : null;
      }
    }

    // Tasa BCV vigente del turno (última factura no anulada desde la apertura)
    const ultimasFacturas = await prisma.factura.findMany({
      where: {
        fechaEmision: { gte: new Date(fechaApertura).toISOString() },
        ...(cajaAbierta.usuarioId ? { usuarioId: cajaAbierta.usuarioId } : {}),
      },
      orderBy: { fechaEmision: 'desc' },
      take: 10,
      select: { estado: true, tasaCambio: true },
    });
    const ultimaFactura = ultimasFacturas.find(f => f.estado !== 'VOIDED' && Number(f.tasaCambio) > 0) || null;
    const tasaCambio = ultimaFactura ? Number(ultimaFactura.tasaCambio) : null;

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

    let montoFinalNum;
    if (montoFinal !== undefined && montoFinal !== '') {
      montoFinalNum = Number(montoFinal);
      if (isNaN(montoFinalNum) || montoFinalNum < 0) {
        throw createValidationError('El monto final debe ser un número positivo');
      }
    }

    const cajaCerrada = await prisma.$transaction(async (tx) => {
      const where = { estado: 'OPEN' };

      if (req.user.rol !== 'EMPRESA') {
        where.usuarioId = userId;
      } else {
        Object.assign(where, getEmpresaFilter(req));
        if (usuarioId) where.usuarioId = usuarioId;
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
      const usuarioFilter = cajaUsuarioId ? Prisma.sql`AND f."usuarioId" = ${cajaUsuarioId}` : Prisma.empty;

      const pagosAgregados = await tx.$queryRaw`
        SELECT
          p."metodoPago" AS metodo,
          CAST(SUM(CASE
            WHEN p."monedaPago" = 'VES' AND f."tasaCambio" > 0
            THEN p."monto" / f."tasaCambio"
            ELSE p."monto"
          END) AS TEXT) AS total_usd
        FROM pagos p
        INNER JOIN facturas f ON f."id" = p."facturaId"
        WHERE p."fechaPago" >= ${tsFrag(fechaApertura)}
          AND f."estado" != 'VOIDED'
          ${usuarioFilter}
        GROUP BY p."metodoPago", p."monedaPago"
      `;

      let ingresosEfectivoUSD = new Decimal(0);
      let ingresosBancoUSD = new Decimal(0);

      for (const row of pagosAgregados) {
        const monto = new Decimal(row.total_usd || 0);
        if (row.metodo === 'CASH') {
          ingresosEfectivoUSD = ingresosEfectivoUSD.add(monto);
        } else {
          ingresosBancoUSD = ingresosBancoUSD.add(monto);
        }
      }

      const finalMonto = montoFinalNum !== undefined
        ? new Decimal(montoFinalNum)
        : new Decimal(cajaAbierta.montoInicial.toString()).add(ingresosEfectivoUSD);

      return await tx.cierreCaja.update({
        where: { id: cajaAbierta.id },
        data: {
          fechaCierre: new Date().toISOString(),
          montoFinal: finalMonto.toFixed(2),
          ingresosEfectivo: ingresosEfectivoUSD.toFixed(2),
          ingresosBanco: ingresosBancoUSD.toFixed(2),
          estado: 'CLOSED',
          observaciones: observaciones ? `${cajaAbierta.observaciones ? cajaAbierta.observaciones + '\n' : ''}${observaciones}` : cajaAbierta.observaciones,
          ...(arqueoDetalleStr ? { arqueoDetalle: arqueoDetalleStr } : {}),
        },
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
          estado: true,
          observaciones: true,
        arqueoDetalle: true,
          createdAt: true,
          updatedAt: true,
          usuario: { select: { id: true, username: true, nombre: true } },
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
