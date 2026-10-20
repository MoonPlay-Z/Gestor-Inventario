import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

/**
 * Formatos que se intentan decodificar. Restringir la lista acelera el lector
 * y reduce los falsos positivos (un QR no se confunde con un EAN).
 */
const FORMATOS_ZXING = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.PDF_417,
];

/** Lector ZXing con `TRY_HARDER` y un barrido cada 120 ms (antes 500 ms). */
const crearLector = () => {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATOS_ZXING);
  hints.set(DecodeHintType.TRY_HARDER, true);
  return new BrowserMultiFormatReader(hints, 120);
};

/**
 * Hook reutilizable de escáner de códigos de barras / QR con la cámara.
 *
 * Extraído de `VisorPreciosPage` para que POS, Visor y cualquier otra pantalla
 * compartan la misma lógica (una sola fuente de verdad). Maneja:
 *   - apertura de cámara (prefiere la trasera en móvil),
 *   - decodificación continua con ZXing,
 *   - errores legibles (permiso, sin cámara, HTTPS, en uso),
 *   - limpieza del lector al desmontar.
 *
 * Uso:
 *   const scanner = useBarcodeScanner({ onDetect: (code) => ... });
 *   // scanner.videoRef  -> <video ref={scanner.videoRef} />
 *   // scanner.start() / scanner.stop()
 *   // scanner.cameraActive / cameraError / scanning
 */
export function useBarcodeScanner({ onDetect } = {}) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const scanningRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);

  // Mantener el callback fresco sin recrear el lector en cada cambio.
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;

  const stop = useCallback(() => {
    scanningRef.current = false;
    setScanning(false);
    if (readerRef.current) {
      try { readerRef.current.reset(); } catch (_) {}
      readerRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const start = useCallback(async () => {
    setCameraError(null);
    setScanning(false);
    scanningRef.current = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')
          ? '⚠️ La cámara requiere HTTPS. Accede usando https:// en lugar de http://'
          : 'Tu navegador no soporta acceso a la cámara. Usa Chrome o Firefox actualizado.'
      );
      return;
    }

    try {
      if (readerRef.current) {
        try { readerRef.current.reset(); } catch (_) {}
        readerRef.current = null;
      }

      setCameraActive(true);

      // Espera a que el <video> esté montado en el DOM.
      await new Promise((r) => setTimeout(r, 200));
      if (!videoRef.current) {
        setCameraError('Error interno: el elemento de video no está listo.');
        setCameraActive(false);
        return;
      }

      const reader = crearLector();
      readerRef.current = reader;

      // Preferir cámara trasera (back/rear/environment) en móvil.
      let deviceId;
      try {
        const devices = await reader.listVideoInputDevices();
        const back = devices.find((d) =>
          /back|rear|environment|trasera|posterior/i.test(d.label)
        ) || devices[devices.length - 1] || devices[0];
        deviceId = back?.deviceId || null;
      } catch (_) {
        deviceId = null;
      }

      setScanning(true);
      scanningRef.current = true;

      const handleResult = (result) => {
        if (!scanningRef.current) return;
        const code = result?.getText();
        if (code) {
          scanningRef.current = false;
          setScanning(false);
          onDetectRef.current?.(code);
        }
      };

      // 1080p: el fotograma que analiza ZXing es el de la cámara, así que con
      // más resolución se leen códigos pequeños o a distancia. `ideal` nunca
      // rompe la apertura: el navegador elige la resolución soportada más cercana.
      await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' } }),
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            advanced: [{ focusMode: 'continuous' }],
          },
        },
        videoRef.current,
        handleResult
      );
    } catch (err) {
      console.error('Error abriendo cámara:', err);
      scanningRef.current = false;
      setScanning(false);
      setCameraActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('❌ Permiso de cámara denegado. Ve a Ajustes → Permisos → Cámara y permite el acceso.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('❌ No se encontró ninguna cámara en este dispositivo.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('❌ La cámara está siendo usada por otra app. Ciérrala e intenta de nuevo.');
      } else if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
        setCameraError('⚠️ La cámara requiere HTTPS. Accede con https:// en el navegador.');
      } else {
        setCameraError('❌ No se pudo abrir la cámara: ' + (err.message || err.name));
      }
    }
  }, []);

  // Limpieza al desmontar.
  useEffect(() => () => stop(), [stop]);

  return { videoRef, cameraActive, cameraError, scanning, start, stop };
}
