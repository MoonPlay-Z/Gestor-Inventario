/**
 * reportesHelpers — Utilidades para el módulo de reportes
 * 
 * Funciones:
 *   - getFechasPeriodo: Calcula fechas de inicio/fin para cada periodicidad
 *   - formatearMoneda: Formatea valores monetarios
 *   - formatearPorcentaje: Formatea porcentajes
 *   - calcularComparacion: Calcula variación vs período anterior
 */

// Venezuela es UTC-4 todo el año (no aplica horario de verano). Todos los
// límites de período se anclan a la hora de Venezuela: con la hora del servidor
// (UTC en producción) el "día" del reporte empezaría a las 20:00 del día
// anterior y las ventas de la tarde-noche caerían en el día equivocado.
const OFFSET_VE_MS = 4 * 60 * 60 * 1000;

const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Día actual en Venezuela como [año, mes, día]. */
function hoyVE() {
  const ve = new Date(Date.now() - OFFSET_VE_MS);
  return [ve.getUTCFullYear(), ve.getUTCMonth() + 1, ve.getUTCDate()];
}

/** Instante UTC de las 00:00 hora de Venezuela de un día (año, mes, día). */
function inicioDiaVE(y, m, d) {
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0) + OFFSET_VE_MS);
}

/** Instante UTC de las 23:59:59.999 hora de Venezuela de un día. */
function finDiaVE(y, m, d) {
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) + OFFSET_VE_MS);
}

const partesUTC = (fecha) => [fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, fecha.getUTCDate()];

/**
 * Calcula las fechas de inicio y fin para un período dado, en hora de Venezuela.
 * @param {string} periodo - 'diario' | 'semanal' | 'mensual' | 'anual'
 * @param {string} fecha - Fecha de referencia en formato 'YYYY-MM-DD' o 'YYYY-MM'
 * @returns {Object} { inicio, fin, inicioAnterior, finAnterior, etiqueta }
 */
function getFechasPeriodo(periodo, fecha) {
  let inicio, fin, inicioAnterior, finAnterior, etiqueta;

  switch (periodo) {
    case 'diario': {
      // fecha = 'YYYY-MM-DD'
      const [y, m, d] = fecha ? fecha.split('-').map(Number) : hoyVE();
      inicio = inicioDiaVE(y, m, d);
      fin = finDiaVE(y, m, d);
      const [ay, am, ad] = partesUTC(new Date(Date.UTC(y, m - 1, d - 1)));
      inicioAnterior = inicioDiaVE(ay, am, ad);
      finAnterior = finDiaVE(ay, am, ad);
      etiqueta = `${d} ${MESES_CORTO[m - 1]} ${y}`;
      break;
    }
    case 'semanal': {
      // fecha = 'YYYY-MM-DD' (cualquier día de la semana deseada)
      const [y, m, d] = fecha ? fecha.split('-').map(Number) : hoyVE();
      // Lunes como inicio. El día de la semana es invariante al desplazamiento
      // (son días completos), así que basta con la parte UTC.
      const ref = new Date(Date.UTC(y, m - 1, d));
      const dow = ref.getUTCDay(); // 0 = Domingo
      ref.setUTCDate(ref.getUTCDate() + (dow === 0 ? -6 : 1 - dow));
      const [ly, lm, ld] = partesUTC(ref);
      inicio = inicioDiaVE(ly, lm, ld);
      fin = finDiaVE(...partesUTC(new Date(Date.UTC(ly, lm - 1, ld + 6))));
      inicioAnterior = inicioDiaVE(...partesUTC(new Date(Date.UTC(ly, lm - 1, ld - 7))));
      finAnterior = finDiaVE(...partesUTC(new Date(Date.UTC(ly, lm - 1, ld - 1))));
      etiqueta = `Semana del ${ld} ${MESES_CORTO[lm - 1]}`;
      break;
    }
    case 'mensual': {
      // fecha = 'YYYY-MM'
      const [y, m] = fecha ? fecha.split('-').map(Number) : hoyVE().slice(0, 2);
      inicio = inicioDiaVE(y, m, 1);
      fin = finDiaVE(y, m, new Date(Date.UTC(y, m, 0)).getUTCDate()); // Último día del mes
      inicioAnterior = inicioDiaVE(y, m - 1, 1);
      finAnterior = finDiaVE(y, m - 1, new Date(Date.UTC(y, m - 1, 0)).getUTCDate());
      etiqueta = `${MESES_LARGO[m - 1]} ${y}`;
      break;
    }
    case 'anual': {
      // fecha = 'YYYY'
      const y = fecha ? Number(fecha) : hoyVE()[0];
      inicio = inicioDiaVE(y, 1, 1);
      fin = finDiaVE(y, 12, 31);
      inicioAnterior = inicioDiaVE(y - 1, 1, 1);
      finAnterior = finDiaVE(y - 1, 12, 31);
      etiqueta = `Año ${y}`;
      break;
    }
    default:
      throw new Error(`Periodo no válido: ${periodo}`);
  }

  return {
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    inicioAnterior: inicioAnterior.toISOString(),
    finAnterior: finAnterior.toISOString(),
    etiqueta,
  };
}

