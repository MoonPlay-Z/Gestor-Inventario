# Diseño móvil — GestorPOS

Adaptación del frontend a teléfonos **sin perder ninguna función**. No es un
escalado: se repiensa cada pantalla para el contexto real de uso (cajero de pie,
una mano, luz de local). La identidad azul-rey se conserva; cambia el
comportamiento.

> Superficie: **Operate** (el usuario completa una tarea). Prioridad de lectura,
> consistencia y expectativas nativas por encima de la expresión.

---

## 1. Diagnóstico (con evidencia)

Auditoría de las 28 páginas a 360–430 px. El armazón (Layout, Sidebar,
BottomNav, Header) ya estaba adaptado; el problema eran las **páginas**, que
heredaban layouts de escritorio de ancho fijo.

### Rompían al 100 % en móvil

| Página | Causa raíz | Estado |
|---|---|---|
| `LoginPage.jsx` | `grid-template-columns: minmax(320px,420px) 1fr` + `overflow:hidden` → formulario aplastado | ✅ |
| `RegisterPage.jsx` | idéntico | ✅ |
| `PagosSaaSPage.jsx` | idéntico | ✅ |
| `CotizacionesPage.jsx` (nueva) | inline `1fr 360px` sin breakpoint | ✅ |
| `ReportesPage.jsx` | 4 grids `minmax(400px,1fr)` > ancho útil | ✅ |
| `CierreTurnoModal.jsx` | `minmax(280px/320px,1fr)` dentro de modal + footer sin envolver | ✅ |

### Funcionaban con scroll horizontal pesado

`VentasPage`, `InventarioPage`, `CajaPage`, `AdminPage`, `ActivacionesPage`,
`PruebasFacturasPage` — tablas anchas sin transformación a tarjetas.

### Transversales

1. `.form-control` a 14 px → **auto-zoom de iOS** al enfocar.
2. `.btn-sm` / `.btn-icon` por debajo de **44 px**.
3. Clase `form-input` usada pero **nunca definida** → inputs sin estilo.
4. Sin transformación **tabla → tarjeta**.

### Bug crítico encontrado y corregido

`BottomNav.jsx` usaba `isActive` **fuera** del callback de `className` (en el
`<span>` de la etiqueta). Como el dock se renderiza siempre (aunque `md:hidden`
solo lo oculte con CSS), el `ReferenceError` **tumbaba cualquier página
protegida** en móvil. Se corrigió usando el render-prop de hijos de `NavLink`,
donde `isActive` sí está en ámbito. También se corrigió `PosPage.jsx`, que usaba
`useCallback` sin importarlo.

---

## 2. Principios

1. **Una mano, a la primera** — las acciones primarias van en la zona del pulgar.
2. **Cero scroll horizontal** — los datos se refluyen a tarjetas/hojas.
3. **Denso pero legible** — 16 px mínimo; el dinero (USD/VES) es protagonista.
4. **Estados de primera clase** — carga/vacío/error/offline con diseño propio.
5. **Nativo de tacto** — 44 px, hojas en vez de dropdowns, sin depender de hover.

---

## 3. Sistema (tokens)

Definidos en `frontend/src/css/movil.css` (importado tras `main.css`):

| Token | Valor |
|---|---|
| `--touch` | 44px (objetivo táctil mínimo) |
| `--dock-h` | 56px (barra inferior) |
| `--safe-*` | `env(safe-area-inset-*)` |
| Inputs | `font-size: 16px !important` en ≤767px (vence estilos en línea) |
| Breakpoints | base ≤767 (móvil) · 768–1023 (tablet) · ≥1024 (escritorio/POS 2 col) |

`index.html`: viewport con **`viewport-fit=cover`** (sin esto las safe-areas no
funcionan en iPhone con notch).

---

## 4. Componentes

| Componente | Archivo | Rol |
|---|---|---|
| `ResponsiveTables` | `components/layout/ResponsiveTables.jsx` | Copia la cabecera de cada tabla a `data-label`; el CSS la apila como tarjetas en móvil. **Cero columnas perdidas**: en escritorio sigue siendo tabla. |
| `useMediaQuery` | `hooks/useMediaQuery.js` | Alterna escritorio/móvil sin duplicar lógica de negocio. |

