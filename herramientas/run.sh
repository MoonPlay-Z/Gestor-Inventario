#!/usr/bin/env bash

# Colores para salida de terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}      Iniciador de Sistema POS y Gestor de Inventario${NC}"
echo -e "${GREEN}=====================================================${NC}"

# 1. Verificar requerimiento: Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js no está instalado.${NC}"
    echo -e "Por favor, instale Node.js (v18 o superior) desde: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}[OK] Node.js detectado (${NODE_VERSION})${NC}"
fi

# 2. Verificar requerimiento: npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm (Node Package Manager) no está instalado.${NC}"
    exit 1
else
    echo -e "${GREEN}[OK] npm detectado ($(npm -v))${NC}"
fi

# 3. Verificar requerimiento: Docker (opcional/recomendado para Postgres)
DOCKER_RUNNING=false
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}[ADVERTENCIA] Docker no está instalado.${NC}"
    echo -e "El sistema requiere un servidor PostgreSQL activo."
    echo -e "Si ya tienes un servidor de base de datos Postgres corriendo de forma local en el puerto 5432, puedes ignorar esta advertencia."
    echo -e "De lo contrario, te recomendamos instalar Docker para automatizar la base de datos."
else
    echo -e "${GREEN}[OK] Docker detectado${NC}"
    # Verificar si el servicio de Docker está activo
    if ! docker info &> /dev/null; then
        echo -e "${YELLOW}[ADVERTENCIA] El daemon de Docker no está en ejecución.${NC}"
        echo -e "Por favor, inicia la aplicación Docker Desktop o ejecuta: sudo systemctl start docker"
    else
        DOCKER_RUNNING=true
    fi
fi

# 4. Iniciar o Crear base de datos PostgreSQL mediante Docker
if [ "$DOCKER_RUNNING" = true ]; then
    CONTAINER_NAME="postgres_inventario"
    
    # Verificar si el contenedor ya existe (activo o apagado)
    if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}$"; then
        # Verificar si está corriendo
        if [ "$(docker inspect -f '{{.State.Running}}' ${CONTAINER_NAME})" = "false" ]; then
            echo -e "${YELLOW}[INFO] Iniciando base de datos existente ($CONTAINER_NAME)...${NC}"
            docker start ${CONTAINER_NAME} > /dev/null
        else
            echo -e "${GREEN}[OK] Base de datos activa y corriendo ($CONTAINER_NAME)${NC}"
        fi
    else
        echo -e "${YELLOW}[INFO] Creando nuevo contenedor Postgres en Docker ($CONTAINER_NAME)...${NC}"
        docker run --name ${CONTAINER_NAME} \
          -e POSTGRES_USER=postgres \
          -e POSTGRES_PASSWORD=postgres \
          -e POSTGRES_DB=gestor_inventario \
          -p 5432:5432 \
          -d postgres:15 > /dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}[OK] Contenedor de base de datos creado con éxito.${NC}"
            echo -e "Esperando 5 segundos para inicializar Postgres..."
            sleep 5
        else
            echo -e "${RED}[ERROR] No se pudo crear el contenedor de Docker.${NC}"
        fi
    fi
fi

# 5. Configurar e Instalar Dependencias del Backend
echo -e "\n${GREEN}[INFO] Verificando dependencias del Backend...${NC}"
cd backend || exit 1
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO] Instalando paquetes del backend...${NC}"
    npm install
else
    echo -e "${GREEN}[OK] Módulos del backend listos.${NC}"
fi

# Generar cliente de Prisma y verificar estado de migraciones
echo -e "${GREEN}[INFO] Generando cliente de Prisma ORM...${NC}"
npx prisma generate

echo -e "${GREEN}[INFO] Sincronizando base de datos con esquema de Prisma...${NC}"
npx prisma db push --skip-generate

# 6. Configurar e Instalar Dependencias del Frontend
echo -e "\n${GREEN}[INFO] Verificando dependencias del Frontend...${NC}"
cd ../frontend || exit 1
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO] Instalando paquetes del frontend...${NC}"
    npm install
else
    echo -e "${GREEN}[OK] Módulos del frontend listos.${NC}"
fi

# 7. Ejecutar de forma concurrente
echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}  Iniciando servidores de desarrollo. ¡Listo para usar!${NC}"
echo -e "${GREEN}  Backend:  http://localhost:3001${NC}"
echo -e "${GREEN}  Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo -e "Presiona Ctrl+C para detener todos los servicios.\n"

# Correr backend en segundo plano
cd ../backend || exit 1
npm run dev &
BACKEND_PID=$!

# Correr frontend en segundo plano
cd ../frontend || exit 1
npm run dev &
FRONTEND_PID=$!

# Esperar 2 segundos para asegurar el inicio del servidor y abrir el navegador
(
  sleep 2
  if command -v xdg-open &> /dev/null; then
      xdg-open "http://localhost:5173" &> /dev/null
  elif command -v open &> /dev/null; then
      open "http://localhost:5173" &> /dev/null
  fi
) &

# Atrapar señal Ctrl+C para apagar ambos procesos al salir
cleanup() {
    echo -e "\n${YELLOW}Deteniendo servidores...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Servicios finalizados con éxito.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Esperar a que terminen los procesos
wait
