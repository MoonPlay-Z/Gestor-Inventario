const { Decimal } = require('decimal.js');
const { getSystemConfig } = require('../routes/config');
const { obtenerTasaEmpresa, guardarTasaEmpresa } = require('./tasaEmpresaCache');
const { tasaBCVActual } = require('./bcvHistorico');
const prisma = require('../db/prisma');
const { ESTADOS_PAGO } = require('../config/pagos');

const MONEDAS_PAGO = ['USD', 'VES'];

// Caché de la tasa del sistema con invalidación por mtime, para no leer
// config.json del disco en cada pago de un listado.
const _tasaCache = { tasa: null, mtime: 0 };

function convertirMontoMoneda(monto, monedaOrigen, monedaDestino, tasaCambio) {
  if (!MONEDAS_PAGO.includes(monedaOrigen) || !MONEDAS_PAGO.includes(monedaDestino)) {
    throw new Error('La moneda del pago o de la factura no es válida');
  }

  const amount = new Decimal(monto.toString());
  if (monedaOrigen === monedaDestino) return amount;

  if (tasaCambio === null || tasaCambio === undefined) {
    throw new Error('Se requiere una tasa de cambio para convertir el pago');
  }

  const rate = new Decimal(tasaCambio.toString());
  if (!rate.isFinite() || rate.lte(0)) {
    throw new Error('La tasa de cambio debe ser mayor a cero para convertir el pago');
  }

  return monedaOrigen === 'VES' ? amount.div(rate) : amount.mul(rate);
}

const esTasaValida = (t) => t instanceof Decimal && t.isFinite() && t.gt(0);

function leerTasaSistema() {
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(
      process.env.DATA_DIR || path.join(__dirname, '../../data'),
      'config.json'
    );
    const mtime = fs.existsSync(configPath) ? fs.statSync(configPath).mtimeMs : 0;
    if (_tasaCache.tasa !== null && _tasaCache.mtime === mtime) return _tasaCache.tasa;

    const config = getSystemConfig();
    const raw = config?.moneda?.tasaDolar;
    const tasa = raw != null && raw !== '' ? new Decimal(String(raw)) : null;
    // Sin tasa global se devuelve null y el llamador decide el siguiente
    // recurso. Antes se devolvía 36.5 hardcodeado, que provocaba conversiones
    // silenciosamente erróneas (1000 Bs leídos como ~27 USD).
    const valor = esTasaValida(tasa) ? tasa : null;
    _tasaCache.tasa = valor;
    _tasaCache.mtime = mtime;
    return valor;
  } catch (_) {
    return null;
  }
}

/**
 * Resuelve la tasa efectiva (VES por USD) para convertir pagos de una factura.
 *
 * `factura.tasaCambio` SOLO es una tasa VES↔USD real cuando la factura fue
 * emitida en VES. En facturas emitidas en USD el campo vale 1.0 (default del
 * schema) y no aporta información de tasa, por lo que usarlo convertiría
 * "1000 Bs" en "1000 USD" y dispararía falsos errores de sobrepago.
 *
 * Cuando la factura es USD se usa la tasa de la EMPRESA (`Empresa.tasaDolar`,
 * cacheada 60s) para no mezclar monedas entre tenants; si no se conoce la
 * empresa se cae a la tasa global del sistema.
 *
 * Es async porque la tasa por empresa requiere I/O a la base de datos.
 *
 * @param {Object} factura
 * @param {string|null} empresaId - id en `empresas` (ver resolverEmpresaRefId)
 */
async function tasaCambioEfectiva(factura, empresaId = null) {
  const moneda = factura?.moneda || 'USD';
  const tasaFactura = factura?.tasaCambio != null && factura.tasaCambio !== ''
    ? new Decimal(factura.tasaCambio.toString())
    : null;

  if (moneda === 'VES' && esTasaValida(tasaFactura)) return tasaFactura;
  return getTasaSistemaPorEmpresa(empresaId);
}

/** Convierte un monto exprés en la moneda de la factura usando la tasa efectiva. */
async function convertirAFactura(monto, monedaOrigen, factura, empresaId = null) {
  return convertirMontoMoneda(
    monto,
    monedaOrigen,
    factura?.moneda || 'USD',
    await tasaCambioEfectiva(factura, empresaId)
  );
}

