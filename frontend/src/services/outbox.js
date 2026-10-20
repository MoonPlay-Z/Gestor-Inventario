/**
 * Outbox offline: cola de ventas en IndexedDB para el POS.
 *
 * Cuando no hay conexión, la venta se guarda localmente y se reenvía al
 * backend cuando vuelve la red. El backend es la fuente de verdad, y el
 * `requestId` (idempotencia ya corregida en facturas.js) hace que reintentar
 * sea siempre seguro: un reintento devuelve la MISMA factura, nunca una nueva.
 *
 * Reglas:
 *   - Solo se reintenta en error de red (status 0 / NETWORK_ERROR / TIMEOUT).
 *   - Un error 4xx es permanente: reintentar no lo arregla.
 *   - Se procesa en orden FIFO y de una en una (sin concurrencia).
 */
import { API } from './api';

const DB_NAME = 'gestorpos-offline';
const DB_VERSION = 1;
const STORE = 'outbox';
const MAX_INTENTOS = 5;

let _db = null;
const _listeners = new Set();

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = (e) => reject(e.target.error || new Error('No se pudo abrir el almacenamiento local'));
  });
}

function notify() { _listeners.forEach((cb) => cb()); }

/** Suscripción a cambios en el outbox (para refrescar indicadores en la UI). */
export function onOutboxChange(cb) {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

export async function initOutbox() {
  await openDB();
}

const genId = () => (crypto.randomUUID?.()
  ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/**
 * Guarda una venta en la cola. Reutiliza el `requestId` del payload si ya
 * existe (así un reintento offline no duplica la venta).
 */
export async function encolarVenta(payload, tipoDocumento = 'factura') {
  const db = await openDB();
  const id = genId();
  const requestId = payload.requestId || id;
  const venta = {
    id,
    requestId,
    payload: { ...payload, requestId },
    tipoDocumento,
    estado: 'PENDING', // PENDING | SYNCING | SYNCED | FAILED
    createdAt: Date.now(),
    intentos: 0,
    error: null,
    facturaId: null,
  };
  await new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite');
    t.objectStore(STORE).add(venta);
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error || new Error('No se pudo guardar la venta'));
  });
  notify();
  return venta;
}

/** Ventas pendientes de enviar, en orden FIFO. */
export async function obtenerPendientes() {
  const db = await openDB();
  const all = await new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readonly');
    const req = t.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error || new Error('No se pudo leer la cola'));
  });
  return all
    .filter((v) => v.estado === 'PENDING')
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** Historial completo del outbox (cualquier estado), más reciente primero. */
export async function obtenerTodos() {
  const db = await openDB();
  const all = await new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readonly');
    const req = t.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error || new Error('No se pudo leer la cola'));
  });
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

async function setEstado(id, estado, extra = {}) {
  const db = await openDB();
  const venta = await new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readonly');
    const req = t.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  if (!venta) return;
  Object.assign(venta, { estado, ...extra });
  await new Promise((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite');
    t.objectStore(STORE).put(venta);
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error || new Error('No se pudo actualizar la venta'));
  });
  notify();
}

const marcarSyncing = (id) => setEstado(id, 'SYNCING');
const marcarSynced = (id, facturaId) => setEstado(id, 'SYNCED', { facturaId, error: null });
const marcarFallida = (id, error) => setEstado(id, 'FAILED', { error });

let _syncing = false;

/**
 * Procesa la cola. Devuelve un resumen { synced, failed }.
 * Emite un evento `outbox:synced` por cada venta enviada para que la UI
 * pueda mostrar el recibo.
 */
export async function syncOutbox() {
  if (_syncing) return { synced: 0, failed: 0, skipped: true };
  _syncing = true;
  let synced = 0;
  let failed = 0;
  try {
    const pendientes = await obtenerPendientes();
    for (const venta of pendientes) {
      await marcarSyncing(venta.id);
      try {
        const res = await API.emitirFactura(venta.payload);
        await marcarSynced(venta.id, res?.numeroFactura);
        synced++;
        window.dispatchEvent(new CustomEvent('outbox:synced', {
          detail: { factura: res, tipoDocumento: venta.tipoDocumento },
        }));
      } catch (err) {
        const intentos = (venta.intentos || 0) + 1;
        if (err.status >= 400 && err.status < 500) {
          await marcarFallida(venta.id, err.message || 'Error de validación');
          failed++;
        } else if (intentos >= MAX_INTENTOS) {
          await marcarFallida(venta.id, `Máximo de reintentos alcanzado. ${err.message || 'Error de red'}`);
          failed++;
        } else {
          // Error de red transitorio: vuelve a PENDING para el próximo intento.
          await setEstado(venta.id, 'PENDING', { intentos, error: err.message || 'Error de red' });
        }
      }
    }
  } finally {
    _syncing = false;
    notify();
  }
  return { synced, failed };
}
