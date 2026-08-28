#!/usr/bin/env bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}=====================================================${NC}"
echo -e "${YELLOW}      ADVERTENCIA: RESTABLECER BASE DE DATOS${NC}"
echo -e "${RED}=====================================================${NC}"
echo -e ""
echo -e "ESTA ACCION BORRARA TODOS LOS DATOS DEL SISTEMA."
echo -e "(Clientes, productos, facturas, pagos, etc.)"
echo -e ""
echo -e "Solo haga esto si desea entregar el sistema a un cliente nuevo"
echo -e "o si desea limpiar la base de datos por completo."
echo -e ""

read -p "¿Esta seguro de borrar todo? (S/N): " confirm
if [[ ! "$confirm" =~ ^[Ss]$ ]]; then
    echo -e "${GREEN}Operacion cancelada.${NC}"
    exit 0
fi

echo -e "\n${YELLOW}[INFO] Limpiando base de datos...${NC}"
cd backend || exit 1
npx prisma migrate reset --force --skip-seed

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Hubo un problema al borrar la base de datos.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}[INFO] Recreando estructura...${NC}"
npx prisma db push

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Hubo un problema al recrear la estructura.${NC}"
    exit 1
fi

echo -e "\n${GREEN}=====================================================${NC}"
echo -e "${GREEN}  BASE DE DATOS RESTABLECIDA CON EXITO (SISTEMA VACIO)${NC}"
echo -e "${GREEN}=====================================================${NC}\n"

read -p "¿Desea cargar los datos de demostracion (prueba)? (S/N): " seed
if [[ "$seed" =~ ^[Ss]$ ]]; then
    echo -e "\n${YELLOW}[INFO] Cargando datos de demostracion...${NC}"
    npm run db:seed
    echo -e "\n${GREEN}[OK] Datos de demostracion cargados.${NC}"
fi

echo -e "\n${GREEN}Operacion finalizada. Ya puede iniciar el sistema.${NC}"
