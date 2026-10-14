const NOMBRE_CORRELATIVO = 'FACTURA';

async function obtenerSiguienteNumeroFactura(tx) {
  // Atomic upsert: INSERT ... ON CONFLICT DO UPDATE avoids race conditions
  // between concurrent transactions reading the same max value.
  const result = await tx.$queryRaw`
    INSERT INTO correlativos (nombre, valor)
    VALUES (${NOMBRE_CORRELATIVO}, 1)
    ON CONFLICT (nombre) DO UPDATE
      SET valor = correlativos.valor + 1
    RETURNING valor;
  `;
  return Number(result[0].valor);
}

module.exports = { obtenerSiguienteNumeroFactura };
