const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const { getSystemConfig: _getSystemConfig, configPath: _configPath } = require('../utils/systemConfig');
const { requireRole } = require('../middleware/auth');
const prisma = require('../db/prisma');
const { resolverEmpresaRefId } = require('../utils/empresaContext');
const { tasaBCVActual } = require('../utils/bcvHistorico');
const { invalidarTasaEmpresa } = require('../utils/tasaEmpresaCache');
const { invalidarCacheVentas } = require('../services/reportesService');
const { registrar: registrarBitacora, contexto: contextoBitacora } = require('../services/bitacora');
const {
  MODOS,
  actualizarTasaEmpresa,
  asegurarTasaDelDia,
} = require('../services/tasaDolar');

// Campos de empresa que devuelve la API (incluye el modo de tasa y su fecha).
const SELECT_EMPRESA_CONFIG = {
  id: true, nombre: true, rif: true, direccion: true,
  telefono: true, email: true, tasaDolar: true,
  monedaSimbolo: true, monedaCodigo: true,
  tasaDolarModo: true, tasaDolarActualizadaEn: true,
  monedaBase: true, monedaExhibicion: true,
};

/**
 * Refresco perezoso de la tasa: si la empresa está en modo automático y su tasa
 * no es la de hoy, se actualiza con la del BCV. Nunca hace fallar la petición:
 * si el BCV está caído se responde con la última tasa conocida.
 */
async function refrescarTasaSiHaceFalta(empresa, contexto) {
  try {
    const refrescada = await asegurarTasaDelDia(empresa);
    return refrescada ? { ...empresa, ...refrescada } : empresa;
  } catch (err) {
    console.error(`[config] Refresco de tasa (${contexto}):`, err.message);
    return empresa;
  }
}

console.log('[CONFIG ROUTES] Router loaded, routes registered');

const configPath = _configPath;

// getSystemConfig — ahora vive en utils/systemConfig.js (sin importar routers)
// para evitar la dependencia circular config ↔ paymentCurrency.
function getSystemConfig() { return _getSystemConfig(); }

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
      let empresa = await prisma.empresa.findUnique({
        where: { id: empresaRefId },
        select: SELECT_EMPRESA_CONFIG,
      });
      // Primer uso del día: refresca la tasa automática antes de responder, para
      // que el POS no cobre con la tasa de ayer.
      empresa = await refrescarTasaSiHaceFalta(empresa, 'GET /config');

      // Multimoneda: la base y la exhibición de la empresa autenticada gobiernan
      // lo que el POS/reportes muestran. El switch visual convierte exhibición ↔
      // base usando la tasa; el backend sigue siendo la fuente de verdad.
      config.moneda.monedaBase = empresa?.monedaBase || config.moneda?.monedaBase || 'USD';
      config.moneda.monedaExhibicion = empresa?.monedaExhibicion || config.moneda?.monedaExhibicion || 'USD';
      if (empresa) {
        config.empresa = {
          nombre: empresa.nombre,
          rif: empresa.rif,
          direccion: empresa.direccion || '',
          telefono: empresa.telefono || '',
          email: empresa.email || '',
        };
        config.moneda.simbolo = empresa.monedaSimbolo || config.moneda.simbolo;
        config.moneda.codigo = empresa.monedaCodigo || config.moneda.codigo;
      }

      if (empresa?.tasaDolar != null && Number(empresa.tasaDolar) > 0) {
        config.moneda.tasaDolar = Number(empresa.tasaDolar);
        config.moneda.tasaDolarModo = empresa.tasaDolarModo || 'AUTO';
        config.moneda.tasaDolarActualizadaEn = empresa.tasaDolarActualizadaEn || null;
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

// POST /api/config/tasa-dolar/actualizar — Aplica la tasa oficial del BCV a la
// empresa autenticada, aunque ya se haya actualizado hoy y aunque esté en modo
// MANUAL (es una acción explícita del usuario). No cambia el modo.
router.post('/tasa-dolar/actualizar', requireRole('EMPRESA'), async (req, res, next) => {
  try {
    const empresaRefId = await resolverEmpresaRefId(req);
    if (!empresaRefId) {
      return res.status(400).json({ error: 'No hay una empresa asociada a la sesión' });
    }

    const antesTasa = await prisma.empresa.findUnique({
      where: { id: empresaRefId },
      select: { tasaDolar: true, tasaDolarModo: true },
    });

    const resultado = await actualizarTasaEmpresa(empresaRefId);
    if (resultado.motivo !== 'actualizada') {
      const mensajes = {
        sin_tasa: 'El BCV no tiene una tasa oficial disponible en este momento',
        error: 'No se pudo consultar la tasa oficial del BCV',
      };
      return res.status(503).json({
        error: resultado.error || mensajes[resultado.motivo] || 'No se pudo actualizar la tasa',
        motivo: resultado.motivo,
      });
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaRefId },
      select: SELECT_EMPRESA_CONFIG,
    });

    registrarBitacora({
      contexto: contextoBitacora(req),
      categoria: 'CONFIGURACION',
      modulo: 'config',
      accion: 'TASA_ACTUALIZADA_BCV',
      entidad: 'Empresa',
      entidadId: empresaRefId,
      descripcion: `Actualizó la tasa desde el BCV: ${antesTasa?.tasaDolar ?? '—'} → ${empresa?.tasaDolar ?? '—'} VES/USD`,
      datosAnteriores: { tasa: antesTasa?.tasaDolar, modo: antesTasa?.tasaDolarModo },
      datosNuevos: { tasa: empresa?.tasaDolar, modo: empresa?.tasaDolarModo, fuente: 'BCV' },
      monto: empresa?.tasaDolar,
    });

    res.json(empresa);
  } catch (err) { next(err); }
});

