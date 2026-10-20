import http from 'k6/http';
import { check } from 'k6';
import { BASE } from '../lib/config.js';
import { F } from '../lib/fixtures.js';
import { api, json, statusSummary } from '../lib/http.js';

/**
 * 05 — Carrera de apertura y cierre de caja.
 *
 * 10 aperturas simultáneas del mismo cajero deben producir una sola caja OPEN.
 * Luego, 10 cierres simultáneos deben cerrarla una sola vez.
 *
 * /caja/open usa un SELECT ... FOR UPDATE sobre el usuario (Postgres), pero
 * /caja/close hace findFirst + update sin bloquear la fila del cierre: dos
 * peticiones pueden leer OPEN y ambas responder 200.
 */
export const options = {
  scenarios: {
    race: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '2m',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
  },
  tags: { suite: '05-race-caja' },
};

const CONCURRENTES = 10;

export default function () {
  const token = F.users.cajeroA.token;
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // ── Aperturas ─────────────────────────────────────────────────────────────
  const aperturas = http.batch(
    Array.from({ length: CONCURRENTES }, () => ({
      method: 'POST',
      url: `${BASE}/api/caja/open`,
      body: JSON.stringify({ montoInicial: 50 }),
      params: { headers: auth, tags: { name: 'POST /caja/open race' } },
    }))
  );

  const abiertas = aperturas.filter((r) => r.status === 201).length;
  const estadoAbierta = json(api('GET', '/caja/status', token));

  // ── Cierres ───────────────────────────────────────────────────────────────
  const cierres = http.batch(
    Array.from({ length: CONCURRENTES }, () => ({
      method: 'POST',
      url: `${BASE}/api/caja/close`,
      body: JSON.stringify({ montoFinal: 0 }),
      params: { headers: auth, tags: { name: 'POST /caja/close race' } },
    }))
  );

  const cerradas = cierres.filter((r) => r.status === 200).length;
  const estadoCerrada = json(api('GET', '/caja/status', token));
  const cincoXX = [...aperturas, ...cierres].filter((r) => r.status >= 500).length;

  check(null, {
    'solo una apertura concurrente gana': () => abiertas === 1,
    'la caja queda OPEN tras la apertura': () => estadoAbierta.estado === 'OPEN',
    'solo un cierre concurrente gana': () => cerradas === 1,
    'la caja queda CLOSED tras el cierre': () =>
      estadoCerrada.status === 'CLOSED' || estadoCerrada.estado === undefined,
    'sin errores 5xx': () => cincoXX === 0,
  });

  console.log(
    `[05] open=${JSON.stringify(statusSummary(aperturas))} ` +
      `close=${JSON.stringify(statusSummary(cierres))} ` +
      `estadoTrasCierre=${JSON.stringify(estadoCerrada)}`
  );
}
