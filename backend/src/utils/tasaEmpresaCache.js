/**
 * Caché en memoria de la tasa VES→USD por empresa.
 *
 * Vive aparte de `paymentCurrency` para que el servicio de actualización diaria
 * pueda invalidarla sin crear un ciclo de imports:
 * `routes/config.js → services/tasaDolar → paymentCurrency → routes/config`.
 */

const TTL_MS = 60 * 1000;

const cache = new Map(); // empresaId -> { tasa, timestamp }

/** Devuelve la tasa cacheada si sigue vigente; `null` si no hay o venció. */
function obtenerTasaEmpresa(empresaId) {
  const entrada = cache.get(empresaId);
  if (!entrada) return null;
  if ((Date.now() - entrada.timestamp) >= TTL_MS) {
    cache.delete(empresaId);
    return null;
  }
  return entrada.tasa;
}

function guardarTasaEmpresa(empresaId, tasa) {
  cache.set(empresaId, { tasa, timestamp: Date.now() });
}

/**
 * Invalida la entrada de una empresa (tras cambiar su tasa) o toda la caché.
 * Sin esto, un cambio de tasa tardaría hasta 60 s en surtir efecto en el POS.
 */
function invalidarTasaEmpresa(empresaId = null) {
  if (empresaId) cache.delete(empresaId);
  else cache.clear();
}

module.exports = {
  TTL_MS,
  obtenerTasaEmpresa,
  guardarTasaEmpresa,
  invalidarTasaEmpresa,
};
