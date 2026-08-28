@echo off
chcp 65001 > nul
setlocal EnableExtensions EnableDelayedExpansion
title Iniciador de Sistema POS y Gestor de Inventario

echo =====================================================
echo       Iniciador de Sistema POS y Gestor de Inventario
echo =====================================================

:: 1. Verificar requerimiento: Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado en este equipo.
    echo Por favor, descargue e instale Node.js (v18 o superior) desde: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [OK] Node.js detectado (%NODE_VER%)

:: 2. Verificar requerimiento: npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm (Node Package Manager) no está instalado.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo [OK] npm detectado (%NPM_VER%)

:: 3. Verificar requerimiento: Docker (Opcional/Recomendado)
set DOCKER_ACTIVE=0
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ADVERTENCIA] Docker no está instalado en este sistema Windows.
    echo El sistema requiere una base de datos PostgreSQL activa en el puerto 5432.
    echo Si ya posee un servidor PostgreSQL nativo ejecutándose de forma local,
    echo puede ignorar esta advertencia y presionar cualquier tecla para continuar.
    pause
) else (
    echo [OK] Docker detectado.
    :: Verificar si Docker Desktop está abierto
    docker info >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ADVERTENCIA] El servicio de Docker no está encendido.
        echo Abra la aplicación Docker Desktop en su equipo para habilitar el inicio automático de base de datos.
        pause
    ) else (
        set DOCKER_ACTIVE=1
    )
)

:: 4. Levantar contenedor de base de datos si Docker está activo
if "%DOCKER_ACTIVE%"=="1" (
    set CONTAINER_NAME=postgres_inventario
    
    :: Verificar si existe
    docker inspect %CONTAINER_NAME% >nul 2>nul
    if %errorlevel% neq 0 (
        echo [INFO] Creando nuevo contenedor de base de datos Postgres (%CONTAINER_NAME%)...
        docker run --name %CONTAINER_NAME% -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=gestor_inventario -p 5432:5432 -d postgres:15 >nul
        echo [OK] Base de datos creada con éxito.
        echo Esperando 5 segundos a que inicie Postgres...
        timeout /t 5 /nobreak >nul
    ) else (
        :: Verificar si está corriendo
        for /f "tokens=*" %%a in ('docker inspect -f "{{.State.Running}}" %CONTAINER_NAME%') do set IS_RUNNING=%%a
        if "!IS_RUNNING!"=="false" (
            echo [INFO] Encendiendo base de datos existente (%CONTAINER_NAME%)...
            docker start %CONTAINER_NAME% >nul
        ) else (
            echo [OK] Base de datos activa y en funcionamiento (%CONTAINER_NAME%).
        )
    )
)

:: 5. Backend dependencies setup
echo.
echo [INFO] Verificando dependencias del Backend...
pushd "%~dp0..\backend"
if not exist node_modules (
    echo [INFO] Instalando paquetes del backend (esto puede tardar unos minutos)...
    call npm install
    if !errorlevel! neq 0 (echo [ERROR] npm install backend fallido.& popd& exit /b 1)
) else (
    echo [OK] Paquetes del backend listos.
)

echo [INFO] Generando cliente de Prisma ORM...
call npx prisma generate
if !errorlevel! neq 0 (echo [ERROR] prisma generate fallido.& popd& exit /b 1)

echo [INFO] Actualizando esquema de la base de datos...
call npx prisma db push --skip-generate --accept-data-loss
if !errorlevel! neq 0 (echo [ERROR] prisma db push fallido.& popd& exit /b 1)
popd

:: 6. Frontend dependencies setup
echo.
echo [INFO] Verificando dependencias del Frontend...
pushd "%~dp0..\frontend"
if not exist node_modules (
    echo [INFO] Instalando paquetes del frontend...
    call npm install
    if !errorlevel! neq 0 (echo [ERROR] npm install frontend fallido.& popd& exit /b 1)
) else (
    echo [OK] Paquetes del frontend listos.
)
popd

:: 7. Ejecutar concurrentemente abriendo terminales
echo.
echo =====================================================
echo   Abriendo servidores del sistema en ventanas nuevas...
echo   Backend se iniciara en:   http://localhost:3001
echo   Frontend se iniciara en:  http://localhost:5173
echo =====================================================
echo Puede cerrar las ventanas emergentes si desea apagar el sistema.
echo.

start cmd /k "title Servidor Backend (API) && cd /d "%~dp0..\backend" && npm run dev"
start cmd /k "title Servidor Frontend (POS) && cd /d "%~dp0..\frontend" && npm run dev"

:: Esperar 3 segundos y abrir el navegador
timeout /t 3 /nobreak >nul
start http://localhost:5173

endlocal
exit /b 0
