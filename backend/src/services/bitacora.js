const crypto = require('crypto');
const prisma = require('../db/auditoriaDb');

/**
 * Bitácora append-only por empresa.
 *
 * Nunca lanza: si la escritura falla, la operación de negocio que la originó
 * sigue su curso. Los registros se acumulan en memoria y se vacían cada 2 s o
 * cada 50 entradas, con reintento y tope de buffer.
 */

const MAX_COLA = 1000;
const TAMANO_LOTE = 50;
const FLUSH_MS = 2000;
const MAX_REINTENTOS = 10;

const CAMPOS_EXCLUIDOS = new Set([
  'password', 'passwordhash', 'passwordtocado',
  'confirmpassword', 'newpassword', 'currentpassword',
  'mfasecret', 'mfacode', 'otp', 'pin', 'sessionversion', 'sudomodeexpiresat',
  'token', 'authorization', 'cookie', 'set-cookie', 'apikey', 'x-api-key',
  'accesstoken', 'refreshtoken', 'refreshtokenid', 'secret',
]);

function sanitizar(valor, profundidad = 0) {
  if (valor === null || valor === undefined) return valor;
  if (profundidad > 6) return '[profundidad]';
  if (Array.isArray(valor)) return valor.slice(0, 200).map((v) => sanitizar(v, profundidad + 1));
  if (typeof valor === 'object') {
    const salida = {};
    for (const [clave, v] of Object.entries(valor)) {
      if (CAMPOS_EXCLUIDOS.has(clave.toLowerCase())) continue;
      salida[clave] = sanitizar(v, profundidad + 1);
    }
    return salida;
  }
  if (typeof valor === 'bigint') return valor.toString();
  if (typeof valor === 'string' && valor.length > 2000) return `${valor.slice(0, 2000)}…`;
  return valor;
}

function serializar(valor) {
  if (valor === null || valor === undefined) return null;
  return JSON.stringify(sanitizar(valor));
}

function mensajeErrorSeguro(error) {
  let mensaje = String(error?.message || error || 'Error desconocido');
  if (process.env.AUDIT_DATABASE_URL) {
    mensaje = mensaje.replaceAll(process.env.AUDIT_DATABASE_URL, '[AUDIT_DATABASE_URL]');
  }
  return mensaje.replace(/((?:postgresql?|mysql):\/\/)[^@\s/]+@/gi, '$1[redacted]@');
}

let cola = [];
let ultimoHash = null;
let ultimoCreadoMs = 0;
let cargandoHash = null;
let vaciando = null;
let temporizador = null;
let reintentos = 0;

function programar(espera = FLUSH_MS) {
  if (temporizador) return;
  temporizador = setTimeout(() => {
    temporizador = null;
    void flush();
  }, espera);
  if (typeof temporizador.unref === 'function') temporizador.unref();
}

async function cargarUltimoHash() {
  if (!prisma) throw new Error('AUDIT_DATABASE_URL no está configurada');
  if (ultimoHash !== null) return ultimoHash;
  if (!cargandoHash) {
    cargandoHash = prisma.bitacora
      .findFirst({
        orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }],
        select: { hash: true, creadoEn: true },
      })
      .then((fila) => {
        ultimoHash = fila?.hash || '';
        ultimoCreadoMs = Math.max(
          ultimoCreadoMs,
          fila ? new Date(fila.creadoEn).getTime() : 0,
        );
      })
      .catch((err) => {
        console.error('[bitacora] No se pudo cargar el último hash:', mensajeErrorSeguro(err));
        throw err;
      })
      .finally(() => { cargandoHash = null; });
  }
  await cargandoHash;
  return ultimoHash;
}

function hashFila(hashAnterior, fila) {
  const contenido = JSON.stringify([
    hashAnterior, fila.id, fila.empresaId, fila.usuarioId, fila.usuarioNombre,
    fila.usuarioRol, fila.categoria, fila.modulo, fila.accion, fila.entidad,
    fila.entidadId, fila.descripcion, fila.datosAnteriores, fila.datosNuevos,
    fila.monto, fila.ipAddress, fila.userAgent, fila.httpMethod, fila.httpPath,
    fila.httpStatus, fila.duracionMs, fila.creadoEn.toISOString(),
  ]);
  return crypto.createHash('sha256').update(contenido).digest('hex');
}

