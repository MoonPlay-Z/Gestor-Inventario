# Arnés k6 — búsqueda de bugs del POS

Suite de pruebas con **Grafana k6** para encontrar defectos funcionales, de
concurrencia, de validación, de multi‑tenant y de rendimiento en el backend.

No es un benchmark “verde”: el objetivo es que los escenarios **fallen cuando
hay un bug**. Cada escenario tiene un oráculo explícito y, al terminar las
carreras, `verify.js` comprueba invariantes directamente en la base de datos.

---

## Requisitos

- `k6` (Grafana k6) instalado.
- Backend corriendo y accesible (`BASE_URL`, por defecto `http://localhost:3001`).
- **PostgreSQL** de pruebas. SQLite no sirve: serializa las escrituras y oculta
  las carreras que sí ocurren en producción.
- `JWT_SECRET` idéntico al del backend (los fixtures firman tokens propios y no
  pasan por `/auth/login`).

### Instalar k6 (Ubuntu/Debian)

```bash
sudo gpg -k
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update && sudo apt install k6
```

### PostgreSQL efímero

```bash
docker run --rm -d --name pos-test-pg \
  -e POSTGRES_PASSWORD=test -e POSTGRES_DB=pos_test \
  -p 5433:5432 postgres:16
```

---

## Puesta en marcha

```bash
cp tests/k6/.env.k6.example tests/k6/.env.k6
# edita BASE_URL / DATABASE_URL / JWT_SECRET si hace falta

# El backend debe arrancar con la MISMA DATABASE_URL y JWT_SECRET:
cd backend
DATABASE_URL=postgresql://postgres:test@localhost:5433/pos_test \
JWT_SECRET=test-secret \
TASA_DOLAR_AUTO_UPDATE=false \
npm run dev
```

En otra terminal:

```bash
cd tests/k6
./run.sh reset     # migra desde cero + seed (borra la DB de pruebas)
./run.sh all       # suite completa
```

`run.sh reset` ejecuta `prisma migrate reset --force` y luego el seed. Exige
`ALLOW_DESTRUCTIVE_TESTS=true` (está en `.env.k6.example`) y aborta si la
`DATABASE_URL` no parece de pruebas.

### Ejecutar un solo escenario

```bash
cd tests/k6
./run.sh run scenarios/04-race-pagos.js
./run.sh verify
```

O manualmente:

```bash
export K6_FIXTURES="$(cat tests/k6/fixtures.json)"
k6 run tests/k6/scenarios/04-race-pagos.js
```

---

## Escenarios

| # | Archivo | Qué busca | Oráculo |
|---|---|---|---|
| 01 | `01-auth-limiter.js` | Rate limit de login y si `/auth/me` comparte el limiter | 10 intentos → 401, 11.º → 429; `/auth/me` debe seguir en 200 |
| 02 | `02-idempotencia-factura.js` | 20 POST con el mismo `requestId` | 1×201 + 19×200 idempotentes; 1 factura; stock −1 |
| 03 | `03-oversell-stock.js` | 20 ventas concurrentes con stock 5 | ≤5 éxitos; stock final = 5 − éxitos; nunca negativo |
| 04 | `04-race-pagos.js` | 10 pagos simultáneos por el saldo exacto (`/pagos` y `/cxc/:id/pago`) | 1 solo pago aceptado por puerta; CxC saldada; sin sobrepago |
| 05 | `05-race-caja.js` | 10 aperturas + 10 cierres simultáneos | 1 apertura y 1 cierre; una sola caja OPEN |
| 06 | `06-paginacion-fuzz.js` | `page=0/-1/abc`, `limit=-5/999999`, fechas/estados inválidos | 4xx o valores clampeados; **nunca 5xx** |
| 07 | `07-payload-fuzz.js` | `"abc"`, `null`, objetos, `1e309`, JSON roto, body 1.2 MB | 4xx (413 para body grande); **nunca 5xx** |
| 08 | `08-multitenant.js` | Empresa B contra IDs de A; roles sin permiso; `requestId` compartido | 404/403; **ningún 2xx con datos ajenos** |
| 09 | `09-monedas-tasa.js` | Pagos USD/VES, tolerancia de redondeo, tasa por empresa | CxC en USD; 0.004 se acepta, 0.01 se rechaza; tasa 100 |
| 10 | `10-load-read.js` | Carga de lectura 0→50 VUs, 8 min | p95 < 800 ms, p99 < 2 s, error < 1 % |

