import React from 'react';
import { Icon } from '@iconify/react';
import { useEscanerNativo } from '../../features/escaner/useEscanerNativo';

/**
 * Pantalla de escaneo con ML Kit (app nativa).
 *
 * La cámara se dibuja **detrás** del WebView, así que mientras el escáner está
 * activo el documento queda invisible (`body.barcode-scanner-active`) y este
 * componente pinta encima el marco, la linterna, el zoom y el botón de cerrar.
 *
 * Toda la lógica (cámara, botón atrás, segundo plano) vive en
 * `useEscanerNativo`; aquí solo se pinta.
 *
 * Se debe montar siempre y controlarlo con `activo`: al pasar a `false` se
 * detiene la cámara y se restaura la pantalla.
 */
export function EscanerMLKit({ activo, titulo = 'Escanear código', onCodigo, onCerrar, onError }) {
  const { estado, mensaje, linterna, zoom, alternarLinterna, cambiarZoom } = useEscanerNativo({
    activo,
    onCodigo,
    onCerrar,
    onError,
  });

  if (!activo) return null;

  return (
    <div className="mlkit-scan" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="mlkit-scan__bar">
        <button type="button" className="mlkit-scan__btn" onClick={onCerrar} aria-label="Cerrar escáner">
          <Icon icon="mdi:close" />
        </button>
        <span className="mlkit-scan__titulo">{titulo}</span>
        <button
          type="button"
          className={`mlkit-scan__btn${linterna ? ' is-on' : ''}`}
          onClick={alternarLinterna}
          aria-label={linterna ? 'Apagar linterna' : 'Encender linterna'}
          aria-pressed={linterna}
        >
          <Icon icon={linterna ? 'mdi:flash' : 'mdi:flash-off'} />
        </button>
      </div>

      <div className="mlkit-scan__centro">
        <div className={`mlkit-scan__marco${estado === 'listo' ? ' is-activo' : ''}`}>
          <span className="mlkit-scan__linea" />
        </div>
        <p className="mlkit-scan__pista">
          {estado === 'iniciando'
            ? 'Encendiendo la cámara…'
            : estado === 'error'
              ? 'No se pudo iniciar el escáner'
              : 'Apunte al código de barras'}
        </p>
        {mensaje && <p className="mlkit-scan__aviso" role="alert">{mensaje}</p>}
      </div>

      <div className="mlkit-scan__pie">
        {zoom && (
          <div className="mlkit-scan__zoom" aria-label="Zoom de la cámara">
            <button type="button" className="mlkit-scan__btn mlkit-scan__btn--sm" onClick={() => cambiarZoom(-0.5)} aria-label="Alejar">
              <Icon icon="mdi:magnify-minus-outline" />
            </button>
            <span>{zoom.actual.toFixed(1)}×</span>
            <button type="button" className="mlkit-scan__btn mlkit-scan__btn--sm" onClick={() => cambiarZoom(0.5)} aria-label="Acercar">
              <Icon icon="mdi:magnify-plus-outline" />
            </button>
          </div>
        )}
        <p className="mlkit-scan__nota">Google ML Kit · se acepta el código tras 3 lecturas iguales</p>
      </div>
    </div>
  );
}

export default EscanerMLKit;
