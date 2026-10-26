const { IS_SQLITE } = require('../db/prisma');

/**
 * Filtro `contains` insensible a mayúsculas portable.
 *
 * Prisma solo admite `mode: 'insensitive'` en PostgreSQL; en SQLite es un
 * argumento desconocido y hace fallar la consulta ("Unknown argument `mode`").
 * El `LIKE` de SQLite ya es insensible a mayúsculas para ASCII, así que ahí se
 * omite `mode`.
 *
 * Uso:
 *   { nombre: containsInsensitive(term) }
 */
const containsInsensitive = (term) => (IS_SQLITE
  ? { contains: term }
  : { contains: term, mode: 'insensitive' });

/**
 * Sanitiza y extrae términos de búsqueda eliminando caracteres que producen falsos vacíos
 * (p. ej. guiones largos "—", paréntesis "(V12345678)", corchetes, etc.).
 */
function extraerTerminosBusqueda(q) {
  if (!q || typeof q !== 'string') return [];
  return q
    .replace(/[—–]/g, ' ')
    .replace(/[()[\]]/g, ' ')
    .trim()
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 0 && t !== '-');
}

module.exports = { containsInsensitive, extraerTerminosBusqueda };
