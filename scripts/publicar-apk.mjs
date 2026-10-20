#!/usr/bin/env node
/**
 * Publica una nueva APK de GestorPOS.
 *
 *   npm run apk:publicar -- --bump --notas "Escáner más preciso" --notas "Visor nuevo"
 *
 * Qué hace, en este orden (y nunca a medias):
 *   1. Bloquea la publicación (un solo proceso a la vez).
 *   2. Lee versionCode/versionName de build.gradle; con --bump los incrementa.
 *   3. Se niega a publicar si el versionCode no es mayor que el ya publicado
 *      (colisión) o si falta la firma de release (sin ella la actualización
 *      no se puede instalar encima).
 *   4. Saca la APK anterior de public/descargas (si no, se embebería dentro de
 *      la nueva y crecería varios MB).
 *   5. Compila la web con Capacitor y la APK de release.
 *   6. Copia la APK, calcula tamaño y SHA-256, y escribe version.json de forma
 *      atómica (archivo temporal + rename).
 *   7. Recompila la web para que el despliegue incluya APK + manifiesto.
 *
 * Opciones:
 *   --bump             Sube versionCode +1 y el último número de versionName.
 *   --notas "texto"    Nota de la versión (repetible). Si se omite se conserva
 *                      la del manifiesto anterior.
 *   --forzar <código>  minVersionCode: por debajo de eso la actualización es
 *                      obligatoria (modal sin «Más tarde»).
 *   --sin-build        Usa la APK ya compilada en android/app/build/outputs.
 *   --sin-web          No recompila la web al final.
 *   --republicar       Permite reemplazar el manifiesto con el mismo versionCode
 *                      (solo para rehacer una compilación fallida).
 *   --sitio <url>      Origen público del APK (por defecto, el VITE_UPDATE_URL de
 *                      .env.capacitor; si no, el de sitemap.xml).
 */

import { execFileSync } from 'node:child_process';
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FRONTEND = join(RAIZ, 'frontend');
const DESCARGA = join(FRONTEND, 'public', 'descargas');
const APK_PUBLICA = join(DESCARGA, 'gestorpos-android.apk');
const MANIFIESTO = join(DESCARGA, 'version.json');
const GRADLE = join(FRONTEND, 'android', 'app', 'build.gradle');
const APK_COMPILADA = join(FRONTEND, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const LOCK = join(RAIZ, '.publicar-apk.lock');
const SITIO_POR_DEFECTO = 'https://gestor-pos.netlify.app';

const rojo = (t) => `\x1b[31m${t}\x1b[0m`;
const verde = (t) => `\x1b[32m${t}\x1b[0m`;
const azul = (t) => `\x1b[36m${t}\x1b[0m`;
const amarillo = (t) => `\x1b[33m${t}\x1b[0m`;

const salir = (mensaje) => {
  console.error(rojo(`\n✖ ${mensaje}\n`));
  liberarLock();
  process.exit(1);
};

// ─── Argumentos ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const opcion = (nombre, defecto = null) => {
  const indice = args.indexOf(`--${nombre}`);
  return indice >= 0 && args[indice + 1] && !args[indice + 1].startsWith('--')
    ? args[indice + 1]
    : defecto;
};
const bandera = (nombre) => args.includes(`--${nombre}`);
const notas = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--notas' && args[i + 1]) notas.push(args[i + 1]);
}

const bump = bandera('bump');
const sinBuild = bandera('sin-build');
const sinWeb = bandera('sin-web');
const republicar = bandera('republicar');
const forzar = Number(opcion('forzar', '0')) || 0;
// El origen del APK debe ser el mismo que consulta la app (VITE_UPDATE_URL):
// si no coinciden, el manifiesto apunta a un host que quizá no exista.
const sitio = (
  opcion('sitio') ||
  sitioDeEnvCapacitor() ||
  sitioDeSitemap() ||
  SITIO_POR_DEFECTO
).replace(/\/+$/, '');

