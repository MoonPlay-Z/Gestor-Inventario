const prisma = require('../db/prisma');

/**
 * Resuelve el `Empresa` (empresaRefId) al que pertenece el usuario autenticado.
 *
 * En el modelo `Usuario` conviven dos columnas con nombres confusos:
 *   - `empresaId`     → apunta al Usuario padre (sub-cuentas CAJA/INVENTARIO/VISOR)
 *   - `empresaRefId`  → apunta al registro `Empresa` (solo lo tienen los EMPRESA)
 *
 * Las sub-cuentas nacen con `empresaRefId = NULL`, así que tomarlo directo del
 * token produce `null` y las columnas `NOT NULL` que lo referencian
 * (`cuentas_por_cobrar.empresaId`, `facturas.empresaId`) hacen fallar la
 * escritura. Aquí se sube por la cadena padre hasta encontrar el `Empresa`.
 *
 * @param {object} req  Request con `req.user` poblado por authMiddleware
 * @returns {Promise<string|null>} id de `empresas`, o null si no se puede resolver
 */
async function resolverEmpresaRefId(req) {
  const user = req.user;
  if (!user) return null;
  if (user.empresaRefId) return user.empresaRefId;

  // Sub-cuentas: el Usuario padre (EMPRESA) sí tiene empresaRefId.
  const padreId = user.empresaId;
  if (!padreId) return null;

  // Cache por request para no repetir la consulta en la misma petición.
  if (!req.__empresaRefIdResuelto) {
    const padre = await prisma.usuario.findUnique({
      where: { id: padreId },
      select: { empresaRefId: true },
    });
    req.__empresaRefIdResuelto = padre?.empresaRefId || null;
  }
  return req.__empresaRefIdResuelto;
}

/**
 * Igual que `resolverEmpresaRefId` pero devuelve el id del Usuario padre
 * (`empresaId`), que es la base de los filtros de tenant por `usuarioId`.
 */
function getUsuarioTenantId(req) {
  return req.user?.empresaId || req.user?.id || null;
}

module.exports = { resolverEmpresaRefId, getUsuarioTenantId };
