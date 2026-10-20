const { Decimal } = require('decimal.js');

/**
 * Convierte un valor a Decimal sin lanzar.
 *
 * `new Decimal()` con texto no numérico (o con `null`/`''`/objetos) lanza
 * `DecimalError`, que el errorHandler no conocía y terminaba en un 500 opaco.
 * Esta variante devuelve un Decimal NO finito (NaN) para que el llamador lo
 * rechace con un 422 legible.
 *
 * Fuente única: caja.js, productos.js, pagos.js y cxc.js deben usar este helper
 * en lugar de `new Decimal(...)` directo sobre entrada del usuario.
 *
 * @param {*} valor
 * @param {number|string} [porDefecto=0] valor usado cuando no viene nada
 * @returns {Decimal}
 */
const toDecimalSeguro = (valor, porDefecto = 0) => {
  if (valor === undefined || valor === null || valor === '') {
    try {
      return new Decimal(porDefecto);
    } catch {
      return new Decimal(NaN);
    }
  }
  try {
    const d = new Decimal(String(valor).trim());
    return d.isFinite() ? d : new Decimal(NaN);
  } catch {
    return new Decimal(NaN);
  }
};

/**
 * Indica si un valor puede interpretarse como un número finito.
 * Se usa para validar la entrada antes de construir Decimales.
 */
const esNumeroValido = (valor) => {
  if (valor === undefined || valor === null || valor === '') return false;
  if (typeof valor === 'object') return false;
  const n = Number(String(valor).trim());
  return Number.isFinite(n);
};

module.exports = { toDecimalSeguro, esNumeroValido };
