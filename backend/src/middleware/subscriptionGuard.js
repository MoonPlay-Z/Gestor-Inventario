const prisma = require('../db/prisma');

/**
 * Middleware de control de suscripción SaaS.
 * Verifica que el usuario tenga una suscripción activa (trialing vigente, active, o lifetime).
 * Debe ejecutarse DESPUÉS de authMiddleware.
 *
 * Sub-usuarios (CAJA, INVENTARIO) pasan sin verificación de suscripción,
 * ya que heredan el acceso de su cuenta EMPRESA padre.
 */
const subscriptionGuard = async (req, res, next) => {
  try {
    // Sub-usuarios no gestionan suscripción propia
    if (req.user && (req.user.rol === 'CAJA' || req.user.rol === 'INVENTARIO')) {
      return next();
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        empresaRefId: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
      }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    // Leer suscripción desde la tabla 'empresas' si el usuario EMPRESA tiene empresaRefId
    let subSource = usuario;
    if (usuario.empresaRefId) {
      const empresa = await prisma.empresa.findUnique({
        where: { id: usuario.empresaRefId },
        select: { subscriptionStatus: true, trialEndsAt: true, currentPeriodEnd: true }
      });
      if (empresa) subSource = empresa;
    }

    const now = new Date();
    const status = subSource.subscriptionStatus;

    // ── Lifetime: acceso permanente ──
    if (status === 'lifetime') {
      return next();
    }

    // ── Active: verificar que no haya expirado el periodo ──
    if (status === 'active') {
      if (subSource.currentPeriodEnd && now > new Date(subSource.currentPeriodEnd)) {
        // Periodo expirado → marcar como canceled en ambas tablas
        await prisma.usuario.update({ where: { id: usuario.id }, data: { subscriptionStatus: 'canceled' } });
        if (usuario.empresaId) {
          await prisma.empresa.update({ where: { id: usuario.empresaId }, data: { subscriptionStatus: 'canceled' } });
        }
        return res.status(403).json({
          code: 'SUBSCRIPTION_EXPIRED',
          error: 'Tu suscripción ha expirado. Gestiona tu pago para continuar.'
        });
      }
      return next();
    }

    // ── Trialing: verificar que esté dentro del periodo de prueba ──
    if (status === 'trialing') {
      if (subSource.trialEndsAt && now > new Date(subSource.trialEndsAt)) {
        await prisma.usuario.update({ where: { id: usuario.id }, data: { subscriptionStatus: 'expired_trial' } });
        if (usuario.empresaId) {
          await prisma.empresa.update({ where: { id: usuario.empresaId }, data: { subscriptionStatus: 'expired_trial' } });
        }
        return res.status(403).json({
          code: 'SUBSCRIPTION_EXPIRED',
          error: 'Tu periodo de prueba de 7 días ha finalizado. Gestiona tu pago para continuar.'
        });
      }
      return next();
    }

    // ── expired_trial / canceled / cualquier otro estado → bloqueado ──
    return res.status(403).json({
      code: 'SUBSCRIPTION_EXPIRED',
      error: 'Tu cuenta no tiene una suscripción activa. Gestiona tu pago para continuar.'
    });

  } catch (err) {
    console.error('Error en subscriptionGuard:', err);
    next(err);
  }
};

module.exports = { subscriptionGuard };