function sitioDeEnvCapacitor() {
  try {
    const env = readFileSync(join(FRONTEND, '.env.capacitor'), 'utf8');
    const match = env.match(/^\s*VITE_UPDATE_URL\s*=\s*(\S+)\s*$/m);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function sitioDeSitemap() {
  try {
    const xml = readFileSync(join(FRONTEND, 'public', 'sitemap.xml'), 'utf8');
    const match = xml.match(/<loc>(https:\/\/[^/]+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// ─── Bloqueo (dos publicaciones a la vez escribirían el mismo manifiesto) ──
let lockTomado = false;
function tomarLock() {
  try {
    const descriptor = openSync(LOCK, 'wx');
    writeFileSync(descriptor, String(process.pid));
    closeSync(descriptor);
    lockTomado = true;
  } catch {
    // Si quedó un lock huérfano de hace más de una hora, se descarta.
    try {
      const edad = Date.now() - statSync(LOCK).mtimeMs;
      if (edad > 60 * 60 * 1000) {
        rmSync(LOCK, { force: true });
        tomarLock();
        return;
      }
    } catch {
      /* sin lock que inspeccionar */
    }
    salir('Ya hay una publicación en curso (.publicar-apk.lock). Espera o bórralo.');
  }
}
function liberarLock() {
  if (lockTomado) {
    rmSync(LOCK, { force: true });
    lockTomado = false;
  }
}
process.on('SIGINT', () => {
  liberarLock();
  process.exit(130);
});

// ─── Versión en Gradle ─────────────────────────────────────────────────────
function leerGradle() {
  const texto = readFileSync(GRADLE, 'utf8');
  const versionCode = Number((texto.match(/versionCode\s+(\d+)/) || [])[1]);
  const versionName = (texto.match(/versionName\s+"([^"]+)"/) || [])[1];
  if (!Number.isInteger(versionCode) || !versionName) {
    salir('No pude leer versionCode/versionName de frontend/android/app/build.gradle.');
  }
  return { texto, versionCode, versionName };
}

function subirVersion(texto, versionCode, versionName) {
  const partes = versionName.split('.');
  if (partes.length === 1) {
    partes.push('1');
  } else {
    const ultimo = Number(partes[partes.length - 1]);
    partes[partes.length - 1] = String(Number.isInteger(ultimo) ? ultimo + 1 : 1);
  }
  const nuevoNombre = partes.join('.');
  const nuevoCodigo = versionCode + 1;

  const actualizado = texto
    .replace(/versionCode\s+\d+/, `versionCode ${nuevoCodigo}`)
    .replace(/versionName\s+"[^"]+"/, `versionName "${nuevoNombre}"`);

  writeFileSync(GRADLE, actualizado, 'utf8');
  return { versionCode: nuevoCodigo, versionName: nuevoNombre };
}

// ─── Utilidades ────────────────────────────────────────────────────────────
const ejecutar = (comando, argumentos, cwd) => {
  console.log(azul(`\n$ ${comando} ${argumentos.join(' ')}  (${cwd})`));
  execFileSync(comando, argumentos, { cwd, stdio: 'inherit' });
};

const sha256 = (archivo) =>
  createHash('sha256').update(readFileSync(archivo)).digest('hex');

const fechaVenezuela = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });

const memoria = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// ─── Publicación ───────────────────────────────────────────────────────────
tomarLock();

mkdirSync(DESCARGA, { recursive: true });

let { texto, versionCode, versionName } = leerGradle();
if (bump) {
  ({ versionCode, versionName } = subirVersion(texto, versionCode, versionName));
  console.log(verde(`\n▲ Versión subida a ${versionName} (versionCode ${versionCode}).`));
}

// Colisión: nunca dos APK con el mismo versionCode (Android no la instalaría).
let publicado = null;
if (existsSync(MANIFIESTO)) {
  try {
    publicado = JSON.parse(readFileSync(MANIFIESTO, 'utf8'));
  } catch {
    salir('El version.json actual está dañado; revísalo antes de publicar.');
  }
}
if (!republicar && publicado && Number(publicado.versionCode) >= versionCode) {
  salir(
    `El versionCode ${versionCode} no es mayor que el ya publicado (${publicado.versionCode}).\n` +
      '  Usa --bump o sube versionCode/versionName en build.gradle.\n' +
      '  (--republicar solo si estás reemplazando una compilación fallida de la misma versión.)',
  );
}
if (forzar && forzar > versionCode) {
  salir(`--forzar ${forzar} no puede superar el versionCode que se publica (${versionCode}).`);
}

// Firma: sin la keystore, Android rechaza la actualización sobre la app instalada.
const keystoreProps = join(FRONTEND, 'android', 'keystore.properties');
if (!existsSync(keystoreProps)) {
  salir(
    'Falta frontend/android/keystore.properties. Sin la firma de release la APK no\n' +
      '  puede instalarse como actualización. Restaura la keystore (respáldala) y reintenta.',
  );
}
const propiedades = readFileSync(keystoreProps, 'utf8');
const rutaKeystore = (propiedades.match(/storeFile\s*=\s*(.+)/) || [])[1]?.trim();
// `file(...)` en app/build.gradle resuelve contra frontend/android/app.
const keystoreEnDisco = rutaKeystore
  ? resolve(join(FRONTEND, 'android', 'app'), rutaKeystore)
  : null;
if (!keystoreEnDisco || !existsSync(keystoreEnDisco)) {
  salir(`No encuentro la keystore declarada en keystore.properties (${rutaKeystore || 'sin ruta'}).`);
}

const notasFinales = notas.length
  ? notas.map((n) => n.trim()).filter(Boolean)
  : Array.isArray(publicado?.notes)
    ? publicado.notes
    : [];

if (!sinBuild) {
  // La APK anterior dentro de public/ se embebería en la nueva.
  if (existsSync(APK_PUBLICA)) {
    const respaldo = join(tmpdir(), `gestorpos-apk-${Date.now()}.apk`);
    renameSync(APK_PUBLICA, respaldo);
    console.log(amarillo(`↪ APK anterior apartada: ${respaldo}`));
  }
  ejecutar('npm', ['run', 'build:capacitor'], FRONTEND);
  ejecutar('npm', ['run', 'build:android:release'], FRONTEND);
}

if (!existsSync(APK_COMPILADA)) {
  salir(`No existe la APK compilada: ${APK_COMPILADA}`);
}

copyFileSync(APK_COMPILADA, APK_PUBLICA);
const tamano = statSync(APK_PUBLICA).size;
const huella = sha256(APK_PUBLICA);

const manifiesto = {
  versionCode,
  versionName,
  url: `${sitio}/descargas/gestorpos-android.apk`,
  size: tamano,
  sha256: huella,
  publishedAt: fechaVenezuela(),
  minVersionCode: forzar || 0,
  notes: notasFinales,
};

// Escritura atómica: el manifiesto nunca queda a medias para quien lo lea.
const temporal = `${MANIFIESTO}.tmp`;
writeFileSync(temporal, `${JSON.stringify(manifiesto, null, 2)}\n`, 'utf8');
renameSync(temporal, MANIFIESTO);

if (!sinWeb) {
  ejecutar('npm', ['run', 'build'], FRONTEND);
}

liberarLock();

console.log(verde('\n✔ APK publicada'));
console.log(`  Versión:      ${manifiesto.versionName} (versionCode ${manifiesto.versionCode})`);
console.log(`  Tamaño:       ${memoria(tamano)}`);
console.log(`  SHA-256:      ${huella}`);
console.log(`  Descarga:     ${manifiesto.url}`);
console.log(`  Manifiesto:   frontend/public/descargas/version.json`);
if (manifiesto.minVersionCode) {
  console.log(amarillo(`  Obligatoria:  para versionCode < ${manifiesto.minVersionCode}`));
}
console.log(
  azul(
    '\nSiguiente paso: desplegar la web (Netlify) para que el manifiesto y la APK\n' +
      'queden publicados. Las apps instaladas avisarán en su próxima revisión diaria.\n',
  ),
);