Los escenarios 02–05 y 09 **mutan datos**. `run.sh all` resetea la DB antes de
cada uno. Si los ejecutas a mano, haz `./run.sh reset` entre ellos.

---

## Bugs encontrados

Estado de cada hipótesis tras una corrida real contra PostgreSQL 16 (los
escenarios fallan exactamente donde hay bug; ese es el objetivo):

| # | Estado | Hallazgo | Dónde |
|---|---|---|---|
| 1 | ✅ Corregido | **Sobrepago por carrera**: 6 de 10 pagos simultáneos por 10 USD se aceptaron sobre una factura de 10 USD (total pagado 60). Misma carrera en `/api/pagos` y `/api/cxc/:id/pago`. El saldo se lee antes de `$transaction`, sin `SELECT ... FOR UPDATE`. | `pagos.js:108`, `cxc.js:425` |
| 2 | ✅ Corregido | **Fuga entre empresas vía `requestId`**: la empresa B reutiliza el `requestId` de A y recibe la factura de A (HTTP 200). `requestId` es `@unique` global y el branch de idempotencia no filtra tenant. | `facturas.js:263`, `schema.prisma:238` |
| 3 | ✅ Corregido | **Doble cierre de caja**: 6 de 10 cierres simultáneos respondieron 200. `findFirst` + `update` sin bloquear la fila del cierre. | `caja.js:349` |
| 4 | ✅ Corregido | **`GET /api/cxc/export` inalcanzable**: responde 404 porque `GET /:id` está declarado antes y captura `id="export"`. | `cxc.js:585` vs `cxc.js:285` |
| 5 | ✅ Corregido | **Paginación negativa → 500**: `page=0`/`page=-1` en clientes, facturas y cxc produce `skip` negativo y Prisma lanza. `page/limit` no numéricos en clientes también da 500. | `clientes.js:16`, `facturas.js:32`, `cxc.js:177` |
| 6 | ✅ Corregido | **Números no parseables → 500**: `new Decimal("abc")` (o un objeto) en productos, pagos y cxc lanza `DecimalError` y termina en 500. | `productos.js:325`, `pagos.js:93`, `cxc.js:415` |
| 7 | ✅ Corregido | **`/auth/me` detrás de `loginLimiter`**: tras agotar el login, `GET /auth/me` responde 429. Un endpoint de lectura consume el cupo de login. | `auth.js:325`, `auth.js:27` |
| 8 | ✅ Corregido | **Métricas de inventario en cero para subusuarios**: EMPRESA ve 5 productos, CAJA ve 0. Usa `req.user.id` en vez de `empresaId || id`. | `productos.js:23` |
| 9 | ✅ Corregido | **`POST /api/config` sin `requireRole`**: desde un CAJA con body vacío responde 400 (validación) en lugar de 403. Falta la autorización. | `config.js:183` |
| 10 | ✅ Corregido | **`GET /api/pagos` siempre 500**: usa `include` y `select` al mismo nivel en el mismo `findMany`. El listado de pagos está roto sin importar los parámetros. | `pagos.js:44-73` |
| 11 | ✅ Corregido | **CxC de facturas VES descuadrada**: al pagar una factura de 1000 Bs con `POST /api/pagos`, la CxC (que es USD-normalizada) queda con `montoCobrado=1000` sobre `montoOriginal=10`. `pagos.js` escribe montos en la moneda de la factura, mientras `cxc.js` los normaliza a USD. | `pagos.js` (actualización de CxC) |
| 12 | 🔍 No reproducible en local | **Rate limit global detrás de proxy**: sin `TRUST_PROXY`, todos los clientes comparten `req.ip` y el límite de 10 logins/15 min pasa a ser global. Requiere un proxy delante; riesgo operativo. | `app.js`, `rateLimiter.js` |

> Los números 1–11 son observados, no teóricos. Para verlos: `./run.sh all`.
> Los escenarios fallan a propósito; revisa qué `check`/invariante concreto se
> puso en rojo para identificar el bug.

### Remediación aplicada

Los 11 bugs confirmados se corrigieron en el backend y la suite completa queda en
verde (10/10 escenarios + invariantes). Cambios por fase:

