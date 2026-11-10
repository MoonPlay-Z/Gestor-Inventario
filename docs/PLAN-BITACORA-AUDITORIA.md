# Plan de implementación — Panel de Auditoría (Bitácora)

**Estado:** implementación parcial; despliegue y escalabilidad pendientes
**Creado:** 2026-10-16  
**Depende de:** commit `82c3b6a` (arreglos de reportes)

## Estado de implementación — 2026-10-30

Ya existe una primera versión en el código:

- Modelo Prisma `Bitacora`, migración PostgreSQL y esquema SQLite.
- Cola asíncrona con sanitizado, hash encadenado, reintentos y errores de descarte visibles en logs.
- Middleware HTTP de mutaciones/exportaciones con método, ruta sin query, estado y duración.
- Captura explícita de ventas, pagos, CxC, caja, productos, tasa, configuración,
  creación/modificación de usuarios e intentos de inicio de sesión.
- API paginada, filtros, verificación de los últimos 500 registros y panel `/bitacora`.
- Triggers para impedir `UPDATE`/`DELETE` (y `TRUNCATE` en PostgreSQL).

La decisión de almacenamiento quedó confirmada: producción usa una **base Neon
separada** mediante `AUDIT_DATABASE_URL`, con esquema y migraciones propios.
En desarrollo, si la variable no está definida, se usa un archivo SQLite local
separado. La bitácora ya no forma parte del esquema operacional.

Siguen pendientes las particiones mensuales, la retención y el interceptador
genérico de Prisma. La cola/hash se serializa dentro de un proceso; ejecutar
varios escritores simultáneos requiere coordinación en BD antes de escalar
horizontalmente.

Para producción, configura `AUDIT_DATABASE_URL`, regenera ambos clientes y aplica
`cd backend && npm run db:auditoria:deploy` además de `npm run db:deploy` para la
base operacional. En desarrollo SQLite, ejecuta
`cd backend && npm run db:auditoria:sqlite:push` para crear la tabla e instalar
los triggers de protección.

---

## 1. Objetivo

Bitácora inmutable de todas las acciones del sistema: inicio/cierre de sesión, emisión y anulación de facturas, movimientos de CxC, ajustes de inventario, cambios de precio, alta de usuarios, descargas de reportes y operaciones de caja.

Debe responder preguntas concretas:
- ¿Quién cambió el precio del tomate? ¿De cuánto a cuánto?
- ¿Qué producto y qué cantidad se vendió en la factura #590?
- ¿Qué usuario emitió esa factura, desde qué IP y a qué hora?
- ¿Quién eliminó este producto y cuándo?
- ¿Se ha manipulado algún registro de la bitácora?

---

## 2. Decisiones tomadas

| Decisión | Valor | Motivo |
|---|---|---|
| Almacenamiento | **Neon**, base separada (`neondb_auditoria`) | Mismo proveedor que la app: una sola latencia, un solo panel, sin dependencia cruzada |
| Etapa intermedia | **Sin NoSQL** — SQL directo | NoSQL no resolvería el problema de espacio (512 MBfree vs ~800 MB en 5 años) y obligaría a mantener dos sistemas durante la migración |
| Disponibilidad | **Asíncrono con cola en memoria** | Una caída de la BD de auditoría nunca debe detener una venta |
| Immutabilidad | `REVOKE DELETE, UPDATE` + hash encadenado | Garantizada por la base de datos, no por convención |
| Retención | 5 años, particionado por mes | ~800 MB totales; particiones de 1 mes mantienen las consultas rápidas |
| Visibilidad | `SUPER_ADMIN`, `EMPRESA` | `ROLE_GROUPS.ADMIN_ONLY` ya existe con esos dos roles |
| Borrado | Ninguno, nunca | Requisito del cliente |

---

## 3. Estado actual

**Legado:**
- El modelo `AuditLog` y su tabla `audit_logs` permanecen para conservar los registros históricos previos.
- `ROLE_GROUPS.ADMIN_ONLY` limita el acceso a `EMPRESA` y `SUPER_ADMIN`.

**Bitácora nueva:**
- El modelo `Bitacora`, el cliente Prisma y las migraciones viven en `prisma/auditoria/`, separados del esquema operacional.
- Las rutas de consulta y el panel `/bitacora` están conectados a `AUDIT_DATABASE_URL`.
- La tabla es append-only mediante triggers; la API verifica una ventana de 500 registros.

**Falta para completar el plan:**
- Interceptador de Prisma y captura de todas las lecturas; el middleware actual limita el volumen auditando mutaciones autenticadas y exportaciones.
- Script de verificación del histórico completo, particionado mensual y política de retención.
- Notificación administrativa de cola llena/descarte (hoy se reporta en los logs del backend).
- Configurar la base Neon y aplicar su migración de producción.

