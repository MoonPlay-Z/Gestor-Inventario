import React from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import downloadIcon from '@iconify/icons-mdi/download';
import shieldIcon from '@iconify/icons-mdi/shield-check-outline';
import alertIcon from '@iconify/icons-mdi/alert-circle-outline';
import { ESTADOS } from '../../features/actualizaciones/domain/maquinaEstados.js';
import { useActualizacion } from '../../features/actualizaciones/ui/useActualizacion';
import { formatearTamano } from '../../services/actualizaciones';
import styles from './ActualizarApk.module.css';

/* =========================================================================
   Aviso de actualización de la APK (presentación)
   -------------------------------------------------------------------------
   No aparece durante una venta (`/pos`, `/caja`) ni con ventas pendientes de
   sincronizar, y nunca bloquea el trabajo salvo que el manifiesto declare
   `minVersionCode` (actualización obligatoria). Toda la lógica está en
   `useActualizacion`; este archivo solo decide qué se pinta.
   ========================================================================= */

const TEXTOS_FASE = {
  [ESTADOS.DESCARGANDO]: (version) => `Descargando la versión ${version}…`,
  [ESTADOS.VERIFICANDO]: () => 'Comprobando la integridad del archivo…',
  [ESTADOS.INSTALANDO]: () => 'Abriendo el instalador de Android…',
  [ESTADOS.PERMISO]: () => 'Permite instalar apps desde GestorPOS',
  [ESTADOS.ERROR]: () => 'No se pudo completar la actualización',
};

export function ActualizarApk() {
  const location = useLocation();
  const { aviso, fase, progreso, error, nota, obligatoria, ocupado, puedeCerrar, acciones } =
    useActualizacion({ ruta: location.pathname });

  if (!aviso) return null;

  const { manifiesto, instalada } = aviso;
  const tamano = formatearTamano(manifiesto.size);
  const textoFase = TEXTOS_FASE[fase]?.(manifiesto.versionName) || '';
  const descargando = fase === ESTADOS.DESCARGANDO || fase === ESTADOS.VERIFICANDO;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="act-titulo">
      <div className={styles.card}>
        <div className={styles.head}>
          <span className={styles.icono}>
            <Icon icon={downloadIcon} width={26} height={26} />
          </span>
          <div>
            <h2 id="act-titulo" className={styles.titulo}>
              {obligatoria ? 'Actualización obligatoria' : 'Nueva versión disponible'}
            </h2>
            <p className={styles.version}>
              GestorPOS {manifiesto.versionName}
              {manifiesto.publishedAt ? ` · ${manifiesto.publishedAt}` : ''}
            </p>
          </div>
        </div>

        <div className={styles.cuerpo}>
          {fase === ESTADOS.AVISO && (
            <>
              <p className={styles.texto}>
                Tienes la versión <strong>{instalada.versionName}</strong>
                {tamano ? ` y la nueva ocupa ${tamano}` : ''}. La instalación conserva tus datos,
                la sesión y la caja abierta.
              </p>

              {nota && (
                <p className={styles.avisoForzado} role="status">
                  <Icon icon={alertIcon} width={18} height={18} />
                  {nota}
                </p>
              )}

              {manifiesto.notes.length > 0 && (
                <ul className={styles.notas}>
                  {manifiesto.notes.map((texto, i) => (
                    <li key={i}>{texto}</li>
                  ))}
                </ul>
              )}

              {obligatoria && (
                <p className={styles.avisoForzado}>
                  <Icon icon={alertIcon} width={18} height={18} />
                  Esta versión es necesaria para seguir operando con el servidor.
                </p>
              )}

              <p className={styles.seguridad}>
                <Icon icon={shieldIcon} width={16} height={16} />
                Se verifica la huella del archivo y la firma antes de instalar.
              </p>
            </>
          )}

          {descargando && (
            <div className={styles.progreso}>
              <p className={styles.texto}>{textoFase}</p>
              <div className={styles.barra}>
                <span
                  className={styles.barraRelleno}
                  style={{ width: `${fase === ESTADOS.VERIFICANDO ? 100 : Math.max(progreso, 2)}%` }}
                />
              </div>
              <span className={styles.porcentaje}>
                {fase === ESTADOS.VERIFICANDO ? 'Verificando…' : `${progreso}%`}
              </span>
            </div>
          )}

          {fase === ESTADOS.INSTALANDO && <p className={styles.texto}>{textoFase}</p>}

          {fase === ESTADOS.PERMISO && (
            <>
              <p className={styles.texto}>
                Android pide autorización para instalar la actualización. Actívala y vuelve a esta
                pantalla.
              </p>
              <p className={styles.seguridad}>
                <Icon icon={shieldIcon} width={16} height={16} />
                Ajustes → Apps → GestorPOS → Instalar apps desconocidas.
              </p>
            </>
          )}

          {fase === ESTADOS.ERROR && (
            <>
              <p className={styles.error}>{error || 'Inténtalo de nuevo.'}</p>
              <p className={styles.seguridad}>
                Si sigue fallando, descarga la APK desde la página de descargas.
              </p>
            </>
          )}
        </div>

        <div className={styles.pie}>
          {fase === ESTADOS.AVISO && (
            <>
              {!obligatoria && (
                <button type="button" className={styles.secundario} onClick={acciones.aplazar}>
                  Más tarde
                </button>
              )}
              <button type="button" className={styles.primario} onClick={acciones.actualizar}>
                Actualizar ahora
              </button>
            </>
          )}

          {descargando && (
            <button type="button" className={styles.secundario} onClick={acciones.cerrar}>
              Cancelar descarga
            </button>
          )}

          {fase === ESTADOS.INSTALANDO && (
            <button type="button" className={styles.secundario} onClick={acciones.cerrar}>
              Volver
            </button>
          )}

          {fase === ESTADOS.PERMISO && (
            <>
              <button
                type="button"
                className={styles.secundario}
                onClick={acciones.abrirAjustes}
              >
                Abrir ajustes
              </button>
              <button type="button" className={styles.primario} onClick={acciones.continuar}>
                Continuar instalación
              </button>
            </>
          )}

          {fase === ESTADOS.ERROR && (
            <>
              {!obligatoria && (
                <button type="button" className={styles.secundario} onClick={acciones.aplazar}>
                  Más tarde
                </button>
              )}
              <button type="button" className={styles.primario} onClick={acciones.reintentar}>
                Reintentar
              </button>
            </>
          )}

          {ocupado && <span className={styles.pista}>No cierres la app</span>}
        </div>

        {puedeCerrar && (
          <button
            type="button"
            className={styles.cerrar}
            onClick={acciones.cerrar}
            aria-label="Cerrar aviso de actualización"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default ActualizarApk;