CSS relevante: `.rt-cards` (tabla→tarjeta), `.auth-split` (pago SaaS),
`.split-360` (cotizaciones), `.pos-cobro-panel` (panel de cobro) y
`.pos-mobile-bar`.

---

## 5. POS rediseñado (prioridad)

- Panel de cobro: **columna lateral** en escritorio → **hoja inferior** en móvil.
  Es la **misma instancia del DOM** (`.pos-cobro-panel` cambia de `sticky` a
  `fixed`); no se duplica el formulario ni las claves de idempotencia.
- **Barra de cobro** fija sobre el dock: total en `$` + `Bs.` y botón **Cobrar**
  siempre al alcance del pulgar.
- El carrito se convierte en tarjetas vía `ResponsiveTables`.
- La hoja se cierra sola al vaciarse el carrito (venta emitida, guardada offline
  o borrada).
- Corregido bug latente: `PosPage.jsx` usaba `useCallback` sin importarlo.

---

## 6. Matriz de preservación de funciones

| Página | Función | Cómo sobrevive en móvil |
|---|---|---|
| Login/Registro/Pago SaaS | Formularios completos | Login y registro: tarjetas apiladas (`AuthLayout`). Pago SaaS: split colapsa a 1 columna y se oculta solo el panel **decorativo** |
| Cotizaciones | Panel de resumen | Colapsa bajo el detalle |
| Reportes | 4 bloques de gráficos | Apilan a 1 columna |
| Cierre de turno | Arqueo + verificación | Tarjetas a 1 columna; footer envuelve |
| Ventas/Caja/Admin/etc. | Todas las columnas | Tarjetas con etiqueta de columna (mismo dato) |
| POS | Todo el flujo de venta | Barra + hoja inferior; mismas acciones |

**Ninguna ruta, permiso ni contrato de API cambia.** Los cambios son de
presentación (CSS + atributos `data-label` + envoltorios), aditivos y por página.

---

## 7. Verificación

### 7.1 Automatizada (Playwright, API simulada)

Sobre el build de producción servido con `vite preview`, a 360 / 390 / 430 px y
escritorio 1280 px, con API simulada (cero escrituras en bases de datos):

| Comprobación | Resultado |
|---|---|
| `npm run build` | ✅ sin errores |
| Desborde horizontal (`scrollWidth - innerWidth`) | ✅ 0 en login, landing y POS (360/390/430/1280) |
| Errores de página (`pageerror`) | ✅ 0 |
| Tabla → tarjetas (carrito POS) | ✅ `table.rt-cards`, `display: block`, `data-label="Producto"` |
| Barra de cobro móvil | ✅ visible con ítems (no en escritorio) |
| Hoja de cobro | ✅ `position: fixed`, abre con «Cobrar», borde inferior = alto del viewport (844) |
| POS escritorio | ✅ 2 columnas (`544px 360px`), panel `sticky`, sin barra móvil ni asa |

### 7.2 Dispositivo real (Android)

**Equipo:** Redmi Note 13 (`23129RA5FL`), Android 15, Chrome 155.0.8059.79,
1080×2400 @ 440 dpi → **392×766 px CSS**, `devicePixelRatio` 2.75.

**Método:** backend real (Express) contra una **PostgreSQL 16 desechable**
(`:5433`, contenedor `gestor-e2e-db`) sembrada con los *fixtures* de k6; el
teléfono carga el build por LAN y el servidor LAN reenvía `/api` al backend.
Playwright se conecta al Chrome del teléfono por `adb forward` + CDP
(`connectOverCDP`). Login **real** por el formulario (`k6_empresa_a`) y **venta
real** completada. Nada de esto toca producción.