function verificarFilas(filas) {
  let anterior = filas[0]?.hashAnterior || null;

  for (const fila of filas) {
    if (fila.hashAnterior !== anterior) {
      return { valido: false, registroId: fila.id, motivo: 'La cadena de hashes está interrumpida' };
    }

    const esperado = hashFila(anterior || '', fila);
    if (esperado !== fila.hash) {
      return { valido: false, registroId: fila.id, motivo: 'El contenido no coincide con su hash' };
    }
    anterior = fila.hash;
  }

  return { valido: true, registrosVerificados: filas.length };
}

/**
 * Contexto de auditoría a partir del request autenticado.
 * `empresaId` usa el id de `Empresa` cuando existe; las subcuentas guardan el
 * id del Usuario padre para que el dueño pueda ver su actividad.
 */
function contexto(req, explicita = true) {
  if (req && explicita) req.bitacoraExplicita = true;
  const u = req?.user || {};
  return {
    empresaId: u.empresaRefId || u.empresaId || u.id || null,
    usuarioId: u.id || null,
    usuarioNombre: u.nombre || u.username || 'Sistema',
    usuarioRol: u.rol || null,
    ipAddress: req?.ip || null,
    userAgent: (req?.get?.('user-agent') || '').slice(0, 300) || null,
    httpMetadata: req?.bitacoraHttp || null,
  };
}

function completarSolicitud(req, httpStatus, duracionMs) {
  const metadata = req?.bitacoraHttp;
  if (!metadata) return;

  metadata.httpStatus = httpStatus;
  metadata.duracionMs = duracionMs;
  metadata.ready = true;

  let actualizados = false;
  for (const evento of cola) {
    if (evento.httpMetadata !== metadata) continue;
    evento.httpStatus = httpStatus;
    evento.duracionMs = duracionMs;
    delete evento.httpMetadata;
    actualizados = true;
  }

  if (actualizados) {
    if (cola.length >= TAMANO_LOTE) void flush();
    else programar();
  }
}

/**
 * Encola un evento. No devuelve promesa a propósito: la ruta no debe esperar
 * a la bitácora ni fallar por ella.
 */
function registrar(evento = {}) {
  try {
    if (!evento.accion || !evento.categoria) return;
    const monto = evento.monto === undefined || evento.monto === null
      ? null
      : Number(evento.monto);
    if (monto !== null && !Number.isFinite(monto)) {
      throw new TypeError('El monto de auditoría debe ser finito');
    }
    const httpStatus = evento.httpStatus == null ? null : Number(evento.httpStatus);
    const duracionMs = evento.duracionMs == null ? null : Number(evento.duracionMs);
    if (httpStatus !== null && !Number.isInteger(httpStatus)) {
      throw new TypeError('El estado HTTP de auditoría debe ser entero');
    }
    if (duracionMs !== null && (!Number.isInteger(duracionMs) || duracionMs < 0)) {
      throw new TypeError('La duración de auditoría debe ser un entero no negativo');
    }

    const ahora = Date.now();
    const creadoEn = new Date(Math.max(ahora, ultimoCreadoMs + 1));
    ultimoCreadoMs = creadoEn.getTime();
    const httpMetadata = evento.contexto?.httpMetadata;
    cola.push({
      id: crypto.randomUUID(),
      empresaId: evento.contexto?.empresaId || null,
      usuarioId: evento.contexto?.usuarioId || null,
      usuarioNombre: evento.contexto?.usuarioNombre || 'Sistema',
      usuarioRol: evento.contexto?.usuarioRol || null,
      categoria: String(evento.categoria).toUpperCase(),
      modulo: evento.modulo || 'general',
      accion: String(evento.accion).toUpperCase(),
      entidad: evento.entidad || 'general',
      entidadId: evento.entidadId ? String(evento.entidadId) : null,
      descripcion: String(evento.descripcion || evento.accion).slice(0, 500),
      datosAnteriores: serializar(evento.datosAnteriores),
      datosNuevos: serializar(evento.datosNuevos),
      monto,
      ipAddress: evento.contexto?.ipAddress || null,
      userAgent: evento.contexto?.userAgent || null,
      httpMethod: evento.httpMethod
        ? String(evento.httpMethod).toUpperCase().slice(0, 10)
        : httpMetadata?.httpMethod || null,
      httpPath: evento.httpPath ? String(evento.httpPath).slice(0, 500) : httpMetadata?.httpPath || null,
      httpStatus: httpStatus ?? httpMetadata?.httpStatus ?? null,
      duracionMs: duracionMs ?? httpMetadata?.duracionMs ?? null,
      ...(httpMetadata && !httpMetadata.ready ? { httpMetadata } : {}),
      creadoEn,
    });
    if (cola.length > MAX_COLA) {
      const descartados = cola.splice(0, cola.length - MAX_COLA);
      console.error(`[bitacora] Cola llena; se descartaron ${descartados.length} registros antiguos`);
    }
    if (cola.length >= TAMANO_LOTE) void flush();
    else programar();
  } catch (err) {
    console.error('[bitacora] No se pudo encolar un registro:', mensajeErrorSeguro(err));
  }
}

