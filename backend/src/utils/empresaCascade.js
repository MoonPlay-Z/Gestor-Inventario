/**
 * Borrado en cascada de una empresa.
 *
 * El esquema usa dos identificadores distintos para el tenant:
 *   - `Usuario.empresaId`  → usuario padre (EMPRESA) de las sub-cuentas.
 *   - `Usuario.empresaRefId` → registro en `empresas`.
 *
 * Además, varios modelos guardan `empresaId` apuntando a `empresas`
 * (`Factura`, `Cotizacion`, `CierreCaja`, `CuentaPorCobrar`) y otros lo
 * guardan apuntando al `Usuario` padre (`Producto`, `Cliente`). Por eso el
 * borrado no puede limitarse a una sola columna: si se deja una fila con
 * `empresaId` la FK `RESTRICT` impide borrar la empresa, y si se ignora el
 * error quedan datos huérfanos.
 *
 * Esta función debe ejecutarse siempre dentro de una transacción. Si alguna
 * FK no prevista bloquea el borrado, la transacción completa se revierte y el
 * endpoint devuelve el error; nunca se ignora en silencio.
 */

/**
 * Recolecta el usuario EMPRESA, todas sus sub-cuentas (recursivamente) y
 * cualquier otro usuario vinculado al mismo registro `Empresa`.
 *
 * @param {object} tx Cliente Prisma de transacción
 * @param {string|null} empresaUsuarioId id del Usuario con rol EMPRESA
 * @param {string|null} empresaRefId id de la tabla `empresas`
 * @returns {Promise<string[]>}
 */
async function recolectarUsuarios(tx, empresaUsuarioId, empresaRefId) {
  const ids = new Set();
  const pendientesIniciales = [];

  if (empresaUsuarioId) {
    ids.add(empresaUsuarioId);
    pendientesIniciales.push(empresaUsuarioId);
  }

  // Puede haber más de una cuenta EMPRESA apuntando a la misma empresa.
  // Nunca se incluye un SUPER_ADMIN, aunque tenga un `empresaRefId` por error.
  if (empresaRefId) {
    const vinculados = await tx.usuario.findMany({
      where: { empresaRefId, rol: { not: 'SUPER_ADMIN' } },
      select: { id: true },
    });
    for (const usuario of vinculados) {
      ids.add(usuario.id);
      pendientesIniciales.push(usuario.id);
    }
  }

  // Sub-cuentas: `empresaId` apunta al Usuario padre. Se recorre en anchura
  // por si existen sub-cuentas anidadas.
  let pendientes = [...new Set(pendientesIniciales)];
  while (pendientes.length > 0) {
    const hijos = await tx.usuario.findMany({
      where: { empresaId: { in: pendientes }, rol: { not: 'SUPER_ADMIN' } },
      select: { id: true },
    });
    const nuevos = hijos.map((hijo) => hijo.id).filter((id) => !ids.has(id));
    for (const id of nuevos) ids.add(id);
    pendientes = nuevos;
  }

  return [...ids];
}

/**
 * Construye los filtros de cada modelo. Se incluyen condiciones por:
 *   - usuario creador (`usuarioId`),
 *   - usuario padre (`usuario.empresaId`),
 *   - cliente de la empresa,
 *   - `empresaId` de la tabla `empresas`,
 *   - `empresaId` legado con el id de un Usuario.
 */
