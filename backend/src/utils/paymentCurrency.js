const { Decimal } = require('decimal.js');
const { getSystemConfig } = require('./systemConfig');
const { obtenerTasaEmpresa, guardarTasaEmpresa } = require('./tasaEmpresaCache');
const { tasaBCVActual } = require('./bcvHistorico');
const prisma = require('../db/prisma');
const { ESTADOS_PAGO } = require('../config/pagos');

const MONEDAS_SISTEMA = ['USD', 'EUR', 'VES'];

// Catálogo de pagos/monedas aceptadas por el sistema: la base (USD | EUR) y las
// exhibiciones (USD | EUR | VES). Con la base en USD (default) el par operativo
// histórico es USD ↔ VES; con base EUR se suman las equivalencias contra el
// euro (`tasaBaseAHacia` maneja la tasa base → VES con valor distinto).
const MONEDAS_PAGO = MONEDAS_SISTEMA;

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

  // `tasaCambio` = unidades de la moneda origen por unidad de la moneda destino
  // (para base USD → VES: Bs por USD = tasaDolar; para base EUR → VES: Bs por EUR).
  // VES → base divide; base → VES multiplica.
  return monedaOrigen === 'VES' ? amount.div(rate) : amount.mul(rate);
}

// ── Multimoneda: moneda base y exhibición por empresa ────────────────────────

/**
 * Moneda BASE de una empresa (USD | EUR). Es la unidad en la que se registran
 * inventario/precios y los montos guardados; default USD.
 */
async function monedaBasePorEmpresa(empresaId) {
  if (empresaId) {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { monedaBase: true },
    });
    if (empresa?.monedaBase === 'EUR') return 'EUR';
  }
  return 'USD';
}

/**
 * Moneda de EXHIBICIÓN de una empresa (USD | EUR | VES). Es la que se ve en
 * ventas, reportes, CxC, presupuestos y facturas. Default: la moneda base.
 */
async function monedaExhibicionPorEmpresa(empresaId) {
  let base = 'USD';
  if (empresaId) {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { monedaBase: true, monedaExhibicion: true },
    });
    base = empresa?.monedaBase === 'EUR' ? 'EUR' : 'USD';
    if (empresa?.monedaExhibicion) return empresa.monedaExhibicion;
  }
  return base;
}

/**
 * Tasa de la moneda BASE hacia una moneda de exhibición (por defecto la de la
 * empresa). Para VES devuelve la tasa base → VES (Bs por unidad de la base: Bs/USD
 * con base USD, Bs/EUR con base EUR). Para la misma moneda devuelve 1.
 */
async function tasaBaseAHacia(empresaId, monedaDestino = null) {
  const base = await monedaBasePorEmpresa(empresaId);
  const destino = monedaDestino || await monedaExhibicionPorEmpresa(empresaId);
  if (destino === base) return new Decimal(1);
  if (destino === 'VES') {
    const tasa = await getTasaSistemaPorEmpresa(empresaId);
    if (tasa == null) throw new Error('No hay una tasa de cambio configurada');
    return tasa;
  }
  throw new Error(`No se puede convertir a la moneda ${destino} con las tasas configuradas`);
}

/** Convierte un monto en la moneda BASE a la moneda de exhibición (o a `monedaDestino`). */
async function convertirAMoneda(monto, monedaDestino = null, empresaId = null) {
  const base = await monedaBasePorEmpresa(empresaId);
  const destino = monedaDestino || await monedaExhibicionPorEmpresa(empresaId);
  const amount = new Decimal(monto.toString());
  if (destino === base) return amount;
  const tasa = await tasaBaseAHacia(empresaId, destino);
  return amount.mul(tasa);
}

/** Convierte un monto desde `monedaOrigen` hacia `monedaDestino` de la empresa. */
async function convertirMoneda(monto, monedaOrigen, monedaDestino, empresaId = null) {
  const base = await monedaBasePorEmpresa(empresaId);
  const origen = monedaOrigen || base;
  const destino = monedaDestino || await monedaExhibicionPorEmpresa(empresaId);
  if (origen === destino) {
    const amount = new Decimal(monto.toString());
    return amount;
  }
  const montoEnBase = await convertirDesdeMoneda(monto, origen, empresaId);
  if (destino === base) return montoEnBase;
  const tasa = await tasaBaseAHacia(empresaId, destino);
  return montoEnBase.mul(tasa);
}

