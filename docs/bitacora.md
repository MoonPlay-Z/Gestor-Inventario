# Bitácora — GestorPOS

> Registro de trabajo con evidencia. Etiquetas: `HECHO`, `INFERIDO`, `HIPÓTESIS`,
> `ABIERTO`, `BLOQUEADO`. Referencias en formato `archivo:línea`.

## 2026-10-30 11:27 — Rol EMPRESA: inventario de accesos (backend y frontend)

**Estado:** PARCIAL
**Alcance:** `backend/src/routes/*`, `middleware/auth.js`, `middleware/subscriptionGuard.js`,
`frontend/src/AppRoutes.jsx`, `components/ui/RoleGuard.jsx`

### Hechos

- [HECHO] `requireRole` devuelve 401 sin usuario y 403 si el rol no está en la lista — `backend/src/middleware/auth.js:58-69`.
- [HECHO] `authMiddleware` invalida el token si `sessionVersion` no coincide con el de la BD — `backend/src/middleware/auth.js:41-42`.
- [HECHO] `EMPRESA` es el único rol (junto a `SUPER_ADMIN`) que puede fijar/actualizar la tasa: `POST /api/tasa/actualizar` y `PUT /api/tasa` — `backend/src/routes/tasa.js:80,95`.
- [HECHO] Exclusivo `EMPRESA` + `SUPER_ADMIN`: usuarios (`usuarios.js:13`), roles (`roles.js:45,75,114`), configuración (`config.js:187`), reportes de ganancias/inversión/impuestos (`reportes.js:70,93,141`).
- [HECHO] Compartido `EMPRESA` + `CAJA`: facturas (`facturas.js:36`), pagos (`pagos.js:41`), caja (`caja.js:17`), CxC (`cxc.js:43`), fiscal (`fiscal.js:9`), cotizaciones (`cotizaciones.js:21`).
- [HECHO] Compartido `EMPRESA` + `CAJA` + `INVENTARIO`: productos (`productos.js:28`), clientes (`clientes.js:10`).
- [HECHO] Dashboard abierto a `EMPRESA`, `CAJA`, `INVENTARIO` y `VISOR` — `backend/src/app.js:258`.
- [HECHO] `EMPRESA` queda fuera de activaciones y facturas de prueba: solo `SUPER_ADMIN` — `activaciones.js:151`, `facturasPruebas.js:55`.
- [HECHO] `subscriptionGuard` valida la suscripción del `EMPRESA`; las subcuentas heredan del padre y se bloquean si el padre está inactivo/eliminado — `backend/src/middleware/subscriptionGuard.js:14-16,53,72`.
- [HECHO] En frontend, `ADMIN_ONLY` = `[EMPRESA, SUPER_ADMIN]` — `frontend/src/components/ui/RoleGuard.jsx:68`; las rutas “solo EMPRESA” usan ese grupo — `frontend/src/AppRoutes.jsx:153-155`.

### Cambios

Sin cambios de código ni de datos: entrada de solo documentación.

### Decisiones

- Documentar accesos por evidencia de código y no por la documentación existente — razón: el `AGENTS.md` puede quedar desfasado respecto al código.

### Abierto

- [ABIERTO] `GET/POST /api/backup/export|import` no tienen `requireRole` — `backend/src/routes/backup.js:18,80`. Falta: probar con token de `CAJA`/`VISOR` si el endpoint responde; siguiente paso: prueba de integración y, si procede, añadir `requireRole('EMPRESA','SUPER_ADMIN')`.
- [ABIERTO] `GET /api/config` no tiene `requireRole` — `backend/src/routes/config.js:94`. Falta: revisar qué campos devuelve y si son globales o por empresa; siguiente paso: leer el handler completo.
- [ABIERTO] No se verificó en runtime (servidor no ejecutándose): los roles efectivos por endpoint son inferidos del código, no de respuestas HTTP reales.

### Riesgos

