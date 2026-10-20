/* =========================================================================
   Dominio: manifiesto de actualización
   -------------------------------------------------------------------------
   Funciones puras: no hacen red, no leen localStorage y no tocan el DOM.
   Todo lo que entra por aquí es datos; lo que no cumple el contrato se
   descarta entero (nunca se intenta instalar algo a medias).
   ========================================================================= */

const SHA_VALIDO = /^[a-f0-9]{64}$/i;
const URL_VALIDA = /^https:\/\//i;

/**
 * Normaliza y valida el manifiesto publicado.
 * @param {unknown} datos JSON tal cual llegó del sitio.
 * @returns {null | {
 *   versionCode: number, versionName: string, url: string, sha256: string,
 *   size: number, publishedAt: string, minVersionCode: number, notes: string[]
 * }}
 */
export function validarManifiesto(datos) {
  if (!datos || typeof datos !== 'object') return null;

  const versionCode = Number(datos.versionCode);
  if (!Number.isInteger(versionCode) || versionCode <= 0) return null;

  if (typeof datos.url !== 'string' || !URL_VALIDA.test(datos.url)) return null;
  if (typeof datos.sha256 !== 'string' || !SHA_VALIDO.test(datos.sha256)) return null;

  const size = Number(datos.size);
  if (!Number.isFinite(size) || size <= 0) return null;

  const minVersionCode = Number(datos.minVersionCode);
  const notes = Array.isArray(datos.notes)
    ? datos.notes.filter((n) => typeof n === 'string' && n.trim()).slice(0, 12)
    : [];

  return {
    versionCode,
    versionName: String(datos.versionName || versionCode),
    url: datos.url,
    sha256: datos.sha256.toLowerCase(),
    size,
    publishedAt: typeof datos.publishedAt === 'string' ? datos.publishedAt : '',
    minVersionCode: Number.isInteger(minVersionCode) && minVersionCode > 0 ? minVersionCode : 0,
    notes,
  };
}

/** ¿El manifiesto describe una versión posterior a la instalada? */
export function esMasNueva(manifiesto, instalada) {
  if (!manifiesto || !instalada) return false;
  return Number(manifiesto.versionCode) > Number(instalada.versionCode);
}

/** ¿La instalada se quedó por debajo del mínimo exigido por el servidor? */
export function esObligatoria(manifiesto, instalada) {
  if (!manifiesto || !instalada) return false;
  const minimo = Number(manifiesto.minVersionCode) || 0;
  return minimo > 0 && Number(instalada.versionCode) < minimo;
}
