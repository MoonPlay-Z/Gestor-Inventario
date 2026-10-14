const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const { requireRole } = require('../middleware/auth');
const prisma = require('../db/prisma');
const { resolverEmpresaRefId } = require('../utils/empresaContext');
const { tasaBCVActual } = require('../utils/bcvHistorico');

console.log('[CONFIG ROUTES] Router loaded, routes registered');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');
const configPath = path.join(dataDir, 'config.json');

// Helper to load config
function getSystemConfig() {
  let config = {
    empresa: {
      nombre:    process.env.EMPRESA_NOMBRE    || 'Mi Empresa C.A.',
      rif:       process.env.EMPRESA_RIF       || 'J-00000000-0',
      direccion: process.env.EMPRESA_DIRECCION || '',
      telefono:  process.env.EMPRESA_TELEFONO  || '',
      email:     process.env.EMPRESA_EMAIL     || '',
    },
    moneda: {
      simbolo: process.env.MONEDA_SIMBOLO || '$',
      codigo:  process.env.MONEDA_CODIGO  || 'USD',
      tasaDolar: 36.5
    },
    ivaDefault: parseFloat(process.env.IVA_DEFAULT || '16.00'),
    tipoDocumento: process.env.TIPO_DOCUMENTO || 'FACTURA'
  };

  try {
    if (fs.existsSync(configPath)) {
      const saved = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = {
        empresa: { ...config.empresa, ...saved.empresa },
        moneda: { 
          simbolo: saved.moneda?.simbolo || config.moneda.simbolo, 
          codigo: saved.moneda?.codigo || config.moneda.codigo,
          tasaDolar: saved.moneda?.tasaDolar !== undefined ? parseFloat(saved.moneda.tasaDolar) : config.moneda.tasaDolar
        },
        ivaDefault: saved.ivaDefault !== undefined ? parseFloat(saved.ivaDefault) : config.ivaDefault,
        tipoDocumento: saved.tipoDocumento || config.tipoDocumento
      };
    }
  } catch (err) {
    console.error('Error reading config file, using environment defaults:', err);
  }
  return config;
}

// GET /api/config — Devuelve configuración de la empresa para el frontend
//
// `moneda.tasaDolar` devuelve la tasa de LA EMPRESA autenticada (tabla
// `empresas`) y solo cae al valor global de config.json si esa empresa no tiene
// una propia. Antes devolvía siempre la global, así que el POS y los reportes
// facturaban con una tasa distinta de la que el usuario ve y actualiza en el
// panel de control.
router.get('/', async (req, res, next) => {
  try {
    const config = getSystemConfig();
    const empresaRefId = await resolverEmpresaRefId(req);

    if (empresaRefId) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaRefId },
        select: { tasaDolar: true, monedaSimbolo: true, monedaCodigo: true },
      });
      if (empresa?.tasaDolar != null && Number(empresa.tasaDolar) > 0) {
        config.moneda.tasaDolar = Number(empresa.tasaDolar);
        config.moneda.simbolo = empresa.monedaSimbolo || config.moneda.simbolo;
        config.moneda.codigo = empresa.monedaCodigo || config.moneda.codigo;
        config.tasaFuente = 'EMPRESA';
      } else {
        config.tasaFuente = 'GLOBAL';
      }
    } else {
      config.tasaFuente = 'GLOBAL';
    }

    res.json(config);
  } catch (err) {
    next(err);
  }
});

