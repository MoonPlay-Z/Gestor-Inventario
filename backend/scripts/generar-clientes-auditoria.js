const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const cli = require.resolve('prisma');
const env = {
  ...process.env,
  AUDIT_DATABASE_URL: process.env.AUDIT_DATABASE_URL
    || 'postgresql://localhost:5432/bitacora?schema=public',
};

for (const schema of [
  'prisma/auditoria/schema.prisma',
  'prisma/auditoria/schema.sqlite.prisma',
]) {
  const resultado = spawnSync(
    process.execPath,
    [cli, 'generate', '--schema', schema],
    {
      cwd: path.resolve(__dirname, '..'),
      env,
      stdio: 'inherit',
    },
  );
  if (resultado.error) {
    console.error(`[bitacora] No se pudo generar el cliente (${schema}):`, resultado.error.message);
    process.exit(1);
  }
  if (resultado.status !== 0) process.exit(resultado.status || 1);
}
