import { Capacitor } from '@capacitor/core';
import { BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

/**
 * Escáner de códigos con Google ML Kit (solo app nativa).
 *
 * Se usa el modo «cámara continua» de ML Kit (`startScan`): el fotograma se
 * analiza en el propio teléfono a 1920×1080 (ver parche en
 * `patches/@capacitor-mlkit+barcode-scanning+6.2.0.patch`) y un valor solo se
 * entrega cuando se ha leído **3 veces en fotogramas distintos**, lo que
 * descarta los falsos positivos (un EAN mal leído que igualmente pasa el dígito
 * de control). La pantalla del escáner la dibuja `EscanerMLKit`.
 *
 * En la web (PWA) no existe ML Kit: `escanerNativoDisponible()` es `false` y
 * cada pantalla usa la cámara interna de `useBarcodeScanner`.
 */

export const FORMATOS_COMERCIALES = [
  BarcodeFormat.Ean13,
  BarcodeFormat.Ean8,
  BarcodeFormat.UpcA,
  BarcodeFormat.UpcE,
  BarcodeFormat.Code128,
  BarcodeFormat.Code39,
  BarcodeFormat.Code93,
  BarcodeFormat.Itf,
  BarcodeFormat.Codabar,
  BarcodeFormat.DataMatrix,
  BarcodeFormat.Pdf417,
  BarcodeFormat.QrCode,
];

/** `true` solo dentro de la app instalada (Android/iOS). */
export const escanerNativoDisponible = () => Capacitor.isNativePlatform();

/**
 * Texto limpio del código: sin espacios ni saltos que algunos lectores añaden
 * y sin el prefijo «]C1» que usan los GS1-128.
 */
export function textoDelCodigo(codigo) {
  if (!codigo) return '';
  const crudo = String(codigo.rawValue || codigo.displayValue || '');
  return crudo.replace(/^\]C1/, '').replace(/\s+/g, '').trim();
}
