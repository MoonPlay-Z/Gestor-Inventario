const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

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
router.get('/', (_req, res) => {
  res.json(getSystemConfig());
});

// POST /api/config — Guarda configuración de la empresa
router.post('/', (req, res) => {
  try {
    const { empresa, moneda, ivaDefault, tipoDocumento } = req.body;
    
    if (!empresa || !empresa.nombre || !empresa.rif) {
      return res.status(400).json({ error: 'Faltan campos obligatorios de la empresa (Nombre, RIF)' });
    }
    if (!moneda || !moneda.simbolo || !moneda.codigo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios de la moneda (Símbolo, Código)' });
    }

    const docType = (tipoDocumento === 'NOTA_ENTREGA') ? 'NOTA_ENTREGA' : 'FACTURA';

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
        tasaDolar: moneda.tasaDolar !== undefined ? parseFloat(moneda.tasaDolar) : 1.0
      },
      ivaDefault: isNaN(parseFloat(ivaDefault)) ? 16.00 : parseFloat(ivaDefault),
      tipoDocumento: docType
    };

    // Ensure data directory exists
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    res.json(newConfig);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar la configuración', details: err.message });
  }
});

module.exports = router;
