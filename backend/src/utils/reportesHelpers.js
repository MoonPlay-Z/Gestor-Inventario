/**
 * reportesHelpers — Utilidades para el módulo de reportes
 * 
 * Funciones:
 *   - getFechasPeriodo: Calcula fechas de inicio/fin para cada periodicidad
 *   - formatearMoneda: Formatea valores monetarios
 *   - formatearPorcentaje: Formatea porcentajes
 *   - calcularComparacion: Calcula variación vs período anterior
 */

/**
 * Calcula las fechas de inicio y fin para un período dado.
 * @param {string} periodo - 'diario' | 'semanal' | 'mensual' | 'anual'
 * @param {string} fecha - Fecha de referencia en formato 'YYYY-MM-DD' o 'YYYY-MM'
 * @returns {Object} { inicio, fin, inicioAnterior, finAnterior, etiqueta }
 */
function getFechasPeriodo(periodo, fecha) {
  const ahora = new Date();
  let inicio, fin, inicioAnterior, finAnterior, etiqueta;

  switch (periodo) {
    case 'diario': {
      // fecha = 'YYYY-MM-DD'
      const [y, m, d] = fecha ? fecha.split('-').map(Number) : [ahora.getFullYear(), ahora.getMonth() + 1, ahora.getDate()];
      inicio = new Date(y, m - 1, d, 0, 0, 0);
      fin = new Date(y, m - 1, d, 23, 59, 59, 999);
      inicioAnterior = new Date(y, m - 1, d - 1, 0, 0, 0);
      finAnterior = new Date(y, m - 1, d - 1, 23, 59, 59, 999);
      etiqueta = inicio.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
      break;
    }
    case 'semanal': {
      // fecha = 'YYYY-MM-DD' (cualquier día de la semana deseada)
      const [y, m, d] = fecha ? fecha.split('-').map(Number) : [ahora.getFullYear(), ahora.getMonth() + 1, ahora.getDate()];
      const fechaRef = new Date(y, m - 1, d);
      const diaSemana = fechaRef.getDay(); // 0=Domingo
      const ajuste = diaSemana === 0 ? -6 : 1 - diaSemana; // Lunes como inicio
      inicio = new Date(fechaRef);
      inicio.setDate(fechaRef.getDate() + ajuste);
      inicio.setHours(0, 0, 0, 0);
      fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      inicioAnterior = new Date(inicio);
      inicioAnterior.setDate(inicio.getDate() - 7);
      finAnterior = new Date(fin);
      finAnterior.setDate(fin.getDate() - 7);
      etiqueta = `Semana del ${inicio.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}`;
      break;
    }
    case 'mensual': {
      // fecha = 'YYYY-MM'
      const [y, m] = fecha ? fecha.split('-').map(Number) : [ahora.getFullYear(), ahora.getMonth() + 1];
      inicio = new Date(y, m - 1, 1, 0, 0, 0);
      fin = new Date(y, m, 0, 23, 59, 59, 999); // Último día del mes
      inicioAnterior = new Date(y, m - 2, 1, 0, 0, 0);
      finAnterior = new Date(y, m - 1, 0, 23, 59, 59, 999);
      etiqueta = inicio.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });
      break;
    }
    case 'anual': {
      // fecha = 'YYYY'
      const y = fecha ? Number(fecha) : ahora.getFullYear();
      inicio = new Date(y, 0, 1, 0, 0, 0);
      fin = new Date(y, 11, 31, 23, 59, 59, 999);
      inicioAnterior = new Date(y - 1, 0, 1, 0, 0, 0);
      finAnterior = new Date(y - 1, 11, 31, 23, 59, 59, 999);
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
