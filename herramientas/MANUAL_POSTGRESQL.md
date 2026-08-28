# Manual de instalación y configuración

## Gestor de Inventario POS

Este manual corresponde al instalador de Windows x64 del Gestor de Inventario POS.

## 1. Requisitos

### Instalación normal en Windows 11

El instalador incluye la aplicación Electron, backend Express/Prisma, frontend compilado, PostgreSQL portable para Windows x64, migraciones y datos iniciales.

Para la instalación normal no es necesario instalar Node.js, npm, Docker ni PostgreSQL por separado.

Se recomienda Windows 11 de 64 bits, permisos para instalar aplicaciones y al menos 1 GB de espacio libre adicional para la base de datos y los respaldos.

## 2. Instalación

1. Cierre cualquier versión anterior del POS.
2. Ejecute `Gestor de Inventario POS Setup 1.0.0.exe`.
3. Acepte la licencia y seleccione la carpeta de instalación.
4. Mantenga activados los accesos directos que desee crear.
5. Finalice el asistente y abra **Gestor de Inventario POS**.

No elimine ni modifique manualmente la carpeta `resources` de la instalación.

## 3. Primer arranque

En el primer inicio la aplicación:

1. Extrae PostgreSQL portable en la carpeta de datos del usuario.
2. Inicializa PostgreSQL con una contraseña generada localmente.
3. Crea la base `gestor_inventario`.
4. Aplica las migraciones Prisma.
5. Carga los datos de demostración si la base es nueva.
6. Inicia el backend y espera a `/api/health`.
7. Abre la ventana principal del POS.

El primer arranque puede tardar más que los siguientes. No cierre la aplicación mientras aparece la pantalla de inicio.

Durante este proceso se muestra una ventana de carga con el porcentaje y la fase actual. Puede mostrar, entre otros, estos estados:

- Buscando un puerto disponible.
- Preparando y verificando PostgreSQL portable.
- Inicializando la base de datos.
- Aplicando migraciones.
- Cargando datos iniciales.
- Iniciando y verificando el servidor.

El porcentaje representa el avance del arranque completo; durante algunas operaciones puede permanecer unos segundos en el mismo valor mientras finaliza PostgreSQL o Prisma.

La comprobación del backend se realiza en una dirección similar a:

```text
http://127.0.0.1:3001/api/health
```

## 4. Configuración dentro del POS

En **Configuración** puede ajustar:

- Nombre, identificación fiscal, dirección, teléfono y correo de la empresa.
- Moneda, símbolo, código y tasa de cambio.
- IVA predeterminado.
- Datos del perfil y contraseña del usuario.
- Configuración de la máquina fiscal, si corresponde.

Pulse **Guardar** después de modificar los datos de empresa o moneda.

### Máquina fiscal

Conecte la máquina fiscal al equipo y confirme el puerto serie asignado por Windows. En **Configuración**, indique el puerto COM, la velocidad y la marca.

Ejemplos:

```text
COM3
COM4
```

Pruebe la conexión antes de emitir reportes. El Reporte Z cierra la jornada fiscal y no debe emitirse hasta confirmar que el día terminó.

## 5. Puertos y configuración avanzada

### Puerto del backend

El backend intenta usar el puerto `3001` y busca automáticamente un puerto libre hasta `3010`.

Para fijar otro puerto, cree:

```text
%APPDATA%\gestor-inventario-root\backend-port.txt
```

Escriba un único puerto entre `1024` y `65535`, por ejemplo `3015`, y reinicie el POS.

### Puerto de PostgreSQL

PostgreSQL portable comienza buscando un puerto libre desde `5432`. Si está ocupado, selecciona automáticamente otro puerto disponible.

El puerto usado se guarda en:

```text
%APPDATA%\gestor-inventario-root\postgres\port.txt
```

No es necesario cambiarlo manualmente.

## 6. Datos, configuración y logs

Los datos modificables se guardan fuera de `Program Files`, en:

```text
%APPDATA%\gestor-inventario-root
```

| Ruta | Uso |
| --- | --- |
| `postgres\data` | Base de datos PostgreSQL persistente |
| `postgres\postgres.log` | Log de PostgreSQL |
| `postgres\port.txt` | Puerto actual de PostgreSQL |
| `postgres-password` | Contraseña interna generada |
| `database-url.txt` | Conexión utilizada por Prisma |
| `jwt-secret` | Secreto local de autenticación |
| `backend-port.txt` | Puerto manual del backend |
| `data\config.json` | Datos de empresa, moneda e IVA |
| `logs\main-AAAA-MM-DD.log` | Log de Electron |
| `logs\backend-AAAA-MM-DD.log` | Log del backend |
| `logs\errors-AAAA-MM-DD.log` | Errores críticos |

También puede abrir el visor de logs desde el menú de herramientas.

No comparta `postgres-password`, `database-url.txt` ni `jwt-secret`.

## 7. Respaldos y restauración