| Comprobación | Resultado |
|---|---|
| Viewport / inputs | ✅ 392×766 CSS; `font-size` de inputs **16 px** (sin zoom en iOS/Android) |
| Login real | ✅ entra a `/dashboard`, token guardado |
| 12 rutas (`/dashboard`, `/pos`, `/inventario`, `/clientes`, `/ventas`, `/cxc`, `/caja`, `/reportes`, `/config`, `/cotizaciones`, `/visor`, `/usuarios`) | ✅ **ancho fijo en 392 px (2 pasadas)**, 0 desborde y **0 errores JS** |
| Menú lateral (drawer) | ✅ abre (`left: 0`), navega a Inventario y cierra tocando el overlay |
| POS · barra fija | ✅ `$ 10,00 · 1 ítem(s) · 1.000,00 Bs.` + **Cobrar** |
| POS · hoja de cobro | ✅ `fixed`, `bottom = 766 = viewport` (pegada al borde) |
| POS · venta completa | ✅ hoja se cierra, carrito se vacía, **factura persistida** (USD 10,00, pago efectivo, CxC creada) |
| Objetivos táctiles (< 44 px) | ✅ **0** en POS y menú; login solo deja un enlace de texto inline (exento por WCAG 2.5.8) |
| Tabla → tarjetas | ✅ etiquetas `PRODUCTO`, `PRECIO UNIT.` visibles en el carrito |

**Bugs encontrados y corregidos durante esta prueba**

1. **`/visor` en blanco** — `VisorPreciosPage` leía `cameraActive` en las
   dependencias de dos `useEffect` **antes** de declararlo (lo devuelve
   `useBarcodeScanner`, más abajo): `ReferenceError: Cannot access
   'cameraActive' before initialization`. Se adelantó la llamada al hook.
2. **El menú lateral nunca abría en móvil** — `main.css` tiene
   `#sidebar { transform: translateX(-100%) }` (selector por ID, gana a la clase
   de Tailwind) y espera `.mobile-open`, que el componente no añadía. Se añadió
   la clase al abrir.
3. **Objetivos táctiles del componente `<Button>`** — usa CSS Modules
   (`Button-module__btn___hash`), así que las reglas `.btn`/`.btn-sm` no le
   aplicaban (37 y 41 px). Se añadió `[class*='Button-module__btn']` y se
   agrandaron cierre del sidebar (32 px), «Cerrar Sesión», «Volver al Inicio» y
   el cierre de la hoja (40 px).
4. **Arranque con `localStorage` corrupto** — un valor `"undefined"` hacía
   `JSON.parse` en el `useState` inicial y dejaba la app en blanco. Se añadió
   `leerJSON()` en `AuthContext` y `try/catch` en `api.js`.
5. **La resolución se expandía en Caja (y puntualmente en Reportes)** — el
   documento pasaba de 392 px a **1181 px**: `#main-content` es un ítem flex
   (`flex-1`) con `min-width: auto`, así que cualquier contenido ancho lo
   estiraba; en Caja lo detonaba `.cash-history-table { min-width: 1100px }`
   (pensado para el scroll horizontal de escritorio) sobreviviendo al modo
   tarjetas. Al ensancharse el layout, la media query dejaba de aplicar, el
   layout saltaba a escritorio (**reaparecía el sidebar**) y la página quedaba
   recortada. Se corrigió con `#main-content { min-width: 0; overflow-x: clip }`
   y `table.rt-cards { min-width: 0 }`. Verificado: 12 rutas × 2 pasadas a
   **392 px fijas, 0 desborde**.
6. **`tfoot` sin adaptar** — la fila de totales («Total General» de Reportes) no
   entraba en las reglas de tarjetas y se recortaba 28 px. `ResponsiveTables`
   ahora etiqueta también las celdas de `tfoot` (respetando `colspan`) y el CSS
   la muestra como tarjeta. Verificado sin recortes en `/reportes` y
   `/ganancias-report`.

**Nota:** el `tfoot` de Caja muestra «Efectivo VES» con el símbolo `$`
(`Utils.formatMoney(c.ingresosEfectivoVES)`), cuando es un monto en bolívares.
Es previo a este trabajo y queda como observación aparte.

**No reproducible:** un desborde aislado de 235 px en `/inventario` a 1280 px se
repitió 5/5 veces con **0 px**, por lo que se descartó como medición transitoria.