async function flush() {
  if (vaciando || cola.length === 0) return vaciando;
  if (temporizador) {
    clearTimeout(temporizador);
    temporizador = null;
  }
  let tamanoListo = 0;
  // Mantiene el orden de hash mientras una respuesta HTTP aún no tiene estado final.
  while (tamanoListo < Math.min(TAMANO_LOTE, cola.length) && !cola[tamanoListo].httpMetadata) {
    tamanoListo += 1;
  }
  if (tamanoListo === 0) {
    programar();
    return null;
  }
  const lote = cola.splice(0, tamanoListo);

  vaciando = (async () => {
    try {
      let anterior = await cargarUltimoHash();
      let creadoMs = ultimoCreadoMs;
      const filas = lote.map((evento) => {
        creadoMs = Math.max(evento.creadoEn.getTime(), creadoMs + 1);
        const datosEvento = { ...evento };
        delete datosEvento.httpMetadata;
        const fila = {
          ...datosEvento,
          creadoEn: new Date(creadoMs),
          hashAnterior: anterior || null,
        };
        fila.hash = hashFila(anterior || '', fila);
        anterior = fila.hash;
        return fila;
      });

      await prisma.bitacora.createMany({ data: filas });
      ultimoHash = anterior;
      ultimoCreadoMs = Math.max(ultimoCreadoMs, creadoMs);
      reintentos = 0;
    } catch (err) {
      reintentos += 1;
      if (reintentos < MAX_REINTENTOS) {
        cola.unshift(...lote);
        console.error(`[bitacora] Falló el lote; reintento ${reintentos}/${MAX_REINTENTOS}:`, mensajeErrorSeguro(err));
      } else {
        console.error(`[bitacora] Se descartó un lote de ${lote.length} registros tras ${MAX_REINTENTOS} intentos:`, mensajeErrorSeguro(err));
        reintentos = 0;
      }
    } finally {
      vaciando = null;
      if (cola.length) {
        const espera = reintentos
          ? Math.min(FLUSH_MS * (2 ** (reintentos - 1)), 60_000)
          : FLUSH_MS;
        programar(espera);
      }
    }
  })();

  return vaciando;
}

/** Solo para pruebas: vacía la cola y olvida el estado en memoria. */
function _reset() {
  cola = [];
  ultimoHash = null;
  ultimoCreadoMs = 0;
  cargandoHash = null;
  reintentos = 0;
  if (temporizador) clearTimeout(temporizador);
  temporizador = null;
}

module.exports = {
  registrar,
  contexto,
  completarSolicitud,
  flush,
  verificarFilas,
  hashFila,
  sanitizar,
  mensajeErrorSeguro,
  _reset,
  CAMPOS_EXCLUIDOS,
};
