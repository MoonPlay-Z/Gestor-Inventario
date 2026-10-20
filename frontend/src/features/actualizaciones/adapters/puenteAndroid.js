/* =========================================================================
   Adaptadores del puente nativo
   -------------------------------------------------------------------------
   `window.AndroidUpdates` (MainActivity) expone métodos síncronos que
   devuelven texto. Aquí se traduce ese protocolo a un contrato tipado:
   la UI nunca ve cadenas crudas ni tiene que saber si corre en un WebView.
   ========================================================================= */

/** Traduce la respuesta nativa (`ok`, `permiso`, `error:...`) a un resultado. */
export function interpretarRespuesta(crudo) {
  const texto = String(crudo || '');
  if (texto === 'ok') return { ok: true };
  if (texto === 'permiso') return { ok: false, permiso: true };
  if (texto.startsWith('error:')) return { ok: false, motivo: texto.slice(6) };
  return { ok: false, motivo: texto || 'Respuesta inesperada del dispositivo.' };
}

export const hayPuente = (win = globalThis.window) => !!win?.AndroidUpdates;

/**
 * Adaptador real: DownloadManager + verificación de firma en Android.
 * @param {Window} [win]
 * @returns {import('../ports').InstaladorNativo}
 */
export function crearInstaladorNativo(win = globalThis.window) {
  const disponible = () => hayPuente(win);
  const puente = () => win.AndroidUpdates;

  return {
    disponible,

    async descargar(manifiesto) {
      if (!disponible()) return { ok: false, motivo: 'no-nativo' };
      try {
        return interpretarRespuesta(
          puente().descargar(manifiesto.url, manifiesto.sha256, manifiesto.versionCode),
        );
      } catch (error) {
        return { ok: false, motivo: error?.message || 'No se pudo iniciar la descarga.' };
      }
    },

    async estado() {
      if (!disponible()) return null;
      try {
        return JSON.parse(puente().estado() || '{}');
      } catch {
        return null;
      }
    },

    async instalar() {
      if (!disponible()) return { ok: false, motivo: 'no-nativo' };
      try {
        return interpretarRespuesta(puente().instalar());
      } catch (error) {
        return { ok: false, motivo: error?.message || 'No se pudo abrir el instalador.' };
      }
    },

    async ajustes() {
      if (!disponible()) return;
      try {
        puente().ajustes();
      } catch {
        /* el usuario puede abrir los ajustes a mano */
      }
    },

    async cancelar() {
      if (!disponible()) return;
      try {
        puente().cancelar();
      } catch {
        /* nada que cancelar */
      }
    },
  };
}

/**
 * Adaptador para navegador: cumple el contrato y no lanza. Así la UI no tiene
 * que preguntar por la plataforma en cada llamada (LSP).
 * @returns {import('../ports').InstaladorNativo}
 */
export function crearInstaladorNulo() {
  return {
    disponible: () => false,
    descargar: async () => ({ ok: false, motivo: 'no-nativo' }),
    estado: async () => null,
    instalar: async () => ({ ok: false, motivo: 'no-nativo' }),
    ajustes: async () => {},
    cancelar: async () => {},
  };
}

/**
 * @param {{ app: { getInfo: () => Promise<{ build?: string, version?: string }> }, esNativo: () => boolean }} deps
 * @returns {import('../ports').LectorVersion}
 */
export function crearLectorVersion({ app, esNativo }) {
  return {
    async obtener() {
      if (!esNativo()) return null;
      try {
        const info = await app.getInfo();
        const versionCode = parseInt(info?.build, 10);
        if (!Number.isInteger(versionCode) || versionCode <= 0) return null;
        return { versionCode, versionName: info.version || String(versionCode) };
      } catch {
        return null;
      }
    },
  };
}
