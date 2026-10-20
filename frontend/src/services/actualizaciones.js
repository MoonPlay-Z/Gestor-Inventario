/* =========================================================================
   Actualizaciones de la APK — fachada
   -------------------------------------------------------------------------
   Este archivo solo compone piezas: dominio puro (`features/actualizaciones/
   domain`), caso de uso y adaptadores. Se mantiene la API pública anterior
   para no romper a quien ya la importaba (`DescargarPage`, el aviso, etc.).

   Flujo: el manifiesto /descargas/version.json dice cuál es la última versión
   publicada. La app lo consulta como máximo una vez al día (o tras un fallo,
   otro día), compara `versionCode` con el instalado y, si hay una nueva,
   muestra el aviso. La descarga y la instalación las hace el puente nativo
   `window.AndroidUpdates` (MainActivity): DownloadManager + SHA-256 + firma.
   ========================================================================= */
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

import { validarManifiesto } from '../features/actualizaciones/domain/manifiesto.js';
import { CLAVES, crearComprobarActualizacion } from '../features/actualizaciones/application/comprobarActualizacion.js';
import { crearManifiestoHttp } from '../features/actualizaciones/adapters/manifiestoHttp';
import { crearRevisionStoreLocal } from '../features/actualizaciones/adapters/revisionStoreLocal';
import {
  crearInstaladorNativo,
  crearInstaladorNulo,
  crearLectorVersion,
} from '../features/actualizaciones/adapters/puenteAndroid';

export { validarManifiesto };

const ESPERA_ANTES_DE_REVISAR = 5000; // no competir con el arranque/login

/**
 * Origen del sitio donde se publican el APK y el manifiesto. En la app nativa
 * no sirve una ruta relativa (`/descargas/...`): el WebView sirve el dist
 * empaquetado y devolvería la versión vieja. En la web se usa el mismo origen.
 */
export const SITIO_ACTUALIZACIONES = (import.meta.env.VITE_UPDATE_URL || '').replace(/\/+$/, '');

export const urlManifiesto = () => {
  const dia = new Date().toISOString().slice(0, 10);
  // Permite alojar el manifiesto fuera del sitio (CDN, GitHub, etc.).
  const directa = import.meta.env.VITE_UPDATE_MANIFEST_URL;
  if (directa) {
    return `${directa}${directa.includes('?') ? '&' : '?'}d=${dia}`;
  }
  const hoy = SITIO_ACTUALIZACIONES || '';
  return `${hoy}/descargas/version.json?d=${dia}`;
};

export const esNativo = () => Capacitor.isNativePlatform();

const instalador = esNativo() ? crearInstaladorNativo() : crearInstaladorNulo();
const lectorVersion = crearLectorVersion({ app: App, esNativo });
const store = crearRevisionStoreLocal();
const reloj = { ahora: () => Date.now() };
const manifiestos = crearManifiestoHttp({ url: urlManifiesto });

/** Solo se avisa fuera de una venta y sin ventas pendientes de enviar. */
export async function hayVentasPendientes() {
  if (!esNativo()) return false;
  try {
    const { obtenerPendientes } = await import('./outbox');
    const pendientes = await obtenerPendientes();
    return Array.isArray(pendientes) && pendientes.length > 0;
  } catch {
    return false;
  }
}

const comprobar = crearComprobarActualizacion({
  manifiestos,
  store,
  reloj,
  lectorVersion,
  ventasPendientes: hayVentasPendientes,
});

export const hayPuenteActualizaciones = () => instalador.disponible();

/** Versión instalada según Android (`build` = versionCode). */
export const versionInstalada = () => lectorVersion.obtener();

/**
 * Consulta el manifiesto respetando el throttle diario.
 * Devuelve `{ instalada, manifiesto, obligatoria }` o `null`.
 */
export async function comprobarActualizacion({ forzar = false } = {}) {
  if (!esNativo()) return null;
  return comprobar({ forzar });
}

/** El usuario eligió «Más tarde»: no volver a avisar de esa versión. */
export function aplazarActualizacion(versionCode) {
  store.guardar(CLAVES.DESCARTADA, versionCode);
}

export const descargarActualizacion = (manifiesto) => instalador.descargar(manifiesto);
export const estadoActualizacion = () => instalador.estado();
export const instalarActualizacion = () => instalador.instalar();
export const abrirAjustesInstalacion = () => instalador.ajustes();
export const cancelarActualizacion = () => instalador.cancelar();

/** «9,4 MB» sin depender del idioma del sistema. */
export function formatearTamano(bytes) {
  const mb = Number(bytes) / (1024 * 1024);
  if (!Number.isFinite(mb) || mb <= 0) return '';
  return `${mb.toFixed(1).replace('.', ',')} MB`;
}

export { ESPERA_ANTES_DE_REVISAR };
