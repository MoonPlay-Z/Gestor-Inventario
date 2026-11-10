/**
 * systemConfig — Lector del archivo config.json del sistema.
 *
 * Extraído de `routes/config.js` para romper la dependencia circular:
 *   routes/config.js → services/reportesService.js → utils/tasaAPI.js
 *                    → utils/paymentCurrency.js → routes/config.js  ← CICLO
 *
 * Tanto `routes/config.js` como `utils/paymentCurrency.js` importan desde aquí.
 * Este módulo NO importa ningún router ni servicio.
 */
const fs   = require('fs');
const path = require('path');

const dataDir    = process.env.DATA_DIR || path.join(__dirname, '../../data');
const configPath = path.join(dataDir, 'config.json');

/**
 * Carga y devuelve la configuración del sistema.
 * Aplica valores de entorno como base y luego los sobreescribe con lo que
 * haya guardado en config.json (si existe).
 *
 * @returns {object} Objeto de configuración del sistema.
 */
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
      // Sin tasa por defecto: si no hay config.json se resuelve la tasa por
      // empresa (o el BCV). Un valor fijo aquí convertía VES→USD con una tasa
      // inexistente.
      tasaDolar: process.env.MONEDA_TASA_DOLAR ? parseFloat(process.env.MONEDA_TASA_DOLAR) : null,
      // Multimoneda: base (USD/EUR) y exhibición (USD/EUR/VES) de la empresa.
      monedaBase:       process.env.MONEDA_BASE       || 'USD',
      monedaExhibicion: process.env.MONEDA_EXHIBICION || 'USD',
    },
    ivaDefault:    parseFloat(process.env.IVA_DEFAULT   || '16.00'),
    tipoDocumento: process.env.TIPO_DOCUMENTO || 'FACTURA',
  };

  try {
    if (fs.existsSync(configPath)) {
      const saved = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config = {
        empresa: { ...config.empresa, ...saved.empresa },
        moneda: {
          simbolo:   saved.moneda?.simbolo  || config.moneda.simbolo,
          codigo:    saved.moneda?.codigo   || config.moneda.codigo,
          tasaDolar: saved.moneda?.tasaDolar !== undefined
            ? parseFloat(saved.moneda.tasaDolar)
            : config.moneda.tasaDolar,
          monedaBase: saved.moneda?.monedaBase || config.moneda.monedaBase,
          monedaExhibicion: saved.moneda?.monedaExhibicion || config.moneda.monedaExhibicion,
        },
        ivaDefault:    saved.ivaDefault    !== undefined ? parseFloat(saved.ivaDefault)    : config.ivaDefault,
        tipoDocumento: saved.tipoDocumento || config.tipoDocumento,
      };
    }
  } catch (err) {
    console.error('Error reading config file, using environment defaults:', err);
  }

  return config;
}

module.exports = { getSystemConfig, configPath, dataDir };
