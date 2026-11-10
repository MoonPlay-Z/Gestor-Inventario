const express = require('express');
const prisma = require('../db/auditoriaDb');
const { requireRole } = require('../middleware/auth');
const { createValidationError } = require('../middleware/errorHandler');
const { verificarFilas } = require('../services/bitacora');

const router = express.Router();

router.use(requireRole('EMPRESA', 'SUPER_ADMIN'));

function parsear(valor) {
  if (!valor) return null;
  try { return JSON.parse(valor); } catch { return valor; }
}

function fecha(valor) {
  if (!valor) return null;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) throw createValidationError('La fecha indicada no es válida');
  return d;
}

function decodificarCursor(valor) {
  if (!valor) return null;
  try {
    const cursor = JSON.parse(Buffer.from(String(valor), 'base64url').toString('utf8'));
    const creadoEn = fecha(cursor.creadoEn);
    if (!creadoEn || typeof cursor.id !== 'string' || !cursor.id) throw new Error('Cursor incompleto');
    return { creadoEn, id: cursor.id };
  } catch {
    throw createValidationError('El cursor de bitácora no es válido');
  }
}

function codificarCursor(fila) {
  return Buffer.from(JSON.stringify({
    creadoEn: fila.creadoEn.toISOString(),
    id: fila.id,
  })).toString('base64url');
}

function whereEmpresa(req) {
  if (req.user.rol === 'SUPER_ADMIN') {
    return req.query.empresaId ? { empresaId: String(req.query.empresaId) } : {};
  }
  const ids = [...new Set([req.user.empresaRefId, req.user.id, req.user.empresaId].filter(Boolean))];
  return { empresaId: { in: ids } };
}

/**
 * GET /api/bitacora
 * Paginación por cursor sobre (creadoEn DESC, id DESC).
 */
router.get('/', async (req, res, next) => {
  try {
    if (!prisma) return res.status(503).json({ error: 'La bitácora no está configurada' });
    const { categoria, accion, modulo, usuarioId, usuario, q, desde, hasta } = req.query;
    const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 50, 1), 200);

    const where = whereEmpresa(req);

    if (categoria) where.categoria = String(categoria).toUpperCase();
    if (accion) where.accion = String(accion).toUpperCase();
    if (modulo) where.modulo = String(modulo);
    if (usuarioId) where.usuarioId = String(usuarioId);
    if (usuario) where.usuarioNombre = { contains: String(usuario) };

    const desdeFecha = fecha(desde);
    const hastaFecha = fecha(hasta);
    const cursor = decodificarCursor(req.query.cursor);
    if (desdeFecha && hastaFecha && desdeFecha > hastaFecha) {
      throw createValidationError('La fecha desde no puede ser posterior a la fecha hasta');
    }
    if (desdeFecha || hastaFecha) {
      where.creadoEn = {};
      if (desdeFecha) where.creadoEn.gte = desdeFecha;
      if (hastaFecha) where.creadoEn.lte = hastaFecha;
    }

    const condiciones = [];
    if (cursor) {
      condiciones.push({
        OR: [
          { creadoEn: { lt: cursor.creadoEn } },
          { creadoEn: cursor.creadoEn, id: { lt: cursor.id } },
        ],
      });
    }
    if (q) {
      condiciones.push({ OR: [
        { descripcion: { contains: String(q) } },
        { entidad: { contains: String(q) } },
        { accion: { contains: String(q) } },
        { usuarioNombre: { contains: String(q) } },
      ] });
    }
    if (condiciones.length) where.AND = condiciones;

    const filas = await prisma.bitacora.findMany({
      where,
      orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }],
      take: limite + 1,
      select: {
        id: true, empresaId: true, usuarioId: true, usuarioNombre: true,
        usuarioRol: true, categoria: true, modulo: true, accion: true,
        entidad: true, entidadId: true, descripcion: true,
        datosAnteriores: true, datosNuevos: true, monto: true,
        ipAddress: true, userAgent: true, httpMethod: true, httpPath: true,
        httpStatus: true, duracionMs: true, hash: true, creadoEn: true,
      },
    });

    const hayMas = filas.length > limite;
    const datos = (hayMas ? filas.slice(0, limite) : filas).map((fila) => ({
      ...fila,
      datosAnteriores: parsear(fila.datosAnteriores),
      datosNuevos: parsear(fila.datosNuevos),
    }));

    res.json({
      datos,
      siguienteCursor: hayMas && datos.length ? codificarCursor(datos[datos.length - 1]) : null,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/integridad', async (req, res, next) => {
  try {
    if (!prisma) return res.status(503).json({ error: 'La bitácora no está configurada' });
    const limite = 500;
    const filas = await prisma.bitacora.findMany({
      // La cadena es global: hay que incluir eventos de otras empresas para
      // validar correctamente los hashes intermedios sin exponerlos al cliente.
      where: {},
      orderBy: [{ creadoEn: 'desc' }, { id: 'desc' }],
      take: limite,
      select: {
        id: true, empresaId: true, usuarioId: true, usuarioNombre: true,
        usuarioRol: true, categoria: true, modulo: true, accion: true,
        entidad: true, entidadId: true, descripcion: true,
        datosAnteriores: true, datosNuevos: true, monto: true,
        ipAddress: true, userAgent: true, httpMethod: true, httpPath: true,
        httpStatus: true, duracionMs: true, hash: true, hashAnterior: true,
        creadoEn: true,
      },
    });
    const ordenCronologico = filas.reverse();
    const resultado = verificarFilas(ordenCronologico);
    res.json({
      ...resultado,
      registrosVerificados: resultado.registrosVerificados || 0,
      limite,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
