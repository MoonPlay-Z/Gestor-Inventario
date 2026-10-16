/**
 * unidades.js — Normalización de cantidades en reportes de venta por peso.
 *
 * `ItemFactura.cantidad` guarda el número en la UNIDAD que indica
 * `ItemFactura.unidadMedida`. Una venta de 675 g se guarda como
 * cantidad=675, unidadMedida='GRAMO'; la misma venta en kg sería 0.675.
 *
 * Multiplicar esa cantidad por un precio unitario sin normalizar produce un
 * resultado 1000x mayor. Este módulo centraliza la conversión para que no
 * exista una segunda copia del CASE que pueda olvidarse.
 *
 * Si un producto está marcado `esVentaPorPeso` pero la línea se registró como
 * UNIDAD, se trata como UNIDAD y no como gramos: se verificó en producción que
 * esas líneas cuadran 1:1 con su subtotal.
 */

/**
 * Expresión SQL que normaliza `item.cantidad` a la unidad del producto
 * (gramos → kilogramos). Usar SIEMPRE en lugar de `item.cantidad` cuando el
 * valor se multiplique por un precio o costo unitario.
 *
 * NOTA: solo convierte GRAMO. Una línea con `UNIDAD` se trata tal cual.
 * Se observó en producción que existen líneas de producto pesado
 * (`esVentaPorPeso`) registradas como UNIDAD que cuadran 1:1 con su subtotal
 * (p. ej. 5 UNIDAD × $1.00 = $5.00), mientras que|Gramos sí se cobran
 * convertidos. Tratar UNIDAD como gramos dividía esas líneas entre 1000 y
 * hacía que la ganancia del reporte mostrara $0.01 en vez de $5.00.
 *
 * @param {string} alias - Alias de la tabla de items ('item', 'it')
 * @returns {string} Fragmento SQL
 */
const cantidadEnKgSQL = (alias = 'item') => `(CASE
    WHEN ${alias}."unidadMedida" = 'GRAMO' THEN ${alias}."cantidad" / 1000
    ELSE ${alias}."cantidad"
  END)`;

/**
 * Expresión SQL que devuelve la unidad ya normalizada para mostrar en pantalla.
 * Una línea de 675 g se presenta como KILOGRAMO con cantidad 0.675.
 *
 * @param {string} alias - Alias de la tabla de items
 * @returns {string} Fragmento SQL
 */
const unidadNormalizadaSQL = (alias = 'item') => `(CASE
    WHEN ${alias}."unidadMedida" = 'GRAMO' THEN 'KILOGRAMO'
    ELSE ${alias}."unidadMedida"
  END)`;

/**
 * Versión JS para cálculos en memoria (no SQL).
 *
 * @param {Decimal|string|number} cantidad
 * @param {string} unidadMedida - Unidad registrada en la línea
 * @param {boolean} esVentaPorPeso - Flag del producto
 * @returns {Decimal} Cantidad en la unidad del producto
 */
const cantidadEnKg = (cantidad, unidadMedida, esVentaPorPeso = false) => {
  const { Decimal } = require('decimal.js');
  const valor = new Decimal(cantidad.toString());
  // Solo GRAMO se convierte; ver nota en cantidadEnKgSQL.
  return unidadMedida === 'GRAMO' ? valor.div(1000) : valor;
};

module.exports = {
  cantidadEnKgSQL,
  unidadNormalizadaSQL,
  cantidadEnKg,
};