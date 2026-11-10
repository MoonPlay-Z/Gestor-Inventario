const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('../node_modules/@prisma/client-auditoria-sqlite');

const databaseUrl = process.env.AUDIT_DATABASE_URL || '';
const sqlitePath = databaseUrl.startsWith('file:')
  ? path.isAbsolute(databaseUrl.slice(5))
    ? databaseUrl.slice(5)
    : path.resolve(__dirname, '../prisma/auditoria', path.basename(databaseUrl.slice(5)))
  : path.resolve(__dirname, '../prisma/auditoria/bitacora.db');

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${sqlitePath}` } },
});

async function proteger() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER IF NOT EXISTS "bitacora_no_update"
      BEFORE UPDATE ON "bitacora"
      BEGIN
        SELECT RAISE(ABORT, 'La bitácora es append-only');
      END
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER IF NOT EXISTS "bitacora_no_delete"
      BEFORE DELETE ON "bitacora"
      BEGIN
        SELECT RAISE(ABORT, 'La bitácora es append-only');
      END
    `);
  } finally {
    await prisma.$disconnect();
  }
}

proteger().catch((err) => {
  console.error('[bitacora] No se pudieron instalar los triggers SQLite:', err.message);
  process.exitCode = 1;
});
