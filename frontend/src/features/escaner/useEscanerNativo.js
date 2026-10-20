/* =========================================================================
   Hook del escáner nativo (ML Kit)
   -------------------------------------------------------------------------
   Separa el ciclo de vida de la cámara del componente que la pinta:
   - inicio/parada de `startScan` y del listener de códigos,
   - botón atrás de Android (cierra el escáner en vez de abandonar la página),
   - segundo plano (suelta la cámara y la recupera al volver),
   - linterna y zoom.
   ========================================================================= */
import { useCallback, useEffect, useRef, useState } from 'react';
import { App } from '@capacitor/app';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { FORMATOS_COMERCIALES, textoDelCodigo } from '../../utils/lectorCodigos';

const CLASE_FONDO = 'barcode-scanner-active';

export function useEscanerNativo({ activo, onCodigo, onCerrar, onError }) {
  const [estado, setEstado] = useState('iniciando'); // iniciando | listo | error
  const [mensaje, setMensaje] = useState('');
  const [linterna, setLinterna] = useState(false);
  const [zoom, setZoom] = useState(null); // { min, max, actual }

  const onCodigoRef = useRef(onCodigo);
  const onErrorRef = useRef(onError);
  const onCerrarRef = useRef(onCerrar);
  onCodigoRef.current = onCodigo;
  onErrorRef.current = onError;
  onCerrarRef.current = onCerrar;

  const zoomRef = useRef(null);

  useEffect(() => {
    if (!activo) return undefined;

    let vivo = true;
    let listener = null;
    let camaraActiva = false;
    let leido = false;
    let historialPropio = false;

    setEstado('iniciando');
    setMensaje('');
    setLinterna(false);
    setZoom(null);
    zoomRef.current = null;

    // La cámara nativa se dibuja detrás del WebView: hay que quitar también el
    // fondo del <html> (`:root` en main.css), porque su color se propaga al
    // lienzo de la página y taparía la cámara aunque <body> esté oculto.
    const fondoActivo = () => {
      document.documentElement.classList.add(CLASE_FONDO);
      document.body.classList.add(CLASE_FONDO);
    };
    const fondoInactivo = () => {
      document.documentElement.classList.remove(CLASE_FONDO);
      document.body.classList.remove(CLASE_FONDO);
    };

    const iniciar = async () => {
      if (!vivo || camaraActiva) return;
      try {
        const permiso = await BarcodeScanner.requestPermissions();
        if (!vivo) return;
        if (permiso.camera !== 'granted') {
          throw new Error('Permiso de cámara denegado. Actívalo en Ajustes → Permisos → Cámara.');
        }

        fondoActivo();

        if (!listener) {
          listener = await BarcodeScanner.addListener('barcodesScanned', (evento) => {
            if (!vivo || leido) return;
            const codigo = (evento.barcodes || []).find((b) => textoDelCodigo(b));
            if (!codigo) return;
            leido = true;
            try { navigator.vibrate?.(40); } catch (_) {}
            onCodigoRef.current?.(textoDelCodigo(codigo), codigo);
          });
        }

        if (!vivo) return;
        await BarcodeScanner.startScan({ formats: FORMATOS_COMERCIALES, lensFacing: 'BACK' });
        camaraActiva = true;
        if (!vivo) return;

        setEstado('listo');

        // Zoom del sensor (ayuda con códigos pequeños o en estanterías).
        try {
          const { zoomRatio: max } = await BarcodeScanner.getMaxZoomRatio();
          const { zoomRatio: min } = await BarcodeScanner.getMinZoomRatio();
          if (vivo && max > min) {
            zoomRef.current = { min, max, actual: min };
            setZoom(zoomRef.current);
          }
        } catch (_) {
          zoomRef.current = null;
          if (vivo) setZoom(null);
        }
      } catch (err) {
        if (!vivo) return;
        camaraActiva = false;
        setEstado('error');
        setMensaje(err?.message || 'No se pudo abrir la cámara.');
        fondoInactivo();
        onErrorRef.current?.(err);
      }
    };

    const detener = async () => {
      camaraActiva = false;
      try { await BarcodeScanner.stopScan(); } catch (_) {}
      if (listener) {
        try { await listener.remove(); } catch (_) {}
        listener = null;
      }
      fondoInactivo();
    };

    iniciar();

    // Botón atrás de Android: con una entrada propia en el historial, el gesto
    // cierra el escáner en lugar de salir del POS (que perdería el carrito).
    historialPropio = true;
    window.history.pushState({ escaner: true }, '');
    const alVolverAtras = () => {
      if (!historialPropio) return;
      historialPropio = false;
      onCerrarRef.current?.();
    };
    window.addEventListener('popstate', alVolverAtras);

    // Segundo plano: se suelta la cámara (batería + indicador) y se recupera
    // al volver, en vez de dejar el PreviewView congelado en negro.
    let quitarApp = null;
    App.addListener('appStateChange', ({ isActive }) => {
      if (!vivo) return;
      if (isActive) iniciar();
      else detener();
    }).then((handle) => {
      if (vivo) quitarApp = handle;
      else handle.remove();
    });

    return () => {
      vivo = false;
      window.removeEventListener('popstate', alVolverAtras);

      // Consume la entrada de historial que añadimos, salvo que ya la haya
      // consumido el botón atrás o que la app haya navegado a otro sitio.
      if (historialPropio && window.history.state?.escaner) {
        historialPropio = false;
        window.history.back();
      }

      quitarApp?.remove();
      detener();
    };
  }, [activo]);

  const alternarLinterna = useCallback(async () => {
    try {
      const { available } = await BarcodeScanner.isTorchAvailable();
      if (!available) {
        setMensaje('Este teléfono no tiene linterna disponible.');
        return;
      }
      await BarcodeScanner.toggleTorch();
      setLinterna((encendida) => !encendida);
    } catch (_) {
      setMensaje('No se pudo controlar la linterna.');
    }
  }, []);

  const cambiarZoom = useCallback((paso) => {
    const actual = zoomRef.current;
    if (!actual) return;
    const siguiente = Math.min(actual.max, Math.max(actual.min, Number((actual.actual + paso).toFixed(1))));
    const nuevo = { ...actual, actual: siguiente };
    zoomRef.current = nuevo;
    setZoom(nuevo);
    BarcodeScanner.setZoomRatio({ zoomRatio: siguiente }).catch(() => {});
  }, []);

  return { estado, mensaje, linterna, zoom, alternarLinterna, cambiarZoom };
}

export default useEscanerNativo;
