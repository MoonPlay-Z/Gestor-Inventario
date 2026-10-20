/* =========================================================================
   Dominio: máquina de estados del aviso de actualización
   -------------------------------------------------------------------------
   Antes las fases eran cadenas sueltas dentro del componente: si el usuario
   cancelaba el instalador de Android la fase se quedaba en `instalando` y el
   modal bloqueaba la app para siempre. Aquí las transiciones son explícitas
   y la regla "todo estado ocupado debe poder abandonarse" es verificable.
   ========================================================================= */

export const ESTADOS = Object.freeze({
  AVISO: 'aviso',
  DESCARGANDO: 'descargando',
  VERIFICANDO: 'verificando',
  INSTALANDO: 'instalando',
  PERMISO: 'permiso',
  ERROR: 'error',
});

export const EVENTOS = Object.freeze({
  ACTUALIZAR: 'actualizar',
  PROGRESO: 'progreso',
  VERIFICAR: 'verificar',
  INSTALAR: 'instalar',
  PERMISO: 'permiso',
  ERROR: 'error',
  REINTENTAR: 'reintentar',
  CANCELAR: 'cancelar',
  VOLVER: 'volver',
});

/** `null` significa "ocultar el aviso". */
const TRANSICIONES = Object.freeze({
  [ESTADOS.AVISO]: Object.freeze({
    [EVENTOS.ACTUALIZAR]: ESTADOS.DESCARGANDO,
    [EVENTOS.CANCELAR]: null,
  }),
  [ESTADOS.DESCARGANDO]: Object.freeze({
    [EVENTOS.PROGRESO]: ESTADOS.DESCARGANDO,
    [EVENTOS.VERIFICAR]: ESTADOS.VERIFICANDO,
    [EVENTOS.INSTALAR]: ESTADOS.INSTALANDO,
    [EVENTOS.PERMISO]: ESTADOS.PERMISO,
    [EVENTOS.ERROR]: ESTADOS.ERROR,
    [EVENTOS.CANCELAR]: ESTADOS.AVISO,
  }),
  [ESTADOS.VERIFICANDO]: Object.freeze({
    [EVENTOS.PROGRESO]: ESTADOS.VERIFICANDO,
    [EVENTOS.INSTALAR]: ESTADOS.INSTALANDO,
    [EVENTOS.PERMISO]: ESTADOS.PERMISO,
    [EVENTOS.ERROR]: ESTADOS.ERROR,
    [EVENTOS.CANCELAR]: ESTADOS.AVISO,
  }),
  [ESTADOS.INSTALANDO]: Object.freeze({
    // El usuario canceló el instalador de Android o tardó demasiado: se
    // vuelve al aviso con la opción de reintentar.
    [EVENTOS.VOLVER]: ESTADOS.AVISO,
    [EVENTOS.ERROR]: ESTADOS.ERROR,
  }),
  [ESTADOS.PERMISO]: Object.freeze({
    [EVENTOS.INSTALAR]: ESTADOS.INSTALANDO,
    [EVENTOS.CANCELAR]: ESTADOS.AVISO,
    [EVENTOS.ERROR]: ESTADOS.ERROR,
  }),
  [ESTADOS.ERROR]: Object.freeze({
    [EVENTOS.REINTENTAR]: ESTADOS.AVISO,
    [EVENTOS.CANCELAR]: null,
  }),
});

/**
 * Aplica un evento. Un evento no declarado deja el estado igual.
 * @returns {string|null} estado siguiente; `null` = ocultar el aviso.
 */
export function transicion(estado, evento) {
  const fila = TRANSICIONES[estado];
  if (!fila || !Object.prototype.hasOwnProperty.call(fila, evento)) return estado;
  return fila[evento];
}

/** Estados en los que hay trabajo en curso y no conviene salir a mitad. */
export function esOcupado(estado) {
  return (
    estado === ESTADOS.DESCARGANDO ||
    estado === ESTADOS.VERIFICANDO ||
    estado === ESTADOS.INSTALANDO
  );
}

/**
 * ¿Se puede abandonar el aviso en este estado?
 * - `error`: siempre (un manifiesto roto no debe dejar la app inservible).
 * - descarga/verificación: sí, cancelando.
 * - instalando: sí, volviendo al aviso.
 * - aviso/permiso: solo si la actualización no es obligatoria.
 */
export function puedeCerrar(estado, { obligatoria = false } = {}) {
  if (estado === ESTADOS.ERROR) return true;
  if (estado === ESTADOS.INSTALANDO) return true;
  if (estado === ESTADOS.DESCARGANDO || estado === ESTADOS.VERIFICANDO) return true;
  return !obligatoria;
}

/** Acción que ejecuta el botón de cerrar en cada estado. */
export function accionCerrar(estado) {
  if (estado === ESTADOS.INSTALANDO) return 'volver';
  if (estado === ESTADOS.DESCARGANDO || estado === ESTADOS.VERIFICANDO) return 'cancelar';
  return 'aplazar';
}