- [ ] iOS Safari en dispositivo real (no hay hardware iOS disponible aquí).
- [ ] Android económico de gama baja (el Redmi Note 13 es gama media).

### 7.3 Landing pública e iconos de marca

**La landing también ensanchaba el documento.** `LandingPage.jsx` define todo su
estilo inline y tenía dos bloques con min-content mayor que la pantalla:

- el **header** no envolvía (logo + 5 enlaces + 2 CTA ≈ **807 px**);
- `#beneficios` usaba `1fr minmax(320px, 400px)` (≈ **787 px**).

Al crecer el layout la media query dejaba de aplicar y la página se veía
recortada. Se adaptó sin perder ningún enlace:

- **Menú plegable** en ≤767 px: logo + botón hamburguesa (44×44); enlaces y CTA
  se despliegan a ancho completo (enlaces de 51 px de alto, con `aria-expanded`).
- Rejillas a **una columna**, padding 44/16, hero a 1,95 rem, CTA a ancho
  completo y `overflow-x: clip` como red de seguridad.
- En escritorio no cambia nada: verificado a 1280 px (nav en línea, 2 columnas,
  `padding: 16px 32px`, título a 43,2 px). En el teléfono, `/`, `/login` y
  `/blog` quedan en **392 px** con 0 desbordes y 0 errores JS.

**Iconos de marca.** El favicon (squircle azul con recibo, carrito y «A») es el
diseño oficial, pero `pwa-512`, `pwa-maskable-512` y `apple-touch-icon` tenían
un icono genérico de documento. `scripts/generar-iconos.py` redibuja el SVG de
`frontend/public/favicon.html` con PIL (supersampling 16× y alfa
premultiplicado) y genera:

| Destino | Archivos |
|---|---|
| Web | `favicon.png` (200), `pwa-192`, `pwa-512`, `pwa-maskable-512` (sangrado total, contenido al 70 %) y `apple-touch-icon` (180) |
| Android | `mipmap-*/ic_launcher.png`, `ic_launcher_round.png` e `ic_launcher_foreground.png` (48→192 y 108→432) |

El fondo adaptativo (`values/ic_launcher_background.xml`) pasa a `#2563EB` para
que el *foreground* transparente se vea sobre el azul de marca.

El mismo icono se usa como logotipo junto a «GestorPOS» en landing, login,
registro, blog, artículo, términos y cookies (`<img src="/favicon.png">` en vez
del cuadro azul con el icono genérico de paquete).

**APK:** `npx cap sync android` + `./gradlew assembleDebug` → APK reconstruida
(con todos los arreglos de esta sesión) e instalada con `adb install -r`. El
`ic_launcher.png` dentro del APK es **idéntico** al generado; los 5 PNG servidos
por la web coinciden por SHA-256 con los locales.

### 7.4 Distribución de la app

- **Backend en la nube (HTTPS):** la app usa el backend de Render
  (`VITE_API_URL=https://gestor-inventario-qamm.onrender.com/api` en
  `frontend/.env.capacitor`). Con HTTPS deja de depender de la red local, no
  hay avisos de «no seguro» y la cámara queda habilitada (contexto seguro).
  Las variantes LAN (`http://192.168.0.140:3001/api`) y USB
  (`http://localhost:3001/api`) quedan comentadas en el mismo archivo.
- **Sección de descarga:** `/descargar` (`DescargarPage.jsx`) con tarjeta de
  Android (APK + pasos) y de PWA (iPhone/iPad/escritorio).
  El archivo vive en `frontend/public/descargas/gestorpos-android.apk` y el
  backend lo sirve con `Content-Type: application/vnd.android.package-archive`.
  Enlaces desde el header y el footer de la landing, y desde el menú lateral
  («Aplicación → Descargar app», todos los roles).
- **URL del APK adaptable:** en la web es relativa (`/descargas/...`); dentro de
  la app nativa se resuelve contra el backend configurado, porque el origen
  local (`https://localhost`) no sirve el archivo.
