/* =========================================================================
   Caso de uso: comprobar si hay una actualización disponible
   -------------------------------------------------------------------------
   Orquesta el dominio (política + validación) con los puertos inyectados.
   No conoce `fetch`, `localStorage` ni Capacitor: se le pasan como objetos.
   ========================================================================= */
import { validarManifiesto } from '../domain/manifiesto.js';
import { decidirAviso, decidirRevision } from '../domain/politica.js';

export const CLAVES = Object.freeze({
  ULTIMA: 'gestorpos:act:ultima',
  FALLO: 'gestorpos:act:fallo',
  DESCARTADA: 'gestorpos:act:descartada',
});

/**
 * @param {{
 *   manifiestos: import('../ports').ManifiestoRepository,
 *   store: import('../ports').RevisionStore,
 *   reloj: import('../ports').Reloj,
 *   lectorVersion: import('../ports').LectorVersion,
 *   ventasPendientes?: () => Promise<boolean>,
 *   claves?: typeof CLAVES,
 * }} deps
 */
export function crearComprobarActualizacion({
  manifiestos,
  store,
  reloj,
  lectorVersion,
  ventasPendientes = async () => false,
  claves = CLAVES,
}) {
  return async function comprobar({ forzar = false } = {}) {
    const instalada = await lectorVersion.obtener();
    if (!instalada) return null;

    const ahora = reloj.ahora();
    const revision = decidirRevision({
      ahora,
      ultimaCorrecta: store.leer(claves.ULTIMA),
      ultimoFallo: store.leer(claves.FALLO),
      forzar,
    });
    if (!revision.revisar) return null;

    // No se interrumpe una venta ni se compite con una cola de sincronización.
    if (await ventasPendientes()) return null;

    try {
      const manifiesto = validarManifiesto(await manifiestos.obtener());

      // Una publicación válida cuenta como consulta correcta, aunque la
      // versión publicada no sea más nueva que la instalada.
      store.guardar(claves.ULTIMA, ahora);

      const aviso = decidirAviso({
        manifiesto,
        instalada,
        descartada: store.leer(claves.DESCARTADA),
      });
      if (!aviso.avisar) return null;

      return { instalada, manifiesto, obligatoria: aviso.obligatoria };
    } catch {
      // Sin red o manifiesto no publicado: no se insiste en cada navegación.
      store.guardar(claves.FALLO, ahora);
      return null;
    }
  };
}