---

## 4. Esquema de la bitácora

```sql
CREATE TABLE bitacora (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresaId       UUID NOT NULL,
  usuarioId       UUID,
  usuarioNombre   TEXT,
  usuarioRol      TEXT,

  categoria       TEXT NOT NULL,   -- VENTAS | INVENTARIO | CAJA | CXC | ACCESO | ADMIN
  modulo          TEXT NOT NULL,   -- facturas | productos | clientes | usuarios
  accion          TEXT NOT NULL,   -- EMITIR_FACTURA | MODIFICAR_PRECIO | ...
  entidad         TEXT NOT NULL,   -- Factura | Producto | Cliente
  entidadId       TEXT,
  descripcion     TEXT NOT NULL,   -- "Cambió precio de tomate de $3.00 a $5.00"

  datosAnteriores JSONB,
  datosNuevos     JSONB,
  monto           NUMERIC(12,2),
  montoAntes      NUMERIC(12,2),
  montoDespues    NUMERIC(12,2),

  ipAddress       INET,
  userAgent       TEXT,
  httpMethod      TEXT,
  httpPath        TEXT,
  httpStatus      INT,
  duracionMs      INT,

  hash            TEXT NOT NULL,
  hashAnterior    TEXT,
  creadoEn        TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (creadoEn);

REVOKE DELETE, UPDATE, TRUNCATE ON bitacora FROM PUBLIC;

CREATE TABLE bitacora_2026_10 PARTITION OF bitacora
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE INDEX idx_bitacora_empresa_fecha ON bitacora (empresaId, creadoEn DESC);
CREATE INDEX idx_bitacora_categoria    ON bitacora (categoria, creadoEn DESC);
CREATE INDEX idx_bitacora_accion       ON bitacora (accion);
```

**Nota sobre el particionado:** se crea una partición por mes. Una consulta del último mes toca una partición en lugar de escanear todo el histórico. Al archiving, las particiones viejas se `DETACH` a tablas `archive` — siguen existiendo, no se borran.

**Nota sobre el hash:** cada fila guarda `SHA256(hashAnterior + contenido)`. Si alguien modifica o borra una fila, el hash de la siguiente deja de cuadrar. La inmutabilidad la garantiza el `REVOKE`; el hash **detecta** sabotaje.

---

## 5. Arquitectura de captura

### 5.1 Cliente de base de datos

`backend/src/db/auditoriaDb.js` — instancia de Prisma propia apuntando a `AUDIT_DATABASE_URL`; en desarrollo admite SQLite separado.

### 5.2 Cola asíncrona

`backend/src/services/bitacora.js`:

- Buffer en memoria (tope 1000 entradas)
- `flush()` cada 2 segundos o cada 50 registros, lo que ocurra primero
- Reintento con backoff exponencial
- Si el buffer se llena: descarta las entradas más antiguas e informa el descarte en logs; todavía no notifica al administrador
- El hash se calcula en el `flush`, en orden de inserción

**Comportamiento ante caída de Neon:** las entradas se acumulan en el buffer. Al reconectar, se reintentan. Si la caída dura más que la memoria disponible o se agotan los intentos, se pierden registros y se informa en logs.

### 5.3 Tres mecanismos de captura

**a) Middleware HTTP** — para endpoints autenticados que mutan datos y rutas de exportación. Registra método, ruta sin query string, IP, user agent, duración y código de estado; no guarda cuerpos de solicitud. Las lecturas ordinarias quedan fuera para evitar ruido y volumen.

**b) Interceptador de Prisma** — envuelve `update` y `delete` del cliente principal. Lee el registro antes de modificar y guarda el diff. Produce el "de cuánto a cuánto" sin tocar las rutas.

**c) Marcas explícitas** — para acciones donde el middleware no alcanza el detalle:

| Acción | Datos a registrar |
|---|---|
| Emitir factura | Ítems: producto, cantidad, precio unitario, total |
| Anular factura | Motivo (obligatorio) |
| Pago en CxC | Monto, moneda, método, factura afectada |
| Ajustar stock | Producto, cantidad antes → después |
| Inicio / cierre de sesión | Usuario, IP, dispositivo |
| Crear usuario | Username, rol, nombre |

### 5.4 Sanitizado obligatorio

Sin esto, la bitácora se convierte en un volcado de credenciales.

```js
const EXCLUIDOS = new Set([
  'password', 'passwordHash', 'passwordTocado',
  'mfaSecret', 'sessionVersion', 'sudoModeExpiresAt',
  'token', 'authorization', 'apiKey', 'accessToken',
]);
```

Se aplica recursivamente a los objetos antes de guardar, **y también a los mensajes de error**: un `error.stack` puede incluir valores de variables en algunos casos.