- **Al recompilar:** mover el APK fuera de `public/` antes de `build:capacitor`
  evita que la app se empaquete dentro de sí misma (3,6 MB → ~9 MB).
- **Web sobre HTTPS (Netlify):** `netlify.toml` proxea `/api/*` a Render con
  `status = 200` antes de la regla SPA. Así el frontend llama a `/api` en su
  mismo origen: sin CORS y sin contenido mixto, y la cámara funciona también
  en el navegador. El `dist` servido por el backend local sigue siendo relativo.

### 7.5 Firma de release y avisos de seguridad

- **Firma:** `frontend/android/keystore.properties` +
  `android/app/gestorpos-release.keystore` (alias `gestorpos`, vigencia 10 000
  días). Ambos están en `.gitignore` — **hay que respaldarlos**: Android exige
  la misma firma para instalar una actualización; sin la clave, los usuarios
  tendrían que desinstalar y perder los datos locales.
- **`app/build.gradle`** carga `keystore.properties` (si existe) en
  `signingConfigs.release` y lo aplica a `buildTypes.release`. `versionCode 3`,
  `versionName "1.2"`.
- **Compilar release:** `npm run build:capacitor` → `npm run build:android:release`
  → `app/build/outputs/apk/release/app-release.apk` (3,6 MB, firmado V1+V2).
- **Cambio de firma:** la release no se instala encima de la APK *debug*
  (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`); hay que desinstalar primero.
- **Avisos que quedan:** Play Protect puede avisar al instalar fuera de Play
  (no se elimina sin publicar en la tienda). El aviso de «no es seguro» del
  navegador desaparece al usar HTTPS; la APK nativa no tiene barra de
  direcciones.
- **Contexto seguro:** `capacitor.config.json` sin `server.androidScheme` →
  origen `https://localhost` (`isSecureContext === true`,
  `navigator.mediaDevices` disponible, verificado en dispositivo).
- **HTTP en claro:** `res/xml/network_security_config.xml` solo lo permite a
  `localhost`/`127.0.0.1`, para desarrollo con `adb reverse`. La release no lo
  necesita porque habla HTTPS con Render.

### 7.6 Permisos del teléfono, descargas y pantalla de carga

**Periféricos — solo se declara lo que la app usa:**

| Periférico | Uso real | Permiso |
|---|---|---|
| Cámara | Escáner ZXing (`useBarcodeScanner`) en POS, Visor e Inventario | `CAMERA` + `uses-feature camera` (`required="false"`) |
| Ubicación | Registro de empresa y creación de usuarios (`utils/geolocation.js`) | `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` |
| Almacenamiento | Reportes CSV/PDF y respaldo JSON | Ninguno en Android 10+ (MediaStore); `WRITE_EXTERNAL_STORAGE` solo con `maxSdkVersion="28"` |
| Contactos | **No se usa**: WhatsApp se abre con enlaces `wa.me`, sin leer la agenda | No se declara (Play lo rechazaría) |
| Notificaciones | Sin notificaciones propias | No se declara |

Los permisos se piden **en contexto**, no al abrir la app: la cámara en el
primer escaneo y la ubicación al registrarse o crear un usuario. Verificado en
dispositivo: aparecen los diálogos del sistema y, al concederlos,
`getUserMedia` devuelve 1 pista de vídeo y `getCurrentPosition` devuelve
coordenadas.

**Descargas nativas.** En un WebView un enlace `blob:` no guarda nada. Por eso
`MainActivity` expone `window.AndroidDownloads.guardarBase64(...)` y
`utils/descargas.js` intercepta los clics de descarga Blob (exportaciones CSV,
PDF de jsPDF, respaldo JSON). El archivo se escribe en **Descargas** con
MediaStore (Android 10+) o con el permiso clásico (Android 9−). Los enlaces
http(s) —el APK de `/descargar`— los maneja el `DownloadManager`. Verificado:
`prueba-gestorpos.txt` guardado y legible desde `/sdcard/Download`.

**Pantalla de carga.** Tres capas con el mismo fondo `#0F172A` para que no haya
destellos blancos:

