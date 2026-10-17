# AGENTS.md

Sistema POS y Gestor de Inventario (Venezuela). Backend: Node.js + Express + Prisma. Frontend: React + Vite + Tailwind.

## Project structure

- `backend/src/routes/` — 18 Express routers (auth, usuarios, roles, clientes, productos, facturas, facturasPruebas, pagos, config, backup, caja, cotizaciones, activaciones, b2b, fiscal, reportes, cxc); mounted in `backend/src/app.js`
- `backend/src/middleware/` — `auth.js` (JWT), `subscriptionGuard.js` (SaaS subscription), `errorHandler.js` (Prisma codes → friendly), `rateLimiter.js` (login/register limiters)
- `backend/src/utils/` — `pagination.js` (paginate + paginatedResponse), `sql.js` (tsFrag/monthTrunc for cross-db DateTime), `paymentCurrency.js` (VES↔USD via tasaCambioEfectiva)
- `frontend/src/pages/` — one file per route; router in `AppRoutes.jsx`
- `frontend/src/components/ui/` — shared primitives (`FieldError`, `FormError`, `Button`, etc.) with CSS Modules
- `frontend/src/context/` — `AuthContext`, `ThemeContext`, `ToastContext`
- `scripts/` — `validar-flujos.js` (API flow validation), `verify-prisma-engines.js`
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
- `subscriptionGuard` middleware blocks access when subscription is expired. Sub-users (`CAJA`, `INVENTARIO`, `VISOR`) bypass this check — they inherit access from their parent `EMPRESA` account.

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

**Never convert VES↔USD using `factura.tasaCambio` directly.** That field is only a real VES-per-USD rate when the invoice was issued in `VES`; for `USD` invoices it defaults to `1.0` and carries no rate, so a 1000 Bs payment would be read as 1000 USD and falsely trip over-payment errors. Always go through `backend/src/utils/paymentCurrency.js`:

- `tasaCambioEfectiva(factura)` — resolves the correct rate (invoice rate for VES invoices, `config.json → moneda.tasaDolar` for USD invoices).
- `convertirAFactura(monto, monedaOrigen, factura)` / `normalizarPagoAFactura(pago, factura)` — convert into the invoice's currency.

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

## Electron mode

When `ELECTRON_ENV=true`, `backend/src/electron-start.js` loads `.env.electron` (git-ignored) and then starts `app.js`. Electron's `electron/main.js` spawns the backend as a child process and injects `DATABASE_URL`/`PORT` — `.env.electron` must NOT override those two.

## Deployment

- **Frontend**: Netlify (reads `netlify.toml` at repo root; builds `frontend/`, publishes `frontend/dist`). Note: `netlify.toml` only has an SPA redirect (`/*` → `/index.html`); the `/api/*` → backend redirect must be added manually (see README).
- **Backend**: Render/Railway/VPS. Production is on Render with Neon PostgreSQL.
- In production, the backend serves `frontend/dist/` statically if it exists (SPA catch-all in `app.js`).

## No tests, lint, or CI

There is no test suite, linter, formatter, or CI configuration. Do not look for them. Verify changes manually against the running app.

## Cuentas por Cobrar (CxC)

- **Modelos:** `CuentaPorCobrar` (1:1 con factura) + `GestionCobranza` (historial de cobranza).
- **Roles:** EMPRESA ve/gestiona todas las CxC de sus cajas; CAJA solo ve/gestiona las suyas.
- **Creación automática:** Al crear una factura (`POST /api/facturas`) se crea la CxC asociada en la misma transacción.
- **Actualización automática:** Al registrar/eliminar pagos (`POST/DELETE /api/pagos`) se recalcula `montoCobrado`, `montoPendiente` y `estado`.
- **Anulación:** Al anular una factura se elimina la CxC asociada.
- **Abonos desde CxC:** `POST /api/cxc/:id/pago` permite abonar o completar el pago directamente.
- **Gestiones:** `POST /api/cxc/:id/gestion` registra acciones de cobranza (LLAMADA, CORREO, WHATSAPP, VISITA, OTRO).
- **Aging:** Calculado en tiempo real por rangos (0-30, 31-60, 61-90, 90+ días).
- **Rutas:** `backend/src/routes/cxc.js` | **Páginas:** `frontend/src/pages/CxcPage.jsx`, `CxcDetailPage.jsx`.

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

## Env vars

Required: `DATABASE_URL`, `JWT_SECRET` (app exits if missing). Optional: `PORT` (default 3001), `EMPRESA_NOMBRE`, `EMPRESA_RIF`, `EMPRESA_DIRECCION`, `EMPRESA_TELEFONO`, `EMPRESA_EMAIL`, `MONEDA_SIMBOLO`, `MONEDA_CODIGO`, `B2B_API_KEY`, `ALLOWED_ORIGINS`, `DB_PROVIDER`, `NODE_ENV`, `ELECTRON_ENV`, `TASA_DOLAR_AUTO_UPDATE` (poner `false` para desactivar el job diario de la tasa).
