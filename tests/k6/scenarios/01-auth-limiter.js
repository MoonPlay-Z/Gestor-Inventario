import http from 'k6/http';
import { check } from 'k6';
import { BASE } from '../lib/config.js';
import { F } from '../lib/fixtures.js';
import { api } from '../lib/http.js';

/**
 * 01 — Rate limit de autenticación.
 *
 * Ejecutar con el backend recién reiniciado: express-rate-limit guarda el
 * contador en memoria y este escenario lo agota a propósito.
 *
 * Qué busca:
 *   1. Que el login inválido se bloquee tras 10 intentos (429).
 *   2. Que GET /auth/me NO comparta el mismo limiter que /auth/login.
 *      En el código actual ambas rutas montan `loginLimiter`, así que un
 *      endpoint de lectura consume el cupo de login (y al revés).
 */
export const options = {
  scenarios: {
    authLimiter: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      maxDuration: '2m',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
  },
  tags: { suite: '01-auth-limiter' },
};

export default function () {
  const bad = { username: 'k6_usuario_inexistente', password: 'contraseña-mala' };
  const statuses = [];
  let lastHeaders = {};

  for (let i = 0; i < 12; i++) {
    const res = http.post(`${BASE}/api/auth/login`, JSON.stringify(bad), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'login-invalido' },
    });
    statuses.push(res.status);
    lastHeaders = res.headers;
  }

  const rateLimitHeaders =
    lastHeaders['Ratelimit'] ||
    lastHeaders['RateLimit'] ||
    lastHeaders['ratelimit'] ||
    lastHeaders['X-RateLimit-Limit'] ||
    '';

  check(null, {
    'los 10 primeros intentos dan 401': () =>
      statuses.slice(0, 10).every((s) => s === 401),
    'el intento 11 está bloqueado con 429': () => statuses[10] === 429,
    'el intento 12 sigue bloqueado con 429': () => statuses[11] === 429,
  });

  // Tras agotar el limiter de login, /auth/me no debería verse afectado.
  const me = api('GET', '/auth/me', F.users.empresaA.token);

  check(null, {
    'GET /auth/me responde 200 pese a agotar el login (no comparte limiter)': () =>
      me.status === 200,
  });

  console.log(
    `[01] login statuses=${statuses.join(',')} | /auth/me=${me.status} | ` +
      `rate-limit-headers=${rateLimitHeaders ? 'sí' : 'no'}`
  );
}
