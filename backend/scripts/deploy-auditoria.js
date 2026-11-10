const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const auditUrl = process.env.AUDIT_DATABASE_URL;
if (!auditUrl || auditUrl.startsWith('file:')) {
  console.error('[bitacora] AUDIT_DATABASE_URL debe apuntar a la base PostgreSQL de auditoría.');
  process.exit(1);
}

const cli = require.resolve('prisma');
const resultado = spawnSync(
  process.execPath,
  [cli, 'migrate', 'deploy', '--schema', 'prisma/auditoria/schema.prisma'],
  {
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
    stdio: 'inherit',
  },
);

if (resultado.error) {
  console.error('[bitacora] No se pudo ejecutar la migración:', resultado.error.message);
  process.exitCode = 1;
} else if (resultado.status !== 0) {
  process.exitCode = resultado.status || 1;
}
