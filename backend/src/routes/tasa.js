const express = require('express');
const router = express.Router();
const { requireRole } = require('../middleware/auth');
const { resolverEmpresaRefId } = require('../utils/empresaContext');
const { tasaBCVPorFecha, tasaBCVActual } = require('../utils/bcvHistorico');
const {
  estadoTasaEmpresa,
  actualizarTasaEmpresa,
  guardarTasaManual,
  setModoTasa,
} = require('../utils/tasaAPI');

/**
 * API estructurada de la tasa de cambio (VES por USD).
 *
 * La tasa vive por empresa (`Empresa.tasaDolar`) y tiene dos modos:
 *   - AUTO   → la actualiza el job diario con la tasa oficial del BCV.
 *   - MANUAL → sólo cambia cuando el usuario la guarda.
 *
 * Todos los módulos resuelven la tasa con `utils/tasaAPI`, así que esta API es
 * la misma fuente que usan facturas, CxC, cotizaciones, caja e inventario.
 *
 * Requiere autenticación JWT (montada bajo `/api`).
 */

const MODOS = ['AUTO', 'MANUAL'];

const mensajeError = (resultado, porDefecto) => {
  const mapa = {
    sin_empresa: 'No hay una empresa asociada a la sesión',
    sin_tasa: 'El BCV no tiene una tasa oficial disponible en este momento',
    error: 'No se pudo consultar la tasa oficial del BCV',
  };
  return mapa[resultado?.motivo] || resultado?.error || porDefecto;
};

async function empresaDeSesion(req, res) {
  const empresaId = await resolverEmpresaRefId(req);
  if (!empresaId) {
    res.status(400).json({ error: 'No hay una empresa asociada a la sesión' });
    return null;
  }
  return empresaId;
}

// GET /api/tasa — Tasa vigente de la empresa autenticada.
router.get('/', async (req, res, next) => {
  try {
    const empresaId = await empresaDeSesion(req, res);
    if (!empresaId) return;
    res.json(await estadoTasaEmpresa(empresaId));
  } catch (err) { next(err); }
});

// GET /api/tasa/bcv — Tasa oficial del BCV del día (global, sin empresa).
router.get('/bcv', async (_req, res, next) => {
  try {
    const tasa = await tasaBCVActual();
    if (!tasa) {
      return res.status(503).json({ error: 'El BCV no tiene una tasa oficial disponible' });
    }
    res.json({ tasa: tasa.toNumber(), fuente: 'BCV oficial' });
  } catch (err) {
    res.status(503).json({ error: 'No se pudo consultar la tasa oficial del BCV', details: err.message });
  }
});

// GET /api/tasa/historico?fecha=YYYY-MM-DD — Tasa BCV de una fecha específica.
router.get('/historico', async (req, res, next) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'El parámetro fecha es requerido' });
    const tasa = await tasaBCVPorFecha(fecha);
    if (!tasa) return res.status(404).json({ error: 'No se encontró tasa para la fecha indicada' });
    res.json({ fecha: String(fecha).slice(0, 10), tasa: tasa.toNumber() });
  } catch (err) { next(err); }
});

// POST /api/tasa/actualizar — Aplica la tasa del BCV a la empresa. No cambia el modo.
router.post('/actualizar', requireRole('EMPRESA'), async (req, res, next) => {
  try {
    const empresaId = await empresaDeSesion(req, res);
    if (!empresaId) return;

    const resultado = await actualizarTasaEmpresa(empresaId);
    if (!resultado || resultado.tasa == null) {
      return res.status(503).json({ error: mensajeError(resultado, 'No se pudo actualizar la tasa') });
    }
    res.json(await estadoTasaEmpresa(empresaId));
  } catch (err) { next(err); }
});

// PUT /api/tasa — Guarda una tasa manual o cambia el modo.
// Body: { tasaDolar?: number } | { modo: 'AUTO' | 'MANUAL' }
router.put('/', requireRole('EMPRESA'), async (req, res, next) => {
  try {
    const empresaId = await empresaDeSesion(req, res);
    if (!empresaId) return;

    const { tasaDolar, modo } = req.body || {};

    if (modo !== undefined) {
      if (!MODOS.includes(modo)) {
        return res.status(400).json({ error: `El modo de tasa debe ser ${MODOS.join(' o ')}` });
      }
      return res.json(await setModoTasa(empresaId, modo));
    }

    if (tasaDolar !== undefined) {
      return res.json(await guardarTasaManual(empresaId, tasaDolar));
    }

    res.status(400).json({ error: 'Debe enviar tasaDolar o modo' });
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    next(err);
  }
});

module.exports = router;
