@echo off
chcp 65001 > nul
setlocal EnableExtensions
title Restablecer Base de Datos

echo =====================================================
echo       ADVERTENCIA: RESTABLECER BASE DE DATOS
echo =====================================================
echo.
echo ESTA ACCION BORRARA TODOS LOS DATOS DEL SISTEMA.
echo (Clientes, productos, facturas, pagos, etc.)
echo.
echo Solo haga esto si desea entregar el sistema a un cliente nuevo
echo o si desea limpiar la base de datos por completo.
echo.

set /p confirm="¿Esta seguro de borrar todo? (S/N): "
if /I "%confirm%" neq "S" (
    echo Operacion cancelada.
    pause
    exit /b 0
)

echo.
echo [INFO] Limpiando base de datos...
pushd "%~dp0..\backend"
call npx prisma migrate reset --force --skip-seed
if %errorlevel% neq 0 (
    echo [ERROR] Hubo un problema al borrar la base de datos.
    popd
    pause
    exit /b 1
)

echo.
echo [INFO] Recreando estructura...
call npx prisma db push --skip-generate --accept-data-loss
if %errorlevel% neq 0 (
    echo [ERROR] Hubo un problema al recrear la estructura.
    popd
    pause
    exit /b 1
)
popd

echo.
echo =====================================================
echo   BASE DE DATOS RESTABLECIDA CON EXITO (SISTEMA VACIO)
echo =====================================================
echo.

set /p seed="Desea cargar los datos de demostracion (prueba)? (S/N): "
if /I "%seed%"=="S" (
    echo.
    echo [INFO] Cargando datos de demostracion...
    pushd "%~dp0..\backend"
    call npm run db:seed
    popd
    echo.
    echo [OK] Datos de demostracion cargados.
)

echo.
echo Operacion finalizada. Ya puede iniciar el sistema.
endlocal
pause
exit /b 0
