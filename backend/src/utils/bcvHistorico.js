const { Decimal } = require('decimal.js');

/**
 * Utilidad para obtener tasas históricas del dólar BCV desde dolarapi.com.
 * Respuesta: [{ fecha: 'YYYY-MM-DD', promedio: number }, ...]
 */

const API_URL = 'https://ve.dolarapi.com/v1/historicos/dolares/oficial';

// Caché en memoria: { tasas: Map<fecha, Decimal>, timestamp }
let _cache = { tasas: null, timestamp: 0 };
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas

// Si dolarapi no responde hay que cortar la espera: el refresco diario de la
// tasa se dispara desde `GET /api/config`, y sin timeout una consulta colgada
// dejaría al POS esperando en cada carga.
const TIMEOUT_MS = 8000;

// Tras un fallo se espera antes de reintentar, para que un dolarapi caído no
// cueste 8 s en cada petición (el refresco perezoso se consulta a diario).
const BACKOFF_ERROR_MS = 10 * 60 * 1000;
let _ultimoError = 0;

function parsearRespuesta(data) {
  const tasas = new Map();
  if (!Array.isArray(data)) return tasas;
  for (const item of data) {
    if (item.fecha && item.promedio != null) {
      const tasa = new Decimal(item.promedio.toString());
      if (tasa.isFinite() && tasa.gt(0)) {
        tasas.set(item.fecha, tasa);
      }
    }
  }
  return tasas;
}

async function fetchTasasBCV() {
  const ahora = Date.now();
  if (_cache.tasas && (ahora - _cache.timestamp) < CACHE_TTL_MS) {
    return _cache.tasas;
  }

  if (_ultimoError && (ahora - _ultimoError) < BACKOFF_ERROR_MS) {
    if (_cache.tasas) return _cache.tasas;
    throw new Error('La API del BCV no está disponible (reintento en espera)');
  }

  const controller = new AbortController();
  const temporizador = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`BCV API HTTP ${res.status}`);
    const data = await res.json();
    const tasas = parsearRespuesta(data);

    // Una respuesta vacía no se cachea: serviría una lista sin tasas durante
    // 6 horas. Se trata como fallo para que el reintento siga disponible.
    if (tasas.size === 0) throw new Error('La API del BCV no devolvió tasas');

    _cache = { tasas, timestamp: ahora };
    _ultimoError = 0;
    return tasas;
  } catch (err) {
    _ultimoError = Date.now();
    throw err.name === 'AbortError'
      ? new Error(`La API del BCV no respondió en ${TIMEOUT_MS / 1000} s`)
      : err;
  } finally {
    clearTimeout(temporizador);
  }
}

/**
 * Obtiene la tasa BCV para una fecha específica (YYYY-MM-DD).
 * Si no hay tasa exacta, busca la más cercana hacia atrás (hasta 7 días).
 */
async function tasaBCVPorFecha(fecha) {
  if (!fecha) return null;

  const fechaStr = fecha instanceof Date
    ? fecha.toISOString().slice(0, 10)
    : String(fecha).slice(0, 10);

  const tasas = await fetchTasasBCV();

  // Buscar fecha exacta
  if (tasas.has(fechaStr)) return tasas.get(fechaStr);

  // Buscar la tasa más cercana hacia atrás (hasta 7 días)
  const fechaBusqueda = new Date(fechaStr);
  for (let i = 1; i <= 7; i++) {
    fechaBusqueda.setDate(fechaBusqueda.getDate() - 1);
    const str = fechaBusqueda.toISOString().slice(0, 10);
    if (tasas.has(str)) return tasas.get(str);
  }

  return null;
}

/**
 * Obtiene la tasa BCV actual (última disponible).
 */
async function tasaBCVActual() {
  const tasas = await fetchTasasBCV();
  if (tasas.size === 0) return null;
  // La última tasa es la más reciente (la API devuelve orden ascendente)
  const ultimaFecha = Array.from(tasas.keys()).sort().pop();
  return tasas.get(ultimaFecha);
}

module.exports = {
  tasaBCVPorFecha,
  tasaBCVActual,
  fetchTasasBCV,
};