1. **Splash nativo** — `res/drawable/splash.xml` (color + logo) y, en Android
   12+, `windowSplashScreenBackground`/`windowSplashScreenAnimatedIcon`.
   `MainActivity` llama a `SplashScreen.installSplashScreen()` y pinta el
   WebView del mismo color.
2. **Pantalla de carga HTML** — `#boot-splash` en `index.html`: logo,
   «GestorPOS.dev», «Sistema POS e inventario» y barra animada. Se pinta antes
   de React y se retira cuando la app monta (mínimo 600 ms en la app nativa).
3. **App**.

Recursos generados por `scripts/generar-splash.py` (reproducible):
`drawable-nodpi/splash_logo.png` (logo + nombre) y `splash_icon.png` (icono
para Android 12).

**Login y registro — diseño de tarjetas (2026-10).** Las dos pantallas usan
`components/auth/AuthLayout.jsx`: cabecera pegajosa («Volver al Inicio» + estado
real del servidor vía `GET /api/health`), tarjeta de marca con degradado azul
(`brand-600 → brand-950`), logo y «GestorPOS.dev», tarjeta blanca con el
formulario y pie. En teléfono es una sola columna (`max-w-md`); desde 768 px
pasa a dos columnas centradas (`max-w-4xl`).

Campos a 16 px (evita el zoom automático), etiquetas a 12 px en mayúsculas,
botón de 52 px de alto y mostrar/ocultar contraseña. «¿Olvidaste tu
contraseña?» abre WhatsApp de soporte (no existe recuperación automática).
Medido a 392×766: login mide 918 px (el botón de ingreso queda visible sin
scroll; el enlace de registro y el aviso de seguridad quedan justo debajo) y
registro 1324 px; 0 desbordes horizontales y 0 errores JS. En 1280×800 login
ocupa exactamente la ventana.

La paleta `brand` (50–950), `shadow-btn-glow`/`shadow-card-glow` y
`fontFamily.sans` viven en `tailwind.config.js`. `PagosSaaSPage` sigue usando
las clases `.auth-split`/`.auth-brand` de `movil.css`; login y registro ya no
dependen de esas reglas.

### 7.7 Teléfono en horizontal (giroscopio)

Una sola regla define «teléfono»: `QUERY_TELEFONO` en `hooks/useMediaQuery.js`
(`(max-width: 767px), (max-width: 1023px) and (max-height: 520px) and
(orientation: landscape)`). Las cinco media queries de `movil.css` usan la misma
condición, así que CSS y React (`Layout`, `Sidebar`, `BottomNav`) cambian juntos
al girar, sin recargar. El tope de 1023 px evita que una ventana de escritorio
baja pero muy ancha entre en modo teléfono.

Dispositivo de prueba: 1080×2400 @2,75 → 392×873 CSS en vertical y 873×392 en
horizontal.

- **Antes**, al girar, el ancho (873) superaba los 767 px y la app saltaba al
  diseño de escritorio: sidebar fijo de 288 px, tablas completas y desbordes de
  581 px en Ventas y 830 px en Caja. Ahora entra el modo teléfono: cajón lateral,
  dock inferior y tablas→tarjetas.
- **`#main-content { min-width: 0 }`** (main.css): al pasar de móvil a escritorio
  el ítem flex conservaba el ancho móvil y sumaba el margen del sidebar
  (scroll horizontal de 288 px). Queda fijado para todos los tamaños.
- **`canvas { max-width: 100% }` + `.card { min-width: 0 }`**: Chart.js fija un
  ancho en píxeles; al ampliar la ventana el canvas agrandaba su tarjeta y el
  dashboard ganaba 256 px de scroll horizontal.
- **Cabecera de página compacta** en horizontal: se ocultan el subtítulo y el
  atajo «Realizar Ventas» (sigue en el dock) → la cabecera baja de 85–141 px a
  45–61 px. Con el dock de 57 px quedan ~274 px de contenido sobre 392.
- **Menú de la landing**: la lista vertical empujaba «Iniciar Sesión» y
  «Registrar» fuera de pantalla; en horizontal pasa a fichas en una fila más los
  dos botones (cierra en 179 px).
