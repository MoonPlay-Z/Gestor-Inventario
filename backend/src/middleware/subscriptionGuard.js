const prisma = require('../db/prisma');

const SUB_ROLES = new Set(['CAJA', 'INVENTARIO', 'VISOR']);

function respuestaSuscripcion(res, { status = 403, code = 'PAYMENT_REQUIRED', error }) {
  return res.status(status).json({ code, error });
}

/**
 * Middleware de control de suscripción SaaS.
 * Debe ejecutarse DESPUÉS de authMiddleware.
 *
 * - SUPER_ADMIN: exento (es el dueño de la plataforma, no tiene suscripción).
 * - EMPRESA: valida su suscripción en `empresas` (si tiene empresaRefId).
 * - CAJA / INVENTARIO / VISOR: heredan del EMPRESA padre. Si el padre está
 *   suspendido (activo=false), eliminado o sin suscripción, la subcuenta
 *   también queda bloqueada. Antes se hacía `next()` sin mirar al padre, así
 *   que bloquear una empresa no detenía a sus cajeros.
 */
const subscriptionGuard = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    if (req.user.rol === 'SUPER_ADMIN') {
      return next();
    }

    let usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        rol: true,
        empresaId: true,
        empresaRefId: true,
        activo: true,
        deletedAt: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    if (!usuario.activo || usuario.deletedAt) {
      return res.status(401).json({ error: 'Sesión revocada o usuario inactivo.' });
    }

    // ── Subcuentas: validar primero a la EMPRESA padre ──
    if (SUB_ROLES.has(usuario.rol)) {
      if (!usuario.empresaId) {
        return res.status(401).json({ error: 'La subcuenta no está vinculada a una empresa.' });
      }

      const padre = await prisma.usuario.findUnique({
        where: { id: usuario.empresaId },
        select: {
          id: true,
          empresaRefId: true,
          activo: true,
          deletedAt: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          currentPeriodEnd: true,
        },
      });

      if (!padre || !padre.activo || padre.deletedAt) {
        return respuestaSuscripcion(res, {
          status: 401,
          code: 'ACCOUNT_SUSPENDED',
          error: 'La cuenta principal de la empresa está suspendida. Contacta al administrador.',
        });
      }

      usuario = padre;
    }

    // ── La suscripción vive en `empresas` cuando el usuario es el dueño ──
    let subSource = usuario;
    if (usuario.empresaRefId) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: usuario.empresaRefId },
        select: {
          activo: true,
          archivedAt: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          currentPeriodEnd: true,
        },
      });

      if (empresa) {
        if (empresa.archivedAt) {
          return respuestaSuscripcion(res, {
            code: 'ACCOUNT_ARCHIVED',
            error: 'La cuenta de la empresa está archivada. Contacta al administrador para restaurarla.',
          });
        }
        if (empresa.activo === false) {
          return respuestaSuscripcion(res, {
            code: 'ACCOUNT_SUSPENDED',
            error: 'La cuenta de la empresa está suspendida. Contacta al administrador.',
          });
        }
        subSource = empresa;
      }
    }

    const now = new Date();
    const status = subSource.subscriptionStatus;

    const marcarEstado = async (nuevoEstado) => {
      await prisma.usuario
        .update({ where: { id: usuario.id }, data: { subscriptionStatus: nuevoEstado } })
        .catch(() => null);
      if (usuario.empresaRefId) {
        await prisma.empresa
          .update({ where: { id: usuario.empresaRefId }, data: { subscriptionStatus: nuevoEstado } })
          .catch(() => null);
      }
    };

    // ── Lifetime: acceso permanente ──
    if (status === 'lifetime') {
      return next();
    }

    // ── Active: verificar que no haya expirado el periodo ──
    if (status === 'active') {
      if (subSource.currentPeriodEnd && now > new Date(subSource.currentPeriodEnd)) {
        await marcarEstado('canceled');
        return respuestaSuscripcion(res, {
          error: 'Tu suscripción ha expirado. Gestiona tu pago para continuar.',
        });
      }
      return next();
    }

    // ── Trialing: verificar que esté dentro del periodo de prueba ──
    if (status === 'trialing') {
      if (subSource.trialEndsAt && now > new Date(subSource.trialEndsAt)) {
        await marcarEstado('expired_trial');
        return respuestaSuscripcion(res, {
          error: 'Tu periodo de prueba de 7 días ha finalizado. Gestiona tu pago para continuar.',
        });
      }
      return next();
    }

    // ── expired_trial / canceled / cualquier otro estado → bloqueado ──
    return respuestaSuscripcion(res, {
      error: 'Tu cuenta no tiene una suscripción activa. Gestiona tu pago para continuar.',
    });
  } catch (err) {
    console.error('Error en subscriptionGuard:', err);
    next(err);
  }
};

module.exports = { subscriptionGuard };
