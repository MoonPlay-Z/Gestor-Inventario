# 🛒 GestorPOS — Sistema POS y Gestor de Inventario Venezuela

<div align="center">

![GestorPOS Banner](https://img.shields.io/badge/GestorPOS-Sistema%20POS%20Venezuela-1a1a2e?style=for-the-badge&logo=shopify&logoColor=white)

[![Versión APK](https://img.shields.io/badge/APK%20Android-v1.8%20(build%209)-success?style=flat-square&logo=android)](frontend/public/descargas/gestorpos-android.apk)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20%2B%20Prisma-339933?style=flat-square&logo=node.js)](backend/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB?style=flat-square&logo=react)](frontend/)
[![DB](https://img.shields.io/badge/Base%20de%20Datos-PostgreSQL%20%2F%20SQLite-336791?style=flat-square&logo=postgresql)](backend/prisma/)
[![Deploy](https://img.shields.io/badge/Deploy-Netlify%20%2B%20Render-00C7B7?style=flat-square&logo=netlify)](https://gestorpos.netlify.app)

**Sistema POS multimoneda (USD/VES) · 10 métodos de pago venezolanos · App Android nativa**

[🌐 Web App](https://gestorpos.netlify.app) · [📱 Descargar APK](https://gestorpos.netlify.app/descargar) · [📖 Documentación](#documentación)

</div>

---

## 🆕 Novedades — Actualización v1.9 (Octubre 2026)

> ### 🚀 Esta actualización está disponible **ya mismo** en la web y en la app Android

### 💳 Sistema Completo de Métodos de Pago (10 métodos venezolanos)
Se unificaron y validaron los **10 métodos de pago oficiales** del sistema con catálogo centralizado en backend y frontend:

| # | Método | Moneda | Referencia |
|---|--------|--------|------------|
| 1 | 💵 Efectivo USD | USD | Opcional |
| 2 | 💴 Efectivo Bs. (VES) | VES | Opcional |
| 3 | 💳 Tarjeta de Débito (POS) | VES | **Obligatoria** |
| 4 | 💳 Tarjeta de Crédito (POS) | VES | **Obligatoria** |
| 5 | 🏦 Transferencia Bancaria | VES | **Obligatoria** |
| 6 | 📱 Pago Móvil Interbancario | VES | **Obligatoria** |
| 7 | 🤳 BioPago BDV (Biométrico) | VES | **Obligatoria** |
| 8 | ₿ Binance Pay (USDT) | USD | **Obligatoria** |
| 9 | 🛍️ Cashea (Compra ahora, paga después) | USD | **Obligatoria** |
| 10 | 📋 Financiamiento / Crédito en cuotas | — | Genera CxC automática |

### 📊 Cuentas por Cobrar (CxC) — Módulo Completamente Auditado
- **Listado y detalle** de cuentas con estado, aging y gestión de cobranza.
- **Abonos con cualquier método de pago** (USD o VES) con conversión exacta usando la tasa de la empresa.
- **Culminación de compra**: la cuenta transiciona `PENDING → PARTIALLY_PAID → PAID` automáticamente al cubrir el saldo.
- **Tasa unificada**: la tasa usada en CxC **es exactamente la misma** que muestra el Dashboard — ambas resuelven vía `tasaAPI.js`.
- **Endpoint de cotización previa** (`GET /api/cxc/:id/conversion`): el frontend consulta cuánto valdría un abono antes de registrarlo, sin divergencias entre UI y backend.
- **Anulación de pagos**: anulación lógica (el registro se conserva con motivo, descripción y auditor) con recálculo atómico del saldo pendiente.

### 🔐 Protocolo Mejorado de Anulación de Facturas
El flujo de anulación de ventas fue completamente rediseñado con:

#### Backend (`PATCH /api/facturas/:id/anular`)
- **Motivos estructurados** (8 categorías): `ERROR_DIGITACION`, `DEVOLUCION_MERCANCIA`, `ERROR_PRECIO_TASA`, `CLIENTE_DESISTIO`, `FRAUDE_INCONSISTENCIA`, `CAMBIO_PRODUCTO`, `DUPLICADO`, `OTRO`.
- **Justificación obligatoria** (mín. 10 caracteres, máx. 500) en campo separado de descripción.
- **Congelamiento de tasa**: se guarda en `tasaAnulacion` la tasa vigente al momento de anular — permite auditar el impacto económico exacto independientemente de cambios futuros en la tasa.
- **Auditoría completa** en `AuditLog`: motivo, descripción, usuario, IP, tasa, impacto USD/VES, ítems restaurados, pagos afectados.
- **Anulación automática de pagos** vinculados: todos los pagos ACTIVOS de la factura pasan a `ANULADO` de forma atómica en la misma transacción.
- **Código de supervisor** obligatorio para rol `CAJA` (configurable por variable `VOID_CODE`).
- **Nuevas columnas** en BD: `descripcionAnulacion`, `fechaAnulacion`, `tasaAnulacion`.

#### Frontend (`VentasPage`)
- **Modal interactivo** con selección de motivo por categoría, campo de justificación con contador de caracteres, confirmación de seguridad y código de supervisor (CAJA).
- **Visualización completa** del detalle de anulación en la tabla de ventas: quién anuló, cuándo, motivo, justificación y tasa vigente.

### 🔍 Búsquedas Robustas sin Colapsos
- **Sanitización universal** de términos de búsqueda (`extraerTerminosBusqueda`) centralizada en `textSearch.js` y aplicada en clientes, productos, facturas y CxC.
- Búsquedas con `—`, `(`, `)`, `/`, `%`, paréntesis o RIFs formateados ya no devuelven listas vacías.

### ⚡ Optimizaciones de Rendimiento
- Caché de 20 segundos para el resumen de CxC (Sidebar), invalidada atómicamente al registrar o anular pagos.
- Ruta `/api/cxc/buscar` registrada antes de `/:id` (prevención de bug de precedencia Express).

### 🐛 Correcciones de Bugs Críticos
| Bug | Causa | Solución |
|-----|-------|----------|
| `pagos.estado column does not exist` | Migración sin aplicar | Migración `20261026160000` aplicada a PostgreSQL y SQLite |
| `GET /buscar → No Cliente found` | Ruta `/:id` precedía a `/buscar` | Reordenamiento de rutas + auditor automático |
| Búsqueda con nombre formateado devuelve vacío | `—` y `()` se parseaban como términos | `extraerTerminosBusqueda()` centralizado |
| CxC mostraba ventas de contado | Filtro Prisma con spread `OR` sobreescrito | `combinarFiltrosCxc()` con `AND` explícito |
| Tasa divergente entre Dashboard y CxC | Rutas usando tasa local vs. fachada central | Unificado en `tasaAPI.js` en todos los módulos |
| Rounding 0.01 excede 0.01 pendiente | Conversión Bs → USD con excedente de centavo | Tolerancia de ≤ 0.005 USD con tope al saldo pendiente |

---

## 📱 Aplicación Android

La app Android es una **instalación nativa** que funciona sin Play Store.

### Descargar e Instalar

1. Desde tu teléfono Android, abre: **[gestorpos.netlify.app/descargar](https://gestorpos.netlify.app/descargar)**
2. Toca **"Descargar APK"** (v1.8 · ~12 MB).
3. Si aparece "instalar desde fuentes desconocidas", actívalo para este archivo.
4. Instala y abre GestorPOS.

> **Actualizaciones automáticas:** La app detecta nuevas versiones en segundo plano y se actualiza sola sin necesidad de reinstalar.

### Funciones exclusivas de la app móvil
- 📷 **Escáner de código de barras** con cámara (ML Kit)
- 📲 **Modo sin conexión** con cola de ventas (outbox)
- 🔔 **Actualizaciones in-place** sin pasar por tienda
- 📺 **Modo pantalla completa** con insets seguros
- ↩️ **Soporte giroscopio** — layout adaptado a horizontal

---

## 🌐 Aplicación Web

La versión web funciona en cualquier navegador moderno, sin instalación.

**URL de producción:** [https://gestorpos.netlify.app](https://gestorpos.netlify.app)

Funciona en:
- 🖥️ PC / Mac / Linux (Chrome, Firefox, Safari, Edge)
- 📱 iPhone / iPad (Safari)
- 📱 Android (Chrome / cualquier navegador)
- 📺 Tablets

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 · Vite 5 · Tailwind CSS · Chart.js |
| **Backend** | Node.js 20 · Express 4 · Prisma ORM 5 |
| **Base de datos** | PostgreSQL (Neon en producción) · SQLite (dev) |
| **App móvil** | Capacitor 6 · Android (API 26+) · ML Kit |
| **Auth** | JWT · sessionVersion (invalidación por token) |
| **Deploy web** | Netlify (frontend) · Render (backend) |
| **Moneda** | dual USD/VES · `decimal.js` · fachada `tasaAPI.js` |

---

## 🚀 Despliegue en Producción

### 1. Base de Datos (Neon PostgreSQL / Supabase)

```bash
# Backend — configurar variables de entorno
DATABASE_URL="postgresql://usuario:contraseña@host/db?sslmode=require"
DB_PROVIDER="postgresql"
JWT_SECRET="tu-secreto-seguro"
VOID_CODE="1234"           # Código de supervisor para anular (CAJA)

# Aplicar migraciones
cd backend && npm run db:migrate
```

### 2. Frontend (Netlify)

```toml
# netlify.toml — ya configurado en el repo
[[redirects]]
  from = "/api/*"
  to = "https://tu-backend.render.com/api/:splat"
  status = 200
  force = true
```

### 3. Backend (Render / Railway / VPS)

```bash
cd backend
npm install
npm run db:generate
npm start
```

---

## 💻 Desarrollo Local

```bash
# Clonar e instalar
git clone https://github.com/MoonPlay-Z/Gestor-Inventario.git
cd Gestor-Inventario

# Instalar dependencias de backend y frontend por separado
cd backend && npm install && npm run setup
cd ../frontend && npm install

# Volver a la raíz e iniciar ambos en paralelo
cd ..
npm run dev        # Backend :3001 + Frontend :5173
```

### Variables de entorno mínimas (`backend/.env`)

```env
DATABASE_URL="file:./prisma/dev.db"   # SQLite para desarrollo
DB_PROVIDER="sqlite"
JWT_SECRET="dev-secret-local"
PORT=3001
VOID_CODE="1234"
```

### Comandos útiles

```bash
npm run build              # Build de producción del frontend
npm run test:rutas         # Auditoría automática de precedencia de rutas Express
cd frontend && npm test    # Tests unitarios del dominio de actualizaciones
node scripts/verify-prisma-engines.js  # Verificar engines Linux + Windows
```

---

## 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| [`AGENTS.md`](AGENTS.md) | Convenciones, arquitectura y reglas del proyecto |
| [`docs/ARQUITECTURA-GESTORPOS.md`](docs/ARQUITECTURA-GESTORPOS.md) | Diagrama de arquitectura completo |
| [`docs/ARQUITECTURA-APP-MOVIL.md`](docs/ARQUITECTURA-APP-MOVIL.md) | Guía de la app Android / Capacitor |

---

## 🔒 Seguridad

- Autenticación JWT con `sessionVersion` (invalidación inmediata al suspender usuario).
- Multi-tenancy estricto: cada consulta filtra por `empresaId` — ningún usuario accede a datos de otra empresa.
- Anulaciones con auditoría completa (motivo estructurado, descripción, IP, tasa, impacto económico).
- Código de supervisor obligatorio para que CAJA anule ventas o pagos.
- Rate limiting en login y registro.

---

<div align="center">

**GestorPOS** · Hecho en Venezuela 🇻🇪 · Multimoneda USD/VES

</div>
