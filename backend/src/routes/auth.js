const express = require('express');
const prisma = require('../db/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { createValidationError } = require('../middleware/errorHandler');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const DEV_SECRET = process.env.DEV_SECRET;

// ─── 1. Iniciar sesión ───────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw createValidationError('Usuario y contraseña son requeridos');
    }

    const usuario = await prisma.usuario.findUnique({
      where: { username }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(401).json({ error: 'Usuario desactivado. Contacte al administrador.' });
    }

    const match = await bcrypt.compare(password, usuario.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Token incluye: id, username, nombre del operador, rol, subscriptionStatus
    const token = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresaId: usuario.empresaId,
        subscriptionStatus: usuario.subscriptionStatus
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresaId: usuario.empresaId,
        subscriptionStatus: usuario.subscriptionStatus,
        trialEndsAt: usuario.trialEndsAt,
        currentPeriodEnd: usuario.currentPeriodEnd
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── 2. Registro Remoto (Solo Desarrollador) ─────────────────────────────────
router.post('/register-remote', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Prohibido: Registro remoto desactivado en producción' });
    }

    const devToken = req.headers['x-dev-secret'];
    if (!DEV_SECRET || devToken !== DEV_SECRET) {
      return res.status(403).json({ error: 'Prohibido: Se requiere clave de desarrollador válida' });
    }

    const { username, password, nombre, rol } = req.body;
    if (!username || !password) {
      throw createValidationError('Usuario y contraseña son requeridos');
    }
    if (password.length < 8) {
      throw createValidationError('La contraseña debe tener al menos 8 caracteres');
    }

    const validRoles = ['SUPER_ADMIN', 'EMPRESA', 'CAJA', 'INVENTARIO'];
    const finalRol = validRoles.includes(rol) ? rol : 'CAJA';

    const existingUser = await prisma.usuario.findUnique({ where: { username } });
    if (existingUser) {
      throw createValidationError('El nombre de usuario ya existe');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.usuario.create({
      data: {
        username,
        passwordHash,
        nombre: nombre || username,
        rol: finalRol
      }
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: { id: newUser.id, username: newUser.username, nombre: newUser.nombre, rol: newUser.rol }
    });
  } catch (err) {
    next(err);
  }
});
// ─── 2.5. Registro Público de Clientes SaaS (Trial 7 días) ───────────────────
router.post('/register-client', registerLimiter, async (req, res, next) => {
  try {
    const { username, password, nombre } = req.body;
    if (!username || !password || !nombre) {
      throw createValidationError('Usuario, contraseña y nombre de la empresa son requeridos');
    }
    if (password.length < 8) {
      throw createValidationError('La contraseña debe tener al menos 8 caracteres');
    }

    const cleanUsername = username.trim().toLowerCase();

    const existingUser = await prisma.usuario.findUnique({ where: { username: cleanUsername } });
    if (existingUser) {
      throw createValidationError('El nombre de usuario ya está en uso');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días

    const nowIso     = now.toISOString();
    const trialEndIso = trialEnd.toISOString();

    // Se crea ACTIVO con trial de 7 días
    const newUser = await prisma.usuario.create({
      data: {
        username: cleanUsername,
        passwordHash,
        nombre: nombre.trim(),
        rol: 'EMPRESA',
        activo: true,
        subscriptionStatus: 'trialing',
        trialStartsAt: nowIso,
        trialEndsAt:   trialEndIso,
      }
    });

    // Auto-login: generar token para acceso inmediato
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        nombre: newUser.nombre,
        rol: newUser.rol,
        empresaId: newUser.empresaId,
        subscriptionStatus: newUser.subscriptionStatus
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.status(201).json({
      message: 'Cuenta creada exitosamente. ¡Tienes 7 días de prueba gratis!',
      token,
      usuario: {
        id: newUser.id,
        username: newUser.username,
        nombre: newUser.nombre,
        rol: newUser.rol,
        subscriptionStatus: newUser.subscriptionStatus,
        trialEndsAt: newUser.trialEndsAt,
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── 3. Info del usuario autenticado ─────────────────────────────────────────
const { authMiddleware } = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, username: true, nombre: true, rol: true, empresaId: true, activo: true,
        subscriptionStatus: true, trialEndsAt: true, currentPeriodEnd: true, planType: true
      }
    });

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
