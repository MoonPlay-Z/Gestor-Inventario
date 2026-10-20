/* =========================================================================
   Dominio: cuándo consultar y cuándo avisar
   -------------------------------------------------------------------------
   Reglas de negocio sin relojes ni almacenamiento propios: el "ahora" y los
   valores guardados llegan como parámetros. Así se pueden probar sin esperar
   24 horas ni simular localStorage.
   ========================================================================= */

export const REVISION_CADA = 24 * 60 * 60 * 1000; // consulta correcta: una vez al día
export const REINTENTO_TRAS_FALLO = 30 * 60 * 1000; // si falló, reintento al abrir la app

/**
 * ¿Toca consultar el manifiesto ahora?
 * @param {{ ahora:number, ultimaCorrecta?:number, ultimoFallo?:number, forzar?:boolean }} p
 * @returns {{ revisar: boolean, motivo: 'forzado'|'reciente'|'espera-tras-fallo'|'toca' }}
 */
export function decidirRevision({ ahora, ultimaCorrecta = 0, ultimoFallo = 0, forzar = false }) {
  if (forzar) return { revisar: true, motivo: 'forzado' };

  // Una consulta correcta vale por 24 h.
  if (ultimaCorrecta && ahora - ultimaCorrecta < REVISION_CADA) {
    return { revisar: false, motivo: 'reciente' };
  }

  // Si la anterior falló, se reintenta al abrir la app cada 30 min como mucho.
  if (ultimoFallo && ahora - ultimoFallo < REINTENTO_TRAS_FALLO) {
    return { revisar: false, motivo: 'espera-tras-fallo' };
  }

  return { revisar: true, motivo: 'toca' };
}

/**
 * ¿Hay que mostrar el aviso? Una versión aplazada no vuelve a molestar,
 * salvo que sea obligatoria (el mínimo del servidor está por encima).
 * @param {{ manifiesto: object|null, instalada: object|null, descartada?: number }} p
 * @returns {{ avisar: boolean, obligatoria: boolean }}
 */
export function decidirAviso({ manifiesto, instalada, descartada = 0 }) {
  if (!manifiesto || !instalada) return { avisar: false, obligatoria: false };
  if (Number(manifiesto.versionCode) <= Number(instalada.versionCode)) {
    return { avisar: false, obligatoria: false };
  }

  const obligatoria =
    Number(manifiesto.minVersionCode) > 0 &&
    Number(instalada.versionCode) < Number(manifiesto.minVersionCode);

  if (!obligatoria && descartada >= Number(manifiesto.versionCode)) {
    return { avisar: false, obligatoria };
  }

  return { avisar: true, obligatoria };
}
