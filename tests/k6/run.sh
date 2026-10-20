#!/usr/bin/env bash
#
# Orquestador del arnés k6.
#
#   ./run.sh reset              # borra y recrea la DB de pruebas + seed
#   ./run.sh seed               # solo seed (DB ya migrada)
#   ./run.sh run <escenario>    # ejecuta un escenario
#   ./run.sh verify             # invariantes contra la DB
#   ./run.sh all                # secuencia completa con reset entre carreras
#   ./run.sh list               # lista escenarios
#
# Seguridad: `reset` y `seed` exigen ALLOW_DESTRUCTIVE_TESTS=true.
# La DATABASE_URL debe apuntar a una base de pruebas (localhost / :5433 / test).

set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
BACKEND="$ROOT/backend"
RESULTS="$DIR/results"
STATUS_FILE="$RESULTS/_status.txt"

# Carga configuración local del arnés (nunca el .env de producción).
if [[ -f "$DIR/.env.k6" ]]; then
  # shellcheck disable=SC1090
  source "$DIR/.env.k6"
fi

export BASE_URL="${BASE_URL:-http://localhost:3001}"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:test@localhost:5433/pos_test}"
export JWT_SECRET="${JWT_SECRET:-test-secret}"

mkdir -p "$RESULTS"

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
}

require_k6() {
  if ! command -v k6 >/dev/null 2>&1; then
    echo "❌ k6 no está instalado. Ver tests/k6/README.md."
    exit 1
  fi
}

require_destructive() {
  if [[ "${ALLOW_DESTRUCTIVE_TESTS:-}" != "true" ]]; then
    echo "❌ Exporta ALLOW_DESTRUCTIVE_TESTS=true (esto borra datos de la DB de pruebas)."
    exit 1
  fi
}

require_test_db() {
  if [[ "$DATABASE_URL" == file:* ]]; then
    echo "❌ Este arnés requiere PostgreSQL. SQLite serializa las escrituras y oculta las carreras."
    exit 1
  fi
  if ! [[ "$DATABASE_URL" =~ (localhost|127\.0\.0\.1|:5433|_test|/test|test_) ]]; then
    echo "❌ DATABASE_URL no parece de pruebas: $DATABASE_URL"
    echo "   Abortando para no tocar producción."
    exit 1
  fi
}

health() {
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/health" 2>/dev/null || echo 000)"
  if [[ "$code" != "200" ]]; then
    echo "⚠️  /api/health devolvió $code. ¿Está el backend en $BASE_URL?"
  fi
}

set_fixtures() {
  if [[ ! -f "$DIR/fixtures.json" ]]; then
    echo "❌ No existe fixtures.json. Ejecuta ./run.sh seed."
    exit 1
  fi
  export K6_FIXTURES
  K6_FIXTURES="$(cat "$DIR/fixtures.json")"
}

seed() {
  require_destructive
  require_test_db
  node "$DIR/seed/seed.js"
}

reset_db() {
  require_destructive
  require_test_db
  echo "♻️  Reseteando base de pruebas..."
  ( cd "$BACKEND" && npx prisma migrate reset --force --skip-seed )
  seed
}

run_scenario() {
  local file="$1"
  local name
  name="$(basename "$file" .js)"
  set_fixtures
  echo ""
  echo "▶️  $name"
  echo "─────────────────────────────────────────────────────────────"
  k6 run --summary-export "$RESULTS/$name.json" "$DIR/scenarios/$file"
  local rc=$?
  echo "$rc $name" >> "$STATUS_FILE"
  echo "◀️  $name → exit $rc"
}

verify() {
  set_fixtures
  echo ""
  echo "🔎 Invariantes"
  echo "─────────────────────────────────────────────────────────────"
  node "$DIR/verify/verify.js"
}

resumen() {
  echo ""
  echo "═════════════════════════════════════════════════════════════"
  echo " Resumen de la suite"
  echo "═════════════════════════════════════════════════════════════"
  if [[ -f "$STATUS_FILE" ]]; then
    awk '{ if ($1 == 0) print "✅ " $2; else print "❌ " $2 " (exit " $1 ")" }' "$STATUS_FILE"
  else
    echo "(sin ejecuciones registradas)"
  fi
  echo ""
  echo "Resultados: $RESULTS"
  echo "Hallazgos:  ver tests/k6/README.md → sección «Bugs encontrados»"
}

case "${1:-}" in
  seed)
    seed
    ;;
  reset)
    require_k6
    health
    reset_db
    ;;
  run)
    require_k6
    [[ -n "${2:-}" ]] || usage
    set_fixtures
    k6 run "${@:2}"
    ;;
  verify)
    verify
    ;;
  list)
    ls -1 "$DIR/scenarios"
    ;;
  all)
    require_k6
    health
    : > "$STATUS_FILE"

    reset_db
    run_scenario 01-auth-limiter.js
    run_scenario 06-paginacion-fuzz.js
    run_scenario 07-payload-fuzz.js
    run_scenario 08-multitenant.js
    verify

    reset_db
    run_scenario 02-idempotencia-factura.js
    verify

    reset_db
    run_scenario 03-oversell-stock.js
    verify

    reset_db
    run_scenario 04-race-pagos.js
    verify

    reset_db
    run_scenario 05-race-caja.js
    verify

    reset_db
    run_scenario 09-monedas-tasa.js
    verify

    # La carga no escribe; se ejecuta sobre los datos actuales.
    run_scenario 10-load-read.js

    resumen
    ;;
  *)
    usage
    ;;
esac