// GET /api/config/tasa-bcv — Tasa oficial del BCV del día.
// El DolarWidget la consulta para el botón "Actualizar desde BCV" a través del
// backend: evita depender de CORS desde el navegador y reutiliza la caché de
// 6 h de `bcvHistorico`.
router.get('/tasa-bcv', async (_req, res) => {
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

// POST /api/config — Guarda configuración de la empresa
//
// Sigue escribiendo config.json (configuración global) y, además, sincroniza
// `empresas.tasaDolar` y los símbolos de moneda de la empresa autenticada. Sin
// esa sincronización el usuario veía el cambio en la pantalla de Configuración
// pero el POS seguía cobrando con la tasa anterior.
router.post('/', async (req, res, next) => {
  try {
    const { empresa, moneda, ivaDefault, tipoDocumento } = req.body;
    
    if (!empresa || !empresa.nombre || !empresa.rif) {
      return res.status(400).json({ error: 'Faltan campos obligatorios de la empresa (Nombre, RIF)' });
    }
    if (!moneda || !moneda.simbolo || !moneda.codigo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios de la moneda (Símbolo, Código)' });
    }

    const docType = (tipoDocumento === 'NOTA_ENTREGA') ? 'NOTA_ENTREGA' : 'FACTURA';

    const parsedTasaDolar = moneda.tasaDolar !== undefined ? parseFloat(moneda.tasaDolar) : 1.0;
    if (!isFinite(parsedTasaDolar) || parsedTasaDolar <= 0) {
      return res.status(400).json({ error: 'La tasa del dólar debe ser un número mayor a cero' });
    }

    const parsedIva = isNaN(parseFloat(ivaDefault)) ? 16.00 : parseFloat(ivaDefault);
    if (!isFinite(parsedIva) || parsedIva < 0 || parsedIva > 100) {
      return res.status(400).json({ error: 'El IVA por defecto debe estar entre 0 y 100' });
    }

    const newConfig = {
      empresa: {
        nombre: empresa.nombre.trim(),
        rif: empresa.rif.trim(),
        direccion: empresa.direccion?.trim() || '',
        telefono: empresa.telefono?.trim() || '',
        email: empresa.email?.trim() || '',
      },
      moneda: {
        simbolo: moneda.simbolo.trim(),
        codigo: moneda.codigo.toUpperCase().trim(),
        tasaDolar: parsedTasaDolar
      },
      ivaDefault: parsedIva,
      tipoDocumento: docType
    };

    // Ensure data directory exists
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');

    // Reflejar la tasa en la empresa, que es la fuente que usa el resto del sistema.
    const empresaRefId = await resolverEmpresaRefId(req);
    if (empresaRefId) {
      await prisma.empresa.update({
        where: { id: empresaRefId },
        data: {
          tasaDolar: parsedTasaDolar,
          monedaSimbolo: newConfig.moneda.simbolo,
          monedaCodigo: newConfig.moneda.codigo,
        },
      }).catch(err => console.error('[config] No se pudo sincronizar empresas.tasaDolar:', err.message));
    }

    res.json({ ...newConfig, tasaFuente: empresaRefId ? 'EMPRESA' : 'GLOBAL' });
  } catch (err) {
    next(err);
  }
});

// Obtener configuración por empresa
router.get('/empresas/:id/config', async (req, res, next) => {
  console.log('[DEBUG] GET /empresas/:id/config hit, id:', req.params.id);
  try {
    const { id } = req.params;
    // `:id` es un id de `empresas`; las sub-cuentas CAJA no lo tienen en el
    // token, hay que resolverlo subiendo por el Usuario padre.
    const empresaAutenticada = await resolverEmpresaRefId(req);
    if (empresaAutenticada !== id) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta empresa' });
    }
    const empresa = await require('../db/prisma').empresa.findUnique({
      where: { id },
      select: {
        id: true, nombre: true, rif: true, direccion: true,
        telefono: true, email: true, tasaDolar: true,
        monedaSimbolo: true, monedaCodigo: true
      }
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (err) { next(err); }
});

// Actualizar configuración por empresa (tasa manual, moneda, datos)
router.put('/empresas/:id/config', requireRole('EMPRESA'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que la empresa autenticada coincide con la que se va a actualizar
    const empresaAutenticada = await resolverEmpresaRefId(req);
    if (empresaAutenticada !== id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta empresa' });
    }

    const { tasaDolar, monedaSimbolo, monedaCodigo, nombre, rif, direccion, telefono, email } = req.body;

    // Validar tasaDolar si se proporciona
    if (tasaDolar !== undefined && tasaDolar !== null) {
      const parsed = Number(tasaDolar);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return res.status(400).json({ error: 'La tasa del dólar debe ser un número mayor a cero' });
      }
    }

    // Construir objeto de actualización solo con campos proporcionados
    const data = {};
    if (tasaDolar !== undefined) data.tasaDolar = Number(tasaDolar);
    if (monedaSimbolo !== undefined) data.monedaSimbolo = monedaSimbolo?.trim() || null;
    if (monedaCodigo !== undefined) data.monedaCodigo = monedaCodigo?.trim()?.toUpperCase() || null;
    if (nombre !== undefined) data.nombre = nombre?.trim();
    if (rif !== undefined) data.rif = rif?.trim();
    if (direccion !== undefined) data.direccion = direccion?.trim() || null;
    if (telefono !== undefined) data.telefono = telefono?.trim() || null;
    if (email !== undefined) data.email = email?.trim() || null;

    const actualizada = await prisma.empresa.update({
      where: { id },
      data,
      select: {
        id: true, nombre: true, rif: true, direccion: true,
        telefono: true, email: true, tasaDolar: true,
        monedaSimbolo: true, monedaCodigo: true
      }
    });

    res.json(actualizada);
  } catch (err) { next(err); }
});

router.getSystemConfig = getSystemConfig;
module.exports = router;