---

## 6. Panel frontend

Ruta `/auditoria`, sección Administración, `roles={ROLE_GROUPS.ADMIN_ONLY}`.

```
┌────────────────────────────────────────────────────────────┐
│  Bitácora                            [Resumen] [⬇ CSV]     │
├────────────────────────────────────────────────────────────┤
│  [Fecha] [Categoría] [Módulo] [Usuario] [Buscar]           │
│  ✓ Integridad verificada                                   │
├────────────────────────────────────────────────────────────┤
│  14:32:08 · brayan soto (CAJA) · 190.2.14.3                │
│  📄 EMITIÓ FACTURA — Factura #590                          │
│     tomate 27,12 kg × $5,00 = $135,73 · Total $19,53       │
│                                              [Ver detalle ▾]│
│  ─────────────────────────────────────────────────────    │
│  14:28:11 · wiliexy mendoza (CAJA)                         │
│  💰 MODIFICÓ PRECIO — Producto                            │
│     tomate · precioVenta: $3,00 → $5,00                    │
│                                              [Ver detalle ▾]│
└────────────────────────────────────────────────────────────┘
```

- **Paginación por cursor** en `(empresaId, creadoEn DESC)`. Con offset la página 500 sería lentísima.
- **Detalle expandible**: diff campo por campo de `datosAnteriores` vs `datosNuevos`.
- **Verificación de integridad**: al cargar, recalcula el hash de las últimas N filas. Si no cuadra, banner rojo "Integridad comprometida".

---

## 7. Script de verificación

```bash
node scripts/verificar-bitacora.js
```

Recorre las particiones en orden cronológico, recalcula `SHA256(hashAnterior + contenido)` y reporta la primera fila donde no cuadra. Detecta filas borradas, modificadas o insertadas fuera de orden.

---

## 8. Plan de fases

| # | Fase | Contenido | Tiempo |
|---|---|---|---|
| 1 | Infraestructura | Esquema en Neon, `auditoriaDb.js`, `auditoria.js` con cola y hash | 3 h |
| 2 | Captura HTTP | Middleware global + sanitizado | 3 h |
| 3 | Diff automático | Interceptador de Prisma | 3 h |
| 4 | Marcas explícitas | Facturas, pagos, stock, auth, usuarios | 4 h |
| 5 | Panel | Endpoint de consulta + `AuditoriaPage.jsx` + sidebar | 5 h |
| 6 | Integridad | Script de verificación + banner de alerta | 2 h |

**Total estimado: 20 horas.**

---

## 9. Configuración requerida

```bash
# Crear la base en el panel de Neon: neondb_auditoria
# Luego en backend/.env:
AUDIT_DATABASE_URL="postgresql://.../neondb_auditoria?sslmode=require"
```

Y en `backend/.env.example`, sin el valor real:

```
AUDIT_DATABASE_URL="postgresql://user:pass@host/neondb_auditoria?sslmode=require"
```

---

## 10. Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Latencia adicional en escrituras | Media | Escritura asíncrona; la venta no espera al flush |
| Pérdida de registros si Neon está caído | Aceptada | Cola en memoria + alerta `CRITICO` al admin |
| Volumen de escritura excesivo | Baja | Particionado mensual; 5 años ≈ 800 MB |
| Interceptador de Prisma degrada rendimiento | Media | Solo envuelve `update`/`delete`, no `findMany`. Medir antes de activarlo en producción |
| Fuga de credenciales en los logs | **Alta** | Lista de exclusión recursiva + sanitizado de errores. Probar con un login real antes de producción |
| Manipulación de la bitácora | Media | `REVOKE` a nivel de BD + hash encadenado + verificación periódica |

---

## 11. Criterios de aceptación

- [ ] Un login fallido **no** escribe la contraseña en ningún campo
- [ ] Cambiar el precio de un producto genera un registro con `datosAnteriores.precioVenta` y `datosNuevos.precioVenta`
- [ ] Emitir una factura genera un registro con el detalle de ítems y cantidades
- [ ] Un `DELETE` directo en la base de datos es rechazado por PostgreSQL
- [ ] Alterar una fila manualmente hace que `verificar-bitacora.js` reporte la fila
- [ ] Con la BD de auditoría caída, las ventas se siguen emitiendo sin error
- [ ] `SUPER_ADMIN` y `EMPRESA` ven el panel; `CAJA`, `INVENTARIO` y `VISOR` no
- [ ] El panel soporta 5 años de datos sin degradarse

---

## 12. Decisión resuelta

Se usará una base Neon exclusiva para auditoría mediante `AUDIT_DATABASE_URL`.
En desarrollo, la misma interfaz usa un archivo SQLite separado. La migración
operacional y la de auditoría se despliegan por separado.