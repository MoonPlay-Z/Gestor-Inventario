const express = require('express');
const prisma = require('../db/prisma');
const { requireRole } = require('../middleware/auth');
const { createBusinessError } = require('../middleware/errorHandler');

const router = express.Router();

// Todas las rutas de activaciones requieren rol SUPER_ADMIN (administrador único del sistema)
router.use(requireRole('SUPER_ADMIN'));

// GET /api/activaciones — Listar historial de peticiones de activación
router.get('/', async (req, res, next) => {
  try {
    const { estado } = req.query;
    const where = estado ? { estado } : {};

    const solicitudes = await prisma.solicitudActivacion.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            nombre: true,
            subscriptionStatus: true,
            planType: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(solicitudes);
  } catch (err) {
    next(err);
  }
});

// GET /api/activaciones/empresas — Listar TODAS las empresas (para Gestión de Empresas)
router.get('/empresas', async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: 'EMPRESA',
      },
      select: {
        id: true,
        username: true,
        nombre: true,
        activo: true,
        subscriptionStatus: true,
        planType: true,
        trialStartsAt: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(usuarios);
  } catch (err) {
    next(err);
  }
});

// PUT /api/activaciones/empresas/:id/estado — Bloquear o suspender empresa
router.put('/empresas/:id/estado', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      throw createBusinessError('El campo activo debe ser booleano');
    }

    const usuario = await prisma.usuario.findUnique({ where: { id, rol: 'EMPRESA' } });
    if (!usuario) throw createBusinessError('Empresa no encontrada');

    await prisma.usuario.update({
      where: { id },
      data: { activo }
    });

    res.json({ message: `Empresa ${activo ? 'desbloqueada' : 'bloqueada'} exitosamente` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/activaciones/empresas/:id — Eliminar empresa por completo (Hard Delete Cascading)
router.delete('/empresas/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({ where: { id, rol: 'EMPRESA' } });
    if (!usuario) throw createBusinessError('Empresa no encontrada');

    await prisma.$transaction(async (tx) => {
      // 1. Pagos e items de facturas (propias o de subusuarios)
      await tx.pago.deleteMany({ where: { factura: { OR: [{ usuarioId: id }, { usuario: { empresaId: id } }] } } });
      await tx.itemFactura.deleteMany({ where: { factura: { OR: [{ usuarioId: id }, { usuario: { empresaId: id } }] } } });
      
      // 2. Facturas y Cotizaciones
      await tx.factura.deleteMany({ where: { OR: [{ usuarioId: id }, { usuario: { empresaId: id } }] } });
      await tx.cotizacion.deleteMany({ where: { OR: [{ usuarioId: id }, { usuario: { empresaId: id } }] } });
      
      // 3. Cierres de Caja
      await tx.cierreCaja.deleteMany({ where: { OR: [{ usuarioId: id }, { usuario: { empresaId: id } }] } });
      
      // 4. Productos y Clientes de la empresa
      await tx.producto.deleteMany({ where: { empresaId: id } });
      await tx.cliente.deleteMany({ where: { empresaId: id } });

      // 5. Solicitudes de activación
      await tx.solicitudActivacion.deleteMany({ where: { usuarioId: id } });
      
      // 6. Sub-usuarios (caja, inventario)
      await tx.usuario.deleteMany({ where: { empresaId: id } });
      
      // 7. La propia empresa
      await tx.usuario.delete({ where: { id } });
    });

    res.json({ message: 'Empresa y todos sus datos eliminados por completo.' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/activaciones/:id/activar-manual — Activación manual con soporte de meses
router.put('/:id/activar-manual', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan_type, meses = 1 } = req.body;

    if (!plan_type || !['monthly', 'lifetime'].includes(plan_type)) {
      throw createBusinessError('plan_type debe ser "monthly" o "lifetime"');
    }

    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw createBusinessError('Usuario no encontrado');

    const updateData = { activo: true, planType: plan_type };

    if (plan_type === 'lifetime') {
      updateData.subscriptionStatus = 'lifetime';
      updateData.currentPeriodEnd = null;
    } else {
      updateData.subscriptionStatus = 'active';
      // Sumar N meses a la fecha actual o desde que venció
      const mesesVal = parseInt(meses) || 1;
      let baseDate = new Date();
      if (usuario.currentPeriodEnd && usuario.currentPeriodEnd > baseDate) {
        baseDate = new Date(usuario.currentPeriodEnd); // Si aún tiene tiempo, se le suma a lo que le queda
      }
      updateData.currentPeriodEnd = new Date(baseDate.setMonth(baseDate.getMonth() + mesesVal)).toISOString();
    }

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({ where: { id }, data: updateData });
      await tx.solicitudActivacion.create({
        data: {
          usuarioId: id,
          plan: plan_type,
          metodoPago: 'MANUAL_ADMIN',
          referencia: `Activación manual ${plan_type === 'monthly' ? `(${meses} mes(es))` : '(lifetime)'}`,
          estado: 'APROBADA',
        }
      });
    });

    res.json({ message: `Usuario activado exitosamente con plan ${plan_type}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
