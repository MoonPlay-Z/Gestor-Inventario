const express = require('express');
const crypto = require('crypto');
const prisma = require('../db/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');
const { createValidationError } = require('../middleware/errorHandler');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { METODOS_PAGO_SAAS, enviarNotificacionPago } = require('../config/metodosPago');
const { getRegistrationMetadata } = require('../utils/registrationMetadata');
const { resolverEmpresaRefId } = require('../utils/empresaContext');

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

// ─── Emisión de tokens ───────────────────────────────────────────────────────
// Access token (12h): identidad completa para el middleware. Refresh token
// (30d): solo identidad mínima + `type`, para renovar el access token. El claim
// `type` ('access' | 'refresh') evita que un refresh token se use como access
// token (y viceversa). No requiere migración: son JWTs firmados con JWT_SECRET.
const ACCESS_TOKEN_TTL = '12h';
const REFRESH_TOKEN_TTL = '7d'; // deslizante: cada renovación emite uno nuevo

function signAccessToken(usuario, empresaId, subscriptionStatus) {
  return jwt.sign(
    {
      id: usuario.id,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: usuario.rol,
      empresaId,
      subscriptionStatus,
      sessionVersion: usuario.sessionVersion,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function signRefreshToken(usuario, jti) {
  return jwt.sign(
    { id: usuario.id, username: usuario.username, type: 'refresh', jti, sessionVersion: usuario.sessionVersion },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
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

    // Las subcuentas heredan el acceso de su EMPRESA padre. Si el padre fue
    // suspendido o eliminado, no debe poder iniciar sesión aunque su propia
    // fila siga con `activo=true` (datos heredados de versiones anteriores).
    if (['CAJA', 'INVENTARIO', 'VISOR'].includes(usuario.rol) && usuario.empresaId) {
      const padre = await prisma.usuario.findUnique({
        where: { id: usuario.empresaId },
        select: { activo: true, deletedAt: true },
      });
      if (!padre || !padre.activo || padre.deletedAt) {
        return res.status(401).json({ error: 'La cuenta principal de la empresa está suspendida. Contacta al administrador.' });
      }
    }

    // Identificador de empresa consistente: se usa en todo el flujo (token,
    // verificación de suscripción y respuesta) para evitar desincronización.
    // OJO: las sub-cuentas (CAJA/INVENTARIO/VISOR) tienen empresaRefId=NULL y su
    // `empresaId` apunta al Usuario padre, NO a la tabla `empresas`. Sin subir
    // por la jerarquía el login devolvía `empresa: null` y el frontend se
    // quedaba sin tasaDolar (conversiones VES→USD erróneas).
    const resolvedEmpresaId = await resolverEmpresaRefId({ user: usuario });

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
          if (emp.archivedAt) {
            return res.status(403).json({
              code: 'ACCOUNT_ARCHIVED',
              error: 'La cuenta de la empresa está archivada. Contacta al administrador para restaurarla.',
            });
          }
          if (emp.activo === false) {
            return res.status(403).json({
              code: 'ACCOUNT_SUSPENDED',
              error: 'La cuenta de la empresa está suspendida. Contacta al administrador.',
            });
          }
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

    // Access token (12h) + refresh token (7d deslizantes, rota en cada renovación).
    const token = signAccessToken(usuario, resolvedEmpresaId, effectiveSubscription.status);
    const refreshTokenId = crypto.randomUUID();
    const refreshToken = signRefreshToken(usuario, refreshTokenId);

    // Actualizar metadatos de último login + guardar el refresh token vigente
    // (su jti permite rotar y detectar reuso en /auth/refresh).
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        lastLoginAt: new Date().toISOString(),
        lastLoginIp: req.ip || null,
        refreshTokenId
      }
    });

    // Datos de la empresa para configuración en sesión (tasa, moneda)
    let empresaData = null;
    if (resolvedEmpresaId) {
      empresaData = await prisma.empresa.findUnique({
        where: { id: resolvedEmpresaId },
        select: {
          id: true, nombre: true, rif: true, direccion: true,
          telefono: true, email: true, tasaDolar: true,
          monedaSimbolo: true, monedaCodigo: true,
          tasaDolarModo: true, tasaDolarActualizadaEn: true
        }
      });
    }

    res.json({
      token,
      refreshToken,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresaId: resolvedEmpresaId,
        subscriptionStatus: effectiveSubscription.status,
        trialEndsAt: effectiveSubscription.trialEndsAt,
        currentPeriodEnd: effectiveSubscription.currentPeriodEnd
      },
      empresa: empresaData
    });
  } catch (err) {
    next(err);
  }
});

