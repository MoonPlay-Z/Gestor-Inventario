/**
 * Service Worker de GestorPOS (PWA).
 *
 * Estrategia:
 *   - Navegaciones (SPA): red primero, fallback a /index.html → app navegable offline.
 *   - Estáticos (JS/CSS/imágenes con hash): cache-first + actualización en segundo plano.
 *   - /api: NUNCA se cachea — siempre red. El backend es la fuente de verdad
 *     (tasas, saldos, CxC en USD); cachear respuestas rompería el inventario.
 *
 * Solo se registra en producción (ver src/main.jsx) para no interferir con Vite dev.
 */

const VERSION = 'gestorpos-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return; // la API vive en la red

  // ── Navegaciones: red → fallback al shell ──────────────────────────────────
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // ── Estáticos: cache-first con revalidación en segundo plano ───────────────
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && (response.status === 200 || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match('/index.html'));
      return cached || network;
    })
  );
});

// Limpieza de versiones antiguas al activar.
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
