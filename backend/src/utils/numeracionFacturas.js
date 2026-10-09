const NOMBRE_CORRELATIVO = 'FACTURA';

async function obtenerSiguienteNumeroFactura(tx) {
  const maxFactura = await tx.factura.aggregate({
    _max: { numeroFactura: true },
  });
  const ultimoNumero = maxFactura._max.numeroFactura || 0;

  await tx.correlativo.upsert({
    where: { nombre: NOMBRE_CORRELATIVO },
    create: { nombre: NOMBRE_CORRELATIVO, valor: ultimoNumero },
    update: { valor: { increment: 0 } },
  });

  await tx.correlativo.updateMany({
    where: {
      nombre: NOMBRE_CORRELATIVO,
      valor: { lt: ultimoNumero },
    },
    data: { valor: ultimoNumero },
  });

  const actualizado = await tx.correlativo.update({
    where: { nombre: NOMBRE_CORRELATIVO },
    data: { valor: { increment: 1 } },
    select: { valor: true },
  });

  return actualizado.valor;
}

module.exports = { obtenerSiguienteNumeroFactura };
