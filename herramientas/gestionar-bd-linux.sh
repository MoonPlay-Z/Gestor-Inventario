#!/usr/bin/env bash
set -Eeuo pipefail

DB_NAME="${DB_NAME:-gestor_inventario}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
OUT="${OUT:-$HOME}"
mkdir -p "$OUT"

command -v psql >/dev/null || { echo "[ERROR] psql no esta disponible en PATH."; exit 1; }
command -v pg_dump >/dev/null || { echo "[ERROR] pg_dump no esta disponible en PATH."; exit 1; }

read_password() {
  read -r -s -p "Contrasena de $DB_USER: " PGPASSWORD
  echo
  export PGPASSWORD
}

change_password() {
  read_password
  read -r -s -p "Nueva contrasena: " new_password
  echo
  [[ -n "$new_password" ]] || { echo "[ERROR] La nueva contrasena no puede estar vacia."; unset PGPASSWORD; return; }
  escaped=${new_password//\'/\'\'}
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -v new_password="$escaped" -c "ALTER ROLE \"$DB_USER\" WITH PASSWORD :'new_password';"; then
    echo "[OK] Contrasena cambiada correctamente."
  else
    echo "[ERROR] No se pudo cambiar. Si olvido la contrasena, recupere el acceso editando pg_hba.conf como administrador."
  fi
  unset PGPASSWORD
}

backup_db() {
  read_password
  file="$OUT/${DB_NAME}-backup-$(date +%Y%m%d-%H%M%S).dump"
  pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -Fc "$DB_NAME" -f "$file"
  echo "[OK] Respaldo creado: $file"
  unset PGPASSWORD
}

export_db() {
  read_password
  file="$OUT/${DB_NAME}-export-$(date +%Y%m%d-%H%M%S).sql"
  pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" --no-owner --no-privileges "$DB_NAME" -f "$file"
  echo "[OK] Exportacion creada: $file"
  unset PGPASSWORD
}

delete_db() {
  read_password
  file="$OUT/${DB_NAME}-pre-delete-$(date +%Y%m%d-%H%M%S).dump"
  echo "ADVERTENCIA: se eliminaran todos los datos de $DB_NAME."
  read -r -p "Crear respaldo y borrar? [s/N]: " answer
  [[ "$answer" =~ ^[sS]$ ]] || { unset PGPASSWORD; echo "Operacion cancelada."; return; }
  pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -Fc "$DB_NAME" -f "$file"
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -v db_name="$DB_NAME" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = :'db_name' AND pid <> pg_backend_pid();" -c "DROP DATABASE \"$DB_NAME\";"
  echo "[OK] Base borrada. Respaldo: $file"
  unset PGPASSWORD
}

while true; do
  echo
  echo "1) Cambiar contrasena"
  echo "2) Respaldo binario (.dump)"
  echo "3) Exportar SQL (.sql)"
  echo "4) Borrar base (respaldo previo)"
  echo "5) Salir"
  read -r -p "Seleccione una opcion: " option
  case "$option" in
    1) change_password ;;
    2) backup_db ;;
    3) export_db ;;
    4) delete_db ;;
    5) exit 0 ;;
    *) echo "[ERROR] Opcion no valida." ;;
  esac
done
