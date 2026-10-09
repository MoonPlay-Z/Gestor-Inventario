const { Decimal } = require('decimal.js');

// Unidades que el POS puede enviar y su equivalente en la unidad base (kg/L)
const CONVERSIONES_PESO = { KILOGRAMO: new Decimal(1), GRAMO: new Decimal(0.001) };
const CONVERSIONES_VOLUMEN = { LITRO: new Decimal(1), MILILITRO: new Decimal(0.001) };

const unidadBaseDe = (producto) => {
  if (producto?.esVentaPorPeso) return 'KILOGRAMO';
  if (producto?.unidadMedida === 'GRAMO') return 'KILOGRAMO';
  if (producto?.unidadMedida === 'MILILITRO') return 'LITRO';
  return producto?.unidadMedida || 'UNIDAD';
};

// Convierte una cantidad a la unidad base (kg/L/unidad). Lanza error si no hay conversión segura.
const aUnidadBase = (cantidad, unidadOrigen, producto) => {
  const base = unidadBaseDe(producto);
  const origen = (unidadOrigen || '').toString().toUpperCase();
  const origenNorm = origen === 'KG' ? 'KILOGRAMO' : origen === 'G' ? 'GRAMO' : origen === 'L' ? 'LITRO' : origen === 'ML' ? 'MILILITRO' : origen;

  if (origenNorm === base) return new Decimal(cantidad);

  if (base === 'KILOGRAMO' && CONVERSIONES_PESO[origenNorm]) {
    return new Decimal(cantidad).mul(CONVERSIONES_PESO[origenNorm]);
  }
  if (base === 'LITRO' && CONVERSIONES_VOLUMEN[origenNorm]) {
    return new Decimal(cantidad).mul(CONVERSIONES_VOLUMEN[origenNorm]);
  }
  throw new Error(`No hay una conversión segura entre ${origenNorm} y la unidad base (${base})`);
};

module.exports = { aUnidadBase, unidadBaseDe };