// POST /api/config — Guarda configuración de la empresa
//
// Persiste la tasa y las monedas en la empresa autenticada, que es la fuente de
// verdad usada por POS y reportes. La tasa anterior se invalida al guardar.
//
// Solo EMPRESA y SUPER_ADMIN: cualquier sub-cuenta (CAJA/INVENTARIO/VISOR)
// podía reescribir la tasa y los datos fiscales de la empresa. El frontend ya
// restringe /config a ADMIN_ONLY; esto cierra el hueco en la API.
router.post('/', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
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

    const MONEDAS_BASE = ['USD'];
    const MONEDAS_EXHIBICION = ['USD', 'VES'];
    const parsedMonedaBase = moneda.monedaBase || 'USD';
    const parsedMonedaExhibicion = moneda.monedaExhibicion || 'USD';
    if (!MONEDAS_BASE.includes(String(parsedMonedaBase))) {
      return res.status(400).json({ error: 'La moneda base disponible actualmente es USD' });
    }
    if (!MONEDAS_EXHIBICION.includes(String(parsedMonedaExhibicion))) {
      return res.status(400).json({ error: `La moneda de exhibición debe ser ${MONEDAS_EXHIBICION.join(' / ')}` });
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
        tasaDolar: parsedTasaDolar,
        monedaBase: parsedMonedaBase,
        monedaExhibicion: parsedMonedaExhibicion
      },
      ivaDefault: parsedIva,
      tipoDocumento: docType
    };

    // Persistir primero la configuración de la empresa: si la base de datos
    // falla, no se debe devolver éxito ni modificar el archivo global.
    const empresaRefId = await resolverEmpresaRefId(req);
    let anteriorConfig = null;
    if (empresaRefId) {
      anteriorConfig = await prisma.empresa.findUnique({
        where: { id: empresaRefId },
        select: SELECT_EMPRESA_CONFIG,
      });
      await prisma.empresa.update({
        where: { id: empresaRefId },
        data: {
          nombre: newConfig.empresa.nombre,
          rif: newConfig.empresa.rif,
          direccion: newConfig.empresa.direccion || null,
          telefono: newConfig.empresa.telefono || null,
          email: newConfig.empresa.email || null,
          tasaDolar: parsedTasaDolar,
          tasaDolarActualizadaEn: new Date(),
          monedaSimbolo: newConfig.moneda.simbolo,
          monedaCodigo: newConfig.moneda.codigo,
          monedaBase: parsedMonedaBase,
          monedaExhibicion: parsedMonedaExhibicion,
        },
      });
      invalidarTasaEmpresa(empresaRefId);
    } else {
      try { anteriorConfig = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { anteriorConfig = null; }
    }

    // Ensure data directory exists
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // La moneda base/exhibición cambia las cifras convertidas que devuelven los
    // reportes: invalida el cache de ventas para no servir montos viejos.
    invalidarCacheVentas();

    if (empresaRefId) {
      let configGlobal = {};
      try { configGlobal = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { configGlobal = {}; }
      fs.writeFileSync(configPath, JSON.stringify({
        ...configGlobal,
        ivaDefault: parsedIva,
        tipoDocumento: docType,
      }, null, 2), 'utf8');
    } else {
      fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
    }

    registrarBitacora({
      contexto: contextoBitacora(req),
      categoria: 'CONFIGURACION',
      modulo: 'config',
      accion: 'CONFIG_MODIFICADA',
      entidad: 'Configuracion',
      entidadId: empresaRefId || null,
      descripcion: `Actualizó la configuración general (tasa ${parsedTasaDolar} VES/USD, IVA ${parsedIva}%, ${docType})`,
      datosAnteriores: anteriorConfig,
      datosNuevos: newConfig,
    });

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
      select: SELECT_EMPRESA_CONFIG,
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(await refrescarTasaSiHaceFalta(empresa, 'GET /empresas/:id/config'));
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

    const { tasaDolar, tasaDolarModo, monedaSimbolo, monedaCodigo, monedaBase, monedaExhibicion, nombre, rif, direccion, telefono, email } = req.body;

    // Validar tasaDolar si se proporciona
    if (tasaDolar !== undefined && tasaDolar !== null) {
      const parsed = Number(tasaDolar);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return res.status(400).json({ error: 'La tasa del dólar debe ser un número mayor a cero' });
      }
    }

    // Validar el modo de tasa: decide si la actualización diaria puede pisarla.
    if (tasaDolarModo !== undefined && tasaDolarModo !== null && !MODOS.includes(tasaDolarModo)) {
      return res.status(400).json({ error: `El modo de tasa debe ser ${MODOS.join(' o ')}` });
    }

    // Validar las monedas: base solo USD/EUR; exhibición USD/EUR/VES.
    const MONEDAS_BASE = ['USD'];
    const MONEDAS_EXHIBICION = ['USD', 'VES'];
    if (monedaBase !== undefined && monedaBase !== null && !MONEDAS_BASE.includes(String(monedaBase))) {
      return res.status(400).json({ error: 'La moneda base disponible actualmente es USD' });
    }
    if (monedaExhibicion !== undefined && monedaExhibicion !== null && !MONEDAS_EXHIBICION.includes(String(monedaExhibicion))) {
      return res.status(400).json({ error: `La moneda de exhibición debe ser ${MONEDAS_EXHIBICION.join(' / ')}` });
    }
    if (monedaBase !== undefined || monedaExhibicion !== undefined) {
      const actual = await prisma.empresa.findUnique({
        where: { id },
        select: { monedaBase: true, monedaExhibicion: true },
      });
      const baseEfectiva = monedaBase ?? actual?.monedaBase ?? 'USD';
      const exhibicionEfectiva = monedaExhibicion ?? actual?.monedaExhibicion ?? baseEfectiva;
      if (baseEfectiva !== 'USD' || !['USD', 'VES'].includes(exhibicionEfectiva)) {
        return res.status(400).json({ error: 'La conversión de exhibición disponible actualmente es USD ↔ VES' });
      }
    }

    // Construir objeto de actualización solo con campos proporcionados
    const data = {};
    if (tasaDolar !== undefined) {
      data.tasaDolar = Number(tasaDolar);
      // Guardar la fecha permite distinguir "tasa de hoy" de "tasa de ayer"
      // sin volver a consultar el BCV.
      data.tasaDolarActualizadaEn = new Date();
    }
    if (tasaDolarModo !== undefined && tasaDolarModo !== null) data.tasaDolarModo = tasaDolarModo;
    if (monedaSimbolo !== undefined) data.monedaSimbolo = monedaSimbolo?.trim() || null;
    if (monedaCodigo !== undefined) data.monedaCodigo = monedaCodigo?.trim()?.toUpperCase() || null;
    if (monedaBase !== undefined && monedaBase !== null) data.monedaBase = String(monedaBase);
    if (monedaExhibicion !== undefined && monedaExhibicion !== null) data.monedaExhibicion = String(monedaExhibicion);
    if (nombre !== undefined) data.nombre = nombre?.trim();
    if (rif !== undefined) data.rif = rif?.trim();
    if (direccion !== undefined) data.direccion = direccion?.trim() || null;
    if (telefono !== undefined) data.telefono = telefono?.trim() || null;
    if (email !== undefined) data.email = email?.trim() || null;

    const antes = await prisma.empresa.findUnique({ where: { id }, select: SELECT_EMPRESA_CONFIG });

    const actualizada = await prisma.empresa.update({
      where: { id },
      data,
      select: SELECT_EMPRESA_CONFIG
    });

    // El POS tiene la tasa cacheada 60 s: sin invalidar seguiría cobrando con la
    // tasa anterior aunque el usuario acabe de cambiarla.
    invalidarTasaEmpresa(id);

    // Cambiar la moneda base/exhibición cambia las cifras convertidas que los
    // reportes devuelven (ya están en exhibición): invalida el cache de ventas.
    if (data.monedaBase !== undefined || data.monedaExhibicion !== undefined) {
      invalidarCacheVentas();
    }

    const camposConfig = ['tasaDolar', 'tasaDolarModo', 'monedaSimbolo', 'monedaCodigo', 'monedaBase', 'monedaExhibicion', 'nombre', 'rif', 'direccion', 'telefono', 'email'];
    const cambios = {};
    for (const campo of camposConfig) {
      if (String(antes?.[campo] ?? '') !== String(actualizada?.[campo] ?? '')) {
        cambios[campo] = { antes: antes?.[campo], despues: actualizada?.[campo] };
      }
    }

    if (Object.keys(cambios).length > 0) {
      const resumen = Object.entries(cambios)
        .map(([campo, c]) => `${campo} ${c.antes ?? '—'} → ${c.despues ?? '—'}`)
        .join(', ');
      registrarBitacora({
        contexto: contextoBitacora(req),
        categoria: 'CONFIGURACION',
        modulo: 'config',
        accion: data.tasaDolar !== undefined
          ? 'TASA_MODIFICADA'
          : data.tasaDolarModo !== undefined ? 'TASA_MODO_MODIFICADO' : 'CONFIG_MODIFICADA',
        entidad: 'Empresa',
        entidadId: id,
        descripcion: `Modificó la configuración: ${resumen}`,
        datosAnteriores: Object.fromEntries(Object.entries(cambios).map(([k, v]) => [k, v.antes])),
        datosNuevos: { ...Object.fromEntries(Object.entries(cambios).map(([k, v]) => [k, v.despues])), cambios },
        monto: cambios.tasaDolar?.despues ?? undefined,
      });
    }

    res.json(actualizada);
  } catch (err) { next(err); }
});

router.getSystemConfig = getSystemConfig;
module.exports = router;
