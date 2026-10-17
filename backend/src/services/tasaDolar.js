const prisma = require('../db/prisma');
const { tasaBCVActual } = require('../utils/bcvHistorico');
const { invalidarTasaEmpresa } = require('../utils/tasaEmpresaCache');

/**
 * Mantiene al día `Empresa.tasaDolar`.
 *
 * Cada empresa tiene su propia tasa y su propio modo:
 *  - AUTOMATICO: se refresca sola con la tasa oficial del BCV (una vez al día).
 *  - MANUAL: solo cambia cuando el usuario la guarda.
 *
 * El refresco se dispara de dos formas complementarias, porque el backend puede
 * estar dormido (Render free) o el equipo apagado a la hora programada:
 *  1. Un temporizador diario a las 08:00 de Venezuela.
 *  2. Un refresco perezoso al primer uso del día (`asegurarTasaDelDia`).
 *
 * Si el BCV no responde, se conserva la última tasa conocida: nunca se inventa
 * un valor ni se deja la tasa en cero.
 */

// Venezuela es UTC-4 todo el año (no aplica horario de verano), así que la fecha
// local se obtiene desplazando el instante y leyéndolo en UTC.
const OFFSET_VE_MS = 4 * 60 * 60 * 1000;

// Las 08:00 de Venezuela son las 12:00 UTC.
const HORA_ACTUALIZACION_UTC = 12;

const MODOS = ['AUTO', 'MANUAL'];

// Margen antes de la hora programada para lanzar el refresco de arranque.
const RETRASO_ARRANQUE_MS = 8000;

const CAMPOS_EMPRESA = {
  id: true,
  tasaDolar: true,
  tasaDolarModo: true,
  tasaDolarActualizadaEn: true,
};

/** Fecha local de Venezuela (YYYY-MM-DD) para un instante dado. */
function fechaEnVenezuela(fecha = new Date()) {
  const instante = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(instante.getTime())) return null;
  return new Date(instante.getTime() - OFFSET_VE_MS).toISOString().slice(0, 10);
}

/** ¿La marca de tiempo corresponde a hoy en Venezuela? */
function esDeHoy(fecha) {
  const dia = fechaEnVenezuela(fecha);
  return dia !== null && dia === fechaEnVenezuela();
}

const estaEnModoAuto = (empresa) => (empresa?.tasaDolarModo || 'AUTO') === 'AUTO';

// Evita que el job diario y una petición simultánea consulten el BCV a la vez.
let _enCurso = null;

/**
 * Refresca la tasa de las empresas en modo AUTOMATICO con la tasa oficial del
 * BCV. Solo toca las que no tienen la tasa del día, salvo `forzar`.
 *
 * @returns {Promise<{tasa: number|null, fecha: Date|null, actualizadas: number, motivo: string, error?: string}>}
 *   `motivo`: 'actualizada' | 'al_dia' | 'sin_tasa' | 'error'
 */
async function actualizarTasas({ empresaId = null, forzar = false } = {}) {
  const ejecutar = async () => {
    const where = { activo: true };
    if (empresaId) where.id = empresaId;

    const empresas = await prisma.empresa.findMany({ where, select: CAMPOS_EMPRESA });
    const pendientes = empresas.filter(
      (e) => estaEnModoAuto(e) && (forzar || !esDeHoy(e.tasaDolarActualizadaEn))
    );
    if (pendientes.length === 0) {
      return { tasa: null, fecha: null, actualizadas: 0, motivo: 'al_dia' };
    }

    let tasaBCV;
    try {
      tasaBCV = await tasaBCVActual();
    } catch (err) {
      console.error('[tasaDolar] No se pudo consultar la tasa del BCV:', err.message);
      return { tasa: null, fecha: null, actualizadas: 0, motivo: 'error', error: err.message };
    }
    if (!tasaBCV || !tasaBCV.isFinite() || tasaBCV.lte(0)) {
      console.error('[tasaDolar] El BCV no devolvió una tasa válida');
      return { tasa: null, fecha: null, actualizadas: 0, motivo: 'sin_tasa' };
    }

    const tasa = Number(tasaBCV.toString());
    const fecha = new Date();
    await prisma.empresa.updateMany({
      where: { id: { in: pendientes.map((e) => e.id) } },
      data: { tasaDolar: tasa, tasaDolarActualizadaEn: fecha },
    });

    // La tasa por empresa está cacheada 60 s: sin invalidar, el POS podría
    // seguir cobrando con la tasa anterior durante el resto del minuto.
    for (const empresa of pendientes) invalidarTasaEmpresa(empresa.id);

    console.log(
      `[tasaDolar] Tasa actualizada a ${tasa} Bs./$ en ${pendientes.length} empresa(s)`
    );
    return { tasa, fecha, actualizadas: pendientes.length, motivo: 'actualizada' };
  };

  // Si ya hay una ejecución en curso se espera a que termine y, si aún hace
  // falta, se ejecuta igual: cada corrida vuelve a filtrar lo que falta.
  if (_enCurso) {
    try { await _enCurso; } catch { /* la ejecución previa ya reportó su error */ }
  }

  const promesa = ejecutar();
  _enCurso = promesa;
  // Se libera el candado solo si sigue siendo esta ejecución: otra petición pudo
  // haber arrancado ya la suya.
  const liberar = () => { if (_enCurso === promesa) _enCurso = null; };
  promesa.then(liberar, liberar);
  return promesa;
}

