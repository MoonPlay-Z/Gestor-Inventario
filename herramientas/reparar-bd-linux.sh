#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
DB_NAME="${DB_NAME:-gestor_inventario}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
BACKUP="$HOME/${DB_NAME}-backup-$(date +%Y%m%d-%H%M%S).dump"

[[ -f "$BACKEND/package.json" ]] || { echo "[ERROR] No se encontro backend/package.json."; exit 1; }
command -v node >/dev/null || { echo "[ERROR] Node.js no esta disponible."; exit 1; }
command -v npx >/dev/null || { echo "[ERROR] npx no esta disponible."; exit 1; }
command -v pg_dump >/dev/null || { echo "[ERROR] pg_dump no esta disponible en PATH."; exit 1; }

echo "Este script creara un respaldo y sincronizara la estructura Prisma."
echo "No elimina datos, pero prisma db push puede crear o modificar columnas."
read -r -p "Continuar? [s/N]: " answer
[[ "$answer" =~ ^[sS]$ ]] || { echo "Operacion cancelada."; exit 0; }

echo "[INFO] Creando respaldo en $BACKUP..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -Fc "$DB_NAME" -f "$BACKUP"

cd "$BACKEND"
echo "[INFO] Consultando estado de migraciones..."
npx prisma migrate status || true
echo "[INFO] Sincronizando estructura con el schema Prisma..."
npx prisma db push
echo "[INFO] Ejecutando verificacion de integridad..."
if node scripts/verificar-integridad-bd.js; then
  echo "[OK] Base de datos reparada y verificada."
else
  echo "[WARN] La estructura fue sincronizada, pero la auditoria reporto inconsistencias."
  echo "[INFO] Respaldo: $BACKUP"
  exit 2
fi
echo "[INFO] Respaldo: $BACKUP"