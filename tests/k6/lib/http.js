import http from 'k6/http';
import { BASE } from './config.js';

// Los escenarios negativos esperan 4xx. Sin este callback k6 los contaría como
// fallos de red y `http_req_failed` sería ruido. Los 5xx siguen contando como
// fallo (no están en la lista).
http.setResponseCallback(
  http.expectedStatuses(
    { min: 200, max: 299 },
    400,
    401,
    403,
    404,
    409,
    413,
    422,
    429
  )
);

export function headers(token, extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

/**
 * Petición a la API. `path` empieza por "/" (p. ej. "/facturas").
 * `tags.name` permite thresholds por endpoint.
 */
export function api(method, path, token, body, tags = {}) {
  const params = {
    headers: headers(token),
    tags: { name: path.split('?')[0], ...tags },
  };
  const payload = body === undefined ? null : JSON.stringify(body);
  return http.request(method, `${BASE}/api${path}`, payload, params);
}

/** Igual que api() pero sin serializar: útil para cuerpos > 1 MB. */
export function apiRaw(method, path, token, rawBody, tags = {}) {
  return http.request(method, `${BASE}/api${path}`, rawBody, {
    headers: headers(token),
    tags: { name: path.split('?')[0], ...tags },
  });
}

/** Construye una entrada para http.batch(). */
export function batchItem(method, path, token, body, name) {
  return {
    method,
    url: `${BASE}/api${path}`,
    body: body === undefined ? null : JSON.stringify(body),
    params: {
      headers: headers(token),
      tags: { name: name || path.split('?')[0] },
    },
  };
}

export function json(res) {
  try {
    return JSON.parse(res.body);
  } catch {
    return {};
  }
}

export function is2xx(res) {
  return res.status >= 200 && res.status < 300;
}

export function statusSummary(responses) {
  const out = {};
  for (const r of responses) out[r.status] = (out[r.status] || 0) + 1;
  return out;
}

/**
 * Precalienta el caché de tasas BCV. Las rutas de facturas/pagos consultan
 * dolarapi por cada operación; si el entorno no tiene salida a internet, la
 * primera llamada tarda hasta 8 s y activa un backoff de 10 min. Hacerla una
 * vez evita que las carreras se midan con 10 timeouts en paralelo.
 */
export function warmupBcv(token) {
  try {
    return api('GET', '/tasa/bcv', token, undefined, { name: 'warmup-bcv' });
  } catch {
    return null;
  }
}