async function normalizarPagoAFactura(pago, factura, empresaId = null) {
  // Un pago anulado no reduce el saldo. El filtro vive aquí para que todas las
  // puertas (facturas, pagos, CxC y reportes) usen la misma regla.
  if (pago?.estado === ESTADOS_PAGO.ANULADO) return new Decimal(0);

  return convertirAFactura(
    pago.monto,
    pago.monedaPago || factura.moneda || 'USD',
    factura,
    empresaId
  );
}

/**
 * Suma los pagos normalizados a la moneda de la factura.
 * Sustituye a `pagos.reduce(...)` porque la conversión ahora es async.
 */
async function sumarPagosNormalizados(pagos, factura, empresaId = null) {
  let total = new Decimal(0);
  for (const pago of pagos || []) {
    total = total.add(await normalizarPagoAFactura(pago, factura, empresaId));
  }
  return total;
}

/**
 * Normaliza un pago a USD para CuentaPorCobrar, que SIEMPRE almacena montos en
 * USD. La tasa efectiva es la de la factura si se emitió en VES, o la vigente
 * de la empresa si se emitió en USD (`tasaCambio = 1` no es una tasa real).
 *
 * Fuente única compartida por `pagos.js` y `cxc.js`: si divergen, el saldo que
 * escribe una puerta no coincide con el que lee la otra (bug de CxC con
 * facturas en Bs).
 */
async function pagoCxcAUsd(pago, factura, empresaId = null) {
  // Mismo criterio que `normalizarPagoAFactura`: un pago anulado no suma al
  // monto cobrado ni reduce el pendiente de la cuenta por cobrar.
  if (pago?.estado === ESTADOS_PAGO.ANULADO) return new Decimal(0);

  return convertirMontoMoneda(
    pago.monto,
    pago.monedaPago || factura?.moneda || 'USD',
    'USD',
    await tasaCambioEfectiva(factura, empresaId)
  );
}

/** Suma en USD una lista de pagos para el saldo de CuentaPorCobrar. */
async function sumarPagosCxcUSD(pagos, factura, empresaId = null) {
  let total = new Decimal(0);
  for (const pago of pagos || []) {
    total = total.add(await pagoCxcAUsd(pago, factura, empresaId));
  }
  return total;
}

/**
 * Resuelve la tasa VES→USD para una empresa específica.
 * Lee desde el registro Empresa.tasaDolar (configuración manual por empresa).
 * Caché en memoria de 60 segundos para no golpe la BD en cada pago.
 * Fallback al config global si la empresa no tiene tasa definida.
 */
async function getTasaSistemaPorEmpresa(empresaId) {
  // 1. Tasa propia de la empresa (AUTO: BCV del día; MANUAL: la guardada).
  if (empresaId) {
    const enCache = obtenerTasaEmpresa(empresaId);
    if (enCache) return enCache;

    try {
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaId },
        select: { tasaDolar: true },
      });
      const raw = empresa?.tasaDolar;
      const tasa = raw != null && Number.isFinite(Number(raw)) && Number(raw) > 0
        ? new Decimal(String(raw))
        : null;
      if (esTasaValida(tasa)) {
        guardarTasaEmpresa(empresaId, tasa);
        return tasa;
      }
    } catch (_) {
      // Sin acceso a la empresa se intenta la tasa global.
    }
  }

  // 2. Tasa global del sistema (config.json).
  const global = leerTasaSistema();
  if (esTasaValida(global)) {
    if (empresaId) guardarTasaEmpresa(empresaId, global);
    return global;
  }

  // 3. Último recurso: tasa oficial del BCV. Nunca un valor hardcodeado.
  const bcv = await tasaBCVActual();
  if (esTasaValida(bcv)) {
    if (empresaId) guardarTasaEmpresa(empresaId, bcv);
    return bcv;
  }

  throw new Error('No hay una tasa de cambio configurada');
}

module.exports = {
  MONEDAS_PAGO,
  convertirMontoMoneda,
  convertirAFactura,
  tasaCambioEfectiva,
  normalizarPagoAFactura,
  sumarPagosNormalizados,
  pagoCxcAUsd,
  sumarPagosCxcUSD,
  getTasaSistema: leerTasaSistema,
  getTasaSistemaPorEmpresa
};
