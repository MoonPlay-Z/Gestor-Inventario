const prisma = require('../db/prisma');
const { IS_SQLITE } = prisma;

/**
 * Bloqueo de fila para operaciones monetarias.
 *
 * PostgreSQL usa `SELECT ... FOR UPDATE` para serializar dos transacciones que
 * tocan la misma factura/cuenta (evita sobrepagos y dobles cierres). SQLite ya
 * serializa las escrituras, así que allí la relectura dentro de la transacción
 * basta y `FOR UPDATE` no existe.
 *
 * IMPORTANTE (orden de bloqueo): para evitar deadlocks, TODOS los flujos deben
 * bloquear primero la factura y después la cuenta por cobrar.
 */

async function lockFactura(tx, facturaId) {
  if (IS_SQLITE || !facturaId) return;
  await tx.$queryRaw`SELECT id FROM facturas WHERE id = ${facturaId} FOR UPDATE`;
}

async function lockCuenta(tx, cuentaId) {
  if (IS_SQLITE || !cuentaId) return;
  await tx.$queryRaw`SELECT id FROM cuentas_por_cobrar WHERE id = ${cuentaId} FOR UPDATE`;
}

module.exports = { lockFactura, lockCuenta };