/**
 * Formatea un valor monetario.
 * @param {number|string} valor 
 * @param {string} simbolo - Símbolo de moneda (default: '$')
 * @returns {string}
 */
function formatearMoneda(valor, simbolo = '$') {
  const num = Number(valor || 0);
  return `${simbolo} ${num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formatea un porcentaje.
 * @param {number} valor 
 * @returns {string}
 */
function formatearPorcentaje(valor) {
  const num = Number(valor || 0);
  const signo = num > 0 ? '+' : '';
  return `${signo}${num.toFixed(1)}%`;
}

/**
 * Calcula la comparación entre el período actual y el anterior.
 * @param {number} actual 
 * @param {number} anterior 
 * @returns {Object} { porcentajeCambio, tendencia: 'up'|'down'|'neutral' }
 */
function calcularComparacion(actual, anterior) {
  const act = Number(actual || 0);
  const ant = Number(anterior || 0);

  if (ant === 0) {
    return { porcentajeCambio: act > 0 ? 100 : 0, tendencia: act > 0 ? 'up' : 'neutral' };
  }

  const porcentajeCambio = ((act - ant) / ant) * 100;
  const tendencia = porcentajeCambio > 0 ? 'up' : porcentajeCambio < 0 ? 'down' : 'neutral';

  return { porcentajeCambio: Math.round(porcentajeCambio * 10) / 10, tendencia };
}

/**
 * Genera etiquetas para el eje X del gráfico según el período.
 * @param {string} periodo 
 * @param {Date} inicio 
 * @param {Date} fin 
 * @returns {string[]}
 */
function generarEtiquetasEje(periodo, inicio, fin) {
  const etiquetas = [];
  const ini = new Date(inicio);
  const fn = new Date(fin);

  switch (periodo) {
    case 'diario':
      // Cada 2 horas
      for (let h = 0; h < 24; h += 2) {
        etiquetas.push(`${h.toString().padStart(2, '0')}:00`);
      }
      break;
    case 'semanal':
      // Días de la semana
      const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(ini);
        d.setDate(ini.getDate() + i);
        etiquetas.push(dias[d.getDay() === 0 ? 6 : d.getDay() - 1]);
      }
      break;
    case 'mensual':
      // Semanas del mes
      const semanas = Math.ceil((fn.getDate()) / 7);
      for (let i = 1; i <= semanas; i++) {
        etiquetas.push(`Sem ${i}`);
      }
      break;
    case 'anual':
      // Meses
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      for (let i = 0; i < 12; i++) {
        etiquetas.push(meses[i]);
      }
      break;
    default:
      etiquetas.push('');
  }

  return etiquetas;
}

module.exports = {
  getFechasPeriodo,
  formatearMoneda,
  formatearPorcentaje,
  calcularComparacion,
  generarEtiquetasEje,
};