function construirAlcances({ userIds, empresaRefId }) {
  // `CuentaPorCobrar.empresaId` y `GestionCobranza.empresaId` son String
  // obligatorios. CxC tiene FK a `empresas`, pero `GestionCobranza` no; en
  // datos antiguos una gestión puede guardar el id de un Usuario. Se cubren
  // ambos casos incluyendo todos los usuarios de la empresa.
  const empresaIds = [...new Set([
    ...(empresaRefId ? [empresaRefId] : []),
    ...userIds,
  ])];

  const factura = {
    OR: [
      { usuarioId: { in: userIds } },
      { usuario: { empresaId: { in: userIds } } },
      { cliente: { empresaId: { in: userIds } } },
      ...(empresaRefId ? [{ empresaId: empresaRefId }] : []),
    ],
  };

  const cotizacion = {
    OR: [
      { usuarioId: { in: userIds } },
      { usuario: { empresaId: { in: userIds } } },
      { cliente: { empresaId: { in: userIds } } },
      ...(empresaRefId ? [{ empresaId: empresaRefId }] : []),
    ],
  };

  const cierreCaja = {
    OR: [
      { usuarioId: { in: userIds } },
      { usuario: { empresaId: { in: userIds } } },
      ...(empresaRefId ? [{ empresaId: empresaRefId }] : []),
    ],
  };

  const cuentaPorCobrar = {
    OR: [
      { empresaId: { in: empresaIds } },
      { usuarioId: { in: userIds } },
      { factura },
      { cliente: { empresaId: { in: userIds } } },
    ],
  };

  // Las gestiones se borran antes que las CxC. Las que pertenezcan a una CxC
  // de la empresa también caerían por la FK CASCADE, pero aquí se cubren las
  // que tengan el `empresaId` legado o un usuario de la empresa.
  const gestionCobranza = {
    OR: [
      { empresaId: { in: empresaIds } },
      { usuarioId: { in: userIds } },
    ],
  };

  return { factura, cotizacion, cierreCaja, cuentaPorCobrar, gestionCobranza };
}

/**
 * Elimina todos los datos de una empresa y devuelve cuántas filas se borraron.
 *
 * No elimina `AuditLog` (la FK queda en NULL y se conserva la trazabilidad),
 * ni catálogos globales (`Noticia`, `Promocion`, `Correlativo`, `Permiso`).
 *
 * @param {object} tx Cliente Prisma de transacción
 * @param {{ empresaUsuarioId?: string|null, empresaRefId?: string|null }} params
 * @returns {Promise<{ userIds: string[], eliminados: Record<string, number> }>}
 */
async function eliminarEmpresaEnCascada(tx, { empresaUsuarioId = null, empresaRefId = null }) {
  if (!empresaUsuarioId && !empresaRefId) {
    throw new Error('eliminarEmpresaEnCascada requiere empresaUsuarioId o empresaRefId');
  }

  const userIds = await recolectarUsuarios(tx, empresaUsuarioId, empresaRefId);
  const alcances = construirAlcances({ userIds, empresaRefId });
  const eliminados = {};

  const ejecutar = async (nombre, promesa) => {
    const resultado = await promesa;
    eliminados[nombre] = resultado.count;
  };

  // Orden FK-safe. Primero hijos, al final Empresa.
  await ejecutar('gestionesCobranza', tx.gestionCobranza.deleteMany({ where: alcances.gestionCobranza }));
  await ejecutar('cuentasPorCobrar', tx.cuentaPorCobrar.deleteMany({ where: alcances.cuentaPorCobrar }));
  await ejecutar('pagos', tx.pago.deleteMany({ where: { factura: alcances.factura } }));
  await ejecutar('itemsFactura', tx.itemFactura.deleteMany({ where: { factura: alcances.factura } }));
  await ejecutar('itemsCotizacion', tx.itemCotizacion.deleteMany({ where: { cotizacion: alcances.cotizacion } }));
  await ejecutar('cotizaciones', tx.cotizacion.deleteMany({ where: alcances.cotizacion }));
  await ejecutar('facturas', tx.factura.deleteMany({ where: alcances.factura }));
  await ejecutar('cierresCaja', tx.cierreCaja.deleteMany({ where: alcances.cierreCaja }));
  await ejecutar('productos', tx.producto.deleteMany({ where: { empresaId: { in: userIds } } }));
  await ejecutar('clientes', tx.cliente.deleteMany({ where: { empresaId: { in: userIds } } }));
  await ejecutar('solicitudesActivacion', tx.solicitudActivacion.deleteMany({ where: { usuarioId: { in: userIds } } }));

  if (empresaRefId) {
    await ejecutar('roles', tx.rol.deleteMany({ where: { empresaId: empresaRefId } }));
  }

  await ejecutar('usuarios', tx.usuario.deleteMany({ where: { id: { in: userIds } } }));

  if (empresaRefId) {
    await ejecutar('empresa', tx.empresa.deleteMany({ where: { id: empresaRefId } }));
  }

  return { userIds, eliminados };
}

module.exports = { eliminarEmpresaEnCascada };
