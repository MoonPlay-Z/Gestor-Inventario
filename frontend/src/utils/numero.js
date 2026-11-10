/**
 * Utilidades para valores numéricos que llegan de la API.
 *
 * Prisma serializa `Decimal` como **string** (`"12.5"`), así que cualquier
 * comparación con `<` o `>` entre dos campos de la API se resuelve como texto y
 * miente: `"6" > "12"` es `true`. En el backend pasa lo mismo con `decimal.js`,
 * cuyo `valueOf()` devuelve string (`new Decimal('6') > new Decimal('12')`).
 *
 * Regla: antes de comparar o sumar, convertir con `aNumero()`.
 */

/** Convierte a número finito; devuelve `defecto` si el valor no es numérico. */
export const aNumero = (valor, defecto = 0) => {
  if (valor === null || valor === undefined || valor === '') return defecto;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : defecto;
};

// ── Multimoneda: símbolos por moneda oficial ───────────────────────────────────
// Regla de visualización: con VES no se usan signos `$`/`€`; el signo de VES es
// `Bs.`. USD → `$`, EUR → `€`, VES → `Bs.`. El formateador recibe siempre el
// código de moneda activo (base o exhibición) y no un símbolo suelto.
export const SIMBOLOS_MONEDA = {
  USD: '$',
  EUR: '€',
  VES: 'Bs.',
};

export const simboloMoneda = (moneda = 'USD') => SIMBOLOS_MONEDA[moneda] || SIMBOLOS_MONEDA.USD;

/**
 * Formatea un monto con el símbolo de la moneda indicada.
 * `moneda` acepta códigos (`USD`/`EUR`/`VES`) o un símbolo legacy (`'$'`, `'Bs.'`).
 */
export const formatMoneda = (monto, moneda = 'USD') => {
  const valor = aNumero(monto);
  const simbolo = SIMBOLOS_MONEDA[moneda] || moneda || '$';
  if (!isFinite(valor)) return `${simbolo} 0.00`;
  return `${simbolo} ${valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Precio al que realmente se vende el producto.
 * En venta por peso el POS cobra `precioPorKilo` (ver `facturas.js` en el
 * backend y `PosPage.jsx` en el frontend), no `precioVenta`.
 */
export const precioVentaReal = (producto) => {
  const precio = aNumero(producto?.precioVenta);
  if (!producto?.esVentaPorPeso) return precio;
  const porKilo = aNumero(producto?.precioPorKilo);
  return porKilo > 0 ? porKilo : precio;
};

/** Compara dos valores de la API sin caer en la comparación de strings. */
export const esMayor = (a, b) => aNumero(a) > aNumero(b);
