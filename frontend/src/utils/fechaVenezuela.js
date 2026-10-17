/**
 * Fechas de Venezuela (UTC-4 todo el año: el país no aplica horario de verano).
 *
 * Se calculan desplazando el instante en lugar de usar la zona horaria del
 * navegador para que coincidan exactamente con lo que guarda el backend
 * (`Empresa.tasaDolarActualizadaEn`). Así, aunque el equipo del POS tenga la
 * hora o la zona mal configurada, el aviso de la tasa sigue apareciendo el día
 * correcto y no "todos los días" ni "nunca".
 */

const OFFSET_VE_MS = 4 * 60 * 60 * 1000;

/** Fecha local de Venezuela como `YYYY-MM-DD`, o `null` si la fecha es inválida. */
export function fechaEnVenezuela(fecha = new Date()) {
  const instante = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(instante.getTime())) return null;
  return new Date(instante.getTime() - OFFSET_VE_MS).toISOString().slice(0, 10);
}

/** ¿La fecha dada corresponde a hoy en Venezuela? */
export function esDeHoy(fecha) {
  const dia = fechaEnVenezuela(fecha);
  return dia !== null && dia === fechaEnVenezuela();
}

/** `16/10/2026` a partir de una fecha ISO o Date. Devuelve `—` si no es válida. */
export function formatearFecha(fecha) {
  const dia = fechaEnVenezuela(fecha);
  if (!dia) return '—';
  const [anio, mes, diaMes] = dia.split('-');
  return `${diaMes}/${mes}/${anio}`;
}
