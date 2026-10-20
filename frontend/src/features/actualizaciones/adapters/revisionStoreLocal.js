/* Adaptador: marcas de revisión en localStorage (o cualquier Storage). */

/**
 * @param {Storage} [storage]
 * @returns {import('../ports').RevisionStore}
 */
export function crearRevisionStoreLocal(storage = globalThis.localStorage) {
  return {
    leer(clave) {
      try {
        const valor = Number(storage?.getItem(clave) || 0);
        return Number.isFinite(valor) ? valor : 0;
      } catch {
        return 0;
      }
    },
    guardar(clave, valor) {
      try {
        storage?.setItem(clave, String(valor));
      } catch {
        /* almacenamiento bloqueado: se reintentará en la próxima consulta */
      }
    },
  };
}
