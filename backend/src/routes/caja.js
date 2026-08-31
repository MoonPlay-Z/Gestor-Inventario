const express = require('express');
const prisma = require('../db/prisma');
const Decimal = require('decimal.js').Decimal;
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');

const router = express.Router();

// 1. Obtener estado de la caja del usuario actual (o global si es EMPRESA y busca por usuario)
router.get('/status', async (req, res, next) => {
  try {
    const userId = req.query.usuarioId || req.user?.id;

    const cajaAbierta = await prisma.cierreCaja.findFirst({
      where: {
        estado: 'OPEN',
        ...(userId ? { usuarioId: userId } : {})
      },
      include: {
        usuario: { select: { id: true, username: true, nombre: true, rol: true } }
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

    // Verificar si el usuario ya tiene una caja abierta
    const cajaAbierta = await prisma.cierreCaja.findFirst({
      where: {
        usuarioId: userId,
        estado: 'OPEN'
      }
    });

    if (cajaAbierta) {
      throw createBusinessError('Ya tienes una caja abierta. Debes cerrarla antes de abrir una nueva.');
    }

    const nuevaCaja = await prisma.cierreCaja.create({
      data: {
        usuarioId: userId,
        empresaId: req.user?.empresaId || null,
        montoInicial: montoInicial || 0,
        observaciones: observaciones?.trim() || null
      },
      include: {
        usuario: { select: { id: true, username: true, nombre: true } }
      }
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

    const cajaAbierta = await prisma.cierreCaja.findFirst({
      where: {
        estado: 'OPEN',
        ...(userId ? { usuarioId: userId } : {})
      },
      include: {
        usuario: { select: { id: true, username: true, nombre: true } }
      },
      orderBy: { fechaApertura: 'desc' }
    });

    if (!cajaAbierta) {
      throw createValidationError('No hay ninguna caja abierta para este usuario.');
    }

    // Sumar todos los pagos recibidos en facturas emitidas por esta caja desde su apertura
    const pagos = await prisma.pago.findMany({
      where: {
        fechaPago: { gte: new Date(cajaAbierta.fechaApertura).toISOString() },
        factura: {
          ...(cajaAbierta.usuarioId ? { usuarioId: cajaAbierta.usuarioId } : {}),
          estado: { not: 'VOIDED' }
        }
      },
      include: { factura: { select: { moneda: true, tasaCambio: true, numeroFactura: true } } }
    });

    let efectivoUSD = new Decimal(0);
    let pagoMovilUSD = new Decimal(0);
    let puntoUSD = new Decimal(0);
    let transferenciaUSD = new Decimal(0);

    pagos.forEach(p => {
      let montoAUsar = new Decimal(p.monto.toString());
      const tasa = new Decimal(p.factura.tasaCambio.toString());

      if (p.factura.moneda === 'VES' && !tasa.isZero()) {
        montoAUsar = montoAUsar.div(tasa);
      }

      switch (p.metodoPago) {
        case 'CASH':           efectivoUSD   = efectivoUSD.add(montoAUsar);    break;
        case 'MOBILE_PAYMENT': pagoMovilUSD  = pagoMovilUSD.add(montoAUsar);   break;
        case 'CREDIT_CARD':    puntoUSD      = puntoUSD.add(montoAUsar);       break;
        case 'BANK_TRANSFER':  transferenciaUSD = transferenciaUSD.add(montoAUsar); break;
        default:               efectivoUSD   = efectivoUSD.add(montoAUsar);
      }
    });

    const ingresosBancoUSD = pagoMovilUSD.add(puntoUSD).add(transferenciaUSD);
    const ingresosEfectivoUSD = efectivoUSD;
    const montoInicialUSD = new Decimal(cajaAbierta.montoInicial.toString());
    const montoEsperadoEfectivo = montoInicialUSD.add(ingresosEfectivoUSD);

    res.json({
      caja: cajaAbierta,
      montoInicialUSD: montoInicialUSD.toFixed(2),
      // Desglose por método
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
      totalTransacciones: pagos.length
    });
  } catch (err) {
    next(err);
  }
});

// 4. Cerrar Caja
router.post('/close', async (req, res, next) => {
  try {
    const { montoFinal, observaciones } = req.body;
    const userId = req.user?.id;

    const cajaAbierta = await prisma.cierreCaja.findFirst({
      where: {
        estado: 'OPEN',
        ...(req.user.rol !== 'EMPRESA' ? { usuarioId: userId } : {})
      },
      orderBy: { fechaApertura: 'desc' }
    });

    if (!cajaAbierta) {
      throw createValidationError('No hay ninguna caja abierta para cerrar.');
    }

    // Calcular ingresos exactos de esta caja
    const pagos = await prisma.pago.findMany({
      where: {
        fechaPago: { gte: new Date(cajaAbierta.fechaApertura).toISOString() },
        factura: {
          ...(cajaAbierta.usuarioId ? { usuarioId: cajaAbierta.usuarioId } : {}),
          estado: { not: 'VOIDED' }
        }
      },
      include: { factura: { select: { moneda: true, tasaCambio: true } } }
    });

    let ingresosEfectivoUSD = new Decimal(0);
    let ingresosBancoUSD = new Decimal(0);

    pagos.forEach(p => {
      let montoAUsar = new Decimal(p.monto.toString());
      const tasa = new Decimal(p.factura.tasaCambio.toString());

      if (p.factura.moneda === 'VES' && !tasa.isZero()) {
        montoAUsar = montoAUsar.div(tasa);
      }

      if (p.metodoPago === 'CASH') {
        ingresosEfectivoUSD = ingresosEfectivoUSD.add(montoAUsar);
      } else {
        ingresosBancoUSD = ingresosBancoUSD.add(montoAUsar);
      }
    });

    const finalMonto = montoFinal !== undefined && montoFinal !== ''
      ? new Decimal(montoFinal)
      : new Decimal(cajaAbierta.montoInicial.toString()).add(ingresosEfectivoUSD);

    const cajaCerrada = await prisma.cierreCaja.update({
      where: { id: cajaAbierta.id },
      data: {
        fechaCierre: new Date().toISOString(),
        montoFinal: finalMonto.toFixed(2),
        ingresosEfectivo: ingresosEfectivoUSD.toFixed(2),
        ingresosBanco: ingresosBancoUSD.toFixed(2),
        estado: 'CLOSED',
        observaciones: observaciones ? `${cajaAbierta.observaciones ? cajaAbierta.observaciones + '\n' : ''}${observaciones}` : cajaAbierta.observaciones
      },
      include: {
        usuario: { select: { id: true, username: true, nombre: true } }
      }
    });

    res.json(cajaCerrada);
  } catch (err) {
    next(err);
  }
});

// 5. Historial de Cierres de Caja
router.get('/', async (req, res, next) => {
  try {
    const { usuarioId } = req.query;
    const empresaId = req.user?.empresaId || req.user?.id;
    const where = {};

    if (req.user.rol === 'SUPER_ADMIN') {
      if (usuarioId) where.usuarioId = usuarioId;
    } else if (req.user.rol === 'EMPRESA') {
      if (usuarioId) {
        where.usuarioId = usuarioId;
      } else {
        where.OR = [
          { usuarioId: empresaId },
          { empresaId: empresaId },
          { usuario: { empresaId: empresaId } }
        ];
      }
    } else {
      where.usuarioId = req.user.id;
    }

    const cierres = await prisma.cierreCaja.findMany({
      where,
      include: {
        usuario: { select: { id: true, username: true, nombre: true, rol: true } }
      },
      orderBy: { fechaApertura: 'desc' },
      take: 50
    });
    res.json(cierres);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
