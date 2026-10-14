const NOMBRE_CORRELATIVO = 'COTIZACION';

/**
 * Devuelve el siguiente número correlativo de cotización de forma atómica.
 *
 * Usa la tabla `correlativos` (la única del schema) con un upsert que además
 * se auto-repara: si la fila no existe, o si su valor quedó por detrás del
 * `MAX(numero)` real de la tabla `cotizaciones`, lo alinea antes de incrementar.
 * Sin ese alineamiento un correlativo recién creado arrancaría en 1 y
 * chocaría con el índice único de `numero`.
 *
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @returns {Promise<number>}
 */
async function obtenerSiguienteNumeroCotizacion(tx) {
  const result = await tx.$queryRaw`
    INSERT INTO correlativos (nombre, valor)
    SELECT ${NOMBRE_CORRELATIVO}, COALESCE(MAX(numero), 0) + 1 FROM cotizaciones
    ON CONFLICT (nombre) DO UPDATE
      SET valor = GREATEST(
        correlativos.valor,
        (SELECT COALESCE(MAX(numero), 0) FROM cotizaciones)
      ) + 1
    RETURNING valor;
  `;
  return Number(result[0].valor);
}

module.exports = { obtenerSiguienteNumeroCotizacion };
