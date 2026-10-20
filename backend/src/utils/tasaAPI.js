/**
 * tasaAPI — Fachada única para la tasa de cambio en el backend.
 *
 * TODOS los módulos (facturas, CxC, cotizaciones, caja, inventario, reportes,
 * dashboard, configuración) resuelven la tasa a través de aquí, para que el
 * sistema use SIEMPRE la misma tasa por empresa.
 *
 * La implementación real vive en:
 *   - `paymentCurrency.js`  → fuente de verdad de la resolución/conversión.
 *   - `services/tasaDolar.js` → job diario y actualización desde el BCV.
 *
 * Esta capa sólo expone una API estable con nombres orientados al dominio, de
 * modo que los módulos no dependan de detalles de `paymentCurrency`.
 */
const { Decimal } = require('decimal.js');
const {
  MONEDAS_PAGO,
  convertirMontoMoneda,
  convertirAFactura,
  normalizarPagoAFactura,
  sumarPagosNormalizados,
  pagoCxcAUsd,
  sumarPagosCxcUSD,
  tasaCambioEfectiva,
  getTasaSistemaPorEmpresa,
} = require('./paymentCurrency');
const { actualizarTasaEmpresa: actualizarTasaEmpresaBCV } = require('../services/tasaDolar');
const { invalidarTasaEmpresa } = require('./tasaEmpresaCache');
const prisma = require('../db/prisma');

const MODOS = ['AUTO', 'MANUAL'];

/**
 * Tasa vigente (VES por USD) de una empresa.
 *
 * Fuente: `Empresa.tasaDolar` — en modo AUTO la escribe el job diario con la
 * tasa oficial del BCV; en MANUAL la guarda el usuario. Si la empresa no tiene
 * tasa se cae a la tasa global del sistema. NUNCA devuelve un valor hardcodeado.
 *
 * @param {string|null} empresaId id en `empresas` (ver resolverEmpresaRefId)
 * @returns {Promise<Decimal>}
 */
async function tasaParaEmpresa(empresaId) {
  return getTasaSistemaPorEmpresa(empresaId);
}

/**
 * Tasa efectiva para una factura concreta.
 *   - Factura emitida en VES → usa la tasa snapshot de la factura.
 *   - Factura emitida en USD → usa la tasa vigente de la empresa.
 */
async function tasaEfectivaFactura(factura, empresaId = null) {
  return tasaCambioEfectiva(factura, empresaId);
}

/** Estado completo de la tasa de una empresa (para la API y el widget del POS). */
async function estadoTasaEmpresa(empresaId) {
  let tasa = null;
  try {
    const resuelta = await getTasaSistemaPorEmpresa(empresaId);
    if (resuelta) tasa = Number(resuelta.toString());
  } catch {
    tasa = null;
  }

  let empresa = null;
  if (empresaId) {
    empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { tasaDolarModo: true, tasaDolarActualizadaEn: true },
    });
  }

  const modo = empresa?.tasaDolarModo || 'AUTO';
  return {
    tasa,
    modo,
    fuente: modo === 'MANUAL' ? 'MANUAL' : 'BCV',
    actualizadaEn: empresa?.tasaDolarActualizadaEn || null,
    empresaId: empresaId || null,
  };
}

/**
 * Aplica la tasa oficial del BCV a una empresa, sin importar su modo.
 * Es una acción explícita del usuario (botón del widget o aviso diario): el
 * modo NO se modifica.
 */
async function actualizarTasaEmpresa(empresaId) {
  return actualizarTasaEmpresaBCV(empresaId);
}

/**
 * Guarda una tasa MANUAL para una empresa.
 *
 * NO cambia el modo: guardar a mano en modo AUTO fija la tasa de hoy (y
 * `tasaDolarActualizadaEn` evita que el job la pise hasta mañana) sin sacar a
 * la empresa de la actualización diaria. El modo sólo se cambia con el
 * interruptor (`setModoTasa`).
 */
async function guardarTasaManual(empresaId, tasaDolar) {
  const tasa = new Decimal(String(tasaDolar));
  if (!tasa.isFinite() || tasa.lte(0)) {
    const err = new Error('La tasa del dólar debe ser un número mayor a cero');
    err.status = 400;
    throw err;
  }

  await prisma.empresa.update({
    where: { id: empresaId },
    data: {
      tasaDolar: Number(tasa.toString()),
      // Marca "tasa de hoy": distingue la tasa vigente de la de ayer.
      tasaDolarActualizadaEn: new Date(),
    },
  });
  invalidarTasaEmpresa(empresaId);
  return estadoTasaEmpresa(empresaId);
}

/** Cambia el modo de actualización de la tasa de una empresa (AUTO | MANUAL). */
async function setModoTasa(empresaId, modo) {
  if (!MODOS.includes(modo)) {
    const err = new Error(`El modo de tasa debe ser ${MODOS.join(' o ')}`);
    err.status = 400;
    throw err;
  }

  await prisma.empresa.update({
    where: { id: empresaId },
    data: { tasaDolarModo: modo },
  });
  invalidarTasaEmpresa(empresaId);
  return estadoTasaEmpresa(empresaId);
}

module.exports = {
  MODOS,
  MONEDAS_PAGO,
  convertirMontoMoneda,
  convertirAFactura,
  normalizarPagoAFactura,
  sumarPagosNormalizados,
  pagoCxcAUsd,
  sumarPagosCxcUSD,
  getTasaSistemaPorEmpresa,
  tasaCambioEfectiva,
  tasaParaEmpresa,
  tasaEfectivaFactura,
  estadoTasaEmpresa,
  actualizarTasaEmpresa,
  guardarTasaManual,
  setModoTasa,
};