- Si `backup/import` fuese alcanzable por `CAJA` o `VISOR`, un usuario operativo podría sobrescribir datos de su empresa; mitigación actual: el handler filtra por `empresaId` (`backup.js:9-15`), pero no restringe el rol — confirmar antes de afirmar impacto.

### Próximo paso

1. Probar `GET /api/backup/export` con un token `VISOR` en entorno local y registrar el código de estado.
2. Revisar el cuerpo de `GET /api/config` y decidir si requiere rol.

## 2026-10-30 11:55 — Verificación runtime: VISOR frente a `/api/backup`

**Estado:** CERRADO
**Alcance:** `backend/src/routes/backup.js`, copia local de `backend/prisma/dev.db`

### Hechos

- [HECHO] Entorno aislado: copia de `backend/prisma/dev.db` en `/tmp/opencode/`, `PORT=3011`,
  `DB_PROVIDER=sqlite`, `TASA_DOLAR_AUTO_UPDATE=false`. No se tocó Neon ni el `dev.db` original.
- [HECHO] Control de rol: `GET /api/usuarios` con token `VISOR` → **403**
  (`{"error":"Acceso denegado. Se requiere rol: EMPRESA o SUPER_ADMIN"}`).
- [HECHO] `GET /api/backup/export` con token `VISOR` → **200**, 51 850 bytes (clientes,
  productos, 19 facturas, 36 ítems y 19 pagos de la empresa) — `backup.js:18`.
- [HECHO] El mismo export con token `EMPRESA` → **200**, 51 850 bytes (control).
- [HECHO] `POST /api/backup/import` con `{}` → **400** de validación (`backup.js:86-88`), no 403.
- [HECHO] `POST /api/backup/import` con payload válido y token `VISOR` → **400** y rollback:
  FK violada en `tx.cliente.deleteMany` (`backup.js:110`). Conteos antes y después:
  clientes/productos/facturas = 1/2/19 sin cambios.
- [HECHO] El primer export devolvió 500 por esquema local desfasado
  (`main.facturas.descripcionAnulacion` no existe); se corrigió con `prisma db push`
  sobre la copia, no sobre el original.
- [HECHO] Evidencia temporal en `/tmp/opencode/backend-bitacora.log`; tokens y copia de BD
  eliminados al terminar.

### Cambios

Sin cambios de código ni de datos: la escritura ocurrió solo en la copia descartable.

### Decisiones

- Probar sobre una copia SQLite en lugar de Neon — razón: ninguna escritura ni lectura
  sobre producción; permite romper datos sin consecuencias.

### Inferido

- [INFERIDO] `backup` no tiene barrera de rol: el `VISOR` llega al handler y obtiene el
  respaldo completo de su empresa. Se apoya en los 200 de export y los 400 de import
  (nunca 403); se confirmaría revisando que el frontend solo muestre la página a `EMPRESA`.
- [INFERIDO] El `import` no pudo demostrar sobrescritura porque falla antes por FK en este
  juego de datos; el `$transaction` revierte y protege la integridad.

### Abierto

- [ABIERTO] `import` falla por FK al borrar clientes (`backup.js:110`) con datos que aún
  referencian facturas/CxC; falta reproducir con un tenant limpio y decidir el orden de borrado.
- [ABIERTO] Añadir `router.use(requireRole('EMPRESA','SUPER_ADMIN'))` a `backup.js` y repetir
  esta prueba esperando 403 para `VISOR` y `CAJA`.

### Riesgos

- Confidencialidad: un `VISOR` (rol de solo lectura) puede descargar clientes, facturas y pagos
  de su empresa. Mitigación actual: solo la UI oculta la pantalla; el backend no la impone.

### Próximo paso

1. Añadir la barrera de rol en `backup.js` y verificar con los mismos tokens.
2. Reproducir el fallo de FK del `import` con un tenant sin cuentas por cobrar.

## 2026-10-30 13:52 — Barrera de rol en `/api/backup`

**Estado:** CERRADO
**Alcance:** `backend/src/routes/backup.js`

### Hechos

