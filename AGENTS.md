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
```

Backend-only scripts (run inside `backend/`): `npm run setup` (install + generate + migrate + seed), `npm run db:reset` (destructive: drops all data + reseeds).

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

`vite.config.js` enables HTTPS with a self-signed cert (required for camera/barcode on mobile) and proxies `/api` → `http://localhost:3001`. The frontend calls the API at `/api` by default (override with `VITE_API_URL`).

## Electron mode

When `ELECTRON_ENV=true`, `electron-start.js` loads `.env.electron` (git-ignored) for packaged desktop builds. Electron spawns the backend as a child process.

## Deployment

- **Frontend**: Netlify (reads `netlify.toml` at repo root; builds `frontend/`, publishes `frontend/dist`).
- **Backend**: Render/Railway/VPS. Production is on Render with Neon PostgreSQL.
- In production, the backend serves `frontend/dist/` statically if it exists (SPA catch-all in `app.js`).

## No tests, lint, or CI

There is no test suite, linter, formatter, or CI configuration. Do not look for them. Verify changes manually against the running app.

## Performance optimizations

- **Pagination**: All list endpoints support `page` and `limit` query params. Use `backend/src/utils/pagination.js` (`paginate()` + `paginatedResponse()`) for consistency.
- **Dashboard**: Uses parallel `$queryRaw` aggregations instead of loading full datasets into memory. All 6 data points run concurrently via `Promise.all`.
- **Indexes**: Migration `20260929000000_add_performance_indexes` adds composite indexes on `facturas`, `pagos`, `productos`, `clientes`, `cotizaciones`, `usuarios`, and `cierres_caja`.
- **N+1 prevention**: Use `$queryRaw` with `GROUP BY` for aggregations (pagos por factura, totales por estado) instead of loading related records into memory.
- **Transactions**: Critical multi-table operations (factura creation, payment registration, cotización conversion) use `prisma.$transaction` for atomicity.

## Error handling system

### Frontend components
- `FieldError` — per-field validation errors with icon and styling
- `FormError` — general form errors with dismiss option
- `ToastContext` — improved toast system with duration by type (error: 8s, warning: 6s, success: 5s)

### Validation utilities
- `frontend/src/utils/validation.js` — reusable validation rules (`ValidationRules`) and contextual error messages (`getErrorMessage`)
- Password strength indicator with 5 levels
- Form validation with `validateForm()` helper

### Backend error handling
- `backend/src/middleware/errorHandler.js` — centralized error handler
- Prisma error codes mapped to user-friendly messages (P2002, P2025, P2003)
- Custom error types: `VALIDATION_ERROR`, `BUSINESS_ERROR`
- Error response format: `{ error, message, code?, fields?, details? }`

## UI components

Located in `frontend/src/components/ui/`:
- `Button` — reusable button with variants
- `FieldError` / `FieldSuccess` — field-level validation messages
- `FormError` / `FormSuccess` — form-level messages
- `RoleGuard` / `useRole` — role-based access control
- `NavItem` / `NavSection` — navigation components
- `ReceiptModal` — receipt display modal
- `CashRegisterReport` — cash register report component

## Legal & compliance pages

- `/politica-cookies` — Cookie policy
- `/politica-privacidad` — Privacy policy
- `/terminos` — Terms and conditions
- Cookie consent banner with granular preferences
- Registration requires explicit acceptance of terms and privacy policy

## Blog

- `/blog` — Blog listing page
- `/blog/:slug` — Individual blog articles
- 8 SEO-optimized articles for keywords like "control de inventario", "facturación", "sistema POS"

## Env vars

Required: `DATABASE_URL`, `JWT_SECRET`. Optional: `PORT` (default 3001), `EMPRESA_NOMBRE`, `EMPRESA_RIF`, `EMPRESA_DIRECCION`, `EMPRESA_TELEFONO`, `EMPRESA_EMAIL`, `MONEDA_SIMBOLO`, `MONEDA_CODIGO`, `B2B_API_KEY`, `ALLOWED_ORIGINS`, `DB_PROVIDER`, `NODE_ENV`.