### Exportar

1. Abra **Configuración**.
2. Busque la sección de respaldos.
3. Seleccione **Exportar respaldo**.
4. Guarde el JSON en otra unidad o almacenamiento externo.

El respaldo incluye clientes, productos, facturas, partidas, pagos, correlativos cuando corresponda y configuración de empresa.

### Restaurar

1. Realice primero un respaldo de los datos actuales.
2. Abra **Configuración** y seleccione **Restaurar respaldo**.
3. Elija un archivo `.json` exportado por el POS.
4. Confirme la operación.

La restauración reemplaza los datos de la empresa actual. No cierre la aplicación hasta que termine.

## 8. Reinicio o reinstalación

Antes de desinstalar, exporte un respaldo y cópielo fuera del equipo. Desinstalar la aplicación no es un respaldo.

Para forzar una instalación completamente nueva, cierre el POS y elimine:

```text
%APPDATA%\gestor-inventario-root
```

Esta acción elimina la base local, configuración, credenciales internas y logs.

## 9. Solución de problemas

### La aplicación no termina de iniciar

1. Espere al menos un minuto en el primer arranque.
2. Revise `%APPDATA%\gestor-inventario-root\logs\errors-AAAA-MM-DD.log`.
3. Revise `%APPDATA%\gestor-inventario-root\postgres\postgres.log`.
4. Compruebe que existan `postgres\data\PG_VERSION` y `postgres\port.txt`.
5. Reinicie Windows y abra el POS nuevamente.

### Error de seed o datos iniciales

Si la base fue creada con una versión anterior, haga un respaldo y elimine solamente:

```text
%APPDATA%\gestor-inventario-root\postgres
```

Abra el POS para que cree una base nueva y cargue los datos iniciales. Esta operación elimina la base local actual.

### PostgreSQL portable está incompleto

La instalación debe contener:

```text
bin\initdb.exe
bin\pg_ctl.exe
bin\postgres.exe
share\postgres.bki
```

Si falta alguno, desinstale, elimine `%APPDATA%\gestor-inventario-root\postgres` y reinstale desde un instalador completo.

### Puerto del backend ocupado

El POS busca automáticamente otro puerto entre `3001` y `3010`. Si todos están ocupados, cree `backend-port.txt` con un puerto libre y reinicie.

### Error CORS o interfaz sin estilos

Confirme que ejecuta la aplicación instalada y no abre un HTML directamente desde `resources`. El POS permite sus propios orígenes locales (`localhost` y `127.0.0.1`) aunque el backend haya elegido otro puerto entre `3001` y `3010`.

Si continúa, revise que backend y frontend sean de la misma versión, cierre procesos antiguos del POS y reinstale el instalador completo. No configure CORS como `*`, porque la aplicación utiliza credenciales de sesión.

## 10. Configuración para desarrollo

## 10A. Base SQLite en Windows

Las versiones Windows del POS utilizan SQLite local y no requieren PostgreSQL instalado. El archivo se guarda en:

```text
%APPDATA%\gestor-inventario-root\data\gestor-inventario.sqlite
```

Para migrar una base PostgreSQL existente durante el desarrollo:

```bash
cd backend
npm run db:sqlite:generate
npm run db:sqlite:push
node scripts/migrar-postgresql-a-sqlite.js --source="postgresql://USUARIO:CONTRASEÑA@HOST:5432/gestor_inventario?schema=public" --target="C:\ruta\gestor-inventario.sqlite"
DATABASE_URL="file:C:\ruta\gestor-inventario.sqlite" npm run db:verify:sqlite
```

Conserve el respaldo PostgreSQL original hasta completar la validación. La migración genera un reporte JSON y no modifica la base PostgreSQL.

## 10B. Configuración PostgreSQL para desarrollo

El desarrollo requiere Node.js 18 o superior, npm y Docker Desktop con PostgreSQL activo, o PostgreSQL local.

Desde la raíz del proyecto, ejecute en PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup-postgresql.ps1
```

Parámetros disponibles:

```powershell
.\setup-postgresql.ps1 -DbPassword "SU_CONTRASEÑA"
.\setup-postgresql.ps1 -DbPort 5433
.\setup-postgresql.ps1 -SkipSeed
```

El script intenta usar Docker y, si no está disponible, PostgreSQL local. Crea la base, aplica el esquema Prisma y carga datos de demostración salvo con `-SkipSeed`.

Para iniciar backend y frontend en desarrollo:

```powershell
.\run.bat
```

Normalmente el frontend usa `http://localhost:5173` y el backend `http://localhost:3001`.

## 11. Construcción del instalador

Solo para desarrollo, después de instalar las dependencias:

```bash
npm run electron:build:win
```

El instalador se genera en:

```text
dist-electron\Gestor de Inventario POS Setup 1.0.0.exe
```

Pruebe cada instalador nuevo en una máquina Windows 11 x64 limpia y conserve los logs si aparece un error.