| Bug | Corrección | Archivos |
|---|---|---|
| 1 | Validación de saldo **dentro** de la transacción + `SELECT ... FOR UPDATE` sobre la factura (`utils/locks.js`). Orden de bloqueo factura→CxC en ambos endpoints. | `pagos.js`, `cxc.js`, `utils/locks.js` |
| 2 | El branch de idempotencia filtra tenant (`findFirst` con `facturaTenantFilter`), también en la recuperación del `P2002`. | `facturas.js` |
| 3 | Cierre con `updateMany({ where: { id, estado: 'OPEN' } })`; 0 filas ⇒ error de negocio. | `caja.js` |
| 4 | `/export` declarado **antes** de `/:id`. | `cxc.js` |
| 5 | Todas las listas usan `paginate()` (clamp `page>=1`, `take` 1–100). | `clientes.js`, `facturas.js`, `cxc.js`, `productos.js` |
| 6 | `toDecimalSeguro()` en la entrada + mapeo global `DecimalError → 422`. | `utils/decimal.js`, `errorHandler.js`, productos/pagos/cxc |
| 7 | `GET /auth/me` sin `loginLimiter` (sigue exigiendo token). | `auth.js` |
| 8 | `req.user.empresaId || req.user.id`. | `productos.js` |
| 9 | `requireRole('EMPRESA','SUPER_ADMIN')` en `POST /api/config`. | `config.js` |
| 10 | Un único `select` anidado (sin `include`+`select`). | `pagos.js` |
| 11 | La CxC se escribe en USD con la normalización compartida `pagoCxcAUsd`; `/pagos` y `/cxc` usan la misma fuente. Reparación de datos históricos con `backend/scripts/backfill-cxc-monedas.js` (dry-run por defecto). | `pagos.js`, `paymentCurrency.js`, `scripts/backfill-cxc-monedas.js` |

---

## Qué genera

- `results/<escenario>.json` — resumen de k6 (`--summary-export`).
- `results/_status.txt` — exit code de cada escenario (0 OK, 99 threshold, 1 error).
- `fixtures.json` — IDs y tokens de la última ejecución del seed.
- Salida de `verify.js` — PASS/FAIL por invariante.

`k6` sale con **99** cuando un threshold falla (por ejemplo, `checks` < 100 %).
Eso es exactamente lo que se busca: el escenario detectó un bug.

### Invariantes de `verify.js`

- Stock no negativo y coherente con las ventas no anuladas.
- Pagos que no superan el total de la factura.
- `montoCobrado + montoPendiente = montoOriginal` en cada CxC.
- Máximo una caja `OPEN` por usuario.
- Sin `requestId` `k6-*` duplicados.
- Sin CxC ni pagos huérfanos.

---

## Seguridad

- `seed` exige `ALLOW_DESTRUCTIVE_TESTS=true` y una `DATABASE_URL` de test
  (`localhost`, `127.0.0.1`, `:5433`, `file:` o nombres con `test`).
- `reset` borra la base. **Nunca** lo apuntes a producción.
- Los escenarios 02–05 y 09 crean facturas, pagos y mueven caja.
- El escenario 08 intenta eliminar un producto sonda de la empresa A; es
  intencional y solo afecta datos `k6_*`.
- El escenario 01 agota el rate limit de login del backend. Reinícialo antes de
  volver a probar login manualmente.

---

## Troubleshooting

| Síntoma | Causa probable |
|---|---|
| Todos los escenarios dan 401 | `JWT_SECRET` del seed no coincide con el backend. Resiembra con el secreto correcto. |
| 429 desde el primer escenario | El backend ya tenía el limiter agotado. Reinícialo. |
| `K6_FIXTURES no está definido` | Usa `./run.sh run ...` o exporta el JSON manualmente. |
| Los pagos tardan 8 s | Sin salida a internet, `tasaBCVPorFecha` espera el timeout. `warmupBcv()` lo hace una vez; el resto usa el backoff. |
| `relation does not exist` | Falta migrar. Ejecuta `./run.sh reset`. |
| `database is locked` | Estás usando SQLite. Cambia a PostgreSQL. |
| `verify` falla tras una carrera | Es el resultado esperado si el escenario encontró el bug; revisa el invariante concreto. |
