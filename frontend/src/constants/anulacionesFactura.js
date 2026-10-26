export const MOTIVOS_ANULACION_FACTURA = Object.freeze([
  { value: 'ERROR_DIGITACION',     label: 'Error de digitación / tipeo de productos', icon: 'mdi:keyboard-outline' },
  { value: 'DEVOLUCION_MERCANCIA', label: 'Devolución total de mercancía',            icon: 'mdi:keyboard-return' },
  { value: 'ERROR_PRECIO_TASA',    label: 'Error en precio, moneda o tasa de cambio',  icon: 'mdi:currency-usd-off' },
  { value: 'CLIENTE_DESISTIO',     label: 'Cliente desistió de la compra / no pagó',   icon: 'mdi:account-cancel-outline' },
  { value: 'FRAUDE_INCONSISTENCIA',label: 'Fraude o inconsistencia en pago/documento',icon: 'mdi:shield-alert-outline' },
  { value: 'CAMBIO_PRODUCTO',      label: 'Cambio de producto (reemisión necesaria)',  icon: 'mdi:swap-horizontal' },
  { value: 'DUPLICADO',            label: 'Venta registrada por duplicado',           icon: 'mdi:content-copy' },
  { value: 'OTRO',                 label: 'Otro motivo justificado',                  icon: 'mdi:help-circle-outline' },
]);

const MOTIVOS_LABEL = Object.freeze(
  Object.fromEntries(MOTIVOS_ANULACION_FACTURA.map((m) => [m.value, m.label]))
);

export const DESCRIPCION_ANULACION_FACTURA_MIN = 10;
export const DESCRIPCION_ANULACION_FACTURA_MAX = 500;
export const CONFIRMACION_ANULACION_FACTURA = 'anular';

export function getMotivoAnulacionFacturaLabel(value) {
  return MOTIVOS_LABEL[value] || value || 'Sin motivo';
}
