/**
 * Catálogo centralizado y estandarizado de Métodos de Pago (Frontend).
 * Sistema POS y Gestor de Inventario.
 *
 * Sincronizado con backend/src/constants/metodosPago.js.
 */

export const METODOS_PAGO = Object.freeze({
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

  // ── Variantes heredadas ──
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  MOBILE_PAYMENT: 'MOBILE_PAYMENT',
});

/**
 * Los 10 métodos de pago oficiales para POS.
 */
export const METODOS_PAGO_POS = Object.freeze([
  {
    value: METODOS_PAGO.EFECTIVO_USD,
    label: 'Efectivo en Dólares ($)',
    moneda: 'USD',
    requiereReferencia: false,
    icon: 'mdi:currency-usd',
  },
  {
    value: METODOS_PAGO.EFECTIVO_VES,
    label: 'Efectivo en Bolívares (Bs.)',
    moneda: 'VES',
    requiereReferencia: false,
    icon: 'mdi:cash',
  },
  {
    value: METODOS_PAGO.TARJETA_DEBITO,
    label: 'Tarjeta de Débito',
    moneda: 'VES',
    requiereReferencia: true,
    icon: 'mdi:credit-card-outline',
  },
  {
    value: METODOS_PAGO.TARJETA_CREDITO,
    label: 'Tarjeta de Crédito',
    moneda: 'VES',
    requiereReferencia: true,
    icon: 'mdi:credit-card',
  },
  {
    value: METODOS_PAGO.TRANSFERENCIA,
    label: 'Transferencia Bancaria',
    moneda: 'VES',
    requiereReferencia: true,
    icon: 'mdi:bank-transfer',
  },
  {
    value: METODOS_PAGO.PAGO_MOVIL,
    label: 'Pago Móvil',
    moneda: 'VES',
    requiereReferencia: true,
    icon: 'mdi:cellphone-wireless',
  },
  {
    value: METODOS_PAGO.BIOPAGO,
    label: 'BioPago BDV',
    moneda: 'VES',
    requiereReferencia: true,
    icon: 'mdi:fingerprint',
  },
  {
    value: METODOS_PAGO.BINANCE,
    label: 'Binance Pay (USDT)',
    moneda: 'USD',
    requiereReferencia: true,
    icon: 'simple-icons:binance',
  },
  {
    value: METODOS_PAGO.CASHEA,
    label: 'Cashea',
    moneda: 'USD',
    requiereReferencia: true,
    icon: 'mdi:shopping',
  },
  {
    value: METODOS_PAGO.FINANCIAMIENTO,
    label: 'Financiamiento (A Crédito / Cuotas)',
    moneda: 'USD',
    requiereReferencia: false,
    esFinanciamiento: true,
    icon: 'mdi:calendar-clock',
  },
]);

/**
 * Métodos disponibles para registrar un abono en CxC (todos excepto FINANCIAMIENTO).
 */
export const METODOS_PAGO_CXC = Object.freeze(
  METODOS_PAGO_POS.filter(m => !m.esFinanciamiento)
);

export const METODOS_PAGO_LABEL = Object.freeze({
  [METODOS_PAGO.TARJETA_DEBITO]: 'Tarjeta de Débito',
  [METODOS_PAGO.TARJETA_CREDITO]: 'Tarjeta de Crédito',
  [METODOS_PAGO.EFECTIVO_VES]: 'Efectivo Bs.',
  [METODOS_PAGO.TRANSFERENCIA]: 'Transferencia',
  [METODOS_PAGO.PAGO_MOVIL]: 'Pago Móvil',
  [METODOS_PAGO.BIOPAGO]: 'BioPago',
  [METODOS_PAGO.BINANCE]: 'Binance Pay',
  [METODOS_PAGO.EFECTIVO_USD]: 'Efectivo USD ($)',
  [METODOS_PAGO.CASHEA]: 'Cashea',
  [METODOS_PAGO.FINANCIAMIENTO]: 'Financiamiento',

  // Compatibilidad
  [METODOS_PAGO.CASH]: 'Efectivo',
  [METODOS_PAGO.BANK_TRANSFER]: 'Transferencia',
  [METODOS_PAGO.CREDIT_CARD]: 'Tarjeta',
  [METODOS_PAGO.MOBILE_PAYMENT]: 'Pago Móvil',
});

export function getMetodoPagoLabel(value) {
  if (!value) return '—';
  return METODOS_PAGO_LABEL[value] || value.replace(/_/g, ' ');
}

export function requiereReferencia(metodo) {
  const item = METODOS_PAGO_POS.find(m => m.value === metodo);
  return Boolean(item?.requiereReferencia);
}

export function esFinanciamiento(metodo) {
  return metodo === METODOS_PAGO.FINANCIAMIENTO || !metodo;
}
