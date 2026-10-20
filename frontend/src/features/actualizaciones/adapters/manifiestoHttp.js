/* Adaptador: manifiesto por HTTP. */

const TIEMPO_MAXIMO = 8000; // el manifiesto es diminuto; sin esperas largas

/**
 * @param {{ url: () => string, fetchImpl?: typeof fetch, timeoutMs?: number }} deps
 * @returns {import('../ports').ManifiestoRepository}
 */
export function crearManifiestoHttp({ url, fetchImpl = globalThis.fetch, timeoutMs = TIEMPO_MAXIMO }) {
  return {
    async obtener() {
      const control = new AbortController();
      const temporizador = setTimeout(() => control.abort(), timeoutMs);
      try {
        const respuesta = await fetchImpl(url(), {
          cache: 'no-cache',
          headers: { Accept: 'application/json' },
          signal: control.signal,
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        // El sitio puede responder el index.html de la SPA en rutas
        // inexistentes: sin este filtro se intentaría parsear HTML como JSON.
        const tipo = (respuesta.headers.get('content-type') || '').toLowerCase();
        if (!tipo.includes('json')) throw new Error('Manifiesto no disponible');

        return await respuesta.json();
      } finally {
        clearTimeout(temporizador);
      }
    },
  };
}
