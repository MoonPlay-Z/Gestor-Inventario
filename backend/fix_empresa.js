const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log('Connecting to DB...');
    const empresas = await prisma.$queryRawUnsafe("SELECT id, username FROM usuarios WHERE rol = 'EMPRESA' ORDER BY \"createdAt\" LIMIT 5");
    console.log('EMPRESAS', empresas);
    const defaultEmpresa = empresas[0]?.id;
    if (!defaultEmpresa) {
      throw new Error('No EMPRESA user found');
    }

    const prodCount = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int AS cnt FROM productos');
    console.log('PRODUCT COUNT', prodCount);

    console.log('Adding empresaId columns if missing...');
    await prisma.$executeRawUnsafe('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS "empresaId" TEXT');
    await prisma.$executeRawUnsafe('ALTER TABLE productos ADD COLUMN IF NOT EXISTS "empresaId" TEXT');

    console.log('Setting empresaId for CAJA/INVENTARIO users...');
    await prisma.$executeRawUnsafe(
      'UPDATE usuarios SET "empresaId" = $1 WHERE rol IN (\'CAJA\', \'INVENTARIO\') AND "empresaId" IS NULL',
      defaultEmpresa
    );

    console.log('Setting empresaId for productos...');
    await prisma.$executeRawUnsafe(
      'UPDATE productos SET "empresaId" = $1 WHERE "empresaId" IS NULL',
      defaultEmpresa
    );

    const orphanProducts = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int AS cnt FROM productos WHERE "empresaId" IS NULL');
    console.log('Products missing empresaId after update:', orphanProducts);

    console.log('Making productos.empresaId NOT NULL...');
    await prisma.$executeRawUnsafe('ALTER TABLE productos ALTER COLUMN "empresaId" SET NOT NULL');

    console.log('Creating indexes and constraints...');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS productos_empresaId_idx ON productos("empresaId")');
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS productos_empresaId_sku_key ON productos("empresaId", "sku")');

    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'productos_empresaId_fkey') THEN
        ALTER TABLE productos ADD CONSTRAINT productos_empresaId_fkey FOREIGN KEY ("empresaId") REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_empresaId_fkey') THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_empresaId_fkey FOREIGN KEY ("empresaId") REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;`);

    console.log('Verifying columns...');
    const cols = await prisma.$queryRawUnsafe(
      `SELECT table_name, column_name, is_nullable, data_type
       FROM information_schema.columns
       WHERE table_schema='public' AND table_name IN ('usuarios', 'productos')
       ORDER BY table_name, ordinal_position`
    );
    console.log(JSON.stringify(cols, null, 2));

    const sampleUsers = await prisma.$queryRawUnsafe('SELECT id, username, rol, empresaId FROM usuarios ORDER BY "createdAt" LIMIT 5');
    console.log('Sample users:', JSON.stringify(sampleUsers, null, 2));
    const sampleProducts = await prisma.$queryRawUnsafe('SELECT id, sku, nombre, empresaId FROM productos ORDER BY "createdAt" LIMIT 5');
    console.log('Sample products:', JSON.stringify(sampleProducts, null, 2));

    console.log('Done');
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await prisma.$disconnect();
  }
})();