// ─── 1b. Refrescar sesión (refresh token) ─────────────────────────────────────
// Renueva el access token (12h) y rota el refresh token (30d). Requiere un
// refresh token válido; NO es una superficie de fuerza bruta (es un secreto
// firmado de 30d). Invalida si el sessionVersion cambió (revocación).
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createValidationError('refreshToken es requerido');

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Token de refresco inválido o expirado.' });
    }

    // Solo un refresh token (type:'refresh') puede renovar; un access token
    // (o un token sin type) no sirve aquí.
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, nombre: true, rol: true, empresaId: true, empresaRefId: true, subscriptionStatus: true, activo: true, deletedAt: true, sessionVersion: true, refreshTokenId: true }
    });

    if (!usuario || !usuario.activo || usuario.deletedAt) {
      return res.status(401).json({ error: 'Sesión revocada o usuario inactivo.' });
    }
    if (decoded.sessionVersion !== undefined && decoded.sessionVersion !== usuario.sessionVersion) {
      return res.status(401).json({ error: 'Sesión invalidada. Por favor, inicia sesión nuevamente.' });
    }

    // Las subcuentas heredan el estado de su EMPRESA padre y de la empresa
    // archivada. Sin esto, un refresh token de una subcuenta podría seguir
    // renovando el acceso aunque la empresa esté archivada.
    let empresaRefId = usuario.empresaRefId || null;
    if (['CAJA', 'INVENTARIO', 'VISOR'].includes(usuario.rol) && usuario.empresaId) {
      const padre = await prisma.usuario.findUnique({
        where: { id: usuario.empresaId },
        select: { activo: true, deletedAt: true, empresaRefId: true },
      });
      if (!padre || !padre.activo || padre.deletedAt) {
        return res.status(401).json({ error: 'La cuenta principal de la empresa está suspendida. Contacta al administrador.' });
      }
      empresaRefId = empresaRefId || padre.empresaRefId;
    }
    if (empresaRefId) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: empresaRefId },
        select: { activo: true, archivedAt: true },
      });
      if (empresa?.archivedAt) {
        return res.status(403).json({
          code: 'ACCOUNT_ARCHIVED',
          error: 'La cuenta de la empresa está archivada. Contacta al administrador para restaurarla.',
        });
      }
      if (empresa && empresa.activo === false) {
        return res.status(403).json({
          code: 'ACCOUNT_SUSPENDED',
          error: 'La cuenta de la empresa está suspendida. Contacta al administrador.',
        });
      }
    }

    // Rotación con detección de reuso: el jti presentado debe ser el vigente.
    // Si no coincide, el token fue reutilizado (posible robo) → revocar todo.
    if (decoded.jti !== usuario.refreshTokenId) {
      await prisma.usuario.update({ where: { id: usuario.id }, data: { sessionVersion: { increment: 1 } } }).catch(() => null);
      return res.status(401).json({ error: 'Sesión invalidada por reuso de token. Por favor, inicia sesión nuevamente.' });
    }

    // Rotar: nuevo jti, el anterior queda inservible aunque fuera filtrado.
    const nuevoJti = crypto.randomUUID();
    const token = signAccessToken(usuario, usuario.empresaId, usuario.subscriptionStatus);
    const nuevoRefreshToken = signRefreshToken(usuario, nuevoJti);
    await prisma.usuario.update({ where: { id: usuario.id }, data: { refreshTokenId: nuevoJti } });

    res.json({ token, refreshToken: nuevoRefreshToken });
  } catch (err) { next(err); }
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

    // SUPER_ADMIN no puede crearse remotamente para evitar escalación de privilegios
    const validRoles = ['EMPRESA', 'CAJA', 'INVENTARIO', 'VISOR'];
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
        rol: finalRol,
        ...getRegistrationMetadata(req, req.body),
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
    const registrationMetadata = getRegistrationMetadata(req, req.body);

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
        ...registrationMetadata,
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
// NO usa loginLimiter: compartir el presupuesto de intentos de login hacía que
// tras agotarlo (429) la app no pudiera resolver la sesión con `/me` y expulsara
// al usuario. Requiere token válido, así que no es una superficie de fuerza bruta.
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
      include: {
        empresaRef: true,
        // Subcuenta → EMPRESA padre. El pago siempre activa a la empresa, no a
        // la subcuenta que lo reportó (una CAJA no tiene suscripción propia).
        empresa: { include: { empresaRef: true } },
      }
    });

    if (!targetUser) {
      throw createValidationError('No se encontró ninguna cuenta asociada a esta sesión.');
    }

    const titular = ['CAJA', 'INVENTARIO', 'VISOR'].includes(targetUser.rol) && targetUser.empresa
      ? targetUser.empresa
      : targetUser;

    // Registrar solicitud de activación en estado PENDIENTE
    const solicitud = await prisma.solicitudActivacion.create({
      data: {
        usuarioId: titular.id,
        plan,
        metodoPago: metodoPago.trim(),
        referencia: referencia.trim(),
        estado: 'PENDIENTE'
      }
    });

    // Enviar notificación al correo de administración (si RESEND_API_KEY está
    // configurada; si no, queda registrada en el log sin bloquear la solicitud).
    let notificacion = { enviado: false };
    try {
      notificacion = await enviarNotificacionPago({
        usuarioId: titular.id,
        username: titular.username,
        nombreEmpresa: titular.empresaRef?.nombre || titular.nombre,
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
      notificacion: notificacion?.enviado
        ? `Comprobante enviado a ${METODOS_PAGO_SAAS.correoNotificacion}`
        : 'Solicitud registrada. El administrador la revisará en el panel.'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;