- [HECHO] Se añadió `requireRole('EMPRESA','SUPER_ADMIN')` como middleware del router,
  antes de `GET /export` y `POST /import` — `backend/src/routes/backup.js:8,12`.
- [HECHO] Verificación runtime sobre copia SQLite aislada (`:3011`, `TASA_DOLAR_AUTO_UPDATE=false`):
  - `VISOR` → `GET /api/backup/export` = **403** ("Acceso denegado…").
  - `VISOR` → `POST /api/backup/import` = **403** (misma respuesta).
  - `EMPRESA` → `GET /api/backup/export` = **200**, 51 850 bytes.
  - Control: `VISOR` → `GET /api/dashboard` = **200** (no se rompió el acceso permitido).
- [HECHO] Copia de BD, tokens y respuestas temporales eliminados al terminar; log en
  `/tmp/opencode/backend-bitacora-2.log`.

### Cambios

| Archivo | Cambio | Motivo |
|---|---|---|
| `backend/src/routes/backup.js` | `router.use(requireRole('EMPRESA','SUPER_ADMIN'))` | Cerrar el acceso de `CAJA`/`INVENTARIO`/`VISOR` al respaldo del tenant |

### Decisiones

- Aplicar el guard a nivel de router y no ruta por ruta — razón: cubre futuras rutas que se añadan al archivo y evita olvidos.
- Mantener `SUPER_ADMIN` — razón: el handler ya distingue su comportamiento global (`backup.js:20,83`).

### Abierto

- [ABIERTO] El `import` sigue fallando por FK con tenants que tienen CxC (`backup.js:110`); no se tocó porque es un bug distinto.
- [ABIERTO] Revisar si otros routers sin `requireRole` (p. ej. `GET /api/config`, `config.js:94`) necesitan el mismo criterio.

### Riesgos

- Ninguno nuevo detectado: el cambio solo restringe; los roles que ya usaban la pantalla (`EMPRESA`, `SUPER_ADMIN`) siguen con 200.

### Próximo paso

1. Añadir una prueba de integración que espere 403 para `VISOR` en `backup` y evite la regresión.
2. Decidir el orden de borrado del `import` para resolver la FK.

## 2026-10-30 14:08 — Implementación inicial de la bitácora de actividad

**Estado:** PARCIAL
**Alcance:** persistencia, captura de eventos, API y panel `/bitacora`

### Cambios

| Archivo / área | Cambio |
|---|---|
| `backend/prisma/schema.prisma`, `schema.sqlite.prisma` | Modelo `Bitacora` con índices de empresa, fecha, categoría, acción y usuario |
| `backend/prisma/migrations/20261030140800_add_bitacora/migration.sql` | Tabla e índices PostgreSQL; triggers impiden `UPDATE`, `DELETE` y `TRUNCATE` |
| `backend/scripts/proteger-bitacora-sqlite.js` | Instala triggers SQLite al ejecutar `npm run db:sqlite:push` |
| `backend/src/services/bitacora.js` | Cola con límite, sanitizado recursivo, timestamps ordenables, SHA-256 encadenado, reintentos y errores visibles |
| `backend/src/routes/bitacora.js` | Consulta por empresa, filtros, cursor compuesto y verificación de los últimos 500 registros |
| Rutas de ventas, pagos, CxC, caja, productos, tasa, configuración, usuarios y login | Captura explícita de eventos con contexto del actor |
| `frontend/src/pages/BitacoraPage.jsx` | Panel filtrable, detalle de cambios y estado de integridad |
| `backend/src/services/bitacora.test.js` | Pruebas de sanitizado, cadena válida, manipulación y salto de registros |

### Decisiones y límites conocidos

- [HECHO] La versión inicial usa el cliente Prisma principal; no requiere una segunda URL de BD.
- [HECHO] La verificación visual cubre los 500 registros más recientes; no sustituye el verificador histórico completo previsto en el plan.
- [ABIERTO] La cola/hash está serializada por proceso, no entre varias instancias del backend.
- [ABIERTO] Captura explícita actual; faltan interceptor general de Prisma, particionado y retención.
- [ABIERTO] En SQLite hay que aplicar `npm run db:sqlite:push` para crear el modelo y los triggers.
- [ABIERTO] Antes del despliegue PostgreSQL hay que aplicar `npm run db:deploy`.

