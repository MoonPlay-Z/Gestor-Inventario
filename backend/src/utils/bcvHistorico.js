const { Decimal } = require('decimal.js');

/**
 * Utilidad para obtener tasas históricas del dólar BCV desde dolarapi.com.
 * Respuesta: [{ fecha: 'YYYY-MM-DD', promedio: number }, ...]
 */

const API_URL = 'https://ve.dolarapi.com/v1/historicos/dolares/oficial';

// Caché en memoria: { tasas: Map<fecha, Decimal>, timestamp }
let _cache = { tasas: null, timestamp: 0 };
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas

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

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`BCV API HTTP ${res.status}`);
  const data = await res.json();
  const tasas = parsearRespuesta(data);

  _cache = { tasas, timestamp: ahora };
  return tasas;
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
