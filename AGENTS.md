# AGENTS.md

Sistema POS y Gestor de Inventario (Venezuela). Backend: Node.js + Express + Prisma. Frontend: React + Vite + Tailwind.

## Commands

```bash
npm run dev              # backend (:3001) + frontend (:5173) in parallel
npm run dev:backend      # backend only
npm run dev:frontend     # frontend only
npm run build            # build frontend (outputs frontend/dist)
npm run prisma:generate  # generate Prisma client (PostgreSQL)
npm run prisma:migrate   # run migrations
npm run prisma:seed      # seed 600 products
npm run prisma:studio    # Prisma Studio
BASE_URL=http://localhost:3001 node scripts/validar-flujos.js  # API flow validation
```

Backend-only scripts (run inside `backend/`): `npm run setup` (install + generate + migrate + seed), `npm run db:reset` (destructive: drops all data + reseeds).

Install gotchas: the root has **no workspaces** — `npm install` at the root only installs root deps. Backend and frontend each need their own `npm install` (or use `backend/`'s `npm run setup`). `validar-flujos.js` requires a running backend with a seeded demo user; configure `API_USER`, `API_PASS`, and `BASE_URL` in the environment.

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

## Frontend dev server

`vite.config.js` enables HTTPS with a self-signed cert via `@vitejs/plugin-basic-ssl` (required for camera/barcode on mobile), `host: true` (LAN access), and proxies `/api` → `http://localhost:3001`. The frontend calls the API at `/api` by default (override with `VITE_API_URL`).

CSS Modules: `localsConvention: 'camelCaseOnly'` and scoped names `[name]__[local]___[hash:base64:5]` — import styles as `styles` and use camelCase keys. Production build splits manual chunks `react` and `iconify`.

## Electron mode

When `ELECTRON_ENV=true`, `backend/src/electron-start.js` loads `.env.electron` (git-ignored) and then starts `app.js`. Electron's `electron/main.js` spawns the backend as a child process and injects `DATABASE_URL`/`PORT` — `.env.electron` must NOT override those two.

## Deployment

- **Frontend**: Netlify (reads `netlify.toml` at repo root; builds `frontend/`, publishes `frontend/dist`).
- **Backend**: Render/Railway/VPS. Production is on Render with Neon PostgreSQL.
- In production, the backend serves `frontend/dist/` statically if it exists (SPA catch-all in `app.js`).

## No tests, lint, or CI

There is no test suite, linter, formatter, or CI configuration. Do not look for them. Verify changes manually against the running app.

## Conventions

- **Pagination**: list endpoints take `page`/`limit`; use `backend/src/utils/pagination.js` (`paginate()` + `paginatedResponse()`).
- **Aggregations**: use `$queryRaw` with `GROUP BY` and `Promise.all` (see dashboard route) instead of loading full tables; wrap multi-table writes (factura creation, pagos, cotización conversion) in `prisma.$transaction`.

## Error handling

- Backend: `backend/src/middleware/errorHandler.js` maps Prisma codes (P2002, P2025, P2003) to friendly messages; error shape `{ error, message, code?, fields?, details? }`.
- Frontend: `frontend/src/utils/validation.js` (`ValidationRules`, `validateForm()`, `getErrorMessage()`); field/form messages via `FieldError`/`FormError` in `frontend/src/components/ui/`.

## Rate limiting & misc

- `backend/src/middleware/rateLimiter.js` exists — check it before adding public endpoints.
- `serialport` is a backend dependency (fiscal printer hardware); it may need native build tools on install.

## Env vars

Required: `DATABASE_URL`, `JWT_SECRET` (app exits if missing). Optional: `PORT` (default 3001), `EMPRESA_NOMBRE`, `EMPRESA_RIF`, `EMPRESA_DIRECCION`, `EMPRESA_TELEFONO`, `EMPRESA_EMAIL`, `MONEDA_SIMBOLO`, `MONEDA_CODIGO`, `B2B_API_KEY`, `ALLOWED_ORIGINS`, `DB_PROVIDER`, `NODE_ENV`, `ELECTRON_ENV`.