### Verificación

- [HECHO] `npm run test:bitacora`: 3 pruebas aprobadas.
- [HECHO] `prisma validate` aprobó el esquema PostgreSQL.
- [HECHO] `prisma validate` aprobó el esquema SQLite al validar con una URL `file:`.
- [HECHO] `npm run db:generate` generó el cliente PostgreSQL y el delegate `prisma.bitacora` quedó disponible.
- [HECHO] `npm run build` del frontend completó; quedan avisos existentes de chunks grandes y carga dinámica.
- [HECHO] ESLint pasó sin errores; en `auth.js:276` queda una advertencia de variable no usada en un `catch` existente.
- [ABIERTO] No se ejecutó una migración real contra PostgreSQL ni un flujo HTTP de extremo a extremo.

## 2026-10-30 14:20 — Base Neon exclusiva para auditoría

**Estado:** IMPLEMENTADO; pendiente configuración del secreto y migración de producción
**Decisión del usuario:** usar una base Neon separada

### Cambios

- [HECHO] La bitácora salió de los esquemas operacionales y ahora tiene esquemas Prisma y migraciones propios en `backend/prisma/auditoria/`.
- [HECHO] `backend/src/db/auditoriaDb.js` selecciona el cliente PostgreSQL con `AUDIT_DATABASE_URL`; en desarrollo sin esa variable utiliza `backend/prisma/auditoria/bitacora.db`.
- [HECHO] La falta o caída de la base de auditoría se informa, reintenta y puede perder eventos al agotar el buffer, pero no interrumpe ventas.
- [HECHO] `db:auditoria:deploy` aplica la migración exclusivamente en `AUDIT_DATABASE_URL`; `db:auditoria:sqlite:push` prepara SQLite y sus triggers.
- [HECHO] Los clientes de auditoría se generan aparte, sin conexión a la base operacional.

### Operación pendiente

1. Crear la base Neon exclusiva y definir `AUDIT_DATABASE_URL` en producción.
2. Ejecutar `npm run db:auditoria:deploy`; `npm install` genera ambos clientes Prisma automáticamente.
3. Decidir más adelante la coordinación de hash si se ejecutan varias instancias escritoras; hoy la cadena está serializada por proceso.

### Verificación posterior a la separación

- [HECHO] Los cuatro esquemas (PostgreSQL/SQLite operacionales y PostgreSQL/SQLite de auditoría) validan.
- [HECHO] El cliente operacional ya no expone `bitacora`; ambos clientes dedicados sí la exponen.
- [HECHO] Escritura de evento en SQLite separada: fila persistida, secreto eliminado y hash verificado.
- [HECHO] Triggers SQLite bloquearon `UPDATE` y `DELETE`; las pruebas unitarias siguen aprobadas.
- [ABIERTO] No se conectó ni migró Neon: falta la URL de producción y la migración debe aplicarse allí.

## 2026-10-30 14:32 — Metadatos HTTP para mutaciones

**Estado:** IMPLEMENTADO

- [HECHO] `middleware/bitacoraHttp.js` registra mutaciones autenticadas y exportaciones sin almacenar cuerpos ni query strings.
- [HECHO] Cada evento explícito de negocio recibe método/ruta/estado/duración al finalizar la respuesta; los eventos ya detallados no generan una segunda fila HTTP.
- [HECHO] El flush respeta el orden de hash y espera a que la respuesta determine su código y duración.
- [HECHO] Se añadió la cobertura de metadatos HTTP al hash encadenado y a la visualización expandida del panel.
- [ABIERTO] Las lecturas ordinarias y módulos B2B siguen fuera del middleware; los descartes se notifican en logs, no mediante alerta al administrador.
