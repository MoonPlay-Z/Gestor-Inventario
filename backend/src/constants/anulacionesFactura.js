const MOTIVOS_ANULACION_FACTURA = Object.freeze([
  { value: 'ERROR_DIGITACION',     label: 'Error de digitación / tipeo de productos' },
  { value: 'DEVOLUCION_MERCANCIA', label: 'Devolución total de mercancía' },
  { value: 'ERROR_PRECIO_TASA',    label: 'Error en precio, moneda o tasa de cambio' },
  { value: 'CLIENTE_DESISTIO',     label: 'Cliente desistió de la compra / no pagó' },
  { value: 'FRAUDE_INCONSISTENCIA',label: 'Fraude o inconsistencia en pago/documento' },
  { value: 'CAMBIO_PRODUCTO',      label: 'Cambio de producto (reemisión necesaria)' },
  { value: 'DUPLICADO',            label: 'Venta registrada por duplicado' },
  { value: 'OTRO',                 label: 'Otro motivo justificado' },
]);

const MOTIVOS_ANULACION_FACTURA_VALIDOS = Object.freeze(
  MOTIVOS_ANULACION_FACTURA.map((m) => m.value)
);

const MOTIVOS_LABEL = Object.freeze(
  Object.fromEntries(MOTIVOS_ANULACION_FACTURA.map((m) => [m.value, m.label]))
);

const DESCRIPCION_ANULACION_FACTURA_MIN = 10;
const DESCRIPCION_ANULACION_FACTURA_MAX = 500;
const CONFIRMACION_ANULACION_FACTURA = 'anular';

function getMotivoAnulacionFacturaLabel(value) {
  return MOTIVOS_LABEL[value] || value || 'Sin motivo';
}

function esMotivoAnulacionFacturaValido(value) {
  return MOTIVOS_ANULACION_FACTURA_VALIDOS.includes(value);
}

module.exports = {
  MOTIVOS_ANULACION_FACTURA,
  MOTIVOS_ANULACION_FACTURA_VALIDOS,
  DESCRIPCION_ANULACION_FACTURA_MIN,
  DESCRIPCION_ANULACION_FACTURA_MAX,
  CONFIRMACION_ANULACION_FACTURA,
  getMotivoAnulacionFacturaLabel,
  esMotivoAnulacionFacturaValido,
};