/** Convierte un monto desde una moneda (p.ej. VES) hacia la moneda BASE. */
async function convertirDesdeMoneda(monto, monedaOrigen, empresaId = null) {
  const base = await monedaBasePorEmpresa(empresaId);
  const amount = new Decimal(monto.toString());
  if (monedaOrigen === base) return amount;
  const tasa = await tasaBaseAHacia(empresaId, base);
  return amount.div(tasa);
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
async function tasaCambioEfectiva(factura, empresaId = null, tx = null) {
  const moneda = factura?.moneda || 'USD';
  const tasaFactura = factura?.tasaCambio != null && factura.tasaCambio !== ''
    ? new Decimal(factura.tasaCambio.toString())
    : null;

  if (moneda === 'VES' && esTasaValida(tasaFactura)) return tasaFactura;
  return getTasaSistemaPorEmpresa(empresaId, tx);
}

/** Convierte un monto exprés en la moneda de la factura usando la tasa efectiva. */
async function convertirAFactura(monto, monedaOrigen, factura, empresaId = null, tx = null) {
  return convertirMontoMoneda(
    monto,
    monedaOrigen,
    factura?.moneda || 'USD',
    await tasaCambioEfectiva(factura, empresaId, tx)
  );
}

async function normalizarPagoAFactura(pago, factura, empresaId = null, tx = null) {
  // Un pago anulado no reduce el saldo. El filtro vive aquí para que todas las
  // puertas (facturas, pagos, CxC y reportes) usen la misma regla.
  if (pago?.estado === ESTADOS_PAGO.ANULADO) return new Decimal(0);

  return convertirAFactura(
    pago.monto,
    pago.monedaPago || factura.moneda || 'USD',
    factura,
    empresaId,
    tx
  );
}

/**
 * Suma los pagos normalizados a la moneda de la factura.
 * Sustituye a `pagos.reduce(...)` porque la conversión ahora es async.
 */
async function sumarPagosNormalizados(pagos, factura, empresaId = null, tx = null) {
  let total = new Decimal(0);
  for (const pago of pagos || []) {
    total = total.add(await normalizarPagoAFactura(pago, factura, empresaId, tx));
  }
  return total;
}

/**
 * Normaliza un pago a la MONEDA BASE de la empresa para CuentaPorCobrar, que
 * SIEMPRE almacena montos en la moneda base (USD por defecto, EUR con base EUR).
 * La tasa efectiva es la de la factura si se emitió en VES, o la vigente de la
 * empresa si se emitió en la base (tasaCambio=1 no sirve como tasa real).
 *
 * Fuente única compartida por `pagos.js` y `cxc.js`: si divergen, el saldo que
 * escribe una puerta no coincide con el que lee la otra (bug de CxC con
 * facturas en Bs).
 */
async function pagoCxcAUsd(pago, factura, empresaId = null, tx = null) {
  // Mismo criterio que `normalizarPagoAFactura`: un pago anulado no suma al
  // monto cobrado ni reduce el pendiente de la cuenta por cobrar.
  if (pago?.estado === ESTADOS_PAGO.ANULADO) return new Decimal(0);

  const base = await monedaBasePorEmpresa(empresaId);
  const monedaFactura = factura?.moneda || base;

  // `tasaCambioEfectiva` devuelve la tasa base→exhibición en uso (Bs por unidad
  // de la base con la que se emitió: Bs/USD con base USD, Bs/EUR con base EUR).
  // Convertir el pago a la base es: VES → base divide por esa tasa; base → base
  // es identidad.
  return convertirMontoMoneda(
    pago.monto,
    pago.monedaPago || monedaFactura,
    base,
    await tasaCambioEfectiva(factura, empresaId, tx)
  );
}

/** Suma en la moneda base una lista de pagos para el saldo de CuentaPorCobrar. */
async function sumarPagosCxcUSD(pagos, factura, empresaId = null, tx = null) {
  let total = new Decimal(0);
  for (const pago of pagos || []) {
    total = total.add(await pagoCxcAUsd(pago, factura, empresaId, tx));
  }
  return total;
}

/**
 * Resuelve la tasa VES→USD para una empresa específica.
 * Lee desde el registro Empresa.tasaDolar (configuración manual por empresa).
 * Caché en memoria de 60 segundos para no golpe la BD en cada pago.
 * Fallback al config global si la empresa no tiene tasa definida.
 */
async function getTasaSistemaPorEmpresa(empresaId, tx = null) {
  // 1. Tasa propia de la empresa (AUTO: BCV del día; MANUAL: la guardada).
  if (empresaId) {
    const enCache = obtenerTasaEmpresa(empresaId);
    if (enCache) return enCache;

    try {
      const client = tx || prisma;
      const empresa = await client.empresa.findUnique({
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
  MONEDAS_SISTEMA,
  MONEDAS_PAGO,
  convertirMontoMoneda,
  convertirAFactura,
  tasaCambioEfectiva,
  normalizarPagoAFactura,
  sumarPagosNormalizados,
  pagoCxcAUsd,
  sumarPagosCxcUSD,
  getTasaSistema: leerTasaSistema,
  getTasaSistemaPorEmpresa,
  monedaBasePorEmpresa,
  monedaExhibicionPorEmpresa,
  tasaBaseAHacia,
  convertirAMoneda,
  convertirMoneda,
  convertirDesdeMoneda
};
