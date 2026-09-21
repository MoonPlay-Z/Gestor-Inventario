const express = require('express');
const prisma = require('../db/prisma');
const bcrypt = require('bcrypt');
const { requireRole } = require('../middleware/auth');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');

const router = express.Router();

// Las rutas de gestión de usuarios están disponibles para EMPRESA y para
// el usuario SUPER_ADMIN que actualiza su propio perfil desde configuración.
router.use(requireRole('EMPRESA', 'SUPER_ADMIN'));

// GET /api/usuarios — Listar sub-usuarios
router.get('/', async (req, res, next) => {
  try {
    const { rol, q } = req.query;
    const where = { empresaId: req.user.id };

    if (rol) {
      where.rol = rol;
    }

    if (q) {
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { nombre: { contains: q, mode: 'insensitive' } }
      ];
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
        _count: {
          select: { facturas: true, cierresCaja: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(usuarios);
  } catch (err) {
    next(err);
  }
});

// POST /api/usuarios — Crear un sub-usuario (CAJA o INVENTARIO)
router.post('/', async (req, res, next) => {
  try {
    const { username, password, nombre, rol } = req.body;

    if (!username?.trim()) throw createValidationError('El nombre de usuario es obligatorio');
    if (!password || password.length < 4) throw createValidationError('La contraseña debe tener al menos 4 caracteres');
    if (!nombre?.trim()) throw createValidationError('El nombre de la persona u operador es obligatorio');
    if (!['CAJA', 'INVENTARIO', 'VISOR'].includes(rol)) {
      throw createValidationError('El rol debe ser CAJA, INVENTARIO o VISOR');
    }

    const cleanUsername = username.trim().toLowerCase();

    const existing = await prisma.usuario.findUnique({ where: { username: cleanUsername } });
    if (existing) {
      throw createBusinessError('El nombre de usuario ya existe');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        username: cleanUsername,
        passwordHash,
        nombre: nombre.trim(),
        rol,
        empresaId: req.user.id,
      },
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true
      }
    });

    res.status(201).json(nuevoUsuario);
  } catch (err) {
    next(err);
  }
});

// PUT /api/usuarios/:id — Editar sub-usuario (nombre, rol, activo, contraseña)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, rol, activo, password } = req.body;

    const targetUser = await prisma.usuario.findUnique({ where: { id } });
    if (!targetUser) throw createBusinessError('Usuario no encontrado');
    if (targetUser.empresaId !== req.user.id && targetUser.id !== req.user.id) {
      throw createBusinessError('No tienes permisos para modificar este usuario');
    }

    // No permitir cambiar el rol del usuario EMPRESA principal desde aquí
    if (targetUser.rol === 'EMPRESA' && req.user.id !== targetUser.id) {
      throw createBusinessError('No se puede modificar la cuenta principal de la Empresa');
    }

    const updateData = {};

    if (nombre !== undefined && nombre.trim()) {
      updateData.nombre = nombre.trim();
    }

    if (rol !== undefined && ['CAJA', 'INVENTARIO', 'VISOR'].includes(rol)) {
      updateData.rol = rol;
    }

    if (activo !== undefined) {
      updateData.activo = Boolean(activo);
    }

    if (password && password.trim().length >= 4) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
        activo: true,
        updatedAt: true
      }
    });

    res.json(actualizado);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/usuarios/:id — Desactivar sub-usuario (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const targetUser = await prisma.usuario.findUnique({ where: { id } });
    if (!targetUser) throw createBusinessError('Usuario no encontrado');
    if (targetUser.empresaId !== req.user.id) {
      throw createBusinessError('No tienes permisos para desactivar este usuario');
    }
    if (id === req.user.id) {
      throw createBusinessError('No puedes desactivar tu propia cuenta de Empresa');
    }

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: { id: true, username: true, activo: true }
    });

    res.json({ message: 'Usuario desactivado correctamente', usuario: actualizado });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