- **Login/registro sin scroll**: en horizontal las dos columnas (marca +
  formulario) se fuerzan también por debajo de 768 px, porque en un teléfono
  girado el ancho (873) supera el punto de corte `md`. El registro pasa sus
  cuatro campos a una rejilla 2×2 (`.reg-form`), los tres consentimientos
  legales a una fila de tres columnas (`10,5 px`) y pierde el título propio (la
  tarjeta de marca ya dice «¡Prueba gratis 7 días!»). En el login se oculta la
  nota de «conexión cifrada», el pie de página y el subtítulo. Los errores de
  campo (`.field-error`) se compactan para que con dos avisos el botón siga a la
  vista.
- **Cámara (punch-hole)**: `shortEdges` + insets reales (ver §7.8). Ya no hay
  franja negra; la cabecera y el dock reservan el alto/ancho del lente.

Medición 873×392 (Playwright, sesión real de `bodegon1`): 0 desbordes
horizontales en `/`, `/login`, `/registro`, `/dashboard`, `/pos`, `/ventas`,
`/productos`, `/caja`, `/reportes`, `/cxc`, `/clientes` e `/inventario`; dock de
57 px; sidebar en -288 (cerrado); 0 errores JS. En POS la barra de cobro mide
65 px sobre el dock y la hoja de cobro 345 px con scroll propio. Rotación
392×766 ⇄ 873×392 ⇄ 1280×800 sin recargar: el dock aparece/desaparece y el
margen del sidebar se repone sin scroll horizontal.

`/login` y `/registro` en horizontal quedan en **0 px de scroll** (documento =
alto del viewport) a 873×392 (con barra de gestos de 16 px o de tres botones de
48 px) y a 640×360; el botón principal siempre visible. En vertical siguen
desplazándose con normalidad.

### 7.8 Pantalla completa (inmersivo)

La app nativa ocupa toda la pantalla: sin barra de estado ni de navegación.

- **`MainActivity.java`**: `WindowCompat.setDecorFitsSystemWindows(window, false)`
  + `WindowInsetsControllerCompat` con `BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`;
  `systemBarsBehavior` se reaplica en `onWindowFocusChanged` y `onResume`
  (`onResume` debe ser `public`). Un `OnApplyWindowInsetsListener` lee
  `WindowInsetsCompat` y publica los insets **en píxeles CSS** al WebView.
- **`styles.xml`**: `Theme.SplashScreen` con `windowLayoutInDisplayCutoutMode =
  shortEdges` y barras transparentes; el tema posterior hereda `NoActionBar` y
  los mismos flags.
- **Puente de insets**: en cada cambio el nativo ejecuta
  `document.documentElement.style.setProperty('--inset-top|right|bottom|left',
  '<px>px')` (dividiendo por `displayMetrics.density`). `movil.css` deriva
  `--safe-top/right/bottom/left` de esos valores, así que el layout no depende
  de `env(safe-area-inset-*)` (que en Android llega como 0). La zona de gestos
  inferior se reserva **ignorando la visibilidad** de la barra: al deslizar para
  mostrarla, el dock sigue encima de la píldora.
- **Quién los usa**: `#main-content`, `.landing-root`, `Sidebar`, `BottomNav`,
  `.pos-mobile-bar` y `AuthLayout` (cabecera, tarjeta y pie). En vertical el
  lente es un inset superior de 34 px CSS; al girar a horizontal pasa a ser un
  inset izquierdo de 34 px.
- Verificado en dispositivo (1080×2400 @2,75): login a dos columnas a ancho
  completo, sin barras del sistema, sin franja del cutout y sin solapamiento del
  dock con la zona de gestos.

---

## 8. Pendiente / siguiente

- iOS Safari real: teclado, gestos y *safe-area* (el resto ya está validado en
  Android real).
- Reutilizar el patrón de hoja inferior in-situ en otros modales que lo ameriten.
- Probar un Android de gama baja para confirmar el rendimiento del
  `MutationObserver` de `ResponsiveTables` con tablas grandes.
