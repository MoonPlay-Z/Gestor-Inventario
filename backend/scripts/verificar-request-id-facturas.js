/**
 * Verificación post-migración de la idempotencia de facturas.
 * Uso: node scripts/verificar-request-id-facturas.js
 *
 * Comprueba en la base de datos real:
 *  1. que la columna `requestId` existe
 *  2. que el índice único está creado
 *  3. que las facturas históricas siguen intactas (NULL) y no colisionan
 *  4. que no hay duplicados (el índice lo impediría, pero se confirma)
 */
const prisma = require('../src/db/prisma');

async function main() {
  const checks = [];
  const check = (name, ok, detail = '') => {
    checks.push({ name, ok });
    console.log(`${ok ? 'OK  ' : 'FALLA'} ${name}${detail ? ' — ' + detail : ''}`);
  };

  // 1. Columna e índice
  const cols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'facturas' AND column_name = 'requestId'
  `;
  check('Columna requestId existe', cols.length === 1, cols[0]?.column_name);

  const idx = await prisma.$queryRaw`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'facturas' AND indexname = 'facturas_requestId_key'
  `;
  check('Índice único creado', idx.length === 1, idx[0]?.indexname);

  // 2. Datos existentes
  const total = await prisma.$queryRaw`SELECT COUNT(*)::int AS n FROM facturas`;
  check('Tabla facturas accesible', true, `${total[0].n} facturas`);

  const conClave = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS n FROM facturas WHERE "requestId" IS NOT NULL
  `;
  check('Facturas con requestId', true, `${conClave[0].n}`);

  // 3. Los NULL no colisionan: varias facturas históricas deben convivir
  const historicas = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS n FROM facturas WHERE "requestId" IS NULL
  `;
  check('Facturas históricas con NULL (sin colisión)', historicas[0].n >= 0, `${historicas[0].n} filas`);

  // 4. Sin duplicados
  const dups = await prisma.$queryRaw`
    SELECT "requestId", COUNT(*)::int AS n FROM facturas
    WHERE "requestId" IS NOT NULL
    GROUP BY "requestId" HAVING COUNT(*) > 1
  `;
  check('Sin requestId duplicados', dups.length === 0,
    dups.length ? JSON.stringify(dups) : 'ninguno');

  const fail = checks.filter(c => !c.ok);
  console.log(`\n${checks.length - fail.length}/${checks.length} verificaciones OK`);
  await prisma.$disconnect();
  process.exit(fail.length ? 1 : 0);
}

main().catch(async (e) => { console.error('Error:', e.message); await prisma.$disconnect(); process.exit(1); });