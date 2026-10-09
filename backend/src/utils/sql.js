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

module.exports = { tsFrag, monthTrunc };
