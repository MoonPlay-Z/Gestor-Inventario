// Carga los IDs y tokens generados por seed/seed.js.
//
// k6 no puede leer archivos arbitrarios en tiempo de ejecución de forma
// portable entre versiones, así que run.sh inyecta el JSON completo en
// K6_FIXTURES. Para ejecuciones manuales:
//
//   export K6_FIXTURES="$(cat tests/k6/fixtures.json)"
//
// El JSON incluye tokens firmados con JWT_SECRET, de modo que ningún escenario
// necesita pasar por /auth/login (y no consume el rate limit de login).

const raw = __ENV.K6_FIXTURES;

if (!raw) {
  throw new Error(
    'K6_FIXTURES no está definido. Ejecuta `tests/k6/run.sh seed` y luego ' +
      '`export K6_FIXTURES="$(cat tests/k6/fixtures.json)"`, o usa `run.sh run <escenario>`.'
  );
}

let parsed;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  throw new Error(`K6_FIXTURES no es JSON válido: ${err.message}`);
}

export const F = parsed;

export const tokenA = F.users.empresaA.token;
export const tokenB = F.users.empresaB.token;
export const tokenCaja = F.users.cajeroA.token;
export const tokenInventario = F.users.inventarioA.token;
export const tokenVisor = F.users.visorA.token;
