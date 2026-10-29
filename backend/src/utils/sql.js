const { Prisma, IS_SQLITE } = require('../db/prisma');

/**
 * Fragmento SQL seguro para comparar columnas DateTime con una fecha dada.
 * PostgreSQL: bind de ISO string con cast explícito.
 * SQLite: epoch ms (Prisma almacena DateTime como ms).
 */
const tsFrag = (v) => {
  const d = new Date(v);
  return IS_SQLITE
    ? Prisma.sql`${d.getTime()}`
    : Prisma.sql`${d.toISOString()}::timestamp`;
};

const monthTrunc = (col) => IS_SQLITE
  ? Prisma.sql`strftime('%Y-%m', ${Prisma.raw(col)}/1000, 'unixepoch')`
  : Prisma.sql`DATE_TRUNC('month', ${Prisma.raw(col)})`;

/**
 * Agrupa una columna DateTime por período y devuelve **una fecha** (no una
 * etiqueta), para poder formatearla igual en PostgreSQL y SQLite.
 *
 * `unidad`: 'day' | 'week' | 'month' | 'year' (el vocabulario de DATE_TRUNC).
 * En SQLite las fechas se guardan como epoch en milisegundos; la semana se
 * normaliza al lunes, igual que DATE_TRUNC('week') en PostgreSQL.
 */
const periodTrunc = (col, unidad) => {
  if (IS_SQLITE) {
    const ms = Prisma.raw(`(${col}/1000)`);
    switch (unidad) {
      case 'day':
        return Prisma.sql`strftime('%Y-%m-%d', ${ms}, 'unixepoch')`;
      case 'week':
        // -6 días y luego el lunes siguiente = lunes de la semana en curso.
        return Prisma.sql`strftime('%Y-%m-%d', ${ms} - 518400, 'unixepoch', 'weekday 1')`;
      case 'year':
        return Prisma.sql`strftime('%Y-01-01', ${ms}, 'unixepoch')`;
      default:
        return Prisma.sql`strftime('%Y-%m-01', ${ms}, 'unixepoch')`;
    }
  }

  // La unidad viene de una lista blanca (PERIODOS_DASHBOARD), así que se
  // interpola como SQL crudo: con un parámetro ligado, PostgreSQL no puede
  // resolver sin ambigüedad entre date_trunc(text, timestamp) y (text, interval).
  const segura = ['day', 'week', 'month', 'year'].includes(unidad) ? unidad : 'month';
  return Prisma.sql`DATE_TRUNC(${Prisma.raw(`'${segura}'`)}, ${Prisma.raw(col)})`;
};

module.exports = { tsFrag, monthTrunc, periodTrunc };
