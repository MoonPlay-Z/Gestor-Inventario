const { Decimal } = require('decimal.js');
const { getSystemConfig } = require('../routes/config');
const prisma = require('../db/prisma');

const MONEDAS_PAGO = ['USD', 'VES'];
const TASA_VES_FALLBACK = new Decimal('36.5');

// Caché de la tasa del sistema con invalidación por mtime, para no leer
// config.json del disco en cada pago de un listado.
const _tasaCache = { tasa: null, mtime: 0 };

// Caché de tasas por empresa (vigilia hasta 60 segundos)
const _tasaEmpresaCache = new Map(); // empresaId -> { tasa, timestamp }

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
    const valor = esTasaValida(tasa) ? tasa : TASA_VES_FALLBACK;
    _tasaCache.tasa = valor;
    _tasaCache.mtime = mtime;
    return valor;
  } catch (_) {
    return TASA_VES_FALLBACK;
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
 * Se usa además la tasa vigente del sistema (config.json → moneda.tasaDolar,
 * actualizable desde DolarWidget), manteniendo la coherencia con el
 * `montoOriginal` de CuentaPorCobrar, que también se normaliza a USD.
 */
function tasaCambioEfectiva(factura) {
  const moneda = factura?.moneda || 'USD';
  const tasaFactura = factura?.tasaCambio != null && factura.tasaCambio !== ''
    ? new Decimal(factura.tasaCambio.toString())
    : null;

  if (moneda === 'VES' && esTasaValida(tasaFactura)) return tasaFactura;
  return leerTasaSistema();
}

/** Convierte un monto exprés en la moneda de la factura usando la tasa efectiva. */
function convertirAFactura(monto, monedaOrigen, factura) {
  return convertirMontoMoneda(
    monto,
    monedaOrigen,
    factura?.moneda || 'USD',
    tasaCambioEfectiva(factura)
  );
}

function normalizarPagoAFactura(pago, factura) {
  return convertirAFactura(
    pago.monto,
    pago.monedaPago || factura.moneda || 'USD',
    factura
  );
}

/**
 * Resuelve la tasa VES→USD para una empresa específica.
 * Lee desde el registro Empresa.tasaDolar (configuración manual por empresa).
 * Caché en memoria de 60 segundos para no golpe la BD en cada pago.
 * Fallback al config global si la empresa no tiene tasa definida.
 */
async function getTasaSistemaPorEmpresa(empresaId) {
  if (!empresaId) return leerTasaSistema();

  const cached = _tasaEmpresaCache.get(empresaId);
  const now = Date.now();
  if (cached && (now - cached.timestamp) < 60000) {
    return cached.tasa;
  }

  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { tasaDolar: true },
    });
    const raw = empresa?.tasaDolar;
    const tasa = raw != null && Number.isFinite(Number(raw)) && Number(raw) > 0
      ? new Decimal(String(raw))
      : null;
    const valor = (tasa && tasa.isFinite() && tasa.gt(0)) ? tasa : leerTasaSistema();
    _tasaEmpresaCache.set(empresaId, { tasa: valor, timestamp: now });
    return valor;
  } catch (_) {
    return leerTasaSistema();
  }
}

module.exports = {
  MONEDAS_PAGO,
  convertirMontoMoneda,
  convertirAFactura,
  tasaCambioEfectiva,
  normalizarPagoAFactura,
  getTasaSistema: leerTasaSistema,
  getTasaSistemaPorEmpresa
};
