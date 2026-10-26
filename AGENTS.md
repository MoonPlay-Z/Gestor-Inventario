# AGENTS.md

Sistema POS y Gestor de Inventario (Venezuela). Backend: Node.js + Express + Prisma. Frontend: React + Vite + Tailwind.

## Project structure

- `backend/src/routes/` — 18 Express routers (auth, usuarios, roles, clientes, productos, facturas, facturasPruebas, pagos, config, backup, caja, cotizaciones, activaciones, b2b, fiscal, reportes, cxc); mounted in `backend/src/app.js`
- `backend/src/middleware/` — `auth.js` (JWT), `subscriptionGuard.js` (SaaS subscription), `errorHandler.js` (Prisma codes → friendly), `rateLimiter.js` (login/register limiters)
- `backend/src/utils/` — `pagination.js` (paginate + paginatedResponse), `sql.js` (tsFrag/monthTrunc for cross-db DateTime), `tasaAPI.js` (fachada única de tasa usada por todos los módulos), `paymentCurrency.js` (motor VES↔USD: `tasaCambioEfectiva`, `getTasaSistemaPorEmpresa`), `tasaEmpresaCache.js` (caché 60 s por empresa), `empresaCascade.js` (borrado transaccional de todos los datos de una empresa)
- `frontend/src/pages/` — one file per route; router in `AppRoutes.jsx`
- `frontend/src/components/ui/` — shared primitives (`FieldError`, `FormError`, `Button`, etc.) with CSS Modules
- `frontend/src/components/auth/` — `AuthLayout.jsx` (marco visual de login/registro: cabecera con estado real del server vía `/api/health`, tarjeta de marca y tarjeta del formulario; 1 columna en móvil, 2 desde `lg`) y `ProtectedRoute.jsx`
- `frontend/src/context/` — `AuthContext`, `ThemeContext`, `ToastContext`
- `scripts/` — `validar-flujos.js` (API flow validation), `verify-prisma-engines.js`, `generar-iconos.py` (regenera favicon/PWA/iconos Android desde `frontend/public/favicon.html`)
- `backend/scripts/` — `backfill-cierre-caja-monedas.js`, `backfill-empresa-config.js`, migration/verification scripts
- `opencode.json` — OpenCode config with `opencode-omniroute-auth` plugin

## Commands

```bash
# Root (run from repo root)
npm run dev              # backend (:3001) + frontend (:5173) in parallel
npm run dev:backend      # backend only
npm run dev:frontend     # frontend only
npm run build            # build frontend (outputs frontend/dist)
npm run prisma:generate  # generate Prisma client (PostgreSQL)
npm run prisma:migrate   # run migrations
npm run prisma:seed      # seed 600 products
npm run prisma:studio    # Prisma Studio
ALLOW_DESTRUCTIVE_TESTS=true API_USER=<user> API_PASS=<pass> BASE_URL=http://localhost:3001 node scripts/validar-flujos.js  # API flow validation (creates sales/modifies caja)
```

```bash
# Backend-only (run inside backend/)
npm run setup                 # install + generate + migrate + seed
npm run db:reset              # destructive: drops all data + reseeds
npm run db:generate           # prisma generate (PostgreSQL)
npm run db:migrate            # prisma migrate dev --name init
npm run db:seed               # node prisma/seed.js
npm run db:studio             # prisma studio
npm run db:sqlite:generate    # generate SQLite Prisma client
npm run db:sqlite:push        # push schema to SQLite
npm run db:migrate:sqlite     # migrate PostgreSQL → SQLite
npm run db:verify:sqlite      # verify SQLite data integrity
```

