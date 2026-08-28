@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "DB_NAME=%DB_NAME%"
if not defined DB_NAME set "DB_NAME=gestor_inventario"
set "DB_USER=%DB_USER%"
if not defined DB_USER set "DB_USER=postgres"
set "DB_HOST=%DB_HOST%"
if not defined DB_HOST set "DB_HOST=127.0.0.1"
set "DB_PORT=%DB_PORT%"
if not defined DB_PORT set "DB_PORT=5432"
set "OUT=%USERPROFILE%\Desktop"

where psql >nul 2>&1 || (echo [ERROR] psql no esta disponible en PATH.& exit /b 1)
where pg_dump >nul 2>&1 || (echo [ERROR] pg_dump no esta disponible en PATH.& exit /b 1)
if not exist "%OUT%" mkdir "%OUT%"

:menu
cls
echo ================================================
echo       GESTION DE BASE DE DATOS POSTGRESQL
echo ================================================
echo Base: %DB_NAME%   Host: %DB_HOST%   Puerto: %DB_PORT%
echo.
echo 1. Cambiar contrasena de PostgreSQL
echo 2. Crear respaldo binario (.dump)
echo 3. Exportar SQL (.sql)
echo 4. Borrar base de datos (respaldo previo)
echo 5. Salir
echo.
choice /C 12345 /N /M "Seleccione una opcion: "
if errorlevel 5 exit /b 0
if errorlevel 4 goto delete
if errorlevel 3 goto export
if errorlevel 2 goto backup
if errorlevel 1 goto password

:password
set "PGPASSWORD="
set /p "CURRENT=Contrasena actual (deje vacio si usa acceso local): "
set /p "NEWPASS=Nueva contrasena: "
if not defined NEWPASS (echo [ERROR] La nueva contrasena no puede estar vacia.& pause& goto menu)
set "PGPASSWORD=%CURRENT%"
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d postgres -v ON_ERROR_STOP=1 -c "ALTER ROLE "%DB_USER%" WITH PASSWORD '%NEWPASS%';"
if errorlevel 1 (
  echo [ERROR] No se pudo cambiar la contrasena.
  echo Si olvido la contrasena, edite pg_hba.conf como administrador para recuperar el acceso.
) else echo [OK] Contrasena cambiada correctamente.
set "PGPASSWORD="
pause
goto menu

:backup
set "PGPASSWORD="
set /p "PGPASSWORD=Contrasena de %DB_USER%: "
set "FILE=%OUT%\%DB_NAME%-backup-%RANDOM%.dump"
echo [INFO] Creando %FILE%...
pg_dump -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -Fc "%DB_NAME%" -f "%FILE%"
if errorlevel 1 (echo [ERROR] No se pudo crear el respaldo.) else echo [OK] Respaldo creado: %FILE%
set "PGPASSWORD="
pause
goto menu

:export
set "PGPASSWORD="
set /p "PGPASSWORD=Contrasena de %DB_USER%: "
set "FILE=%OUT%\%DB_NAME%-export-%RANDOM%.sql"
echo [INFO] Exportando %FILE%...
pg_dump -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" --no-owner --no-privileges "%DB_NAME%" -f "%FILE%"
if errorlevel 1 (echo [ERROR] No se pudo exportar la base.) else echo [OK] Exportacion creada: %FILE%
set "PGPASSWORD="
pause
goto menu

:delete
set "PGPASSWORD="
set /p "PGPASSWORD=Contrasena de %DB_USER%: "
echo ADVERTENCIA: esta operacion elimina todos los datos de %DB_NAME%.
choice /C SN /N /M "Crear respaldo y borrar? [S/N]: "
if errorlevel 2 (set "PGPASSWORD="&goto menu)
set "FILE=%OUT%\%DB_NAME%-pre-delete-%RANDOM%.dump"
pg_dump -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -Fc "%DB_NAME%" -f "%FILE%"
if errorlevel 1 (echo [ERROR] Respaldo fallido. La base no se borro.&set "PGPASSWORD="&pause&goto menu)
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d postgres -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='%DB_NAME%' AND pid <> pg_backend_pid();" -c "DROP DATABASE \"%DB_NAME%\";"
if errorlevel 1 (echo [ERROR] No se pudo borrar la base.) else echo [OK] Base borrada. Respaldo: %FILE%
set "PGPASSWORD="
pause
goto menu