/**
 * Refresco perezoso para el primer uso del día. Devuelve la fila ya refrescada,
 * o `null` cuando no había nada que hacer (modo manual o tasa ya de hoy).
 */
async function asegurarTasaDelDia(empresa) {
  // Sin `id` la consulta de `actualizarTasas` perdería el filtro por empresa y
  // refrescaría a todas: se exige explícitamente.
  if (!empresa?.id || !estaEnModoAuto(empresa) || esDeHoy(empresa.tasaDolarActualizadaEn)) {
    return null;
  }
  await actualizarTasas({ empresaId: empresa.id });
  // Se relee: otra petición en paralelo pudo haber hecho la actualización.
  return prisma.empresa.findUnique({ where: { id: empresa.id }, select: CAMPOS_EMPRESA });
}

/**
 * Aplica la tasa del BCV a UNA empresa, sin importar su modo. Es una acción
 * explícita del usuario (botón "Actualizar desde BCV") o del aviso diario, así
 * que también funciona en modo MANUAL; el modo no se modifica.
 */
async function actualizarTasaEmpresa(empresaId) {
  if (!empresaId) return { tasa: null, fecha: null, motivo: 'sin_empresa' };

  let tasaBCV;
  try {
    tasaBCV = await tasaBCVActual();
  } catch (err) {
    console.error('[tasaDolar] No se pudo consultar la tasa del BCV:', err.message);
    return { tasa: null, fecha: null, motivo: 'error', error: err.message };
  }
  if (!tasaBCV || !tasaBCV.isFinite() || tasaBCV.lte(0)) {
    return { tasa: null, fecha: null, motivo: 'sin_tasa' };
  }

  const tasa = Number(tasaBCV.toString());
  const fecha = new Date();
  await prisma.empresa.update({
    where: { id: empresaId },
    data: { tasaDolar: tasa, tasaDolarActualizadaEn: fecha },
    select: { id: true },
  });
  invalidarTasaEmpresa(empresaId);

  console.log(`[tasaDolar] Tasa de la empresa ${empresaId} actualizada a ${tasa} Bs./$`);
  return { tasa, fecha, motivo: 'actualizada' };
}

const actualizacionAutomaticaActiva = () => process.env.TASA_DOLAR_AUTO_UPDATE !== 'false';

/** Espera hasta las 08:00 de Venezuela del próximo día. */
function msHastaProximaActualizacion() {
  const ahora = Date.now();
  const objetivo = new Date();
  objetivo.setUTCHours(HORA_ACTUALIZACION_UTC, 0, 0, 0);
  if (objetivo.getTime() <= ahora) objetivo.setUTCDate(objetivo.getUTCDate() + 1);
  return objetivo.getTime() - ahora;
}

/**
 * Arranca el refresco diario. No usa cron externo: un temporizador que se
 * reprograma solo. Con `unref` no impide que el proceso termine (scripts,
 * pruebas) si nada más lo mantiene vivo.
 */
function iniciarActualizacionDiaria() {
  if (!actualizacionAutomaticaActiva()) {
    console.log('[tasaDolar] Actualización diaria desactivada (TASA_DOLAR_AUTO_UPDATE=false)');
    return;
  }

  // Recupera el día si el proceso estuvo caído a la hora programada. Es
  // idempotente: si la tasa ya es de hoy, no consulta el BCV.
  setTimeout(() => {
    actualizarTasas().catch((err) => console.error('[tasaDolar] Refresco de arranque:', err.message));
  }, RETRASO_ARRANQUE_MS).unref?.();

  const programar = () => {
    const espera = msHastaProximaActualizacion();
    const temporizador = setTimeout(async () => {
      try {
        await actualizarTasas();
      } catch (err) {
        console.error('[tasaDolar] Refresco diario:', err.message);
      }
      programar();
    }, espera);
    temporizador.unref?.();
  };
  programar();

  console.log('[tasaDolar] Actualización diaria programada (08:00 de Venezuela)');
}

module.exports = {
  MODOS,
  fechaEnVenezuela,
  esDeHoy,
  estaEnModoAuto,
  actualizarTasas,
  actualizarTasaEmpresa,
  asegurarTasaDelDia,
  iniciarActualizacionDiaria,
  // Expuesta para poder verificar el momento exacto del disparo diario.
  msHastaProximaActualizacion,
};