Install gotchas: the root has **no workspaces** — `npm install` at the root only installs root deps. Backend and frontend each need their own `npm install` (or use `backend/`'s `npm run setup`). `validar-flujos.js` requires a running backend with a seeded demo user; configure `API_USER`, `API_PASS`, and `BASE_URL` in the environment. It **requires `ALLOW_DESTRUCTIVE_TESTS=true`** or it exits immediately — the script creates sales and modifies caja state.

## Database: PostgreSQL & SQLite

The app supports both PostgreSQL (production) and SQLite (local/dev). The active database is determined by:
- `DB_PROVIDER=sqlite` env var, **or**
- `DATABASE_URL` starting with `file:`

When SQLite is active, `backend/src/db/prisma.js` uses a separate generated client from `backend/src/generated/prisma-sqlite` and applies a middleware to convert string numerics to numbers (SQLite stores decimals as strings).

SQLite-specific commands (run inside `backend/`):
```bash
npm run db:sqlite:generate   # generate SQLite Prisma client
npm run db:sqlite:push       # push schema to SQLite
npm run db:migrate:sqlite    # migrate from PostgreSQL to SQLite
npm run db:verify:sqlite     # verify SQLite data integrity
```

## Prisma engines

`schema.prisma` declares `binaryTargets = ["native", "debian-openssl-3.0.x", "windows"]`. After `prisma generate`, verify both Linux and Windows engines exist:
```bash
node scripts/verify-prisma-engines.js
```

## Auth & roles

- JWT auth via `JWT_SECRET` env var — **app exits immediately if not set**.
- Valid roles: `SUPER_ADMIN`, `EMPRESA`, `CAJA`, `INVENTARIO`, `VISOR`.
- `sessionVersion` on tokens enables session invalidation (increment to revoke all user tokens).
- B2B routes (`/api/v1/b2b`) use API key auth (`X-Api-Key` header), not JWT.
- `subscriptionGuard` middleware blocks access when the subscription or the company is suspended. Sub-users (`CAJA`, `INVENTARIO`, `VISOR`) inherit from their parent `EMPRESA`: the guard resolves `empresaId` → parent, rejects if the parent is inactive/deleted, and evaluates the parent/Empresa subscription. `SUPER_ADMIN` is exempt.
- After login, `SUPER_ADMIN` lands on `/admin` (not `/dashboard`, which is EMPRESA-only). `ProtectedRoute` redirects using the same rule.

## Panel Super Admin (activaciones y pagos)

- **Suspensión real:** `PUT /api/activaciones/empresas/:id/estado` writes `Empresa.activo`, sets the owner `activo=false` and increments `sessionVersion` for the owner and every sub-account, so blocking cuts POS access immediately instead of leaving cajeros working.
- **Bandeja de pagos:** `GET /api/activaciones` lists requests. `PUT /api/activaciones/:id/aprobar` activates the company (monthly 1–12 months, adding to any remaining period, or `lifetime`) and `PUT /api/activaciones/:id/rechazar` requires a reason. `SolicitudActivacion` persists `notas`, `revisadoPor`, `revisadoEn`. If a sub-account reports the payment, the request is stored against its `EMPRESA` parent.
- **Auditoría:** `GET /api/activaciones/auditoria` (paginated) reads `AuditLog`. Activations, block/unblock, deletions, password resets and promo/news changes are recorded with actor, IP and user agent via `utils/auditLog.js`.
- **Salud:** `GET /api/activaciones/salud` reports `Usuario`↔`Empresa` subscription drift and active sub-accounts under a blocked company.
- **Eliminación en cascada:** `DELETE /api/activaciones/empresas/:id` y `DELETE /api/activaciones/usuarios/:id` (cuenta `EMPRESA`) usan `utils/empresaCascade.js`. En una sola transacción borran sub-cuentas, roles, productos, clientes, facturas, items, pagos, cotizaciones, CxC, gestiones, cierres, solicitudes y el registro `Empresa`. Ya no se ignora el error de `Empresa.delete`: si una FK bloquea, la transacción se revierte completa. `AuditLog` se conserva con `empresaId`/`usuarioId` en `NULL` (trazabilidad histórica); `Noticia`, `Promocion`, `Correlativo` y `Permiso` son globales y no se tocan. La respuesta incluye `eliminados` con el conteo por tabla.
- **Migración:** `20261021120000_add_solicitud_activacion_revision` must be applied before deploying (the panel reads the new columns). `schema.sqlite.prisma` now includes `Usuario.refreshTokenId` so login also works on SQLite, and the CxC models (`CuentaPorCobrar`, `GestionCobranza`) to mirror PostgreSQL; run `npm run db:sqlite:push` on existing SQLite databases.
- **Notificaciones:** `config/metodosPago.js` sends the payment notice through Resend when `RESEND_API_KEY` is set; otherwise it only logs it. `ADMIN_NOTIFICACION_EMAIL` and `ADMIN_EMAIL_FROM` are optional.
- **Noticias:** `Noticia.imagenUrl` y `Noticia.videoUrl` son URLs externas (YouTube/Vimeo o un archivo directo `.mp4/.webm/.ogg`). No hay subida de archivos: el medio se aloja fuera y se pega el enlace. La landing pinta el video con prioridad sobre la imagen y muestra subtítulo/destacado. Migración `20261021130000_add_noticia_video_url` antes de desplegar.

## Multi-tenancy

Most models carry `empresaId`. The `Usuario` model has two company relations with confusing names:
- `empresaId` — self-referential: points to the parent `Usuario` (for sub-users).
- `empresaRefId` — points to the `Empresa` record.

`Cliente.empresa` and `Producto.empresa` also reference `Usuario` (not `Empresa`) via the `"EmpresaClientes"` / `"EmpresaProductos"` relations.

Tenant filtering pattern used across routes:
```js
const facturaTenantFilter = (empresaId) => ({
  OR: [
    { usuarioId: empresaId },
    { usuario: { empresaId } }
  ]
});
```

## Currency & decimals

Uses `decimal.js` for all monetary math. Invoices support dual currency (`moneda` + `tasaCambio`). VES amounts are divided by `tasaCambio` to normalize to USD in dashboard aggregations. Never use native float arithmetic for money.

**Never convert VES↔USD using `factura.tasaCambio` directly.** That field is only a real VES-per-USD rate when the invoice was issued in `VES`; for `USD` invoices it defaults to `1.0` and carries no rate, so a 1000 Bs payment would be read as 1000 USD and falsely trip over-payment errors. Always resolve the rate through the single facade `backend/src/utils/tasaAPI.js` (which delegates to `paymentCurrency.js`):

- `tasaParaEmpresa(empresaId)` — rate of record for a company (`Empresa.tasaDolar`; BCV in `AUTO`, saved value in `MANUAL`).
- `tasaEfectivaFactura(factura, empresaId)` — invoice rate for VES invoices, company rate for USD invoices.
- `convertirMontoMoneda` / `convertirAFactura` / `normalizarPagoAFactura` / `sumarPagosNormalizados` — the conversions.

**Every module** (facturas, CxC, cotizaciones, caja, inventario, reportes, dashboard) must resolve the rate through `tasaAPI`. The rate is **per company** — never use the global `config.json` rate or a hardcoded value in a request path. Raw-SQL payment aggregations (dashboard in `app.js`, `getCajaReporte` in `reportesService.js`, `buildPagosTurnoSql` in `caja.js`) normalize Bs payments with the company rate: `WHEN p."monedaPago"='VES' THEN CASE WHEN f."moneda"='VES' AND f."tasaCambio">0 THEN p."monto"/f."tasaCambio" ELSE p."monto"/tasaSistema END ELSE p."monto"`.

`CuentaPorCobrar` amounts (`montoOriginal` / `montoCobrado` / `montoPendiente`) are **always USD-normalized**, so `cxc.js` converts payments to USD via a local `pagoAUsd()` helper rather than to the invoice currency.

**Rounding tolerance:** both `cxc.js` and `pagos.js` accept a payment that exceeds the pendiente by ≤ `0.005` USD (half a cent) and cap the applied amount at the pendiente. Without it, a Bs payment can never exactly match a sub-cent USD balance (e.g. 10 Bs = 0.0116 USD vs 0.01 USD pendiente) and gets rejected with a self-contradictory "0.01 excede 0.01" message. Larger overpayments are still rejected.

## Frontend dev server

`vite.config.js` enables HTTPS with a self-signed cert via `@vitejs/plugin-basic-ssl` (required for camera/barcode on mobile), `host: true` (LAN access), and proxies `/api` → `http://localhost:3001`. The frontend calls the API at `/api` by default (override with `VITE_API_URL`).

## CSS Modules

`vite.config.js` configura CSS Modules con:
- `localsConvention: 'camelCaseOnly'` — importa como `styles.btnPrimary`
- `generateScopedName: '[name]__[local]___[hash:base64:5]'` — nombres únicos

**Patrón de uso:**
```js
import styles from './Button.module.css';
// styles.btnPrimary, styles.btnSm, etc.
```

Archivos de módulo en `frontend/src/components/ui/*.module.css`:
- `Button.module.css`, `Modal.module.css`, `Form.module.css`
- `Table.module.css`, `Badge.module.css`, `Toast.module.css`, `Card.module.css`

Estilos globales (variables CSS, reset, Tailwind) en `frontend/src/css/main.css`. Ejemplos en `CSSModulesExamples.jsx`.

CSS Modules: `localsConvention: 'camelCaseOnly'` and scoped names `[name]__[local]___[hash:base64:5]` — import styles as `styles` and use camelCase keys. Production build splits manual chunks `react` and `iconify`.

## App móvil (Capacitor)

- Proyecto nativo en `frontend/android/` (Capacitor 6). `frontend/capacitor.config.json` no define `server.androidScheme`, así que el WebView usa `https://localhost` (contexto seguro: cámara y PWA funcionan). Solo se necesita HTTP en claro para desarrollo (`res/xml/network_security_config.xml` → `localhost`/`127.0.0.1`).
- `frontend/.env.capacitor` define `VITE_API_URL` para la app nativa (activo: backend de Render por HTTPS). Las variantes LAN/USB están comentadas.
- **Release firmada:** `frontend/android/keystore.properties` + `android/app/gestorpos-release.keystore` (git-ignored, **respaldar**). `app/build.gradle` lo carga en `signingConfigs.release`.
- Flujo: mover el APK fuera de `frontend/public/descargas/` → `npm run build:capacitor` → `npm run build:android:release` → copiar `android/app/build/outputs/apk/release/app-release.apk` a `frontend/public/descargas/gestorpos-android.apk` → `npm run build` (web relativa).
- `AndroidManifest.xml` declara `CAMERA` + `uses-feature camera` (`required="false"`), `ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION` (registro y alta de usuarios) y `WRITE_EXTERNAL_STORAGE` con `maxSdkVersion="28"`. **No** declara contactos (WhatsApp se abre por enlace) ni notificaciones. Los permisos se piden en contexto (primer escaneo / al registrarse).
- **Descargas:** en el WebView un `blob:` no descarga. `MainActivity` expone `window.AndroidDownloads` y `src/utils/descargas.js` intercepta los clics Blob (CSV, PDF, respaldo JSON) para guardarlos en Descargas (MediaStore en Android 10+, permiso clásico en 9−).
- **Horizontal (giroscopio):** «teléfono» se define una sola vez en `frontend/src/hooks/useMediaQuery.js` (`QUERY_TELEFONO`: `(max-width: 767px), (max-width: 1023px) and (max-height: 520px) and (orientation: landscape)`). Las media queries de `frontend/src/css/movil.css` repiten esa condición y `Layout`/`Sidebar`/`BottomNav` la usan vía `useMediaQuery` (dock + cajón en lugar de sidebar fijo). Sin ella, un teléfono girado (873 px de ancho) caía en el layout de escritorio y desbordaba. `/login` y `/registro` no deben hacer scroll en horizontal: 2 columnas, registro con rejilla 2×2 de campos y consentimientos en una fila (clases `reg-form`, `reg-field`, `reg-legal`, `reg-head`, `auth-cta`, `auth-nota`).
- **Pantalla completa:** la app nativa va en modo inmersivo (`MainActivity.java`: `setDecorFitsSystemWindows(false)` + `WindowInsetsControllerCompat` con barras transitorias; `styles.xml` con `shortEdges` y barras transparentes). Los insets reales se publican al WebView como `--inset-top/right/bottom/left` en px CSS (divididos por `density`) y `movil.css` deriva `--safe-*`; **no** se usa `env(safe-area-inset-*)` (en Android llega 0). La zona de gestos inferior se reserva ignorando la visibilidad de la barra. `#main-content`, `.landing-root`, `Sidebar`, `BottomNav`, `.pos-mobile-bar` y `AuthLayout` consumen esos valores.
- **Splash:** `scripts/generar-splash.py` genera `drawable-nodpi/splash_logo.png` (logo + nombre) y `splash_icon.png`; `drawable/splash.xml` + `styles.xml` (`Theme.SplashScreen`, `windowSplashScreen*`, `postSplashScreenTheme`) y `SplashScreen.installSplashScreen()` en `MainActivity`. La pantalla de carga HTML (`#boot-splash` en `index.html`, retirada por `QuitarSplash` en `main.jsx`) comparte el fondo `#0F172A`.

## Electron mode

When `ELECTRON_ENV=true`, `backend/src/electron-start.js` loads `.env.electron` (git-ignored) and then starts `app.js`. Electron's `electron/main.js` spawns the backend as a child process and injects `DATABASE_URL`/`PORT` — `.env.electron` must NOT override those two.

## Actualizaciones de la APK

La app instalada detecta, descarga e instala sus propias actualizaciones (sin tienda). Piezas:

- **Manifiesto** `frontend/public/descargas/version.json` — `{ versionCode, versionName, url, size, sha256, publishedAt, minVersionCode, notes }`. `url` es **absoluta** y https; `versionCode` es lo que se compara; `minVersionCode > 0` obliga a actualizar (sin «Más tarde»).
- **Publicación**: `npm run apk:publicar -- --bump --notas "…" [--notas "…"] [--forzar <versionCode>] [--republicar]`.
  Lee `versionCode`/`versionName` de `frontend/android/app/build.gradle`, aborta si falta la keystore o si el `versionCode` no es mayor que el publicado, saca la APK anterior de `public/descargas` (si no se embebería), compila `build:capacitor` + release, calcula tamaño y SHA-256 y escribe el manifiesto de forma atómica (`tmp` + `rename`). Bloqueo en `.publicar-apk.lock`.
- **Consulta en la app**: `frontend/src/services/actualizaciones.js` es una **fachada** que compone `features/actualizaciones/`: `domain/` (manifiesto, política de throttle y máquina de estados, puro), `application/` (caso de uso), `adapters/` (HTTP, localStorage, puente nativo) y `ui/useActualizacion.js` (estado + ciclo de vida). `components/app/ActualizarApk.jsx` solo pinta. Usa `App.getInfo()` (`build` = versionCode), consulta el manifiesto **como máximo una vez al día** (si falla, reintenta al abrir la app con 30 min de separación), se salta `/pos` y `/caja` y no avisa con ventas pendientes en el outbox.
- **Sin estados sin salida**: `domain/maquinaEstados.js` declara las transiciones y `puedeCerrar()`. Si el usuario cancela el instalador de Android, la app vuelve del fondo en `instalando` y el aviso regresa a `aviso` con «Reanudar»; durante la descarga hay «Cancelar descarga». `domain/maquinaEstados.test.js` verifica que todo estado ocupado se pueda abandonar.
- **Instalación** (`ActualizadorApk` + `VerificadorApk`, expuestos como `window.AndroidUpdates` desde `MainActivity.ActualizacionesNativas`): `DownloadManager` a `getExternalFilesDir(DIRECTORY_DOWNLOADS)/actualizaciones/`; `VerificadorApk` comprueba SHA-256, `packageName`, `versionCode` y firma con `getPackageArchiveInfo`, y el actualizador abre el instalador vía `FileProvider` (`res/xml/file_paths.xml` → `<external-files-path path="Download/actualizaciones/">`). Requiere `REQUEST_INSTALL_PACKAGES`; si falta el permiso, abre `ACTION_MANAGE_UNKNOWN_APP_SOURCES`. `app/proguard-rules.pro` conserva los métodos `@JavascriptInterface` por si algún día se activa `minifyEnabled`.
- **Integridad**: la actualización es *in-place* con la misma keystore (`frontend/android/app/gestorpos-release.keystore`), así que Android conserva sesión, caja y datos del WebView. Perder la keystore rompe las actualizaciones para siempre. `android:allowBackup="false"` evita que los datos del WebView (sesión, caja) acaben en la copia de seguridad de Google.
- **Env**: `VITE_UPDATE_URL` (origen del sitio donde viven `/descargas/version.json` y el APK; por defecto vacío = mismo origen, y en `.env.capacitor` apunta a Netlify) y `VITE_UPDATE_MANIFEST_URL` (opcional, URL completa del manifiesto si se aloja en otro sitio). En la app nativa **no** sirve una ruta relativa: el WebView resolvería contra el dist empaquetado.
- **Netlify**: `netlify.toml` envía `Access-Control-Allow-Origin: *` y `no-cache` para `version.json` (la app la consulta desde `https://localhost`).
- La página `/descargar` (`DescargarPage.jsx`) lee versión y tamaño del manifiesto; ya no hay valores a mano.

## Deployment

- **Frontend**: Netlify (reads `netlify.toml` at repo root; builds `frontend/`, publishes `frontend/dist`). Note: `netlify.toml` only has an SPA redirect (`/*` → `/index.html`); the `/api/*` → backend redirect must be added manually (see README).
- **Backend**: Render/Railway/VPS. Production is on Render with Neon PostgreSQL.
- In production, the backend serves `frontend/dist/` statically if it exists (SPA catch-all in `app.js`).

## Pruebas, lint y CI

Solo hay pruebas unitarias del **dominio del actualizador** (funciones puras: validación del manifiesto, política de revisión y máquina de estados). Se ejecutan con el runner de Node, sin dependencias nuevas:

```bash
cd frontend && npm test   # node --test src/features/actualizaciones/domain
```

No hay linter, formateador ni CI. El resto se verifica manualmente contra la app en ejecución.

## Cuentas por Cobrar (CxC)

- **Modelos:** `CuentaPorCobrar` (1:1 con factura) + `GestionCobranza` (historial de cobranza).
- **Roles:** EMPRESA ve/gestiona todas las CxC de sus cajas; CAJA solo ve/gestiona las suyas.
- **Creación exclusiva para financiamiento:** Al crear una factura (`POST /api/facturas`) se crea la CxC asociada únicamente si la venta es emitida con `FINANCIAMIENTO` o en cuotas (`cuotasTotales > 1`). Las ventas de contado inmediato no generan registro en CxC.
- **Recuperación automática por fraude:** Si un pago de contado es anulado por motivo `FRAUDE` o inconsistencia y la factura vuelve a saldo deudor, se genera automáticamente su `CuentaPorCobrar` para gestión y cobranza.
- **Actualización automática:** Al registrar pagos (`POST /api/pagos`, `POST /api/cxc/:id/pago`) o anularlos (`PATCH /api/pagos/:id/anular`), se recalculan atómicamente `montoCobrado`, `montoPendiente` y `estado`.
- **Anulación de factura:** Al anular una factura se elimina la CxC asociada.
- **Abonos desde CxC:** `POST /api/cxc/:id/pago` permite abonar o completar el pago directamente con cualquiera de los métodos de pago de abono.
- **Gestiones:** `POST /api/cxc/:id/gestion` registra acciones de cobranza (LLAMADA, CORREO, WHATSAPP, VISITA, OTRO).
- **Aging:** Calculado en tiempo real por rangos (0-30, 31-60, 61-90, 90+ días).
- **Rutas:** `backend/src/routes/cxc.js` | **Páginas:** `frontend/src/pages/CxcPage.jsx`, `CxcDetailPage.jsx`.

## Métodos de Pago y Anulaciones

- **Catálogo oficial (10 métodos):** `TARJETA_DEBITO`, `TARJETA_CREDITO`, `EFECTIVO_VES`, `TRANSFERENCIA`, `PAGO_MOVIL`, `BIOPAGO`, `BINANCE`, `EFECTIVO_USD`, `CASHEA`, `FINANCIAMIENTO` (definidos en `backend/src/constants/metodosPago.js` y `frontend/src/constants/metodosPago.js`). Soporta retrocompatibilidad con variantes heredadas (`CASH`, `BANK_TRANSFER`, `CREDIT_CARD`, `MOBILE_PAYMENT`).
- **Validación de referencias:** Tarjetas, transferencias, pago móvil, biopago, binance y cashea exigen número de referencia obligatorio.
- **Anulación lógica de pagos:** `PATCH /api/pagos/:id/anular` exige motivo (`FRAUDE`, `ERROR_MONTO`, `COBRO_DUPLICADO`, `DEVOLUCION`, `OTRO`), descripción obligatoria (mínimo 10 caracteres, máximo 500) y código de supervisor para rol `CAJA`. Los pagos nunca se eliminan físicamente (`DELETE /api/pagos/:id` responde `405 Method Not Allowed`).
- **Visualización de motivos y descripciones:** La justificación de anulación se expone en el detalle de la cuenta (`CxcDetailPage`), en la bandeja `/pagos-anulados` (`PagosAnuladosPage`) y con modal detallado en el historial de facturación (`VentasPage`).

## Conventions

- **Pagination**: list endpoints take `page`/`limit`; use `backend/src/utils/pagination.js` (`paginate()` + `paginatedResponse()`).
- **Aggregations**: use `$queryRaw` with `GROUP BY` and `Promise.all` (see dashboard route) instead of loading full tables; wrap multi-table writes (factura creation, pagos, cotización conversion) in `prisma.$transaction`. Use `backend/src/utils/sql.js` (`tsFrag`, `monthTrunc`) for DateTime comparisons in raw SQL — they handle PostgreSQL/SQLite differences automatically.

## Error handling

- Backend: `backend/src/middleware/errorHandler.js` maps Prisma codes (P2002, P2025, P2003) to friendly messages; error shape `{ error, message, code?, fields?, details? }`.
- Frontend: `frontend/src/utils/validation.js` (`ValidationRules`, `validateForm()`, `getErrorMessage()`); field/form messages via `FieldError`/`FormError` in `frontend/src/components/ui/`.

## Rate limiting & misc

- `backend/src/middleware/rateLimiter.js` exists — check it before adding public endpoints.
- `serialport` is a backend dependency (fiscal printer hardware); it may need native build tools on install.

## Cierre de caja — desglose por moneda

`CierreCaja` persiste `ingresosEfectivo`/`ingresosBanco` (USD normalizado) **y** `ingresosEfectivoVES`/`ingresosBancoVES` (montos originales en Bs, nullable). El desglose se calcula con `buildPagosTurnoSql()` en `backend/src/routes/caja.js`, que aplica la misma regla de `tasaCambioEfectiva()`: usa la tasa de la factura solo si fue emitida en VES; en facturas USD (tasaCambio=1) usa la tasa vigente del sistema (`config.json → moneda.tasaDolar`). Esto evita que 1000 Bs se lean como 1000 USD.

**Backfill:** `backend/scripts/backfill-cierre-caja-monedas.js` (dry-run por defecto, `--apply` para persistir). Cierres sin `arqueoDetalle` quedan con NULL — no se estima ni se inventa datos.

## Configuración independiente por empresa

Cada `Empresa` tiene su propia configuración: `tasaDolar` (Float), `monedaSimbolo`, `monedaCodigo`, `direccion`, `telefono`, `email`. La tasa se resuelve con `getTasaSistemaPorEmpresa(empresaId)` en `backend/src/utils/paymentCurrency.js` (caché en memoria de 60s, fallback a `leerTasaSistema()`).

- Al login, `auth.js` incluye `empresa: { id, nombre, rif, tasaDolar, tasaDolarModo, tasaDolarActualizadaEn, monedaSimbolo, ... }` en la respuesta.
- El frontend guarda `empresa` en `AuthContext` (`context/AuthContext.jsx`) y los componentes la usan para conversiones.
- El `DolarWidget` (`components/widgets/DolarWidget.jsx`) permite actualizar desde el BCV, editar a mano y activar/desactivar la actualización automática. Solo es editable para `EMPRESA`; el resto de roles lo ven en modo lectura.
- La tasa de una empresa no afecta a otras — cada una trabaja con su propia diferencia.
- **Backfill:** `backend/scripts/backfill-empresa-config.js` (copia valores globales a empresas existentes; dry-run por defecto, `--apply` para persistir).

### Actualización diaria de la tasa

`Empresa.tasaDolarModo` (`"AUTO"` por defecto, o `"MANUAL"`) y `Empresa.tasaDolarActualizadaEn` gobiernan el refresco. Lógica central en `backend/src/services/tasaDolar.js`:

- **`AUTO`** — la tasa se refresca con la oficial del BCV. **`MANUAL`** — solo cambia al guardarla.
- Se dispara de dos formas complementarias, porque el backend puede estar dormido (Render free) o el equipo apagado a la hora programada: un **job diario** a las 08:00 de Venezuela (12:00 UTC, `setTimeout` que se reprograma solo, sin cron externo) y un **refresco perezoso** al primer uso del día (`GET /api/config` y `GET /api/config/empresas/:id/config`). Ambos son idempotentes.
- Guardar la tasa a mano (`PUT`) marca `tasaDolarActualizadaEn = now`: la actualización automática **no la pisa hasta mañana**, aunque el modo siga en `AUTO`.
- Si el BCV no responde se conserva la última tasa conocida (nunca se inventa un valor). `bcvHistorico.js` corta el `fetch` a los 8 s y aplica un backoff de 10 min tras un fallo, para que el refresco perezoso no cueste 8 s en cada carga.
- Al guardar una tasa se invalida su caché de 60 s (`utils/tasaEmpresaCache.js`) para que el POS no siga cobrando con la anterior.
- La fecha se calcula siempre en hora de Venezuela (UTC-4), en backend (`fechaEnVenezuela`) y frontend (`utils/fechaVenezuela.js`).
- **Aviso al iniciar sesión:** `components/widgets/AlertaTasaDolar.jsx` (montado en `Layout.jsx`) muestra un modal una vez al día por dispositivo y empresa (bandera `tasaDolarAviso:<empresaId>` en localStorage). Si la tasa ya es la de hoy se muestra como confirmación; si no, ofrece actualizarla desde el BCV o a mano.
- Rutas: `POST /api/config/tasa-dolar/actualizar` (aplica la tasa del BCV a la empresa sin importar su modo, `requireRole('EMPRESA')`). El `GET /api/config/tasa-bcv` sigue existiendo.
- Migración: `backend/prisma/migrations/20261016180000_add_empresa_tasa_dolar_auto/` — **debe aplicarse antes de desplegar el backend**, porque el login ya selecciona las columnas nuevas.

### API estructurada de tasa (`/api/tasa`)

`backend/src/routes/tasa.js` expone la misma fuente que usan todos los módulos. Requiere JWT.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/tasa` | Tasa vigente de la empresa: `{ tasa, modo, fuente, actualizadaEn, empresaId }` |
| `GET` | `/api/tasa/bcv` | Tasa oficial del BCV del día (global) |
| `GET` | `/api/tasa/historico?fecha=YYYY-MM-DD` | Tasa BCV de una fecha |
| `POST` | `/api/tasa/actualizar` | Aplica la tasa del BCV a la empresa. **No cambia el modo**. `EMPRESA` |
| `PUT` | `/api/tasa` | `{ tasaDolar }` guarda a mano (**no cambia el modo**, marca la fecha de hoy); `{ modo }` cambia `AUTO`/`MANUAL`. `EMPRESA` |

`utils/tasaAPI.js` es la fachada única: `tasaParaEmpresa`, `tasaEfectivaFactura`, `estadoTasaEmpresa`, `actualizarTasaEmpresa`, `guardarTasaManual`, `setModoTasa` + las conversiones de `paymentCurrency`.

**Sin default `36.5`:** `Empresa.tasaDolar` ya no tiene `@default(36.5)`. Antes, toda empresa sin tasa explícita quedaba en 36.5 y el sistema convertía VES→USD con esa tasa (bug "*CxC usa una tasa de 36 Bs*"). `getTasaSistemaPorEmpresa` resuelve en cascada **tasa de la empresa → tasa global (`config.json`) → tasa del BCV** y nunca devuelve un valor hardcodeado. Migración: `backend/prisma/migrations/20261017200000_empresa_tasa_dolar_sin_default/` (**aplicar antes de desplegar**; hace `DROP DEFAULT` y limpia los `36.5` heredados).

**Módulos conectados a la tasa por empresa:** facturas (POST usa `tasaParaEmpresa` como fallback), CxC (`pagoAUsd`), cotizaciones, caja y reportes usan `tasaAPI`; el dashboard (`app.js`) y `getCajaReporte` (`reportesService.js`) normalizan los pagos en Bs sobre facturas USD con la tasa de la empresa; `productos.js` (`GET /api/productos/lookup/:codigo`) devuelve `precioUsd/precioVes/tasaBcv` con la tasa de la empresa.

## Env vars

Required: `DATABASE_URL`, `JWT_SECRET` (app exits if missing). Optional: `PORT` (default 3001), `EMPRESA_NOMBRE`, `EMPRESA_RIF`, `EMPRESA_DIRECCION`, `EMPRESA_TELEFONO`, `EMPRESA_EMAIL`, `MONEDA_SIMBOLO`, `MONEDA_CODIGO`, `B2B_API_KEY`, `ALLOWED_ORIGINS`, `DB_PROVIDER`, `NODE_ENV`, `ELECTRON_ENV`, `TASA_DOLAR_AUTO_UPDATE` (poner `false` para desactivar el job diario de la tasa), `RESEND_API_KEY` (activa el envío real de avisos de pago), `ADMIN_EMAIL_FROM` y `ADMIN_NOTIFICACION_EMAIL`.
