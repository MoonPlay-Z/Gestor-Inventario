const path = require('path');

const auditUrl = process.env.AUDIT_DATABASE_URL;
const esProduccion = process.env.NODE_ENV === 'production';
const isSqlite = auditUrl
  ? auditUrl.startsWith('file:')
  : !esProduccion;

if (esProduccion && (!auditUrl || isSqlite)) {
  console.error('[bitacora] En producción AUDIT_DATABASE_URL debe apuntar a PostgreSQL; los eventos no se persistirán.');
  module.exports = null;
} else {
  const clientPackage = isSqlite
    ? '../../node_modules/@prisma/client-auditoria-sqlite'
    : '../../node_modules/@prisma/client-auditoria';
  const { PrismaClient } = require(clientPackage);

  let url = auditUrl;
  if (isSqlite) {
    const rawPath = auditUrl?.slice('file:'.length).split('?')[0];
    const sqlitePath = rawPath
      ? path.isAbsolute(rawPath)
        ? rawPath
        : path.resolve(__dirname, '../../prisma/auditoria', path.basename(rawPath))
      : path.resolve(__dirname, '../../prisma/auditoria/bitacora.db');
    url = `file:${sqlitePath}`;
  }

  module.exports = new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}
