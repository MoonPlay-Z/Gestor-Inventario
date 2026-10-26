/**
 * Catálogo centralizado y estandarizado de Métodos de Pago.
 * Sistema POS y Gestor de Inventario.
 *
 * Contiene los 10 métodos de pago oficiales más soporte de retrocompatibilidad
 * para valores heredados ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'MOBILE_PAYMENT').
 */

const METODOS_PAGO = Object.freeze({
  TARJETA_DEBITO: 'TARJETA_DEBITO',
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  EFECTIVO_VES: 'EFECTIVO_VES',
  TRANSFERENCIA: 'TRANSFERENCIA',
  PAGO_MOVIL: 'PAGO_MOVIL',
  BIOPAGO: 'BIOPAGO',
  BINANCE: 'BINANCE',
  EFECTIVO_USD: 'EFECTIVO_USD',
  CASHEA: 'CASHEA',
  FINANCIAMIENTO: 'FINANCIAMIENTO',

  // ── Variantes heredadas para retrocompatibilidad ──
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  MOBILE_PAYMENT: 'MOBILE_PAYMENT',
});

/**
 * Métodos de pago oficiales solicitados para operaciones comerciales.
 */
const METODOS_PAGO_OFICIALES = Object.freeze([
  METODOS_PAGO.TARJETA_DEBITO,
  METODOS_PAGO.TARJETA_CREDITO,
  METODOS_PAGO.EFECTIVO_VES,
  METODOS_PAGO.TRANSFERENCIA,
  METODOS_PAGO.PAGO_MOVIL,
  METODOS_PAGO.BIOPAGO,
  METODOS_PAGO.BINANCE,
  METODOS_PAGO.EFECTIVO_USD,
  METODOS_PAGO.CASHEA,
  METODOS_PAGO.FINANCIAMIENTO,
]);

/**
 * Métodos con los que se puede liquidar un abono o pago directo.
 * Excluye FINANCIAMIENTO ya que este último genera deuda en CxC y no un cobro inmediato.
 */
const METODOS_ABONO_VALIDOS = Object.freeze([
  METODOS_PAGO.TARJETA_DEBITO,
  METODOS_PAGO.TARJETA_CREDITO,
  METODOS_PAGO.EFECTIVO_VES,
  METODOS_PAGO.TRANSFERENCIA,
  METODOS_PAGO.PAGO_MOVIL,
  METODOS_PAGO.BIOPAGO,
  METODOS_PAGO.BINANCE,
  METODOS_PAGO.EFECTIVO_USD,
  METODOS_PAGO.CASHEA,
  // Compatibilidad
  METODOS_PAGO.CASH,
  METODOS_PAGO.BANK_TRANSFER,
  METODOS_PAGO.CREDIT_CARD,
  METODOS_PAGO.MOBILE_PAYMENT,
]);

/**
 * Definición técnica y metadatos de cada método de pago.
 */
