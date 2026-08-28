@echo off
setlocal EnableExtensions

set "ROOT=%~dp0..\"
set "BACKEND=%ROOT%backend"
set "DB_NAME=gestor_inventario"
set "DB_USER=postgres"
set "DB_HOST=127.0.0.1"
set "DB_PORT=5432"
for /f "tokens=2 delims==" %%d in ('wmic os get LocalDateTime /value') do set DT=%%d
set "BACKUP=%USERPROFILE%\Desktop\%DB_NAME%-backup-%DT:~0,8%-%DT:~8,6%.dump"

if not exist "%BACKEND%\package.json" (
  echo [ERROR] No se encontro backend\package.json.
  exit /b 1
)

echo [INFO] Comprobando herramientas...
where node >nul 2>&1 || (echo [ERROR] Node.js no esta disponible.& exit /b 1)
where npx >nul 2>&1 || (echo [ERROR] npx no esta disponible.& exit /b 1)
where pg_dump >nul 2>&1 || (echo [ERROR] pg_dump no esta disponible en PATH.& exit /b 1)

echo.
echo Este script hara un respaldo y sincronizara la estructura Prisma.
echo No elimina datos, pero db push puede crear o modificar columnas.
choice /C SN /N /M "Continuar? [S/N]: "
if errorlevel 2 exit /b 0

echo [INFO] Creando respaldo en "%BACKUP%"...
pg_dump -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -Fc "%DB_NAME%" -f "%BACKUP%"
if errorlevel 1 (
  echo [ERROR] No se pudo crear el respaldo. No se modifico la base.
  exit /b 1
)

pushd "%BACKEND%"
echo [INFO] Consultando estado de migraciones...
call npx prisma migrate status
echo.
echo [INFO] Sincronizando estructura con el schema Prisma...
call npx prisma db push --accept-data-loss
if errorlevel 1 (
  echo [ERROR] No se pudo reparar la estructura.
  popd
  exit /b 1
)

echo [INFO] Ejecutando verificacion de integridad...
call node "%BACKEND%\scripts\verificar-integridad-bd.js"
set "RESULT=%ERRORLEVEL%"
popd

if not "%RESULT%"=="0" echo [WARN] La estructura fue sincronizada, pero la auditoria reporto inconsistencias.
if "%RESULT%"=="0" echo [OK] Base de datos reparada y verificada.
echo [INFO] Respaldo: "%BACKUP%"
exit /b %RESULT%