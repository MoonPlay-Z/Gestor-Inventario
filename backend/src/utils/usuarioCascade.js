const { eliminarEmpresaEnCascada } = require('./empresaCascade');

/**
 * Borra físicamente un usuario y los datos comerciales de los que es dueño.
 *
 * Se usa tanto en el endpoint de borrado definitivo como en el job de purga
 * de archivados. Para una cuenta EMPRESA delega en `eliminarEmpresaEnCascada`
 * (arrastra toda la empresa). Para CAJA/INVENTARIO/VISOR recorre la jerarquía
 * de subcuentas y elimina sus ventas, pagos, cotizaciones y cierres.
 *
 * Debe ejecutarse dentro de una transacción.
 *
 * @param {object} tx Cliente Prisma de transacción
 * @param {{ id: string, rol: string, empresaRefId?: string|null }} targetUser
 * @returns {Promise<{ userIds: string[], eliminados: Record<string, number> }>}
 */
async function eliminarUsuarioEnCascada(tx, targetUser) {
  if (!targetUser?.id) {
    throw new Error('eliminarUsuarioEnCascada requiere un usuario');
  }

  if (targetUser.rol === 'EMPRESA') {
    return eliminarEmpresaEnCascada(tx, {
      empresaUsuarioId: targetUser.id,
      empresaRefId: targetUser.empresaRefId || null,
    });
  }

  const userIds = [targetUser.id];
  let pendingIds = [targetUser.id];

  while (pendingIds.length > 0) {
    const children = await tx.usuario.findMany({
      where: { empresaId: { in: pendingIds } },
      select: { id: true },
    });
    pendingIds = children.map((user) => user.id).filter((childId) => !userIds.includes(childId));
    userIds.push(...pendingIds);
  }

  const ownedRecords = { OR: [{ usuarioId: { in: userIds } }] };
  const eliminados = {};
  const ejecutar = async (nombre, promesa) => {
    eliminados[nombre] = (await promesa).count;
  };

  await ejecutar('pagos', tx.pago.deleteMany({ where: { factura: ownedRecords } }));
  await ejecutar('itemsFactura', tx.itemFactura.deleteMany({ where: { factura: ownedRecords } }));
  await ejecutar('facturas', tx.factura.deleteMany({ where: ownedRecords }));
  await ejecutar('cotizaciones', tx.cotizacion.deleteMany({ where: ownedRecords }));
  await ejecutar('cierresCaja', tx.cierreCaja.deleteMany({ where: ownedRecords }));

  // `GestionCobranza.usuarioId` es RESTRICT: sin borrar estas filas el
  // usuario no se puede eliminar. Se borran solo las gestiones hechas por
  // el propio usuario; las CxC de la empresa se conservan.
  await ejecutar('gestionesCobranza', tx.gestionCobranza.deleteMany({ where: { usuarioId: { in: userIds } } }));
  await ejecutar('solicitudesActivacion', tx.solicitudActivacion.deleteMany({ where: { usuarioId: { in: userIds } } }));
  await ejecutar('usuarios', tx.usuario.deleteMany({ where: { id: { in: userIds } } }));

  return { userIds, eliminados };
}

module.exports = { eliminarUsuarioEnCascada };
