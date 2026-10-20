import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE } from '../lib/config.js';
import { F } from '../lib/fixtures.js';

/**
 * 10 — Carga de lectura sostenida.
 *
 * Solo GETs, para no ensuciar los datos. Busca:
 *   - p95/p99 altos por subscriptionGuard (1-2 queries por request),
 *   - agotamiento del pool de conexiones,
 *   - endpoints de reportes/dashboard con agregaciones costosas.
 *
 * No incluye /auth/login ni /auth/me: comparten el rate limit de login.
 */
export const options = {
  scenarios: {
    read: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages:
        __ENV.K6_LOAD_SMOKE === 'true'
          ? [
              { duration: '5s', target: 3 },
              { duration: '5s', target: 3 },
              { duration: '5s', target: 0 },
            ]
          : [
              { duration: '1m', target: 20 },
              { duration: '3m', target: 50 },
              { duration: '3m', target: 50 },
              { duration: '1m', target: 0 },
            ],
      exec: 'leer',
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:dashboard}': ['p(95)<800', 'p(99)<2000'],
    'http_req_duration{name:facturas}': ['p(95)<600', 'p(99)<1500'],
    'http_req_duration{name:productos}': ['p(95)<600', 'p(99)<1500'],
    'http_req_duration{name:cxc-resumen}': ['p(95)<800', 'p(99)<2000'],
    'http_req_duration{name:reportes-ventas}': ['p(95)<1500', 'p(99)<3000'],
    'http_req_duration{name:clientes}': ['p(95)<600'],
    'http_req_duration{name:tasa}': ['p(95)<300'],
  },
  tags: { suite: '10-load-read' },
};

const TOKEN = F.users.empresaA.token;
const HEADERS = { Authorization: `Bearer ${TOKEN}` };

const ENDPOINTS = [
  ['dashboard', '/api/dashboard'],
  ['facturas', '/api/facturas?limit=25'],
  ['productos', '/api/productos?limit=25'],
  ['cxc-resumen', '/api/cxc/resumen'],
  ['reportes-ventas', '/api/reportes/ventas'],
  ['clientes', '/api/clientes?limit=25'],
  ['tasa', '/api/tasa'],
];

export function leer() {
  for (const [name, path] of ENDPOINTS) {
    const res = http.get(`${BASE}${path}`, {
      headers: HEADERS,
      tags: { name },
    });
    check(res, {
      [`${name} 200`]: (r) => r.status === 200,
    });
  }
  sleep(1);
}
