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

    // ─── VERIFICACIÓN DE FECHA DE PAGO Y MENSUALIDAD (EXCEPTO SUPER_ADMIN) ───
    if (usuario.rol !== 'SUPER_ADMIN') {
      const { METODOS_PAGO_SAAS } = require('../config/metodosPago');

      // Buscar datos de suscripción (desde la tabla Empresa o el Usuario principal)
      let subSource = usuario;
      let empresaNombre = usuario.nombre;
      let targetEmpresaId = usuario.empresaRefId || usuario.empresaId || usuario.id;

      if (usuario.empresaRefId || usuario.empresaId) {
        const empId = usuario.empresaRefId || usuario.empresaId;
        const emp = await prisma.empresa.findUnique({ where: { id: empId } });
        if (emp) {
          subSource = emp;
          empresaNombre = emp.nombre;
        }
      }

      const now = new Date();
      const status = subSource.subscriptionStatus;
      let expired = false;

      if (['expired_trial', 'canceled', 'unpaid', 'past_due'].includes(status)) {
        expired = true;
      } else if (status === 'trialing' && subSource.trialEndsAt && now > new Date(subSource.trialEndsAt)) {
        expired = true;
        // Marcar como trial expirado en BD
        await prisma.usuario.update({ where: { id: usuario.id }, data: { subscriptionStatus: 'expired_trial' } }).catch(() => null);
        if (usuario.empresaRefId) {
          await prisma.empresa.update({ where: { id: usuario.empresaRefId }, data: { subscriptionStatus: 'expired_trial' } }).catch(() => null);
        }
      } else if (status === 'active' && subSource.currentPeriodEnd && now > new Date(subSource.currentPeriodEnd)) {
        expired = true;
        await prisma.usuario.update({ where: { id: usuario.id }, data: { subscriptionStatus: 'canceled' } }).catch(() => null);
        if (usuario.empresaRefId) {
          await prisma.empresa.update({ where: { id: usuario.empresaRefId }, data: { subscriptionStatus: 'canceled' } }).catch(() => null);
        }
      }

      if (expired && status !== 'lifetime') {
        return res.status(403).json({
          code: 'PAYMENT_REQUIRED',
          error: 'Debe cancelar la mensualidad para continuar utilizando el sistema.',
          redirect: '/pagos-saas',
          usuarioId: usuario.id,
          empresaId: targetEmpresaId,
          empresaNombre,
          metodosPago: METODOS_PAGO_SAAS
        });
      }
    }

    // Token incluye: id, username, nombre del operador, rol, subscriptionStatus
    const token = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresaId: usuario.empresaId,
        subscriptionStatus: usuario.subscriptionStatus,
        sessionVersion: usuario.sessionVersion
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Actualizar metadatos de último login
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        lastLoginAt: new Date().toISOString(),
        lastLoginIp: req.ip || req.headers['x-forwarded-for'] || null
      }
    });

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

    // Se crea primero la Empresa en la tabla 'empresas'
    const nuevaEmpresa = await prisma.empresa.create({
      data: {
        nombre: nombre.trim(),
        rif: `PENDIENTE-${Date.now()}`, // El cliente actualiza su RIF desde el perfil
        subscriptionStatus: 'trialing',
        trialStartsAt: nowIso,
        trialEndsAt:   trialEndIso,
      }
    });

    // Se crea el usuario EMPRESA vinculado a la nueva empresa
    const newUser = await prisma.usuario.create({
      data: {
        username: cleanUsername,
        passwordHash,
        nombre: nombre.trim(),
        rol: 'EMPRESA',
        activo: true,
        empresaRefId: nuevaEmpresa.id,
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
        subscriptionStatus: newUser.subscriptionStatus,
        sessionVersion: newUser.sessionVersion
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

// ─── 4. Información de Métodos de Pago ────────────────────────────────────────
router.get('/metodos-pago', (_req, res) => {
  const { METODOS_PAGO_SAAS } = require('../config/metodosPago');
  res.json(METODOS_PAGO_SAAS);
});

// ─── 5. Reportar Pago de Mensualidad ──────────────────────────────────────────
router.post('/reportar-pago', async (req, res, next) => {
  try {
    const { usuarioId, metodoPago, referencia, plan = 'monthly' } = req.body;
    if (!usuarioId) throw createValidationError('El usuarioId o empresaId es obligatorio');
    if (!referencia?.trim()) throw createValidationError('El número de referencia es obligatorio');
    if (!metodoPago?.trim()) throw createValidationError('El método de pago es obligatorio');

    const targetUser = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { empresaRef: true }
    });
    if (!targetUser) throw createValidationError('Usuario no encontrado');

    const { METODOS_PAGO_SAAS, enviarNotificacionPago } = require('../config/metodosPago');

    // Registrar solicitud de activación en estado PENDIENTE
    const solicitud = await prisma.solicitudActivacion.create({
      data: {
        usuarioId: targetUser.id,
        plan,
        metodoPago: metodoPago.trim(),
        referencia: referencia.trim(),
        estado: 'PENDIENTE'
      }
    });

    // Enviar notificación al correo de administración (arcila.juan10@gmail.com)
    await enviarNotificacionPago({
      usuarioId: targetUser.id,
      username: targetUser.username,
      nombreEmpresa: targetUser.empresaRef?.nombre || targetUser.nombre,
      metodoPago: metodoPago.trim(),
      referencia: referencia.trim(),
      plan
    });

    res.json({
      message: 'Pago reportado exitosamente. Tu solicitud está en proceso de verificación.',
      solicitudId: solicitud.id,
      notificacion: `Comprobante enviado a ${METODOS_PAGO_SAAS.correoNotificacion}`
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
