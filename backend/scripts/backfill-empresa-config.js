/**
 * Backfill: copiar valores globales de config.json a todas las empresas.
 * Cada empresa puede luego personalizar su tasa manualmente.
 *
 * Uso:
 *   node scripts/backfill-empresa-config.js            (dry-run)
 *   node scripts/backfill-empresa-config.js --apply    (persiste)
 */
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require(path.join(__dirname, '..', 'node_modules', '@prisma/client'));

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

async function main() {
  // Leer config global actual
  const configPath = path.join(__dirname, '..', 'data', 'config.json');
  let global = { moneda: { tasaDolar: 36.5, simbolo: '$', codigo: 'USD' } };
  try {
    if (fs.existsSync(configPath)) {
      global = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.warn('No se pudo leer config.json, usando defaults:', e.message);
  }

  const tasaDolar = Number(global.moneda?.tasaDolar) || 36.5;
  const monedaSimbolo = global.moneda?.simbolo || '$';
  const monedaCodigo = global.moneda?.codigo || 'USD';

  console.log(`Valores globales: tasaDolar=${tasaDolar}, simbolo=${monedaSimbolo}, codigo=${monedaCodigo}`);
  console.log(APPLY ? '=== APLICANDO ===' : '=== DRY-RUN (sin cambios) ===');

  const empresas = await prisma.empresa.findMany({
    select: { id: true, nombre: true, rif: true, tasaDolar: true },
  });

  console.log(`Empresas encontradas: ${empresas.length}`);

  for (const emp of empresas) {
    if (!APPLY) {
      console.log(`  [dry-run] ${emp.nombre} (${emp.rif}) — tasa actual: ${emp.tasaDolar} → ${tasaDolar}`);
      continue;
    }
    await prisma.empresa.update({
      where: { id: emp.id },
      data: {
        tasaDolar,
        monedaSimbolo,
        monedaCodigo,
        direccion: emp.direccion || undefined,
        telefono: emp.telefono || undefined,
      },
    });
    console.log(`  OK ${emp.nombre} (${emp.rif}) — tasa=${tasaDolar}, moneda=${monedaSimbolo} (${monedaCodigo})`);
  }

  console.log(APPLY ? 'Backfill aplicado.' : 'Dry-run. Reaplica con --apply para persistir.');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
