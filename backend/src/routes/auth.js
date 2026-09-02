const express = require('express');
const crypto = require('crypto');
const prisma = require('../db/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');
const { createValidationError } = require('../middleware/errorHandler');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { METODOS_PAGO_SAAS, enviarNotificacionPago } = require('../config/metodosPago');

const router = express.Router();

const DEV_SECRET = process.env.DEV_SECRET;

// Comparación de tiempo constante para secretos (evita timing attacks)
function safeCompare(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

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

    // Identificador de empresa consistente: se usa en todo el flujo (token,
    // verificación de suscripción y respuesta) para evitar desincronización.
    const resolvedEmpresaId = usuario.empresaRefId || usuario.empresaId || null;

    // Estado de suscripción "vigente" que se usará en la respuesta final.
    // Por defecto es el del propio usuario; si hay Empresa vinculada y la
    // verificación de abajo la consulta, se actualiza a ese valor.
    let effectiveSubscription = {
      status: usuario.subscriptionStatus,
      trialEndsAt: usuario.trialEndsAt,
      currentPeriodEnd: usuario.currentPeriodEnd
    };

    // ─── VERIFICACIÓN DE FECHA DE PAGO Y MENSUALIDAD (EXCEPTO SUPER_ADMIN) ───
    if (usuario.rol !== 'SUPER_ADMIN') {
      let subSource = usuario;
      let empresaNombre = usuario.nombre;

      if (resolvedEmpresaId) {
        const emp = await prisma.empresa.findUnique({ where: { id: resolvedEmpresaId } });
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
        effectiveSubscription.status = 'expired_trial';
        // Marcar como trial expirado en BD
        await prisma.usuario.update({ where: { id: usuario.id }, data: { subscriptionStatus: 'expired_trial' } }).catch(() => null);
        if (usuario.empresaRefId) {
          await prisma.empresa.update({ where: { id: usuario.empresaRefId }, data: { subscriptionStatus: 'expired_trial' } }).catch(() => null);
        }
      } else if (status === 'active' && subSource.currentPeriodEnd && now > new Date(subSource.currentPeriodEnd)) {
        expired = true;
        effectiveSubscription.status = 'canceled';
        await prisma.usuario.update({ where: { id: usuario.id }, data: { subscriptionStatus: 'canceled' } }).catch(() => null);
        if (usuario.empresaRefId) {
          await prisma.empresa.update({ where: { id: usuario.empresaRefId }, data: { subscriptionStatus: 'canceled' } }).catch(() => null);
        }
      } else {
        // Sin cambios: reflejar el estado realmente evaluado (puede venir de Empresa)
        effectiveSubscription = {
          status: subSource.subscriptionStatus,
          trialEndsAt: subSource.trialEndsAt,
          currentPeriodEnd: subSource.currentPeriodEnd
        };
      }

      if (expired && status !== 'lifetime') {
        return res.status(403).json({
          code: 'PAYMENT_REQUIRED',
          error: 'Debe cancelar la mensualidad para continuar utilizando el sistema.',
          redirect: '/pagos-saas',
          usuarioId: usuario.id,
          empresaId: resolvedEmpresaId,
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
        empresaId: resolvedEmpresaId,
        subscriptionStatus: effectiveSubscription.status,
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
        lastLoginIp: req.ip || null
      }
    });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresaId: resolvedEmpresaId,
        subscriptionStatus: effectiveSubscription.status,
        trialEndsAt: effectiveSubscription.trialEndsAt,
        currentPeriodEnd: effectiveSubscription.currentPeriodEnd
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
    if (!DEV_SECRET || !safeCompare(devToken, DEV_SECRET)) {
      return res.status(403).json({ error: 'Prohibido: Se requiere clave de desarrollador válida' });
    }

    const { username, password, nombre, rol } = req.body;
    const cleanUsername = (username || '').trim();
    const cleanNombre = (nombre || '').trim();

    if (!cleanUsername || !password) {
      throw createValidationError('Usuario y contraseña son requeridos');
    }
    if (password.length < 8) {
      throw createValidationError('La contraseña debe tener al menos 8 caracteres');
    }

    const validRoles = ['SUPER_ADMIN', 'EMPRESA', 'CAJA', 'INVENTARIO', 'VISOR'];
    const finalRol = validRoles.includes(rol) ? rol : 'CAJA';

    const existingUser = await prisma.usuario.findUnique({ where: { username: cleanUsername } });
    if (existingUser) {
      throw createValidationError('El nombre de usuario ya existe');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.usuario.create({
      data: {
        username: cleanUsername,
        passwordHash,
        nombre: cleanNombre || cleanUsername,
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
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanNombre = (nombre || '').trim();

    if (!cleanUsername || !password || !cleanNombre) {
      throw createValidationError('Usuario, contraseña y nombre de la empresa son requeridos');
    }
    if (password.length < 8) {
      throw createValidationError('La contraseña debe tener al menos 8 caracteres');
    }

    const existingUser = await prisma.usuario.findUnique({ where: { username: cleanUsername } });
    if (existingUser) {
      throw createValidationError('El nombre de usuario ya está en uso');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días

    const nowIso      = now.toISOString();
    const trialEndIso = trialEnd.toISOString();

    // Se crea primero la Empresa en la tabla 'empresas'
    const nuevaEmpresa = await prisma.empresa.create({
      data: {
        nombre: cleanNombre,
        rif: `PENDIENTE-${crypto.randomUUID()}`, // El cliente actualiza su RIF desde el perfil
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
        nombre: cleanNombre,
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
        empresaId: nuevaEmpresa.id,
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
        empresaId: nuevaEmpresa.id,
        subscriptionStatus: newUser.subscriptionStatus,
        trialEndsAt: newUser.trialEndsAt,
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── 3. Info del usuario autenticado ─────────────────────────────────────────
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
  res.json(METODOS_PAGO_SAAS);
});

// ─── 5. Reportar Pago de Mensualidad ──────────────────────────────────────────
// Requiere sesión activa: se usa la identidad del token, nunca un ID enviado
// libremente por el cliente, para evitar que un usuario reporte pagos a
// nombre de otra cuenta. También lleva rate limiting para evitar spam de
// notificaciones al correo de administración.
router.post('/reportar-pago', registerLimiter, authMiddleware, async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { metodoPago, referencia, plan = 'monthly' } = req.body;
    if (!referencia?.trim()) throw createValidationError('El número de referencia es obligatorio');
    if (!metodoPago?.trim()) throw createValidationError('El método de pago es obligatorio');

    const targetUser = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: { empresaRef: true }
    });

    if (!targetUser) {
      throw createValidationError('No se encontró ninguna cuenta asociada a esta sesión.');
    }

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

    // Enviar notificación al correo de administración
    try {
      await enviarNotificacionPago({
        usuarioId: targetUser.id,
        username: targetUser.username,
        nombreEmpresa: targetUser.empresaRef?.nombre || targetUser.nombre,
        metodoPago: metodoPago.trim(),
        referencia: referencia.trim(),
        plan
      });
    } catch (notifErr) {
      console.warn('[WARN] No se pudo enviar notificación por correo:', notifErr.message);
    }

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