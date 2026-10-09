const { Decimal } = require('decimal.js');

const MONEDAS_PAGO = ['USD', 'VES'];

function convertirMontoMoneda(monto, monedaOrigen, monedaDestino, tasaCambio) {
  if (!MONEDAS_PAGO.includes(monedaOrigen) || !MONEDAS_PAGO.includes(monedaDestino)) {
    throw new Error('La moneda del pago o de la factura no es válida');
  }

  const amount = new Decimal(monto.toString());
  if (monedaOrigen === monedaDestino) return amount;

  if (tasaCambio === null || tasaCambio === undefined) {
    throw new Error('Se requiere una tasa de cambio para convertir el pago');
  }

  const rate = new Decimal(tasaCambio.toString());
  if (!rate.isFinite() || rate.lte(0)) {
    throw new Error('La tasa de cambio debe ser mayor a cero para convertir el pago');
  }

  return monedaOrigen === 'VES' ? amount.div(rate) : amount.mul(rate);
}

function normalizarPagoAFactura(pago, factura) {
  return convertirMontoMoneda(
    pago.monto,
    pago.monedaPago || factura.moneda || 'USD',
    factura.moneda || 'USD',
    factura.tasaCambio
  );
}

module.exports = { MONEDAS_PAGO, convertirMontoMoneda, normalizarPagoAFactura };
