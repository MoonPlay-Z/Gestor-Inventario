/**
 * Valores compartidos por las pantallas que leen o anulan pagos.
 * Deben coincidir con backend/src/config/pagos.js.
 */
export const ESTADOS_PAGO = Object.freeze({
  ACTIVO: 'ACTIVO',
  ANULADO: 'ANULADO',
});

export const MOTIVOS_ANULACION_PAGO = Object.freeze([
  { value: 'FRAUDE', label: 'Fraude / pago no reconocido' },
  { value: 'ERROR_MONTO', label: 'Error en el monto' },
  { value: 'COBRO_DUPLICADO', label: 'Cobro duplicado' },
  { value: 'DEVOLUCION', label: 'Devolución al cliente' },
  { value: 'OTRO', label: 'Otro motivo' },
]);

const MOTIVOS_LABEL = Object.freeze(
  Object.fromEntries(MOTIVOS_ANULACION_PAGO.map((motivo) => [motivo.value, motivo.label]))
);

export const DESCRIPCION_ANULACION_MIN = 10;
export const DESCRIPCION_ANULACION_MAX = 500;
export const CONFIRMACION_ANULACION = 'anular';

export function getMotivoAnulacionLabel(value) {
  return MOTIVOS_LABEL[value] || value || 'Sin motivo';
}

export {
  METODOS_PAGO,
  METODOS_PAGO_POS,
  METODOS_PAGO_CXC,
  METODOS_PAGO_LABEL,
  getMetodoPagoLabel,
  requiereReferencia,
  esFinanciamiento,
} from './metodosPago';
