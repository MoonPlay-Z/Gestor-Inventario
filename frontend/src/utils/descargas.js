/**
 * Descargas que funcionan igual en la web y dentro de la app Android.
 *
 * En el navegador basta con un `<a download href="blob:…">`. En el WebView de
 * Android un enlace `blob:` no guarda nada, así que MainActivity expone
 * `window.AndroidDownloads.guardarBase64(nombre, mime, base64)` y aquí se
 * interceptan los clics de los enlaces Blob (CSV, PDF de jsPDF, respaldo JSON)
 * para enviarlos al puente nativo. Los enlaces http(s) los maneja el
 * DownloadManager desde Java.
 */

const tienePuenteNativo = () =>
  typeof window !== 'undefined' && !!window.AndroidDownloads;

function blobABase64(blob) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      const resultado = String(lector.result || '');
      resolve(resultado.slice(resultado.indexOf(',') + 1));
    };
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(blob);
  });
}

/**
 * Guarda un Blob con el nombre indicado.
 * @returns {Promise<'nativo'|'web'>}
 */
export async function guardarBlob(blob, nombre) {
  if (tienePuenteNativo()) {
    const base64 = await blobABase64(blob);
    window.AndroidDownloads.guardarBase64(
      nombre,
      blob.type || 'application/octet-stream',
      base64
    );
    return 'nativo';
  }

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'web';
}

/**
 * Activa la interceptación de descargas Blob en la app nativa. Idempotente.
 * Se llama una vez al arrancar (`main.jsx`).
 */
export function instalarDescargasNativas() {
  if (!tienePuenteNativo() || window.__descargasNativasInstaladas) return;
  window.__descargasNativasInstaladas = true;

  const clicOriginal = HTMLAnchorElement.prototype.click;

  HTMLAnchorElement.prototype.click = function () {
    const href = this.href || '';
    // Solo los enlaces de descarga generados en memoria (exportaciones).
    if (this.download && href.startsWith('blob:')) {
      fetch(href)
        .then((respuesta) => respuesta.blob())
        .then((blob) => guardarBlob(blob, this.download))
        .catch(() => clicOriginal.call(this));
      return undefined;
    }
    return clicOriginal.call(this);
  };
}
