/**
 * Catálogo de estados y motivos de anulación de pagos.
 *
 * El estado del pago es independiente del estado de la factura: una factura
 * puede volver a PENDING/PARTIALLY_PAID cuando uno de sus pagos se anula, sin
 * que la venta completa quede anulada. Los valores se guardan como texto para
 * poder ampliar motivos sin migrar un enum de PostgreSQL.
 */
const ESTADOS_PAGO = Object.freeze({
  ACTIVO: 'ACTIVO',
  ANULADO: 'ANULADO',
});

const MOTIVOS_ANULACION_PAGO = Object.freeze({
  FRAUDE: 'FRAUDE',
  ERROR_MONTO: 'ERROR_MONTO',
  COBRO_DUPLICADO: 'COBRO_DUPLICADO',
  DEVOLUCION: 'DEVOLUCION',
  OTRO: 'OTRO',
});

const MOTIVOS_ANULACION_PAGO_VALIDOS = Object.freeze(
  Object.values(MOTIVOS_ANULACION_PAGO)
);

const DESCRIPCION_ANULACION_PAGO_MIN = 10;
const DESCRIPCION_ANULACION_PAGO_MAX = 500;
const CONFIRMACION_ANULACION_PAGO = 'anular';

const {
  METODOS_PAGO,
  METODOS_PAGO_OFICIALES,
  METODOS_ABONO_VALIDOS,
  METODOS_PAGO_INFO,
  esMetodoPagoValido,
  requiereReferenciaMetodo,
  esMetodoFinanciado,
  esMetodoEfectivo,
  monedaDefectoPorMetodo,
  normalizarMetodoPago,
} = require('../constants/metodosPago');

module.exports = {
  ESTADOS_PAGO,
  MOTIVOS_ANULACION_PAGO,
  MOTIVOS_ANULACION_PAGO_VALIDOS,
  DESCRIPCION_ANULACION_PAGO_MIN,
  DESCRIPCION_ANULACION_PAGO_MAX,
  CONFIRMACION_ANULACION_PAGO,
  METODOS_PAGO,
  METODOS_PAGO_OFICIALES,
  METODOS_ABONO_VALIDOS,
  METODOS_PAGO_INFO,
  esMetodoPagoValido,
  requiereReferenciaMetodo,
  esMetodoFinanciado,
  esMetodoEfectivo,
  monedaDefectoPorMetodo,
  normalizarMetodoPago,
};
