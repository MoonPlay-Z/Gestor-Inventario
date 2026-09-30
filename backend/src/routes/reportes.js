/**
 * reportes — Rutas de reportes de ventas, ganancias e inversión
 * 
 * Acceso:
 *   - Ventas: EMPRESA, CAJA, SUPER_ADMIN (CAJA solo ve sus ventas)
 *   - Ganancias: EMPRESA, SUPER_ADMIN
 *   - Inversión: EMPRESA, SUPER_ADMIN
 *   - Productos Top: EMPRESA, CAJA, SUPER_ADMIN
 *   - Clientes Top: EMPRESA, CAJA, SUPER_ADMIN
 *   - Caja: EMPRESA, CAJA, SUPER_ADMIN
 */

const express = require('express');
const { requireRole } = require('../middleware/auth');
const {
  getVentasReporte,
  getGananciasReporte,
  getInversionReporte,
  getProductosTop,
  getClientesTop,
  getCajaReporte,
  getImpuestosReporte,
} = require('../services/reportesService');

const router = express.Router();

// ─── Ventas ───────────────────────────────────────────────────────────────────
router.get('/ventas', requireRole('EMPRESA', 'CAJA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await getVentasReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Ganancias ────────────────────────────────────────────────────────────────
router.get('/ganancias', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await getGananciasReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Inversión ────────────────────────────────────────────────────────────────
router.get('/inversion', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await getInversionReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Productos Top ────────────────────────────────────────────────────────────
router.get('/productos-top', requireRole('EMPRESA', 'CAJA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await getProductosTop(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Clientes Top ─────────────────────────────────────────────────────────────
router.get('/clientes-top', requireRole('EMPRESA', 'CAJA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await getClientesTop(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Caja ─────────────────────────────────────────────────────────────────────
router.get('/caja', requireRole('EMPRESA', 'CAJA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await getCajaReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Impuestos ────────────────────────────────────────────────────────────────
router.get('/impuestos', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const data = await getImpuestosReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
