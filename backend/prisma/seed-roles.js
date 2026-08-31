const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Poblando Permisos y Roles por defecto...');

  // 1. Catálogo de Permisos
  const permisosData = [
    { modulo: 'facturas', accion: 'crear', descripcion: 'Emisión de facturas y ventas' },
    { modulo: 'facturas', accion: 'anular', descripcion: 'Anulación de facturas' },
    { modulo: 'facturas', accion: 'ver', descripcion: 'Consulta de facturas e historial' },
    { modulo: 'productos', accion: 'crear', descripcion: 'Creación de productos e inventario' },
    { modulo: 'productos', accion: 'editar', descripcion: 'Modificación de precios y stock' },
    { modulo: 'productos', accion: 'eliminar', descripcion: 'Desactivación de productos' },
    { modulo: 'caja', accion: 'aperturar', descripcion: 'Apertura de turno de caja' },
    { modulo: 'caja', accion: 'cerrar', descripcion: 'Cierre de caja y arqueo de efectivo' },
    { modulo: 'clientes', accion: 'gestionar', descripcion: 'Gestión de clientes y contactos' },
    { modulo: 'cotizaciones', accion: 'crear', descripcion: 'Emisión de cotizaciones' },
    { modulo: 'reportes', accion: 'ver', descripcion: 'Acceso a reportes y métricas avanzadas' },
  ];

  for (const p of permisosData) {
    await prisma.permiso.upsert({
      where: { modulo_accion: { modulo: p.modulo, accion: p.accion } },
      update: { descripcion: p.descripcion },
      create: p,
    });
  }

  // 2. Roles Base Globales
  const rolesBase = [
    { nombre: 'Cajero Principal', descripcion: 'Rol operativo enfocado en cobros, aperturas/cierres de caja y ventas' },
    { nombre: 'Encargado de Inventario', descripcion: 'Gestión completa de catálogo de productos, precios y compras' },
    { nombre: 'Administrador de Sucursal', descripcion: 'Acceso total operativo dentro de la empresa' },
  ];

  for (const r of rolesBase) {
    const rolDb = await prisma.rol.findFirst({
      where: { nombre: r.nombre, empresaId: null }
    });

    if (!rolDb) {
      await prisma.rol.create({
        data: {
          nombre: r.nombre,
          descripcion: r.descripcion,
          empresaId: null,
        }
      });
    }
  }

  console.log('✅ Permisos y Roles globales creados exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
