const express = require('express');
const prisma = require('../db/prisma');
const { createBusinessError } = require('../middleware/errorHandler');

const router = express.Router();

const B2B_API_KEY = process.env.B2B_API_KEY || 'sk_dev_b2b_key_default_2026';

/**
 * Middleware de autenticación B2B por API Key.
 * Verifica el header X-Api-Key contra la clave configurada.
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== B2B_API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API Key inválida o no proporcionada.'
    });
  }

  next();
};

// Todas las rutas B2B requieren API Key válida
router.use(validateApiKey);

// ─── POST /api/v1/b2b/activate-subscription ──────────────────────────────────
// Endpoint Server-to-Server para que la App Empresa active suscripciones
router.post('/activate-subscription', async (req, res, next) => {
  try {
    const { saas_user_id, company_id, plan_type, payment_reference, valid_until } = req.body;

    // Validaciones
    if (!saas_user_id) {
      return res.status(400).json({ error: 'saas_user_id es requerido' });
    }
    if (!plan_type || !['monthly', 'lifetime'].includes(plan_type)) {
      return res.status(400).json({ error: 'plan_type debe ser "monthly" o "lifetime"' });
    }
    if (!payment_reference) {
      return res.status(400).json({ error: 'payment_reference es requerido' });
    }
    if (plan_type === 'monthly' && !valid_until) {
      return res.status(400).json({ error: 'valid_until es requerido para plan mensual' });
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id: saas_user_id }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado con el saas_user_id proporcionado' });
    }

    // Verificación de idempotencia (previene duplicados si la App Empresa reintenta el webhook)
    const solicitudExistente = await prisma.solicitudActivacion.findFirst({
      where: { referencia: payment_reference, estado: 'APROBADA' }
    });

    if (solicitudExistente) {
      return res.json({
        activated: true,
        idempotent: true,
        message: 'Esta referencia de pago ya fue procesada anteriormente',
        user_id: saas_user_id,
        status: usuario.subscriptionStatus,
      });
    }

    // Preparar datos de actualización
    const updateData = {
      activo: true,
      planType: plan_type,
    };

    if (plan_type === 'lifetime') {
      updateData.subscriptionStatus = 'lifetime';
      updateData.currentPeriodEnd = null;
    } else {
      // monthly
      updateData.subscriptionStatus = 'active';
      updateData.currentPeriodEnd = new Date(valid_until).toISOString();
    }

    // Transacción: actualizar usuario + registrar solicitud de auditoría
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.usuario.update({
        where: { id: saas_user_id },
        data: updateData,
        select: {
          id: true,
          username: true,
          nombre: true,
          subscriptionStatus: true,
          planType: true,
          currentPeriodEnd: true,
          activo: true,
        }
      });

      // Registro de auditoría
      await tx.solicitudActivacion.create({
        data: {
          usuarioId: saas_user_id,
          plan: plan_type,
          metodoPago: 'B2B_API',
          referencia: payment_reference,
          estado: 'APROBADA',
        }
      });

      return updatedUser;
    });

    console.log(`[B2B] Suscripción activada para usuario ${result.username} (${result.id}) - Plan: ${plan_type}`);

    res.json({
      activated: true,
      user_id: result.id,
      username: result.username,
      status: result.subscriptionStatus,
      plan_type: result.planType,
      current_period_end: result.currentPeriodEnd,
    });

  } catch (err) {
    next(err);
  }
});

// ─── GET /api/v1/b2b/user-status/:userId ─────────────────────────────────────
// Permite a la App Empresa consultar el estado de un usuario
router.get('/user-status/:userId', async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.params.userId },
      select: {
        id: true,
        username: true,
        nombre: true,
        subscriptionStatus: true,
        planType: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        activo: true,
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