const METODOS_PAGO_INFO = Object.freeze({
  [METODOS_PAGO.TARJETA_DEBITO]: {
    label: 'Tarjeta de Débito',
    monedaDefecto: 'VES',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'Punto de venta débito interbancario',
  },
  [METODOS_PAGO.TARJETA_CREDITO]: {
    label: 'Tarjeta de Crédito',
    monedaDefecto: 'VES',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'Punto de venta crédito',
  },
  [METODOS_PAGO.EFECTIVO_VES]: {
    label: 'Efectivo Bs.',
    monedaDefecto: 'VES',
    requiereReferencia: false,
    esFinanciamiento: false,
    descripcion: 'Efectivo en moneda de curso legal (Bolívares)',
  },
  [METODOS_PAGO.TRANSFERENCIA]: {
    label: 'Transferencia Bancaria',
    monedaDefecto: 'VES',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'Transferencia bancaria nacional o internacional',
  },
  [METODOS_PAGO.PAGO_MOVIL]: {
    label: 'Pago Móvil',
    monedaDefecto: 'VES',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'Pago móvil interbancario P2P / P2C',
  },
  [METODOS_PAGO.BIOPAGO]: {
    label: 'BioPago BDV',
    monedaDefecto: 'VES',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'BioPago Banco de Venezuela / huella digital',
  },
  [METODOS_PAGO.BINANCE]: {
    label: 'Binance Pay',
    monedaDefecto: 'USD',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'Pago en criptoactivos / USDT vía Binance Pay',
  },
  [METODOS_PAGO.EFECTIVO_USD]: {
    label: 'Efectivo USD ($)',
    monedaDefecto: 'USD',
    requiereReferencia: false,
    esFinanciamiento: false,
    descripcion: 'Dólares estadounidenses en efectivo',
  },
  [METODOS_PAGO.CASHEA]: {
    label: 'Cashea',
    monedaDefecto: 'USD',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'Plataforma Cashea (Compra ahora, paga después)',
  },
  [METODOS_PAGO.FINANCIAMIENTO]: {
    label: 'Financiamiento (A Crédito / Cuotas)',
    monedaDefecto: 'USD',
    requiereReferencia: false,
    esFinanciamiento: true,
    descripcion: 'Venta a crédito o financiada en cuotas gestionada en CxC',
  },

  // Heredados
  [METODOS_PAGO.CASH]: {
    label: 'Efectivo (Legado)',
    monedaDefecto: 'USD',
    requiereReferencia: false,
    esFinanciamiento: false,
    descripcion: 'Efectivo histórico',
  },
  [METODOS_PAGO.BANK_TRANSFER]: {
    label: 'Transferencia (Legado)',
    monedaDefecto: 'VES',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'Transferencia histórica',
  },
  [METODOS_PAGO.CREDIT_CARD]: {
    label: 'Tarjeta (Legado)',
    monedaDefecto: 'VES',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'Tarjeta histórica',
  },
  [METODOS_PAGO.MOBILE_PAYMENT]: {
    label: 'Pago Móvil (Legado)',
    monedaDefecto: 'VES',
    requiereReferencia: true,
    esFinanciamiento: false,
    descripcion: 'Pago móvil histórico',
  },
});

/**
 * Valida si una clave dada es un método de pago aceptado por el sistema.
 */
function esMetodoPagoValido(metodo) {
  if (!metodo || typeof metodo !== 'string') return false;
  return Object.prototype.hasOwnProperty.call(METODOS_PAGO_INFO, metodo);
}

/**
 * Determina si el método de pago exige número de referencia obligatoria.
 */
function requiereReferenciaMetodo(metodo) {
  const info = METODOS_PAGO_INFO[metodo];
  return Boolean(info?.requiereReferencia);
}

/**
 * Determina si el método representa una venta financiada / a crédito.
 */
function esMetodoFinanciado(metodo) {
  return metodo === METODOS_PAGO.FINANCIAMIENTO;
}

/**
 * Determina si el método de pago corresponde a efectivo (físico).
 */
function esMetodoEfectivo(metodo) {
  return [METODOS_PAGO.EFECTIVO_VES, METODOS_PAGO.EFECTIVO_USD, METODOS_PAGO.CASH].includes(metodo);
}

/**
 * Resuelve la moneda por defecto según el método de pago.
 */
function monedaDefectoPorMetodo(metodo, monedaFactura = 'USD') {
  const info = METODOS_PAGO_INFO[metodo];
  if (info?.monedaDefecto) return info.monedaDefecto;
  return monedaFactura;
}

/**
 * Normaliza métodos heredados al catálogo principal.
 */
function normalizarMetodoPago(metodo, moneda = 'USD') {
  if (!metodo) return null;
  if (metodo === METODOS_PAGO.CASH) {
    return moneda === 'VES' ? METODOS_PAGO.EFECTIVO_VES : METODOS_PAGO.EFECTIVO_USD;
  }
  if (metodo === METODOS_PAGO.CREDIT_CARD) return METODOS_PAGO.TARJETA_CREDITO;
  if (metodo === METODOS_PAGO.BANK_TRANSFER) return METODOS_PAGO.TRANSFERENCIA;
  if (metodo === METODOS_PAGO.MOBILE_PAYMENT) return METODOS_PAGO.PAGO_MOVIL;
  return metodo;
}

module.exports = {
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
