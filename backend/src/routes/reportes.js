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
  getDetalleVentasReporte,
  getInversionReporte,
  getProductosTop,
  getClientesTop,
  getCajaReporte,
  getImpuestosReporte,
} = require('../services/reportesService');

const router = express.Router();

const PERIODOS_VALIDOS = ['diario', 'semanal', 'mensual', 'anual'];

const FORMATOS_FECHA = {
  diario:   /^\d{4}-\d{2}-\d{2}$/,
  semanal:  /^\d{4}-\d{2}-\d{2}$/,
  mensual:  /^\d{4}-\d{2}$/,
  anual:    /^\d{4}$/,
};

function validarParamsReporte(req) {
  const { periodo, fecha, comparar } = req.query;
  if (periodo && !PERIODOS_VALIDOS.includes(periodo)) {
    return 'Periodo inválido. Valores permitidos: ' + PERIODOS_VALIDOS.join(', ');
  }
  if (fecha && periodo) {
    const formatoEsperado = FORMATOS_FECHA[periodo];
    if (formatoEsperado && !formatoEsperado.test(fecha)) {
      const formatos = {
        diario: 'YYYY-MM-DD', semanal: 'YYYY-MM-DD', mensual: 'YYYY-MM', anual: 'YYYY'
      };
      return `Formato de fecha inválido para período ${periodo}. Use ${formatos[periodo]}`;
    }
  }
  if (comparar !== undefined && comparar !== 'true' && comparar !== 'false') {
    return 'El parámetro comparar debe ser true o false';
  }
  return null;
}

// ─── Ventas ───────────────────────────────────────────────────────────────────
router.get('/ventas', requireRole('EMPRESA', 'CAJA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const error = validarParamsReporte(req);
    if (error) return res.status(400).json({ error });
    const data = await getVentasReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Ganancias ────────────────────────────────────────────────────────────────
router.get('/ganancias', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const error = validarParamsReporte(req);
    if (error) return res.status(400).json({ error });
    const data = await getGananciasReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/ventas-detalle', requireRole('EMPRESA', 'CAJA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const error = validarParamsReporte(req);
    if (error) return res.status(400).json({ error });
    const data = await getDetalleVentasReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Inversión ────────────────────────────────────────────────────────────────
router.get('/inversion', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const error = validarParamsReporte(req);
    if (error) return res.status(400).json({ error });
    const data = await getInversionReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Productos Top ────────────────────────────────────────────────────────────
router.get('/productos-top', requireRole('EMPRESA', 'CAJA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const error = validarParamsReporte(req);
    if (error) return res.status(400).json({ error });
    const data = await getProductosTop(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Clientes Top ─────────────────────────────────────────────────────────────
router.get('/clientes-top', requireRole('EMPRESA', 'CAJA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const error = validarParamsReporte(req);
    if (error) return res.status(400).json({ error });
    const data = await getClientesTop(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Caja ─────────────────────────────────────────────────────────────────────
router.get('/caja', requireRole('EMPRESA', 'CAJA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const error = validarParamsReporte(req);
    if (error) return res.status(400).json({ error });
    const data = await getCajaReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// ─── Impuestos ────────────────────────────────────────────────────────────────
router.get('/impuestos', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const error = validarParamsReporte(req);
    if (error) return res.status(400).json({ error });
    const data = await getImpuestosReporte(req);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
