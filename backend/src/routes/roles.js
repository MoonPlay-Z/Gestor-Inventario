const express = require('express');
const prisma = require('../db/prisma');
const { requireRole } = require('../middleware/auth');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/roles/permisos — Listar catálogo de permisos del sistema
router.get('/permisos', async (req, res, next) => {
  try {
    const permisos = await prisma.permiso.findMany({
      orderBy: [{ modulo: 'asc' }, { accion: 'asc' }]
    });
    res.json(permisos);
  } catch (err) {
    next(err);
  }
});

// GET /api/roles — Listar roles
router.get('/', async (req, res, next) => {
  try {
    const empresaId = req.user.empresaRefId || req.user.empresaId || req.user.id;
    const roles = await prisma.rol.findMany({
      where: {
        OR: [
          { empresaId: null }, // roles globales del sistema
          { empresaId }
        ]
      },
      include: {
        permisos: {
          include: { permiso: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(roles);
  } catch (err) {
    next(err);
  }
});

// POST /api/roles — Crear un nuevo rol con sus permisos
router.post('/', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { nombre, descripcion, permisoIds } = req.body;
    if (!nombre?.trim()) throw createValidationError('El nombre del rol es obligatorio');

    const empresaId = req.user.rol === 'SUPER_ADMIN' ? null : (req.user.empresaRefId || req.user.id);

    const nuevoRol = await prisma.rol.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        empresaId,
        permisos: Array.isArray(permisoIds) && permisoIds.length > 0 ? {
          create: permisoIds.map(pId => ({ permisoId: pId }))
        } : undefined
      },
      include: {
        permisos: {
          include: { permiso: true }
        }
      }
    });

    res.status(201).json(nuevoRol);
  } catch (err) {
    next(err);
  }
});

// PUT /api/roles/:id — Modificar rol y sus permisos
router.put('/:id', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisoIds } = req.body;

    const rolExistente = await prisma.rol.findUnique({ where: { id } });
    if (!rolExistente) throw createBusinessError('Rol no encontrado');

    const updateData = {};
    if (nombre !== undefined && nombre.trim()) updateData.nombre = nombre.trim();
    if (descripcion !== undefined) updateData.descripcion = descripcion.trim() || null;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.rol.update({ where: { id }, data: updateData });
      }

      if (Array.isArray(permisoIds)) {
        await tx.rolPermiso.deleteMany({ where: { rolId: id } });
        if (permisoIds.length > 0) {
          await tx.rolPermiso.createMany({
            data: permisoIds.map(pId => ({ rolId: id, permisoId: pId }))
          });
        }
      }
    });

    const rolActualizado = await prisma.rol.findUnique({
      where: { id },
      include: { permisos: { include: { permiso: true } } }
    });

    res.json(rolActualizado);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/roles/:id — Eliminar rol
router.delete('/:id', requireRole('EMPRESA', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const rolExistente = await prisma.rol.findUnique({ where: { id } });
    if (!rolExistente) throw createBusinessError('Rol no encontrado');

    await prisma.rol.delete({ where: { id } });
    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
