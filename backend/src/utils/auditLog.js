const prisma = require('../db/prisma');

// El esquema SQLite no soporta `Json`: guarda los mismos objetos serializados
// como texto. El esquema PostgreSQL usa columnas JSON nativas.
const IS_SQLITE = prisma.IS_SQLITE === true;

function serializar(value) {
  if (value === undefined || value === null) return null;
  const plano = JSON.parse(JSON.stringify(value));
  return IS_SQLITE ? JSON.stringify(plano) : plano;
}

/**
 * Registra una acción administrativa en `audit_logs`.
 *
 * Nunca lanza: la auditoría no debe tumbar la operación que se está auditando.
 * `empresaId` debe ser el id de la tabla `empresas` (no el de un Usuario).
 */
async function registrarAuditoria(req, {
  accion,
  entidad,
  entidadId = null,
  empresaId = null,
  datosAnteriores = null,
  datosNuevos = null,
  tx = null,
} = {}) {
  if (!accion || !entidad) return;

  try {
    const db = tx || prisma;
    await db.auditLog.create({
      data: {
        empresaId: empresaId || null,
        usuarioId: req?.user?.id || null,
        accion,
        entidad,
        entidadId: entidadId || null,
        datosAnteriores: serializar(datosAnteriores),
        datosNuevos: serializar(datosNuevos),
        ipAddress: req?.ip || null,
        userAgent: req?.headers?.['user-agent']?.slice(0, 255) || null,
      },
    });
  } catch (err) {
    console.warn('[audit] No se pudo registrar la acción:', err.message);
  }
}

module.exports = { registrarAuditoria };
