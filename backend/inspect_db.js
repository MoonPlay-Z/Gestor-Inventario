const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.usuario.findMany({ select:{id:true,username:true,rol:true,empresaId:true,activo:true,createdAt:true}, orderBy:{createdAt:'asc'}, take:50});
    console.log('USERS:', JSON.stringify(users, null, 2));
    const prods = await prisma.producto.findMany({ select:{id:true,sku:true,nombre:true,empresaId:true,activo:true}, take:50});
    console.log('PRODUCTS:', JSON.stringify(prods, null, 2));
    const cols = await prisma.$queryRaw`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('usuarios','productos') ORDER BY table_name, ordinal_position`;
    console.log('COLUMNS:', JSON.stringify(cols, null, 2));
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
