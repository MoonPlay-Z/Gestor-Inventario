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

    const usuario = await prisma.usuario.findUnique({ where: { id, rol: 'EMPRESA' }, select: { id: true, rol: true, empresaRefId: true } });
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
      
      // 7. La propia cuenta de usuario EMPRESA
      await tx.usuario.delete({ where: { id } });

      // 8. El registro en la tabla empresas (si existe)
      if (usuario.empresaRefId) {
        await tx.empresa.delete({ where: { id: usuario.empresaRefId } }).catch(() => null);
      }
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

    const usuario = await prisma.usuario.findUnique({ where: { id }, select: { id: true, empresaRefId: true, currentPeriodEnd: true, subscriptionStatus: true } });
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
      // Sincronizar estado de suscripción con la tabla 'empresas'
      if (usuario.empresaRefId) {
        const { subscriptionStatus, planType, currentPeriodEnd } = updateData;
        await tx.empresa.update({
          where: { id: usuario.empresaRefId },
          data: {
            ...(subscriptionStatus !== undefined && { subscriptionStatus }),
            ...(planType !== undefined && { planType }),
            ...(currentPeriodEnd !== undefined && { currentPeriodEnd }),
            activo: true
          }
        }).catch(() => null);
      }
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

// PUT /api/activaciones/usuarios/:id/reset-password — Cambiar o recuperar clave de cualquier usuario desde SUPER_ADMIN
router.put('/usuarios/:id/reset-password', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 4) {
      throw createBusinessError('La nueva contraseña debe tener al menos 4 caracteres');
    }

    const bcrypt = require('bcrypt');
    const targetUser = await prisma.usuario.findUnique({ where: { id } });
    if (!targetUser) throw createBusinessError('Usuario no encontrado');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword.trim(), salt);

    await prisma.usuario.update({
      where: { id },
      data: {
        passwordHash,
        sessionVersion: { increment: 1 } // Invalida sesiones activas anteriores del usuario por seguridad
      }
    });

    res.json({ message: `Contraseña para el usuario '${targetUser.username}' actualizada exitosamente` });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GESTIÓN DE PROMOCIONES (SUPER_ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/activaciones/promociones — Listar todas las promociones
router.get('/promociones', async (req, res, next) => {
  try {
    const promociones = await prisma.promocion.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(promociones);
  } catch (err) {
    next(err);
  }
});

// POST /api/activaciones/promociones — Crear una promoción
router.post('/promociones', async (req, res, next) => {
  try {
    const { codigo, titulo, descripcion, descuentoPorc, diasExtraTrial, planDestino, usosMaximos, fechaFin } = req.body;
    if (!codigo?.trim()) throw createBusinessError('El código de la promoción es obligatorio');
    if (!titulo?.trim()) throw createBusinessError('El título de la promoción es obligatorio');

    const nueva = await prisma.promocion.create({
      data: {
        codigo: codigo.trim().toUpperCase(),
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || null,
        descuentoPorc: descuentoPorc ? parseFloat(descuentoPorc) : null,
        diasExtraTrial: diasExtraTrial ? parseInt(diasExtraTrial) : 0,
        planDestino: planDestino || null,
        usosMaximos: usosMaximos ? parseInt(usosMaximos) : 100,
        fechaFin: fechaFin ? new Date(fechaFin).toISOString() : null,
      }
    });

    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
});

// PUT /api/activaciones/promociones/:id — Modificar o desactivar promoción
router.put('/promociones/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo, titulo, descripcion, descuentoPorc, diasExtraTrial, usosMaximos, fechaFin } = req.body;

    const updateData = {};
    if (typeof activo === 'boolean') updateData.activo = activo;
    if (titulo !== undefined) updateData.titulo = titulo.trim();
    if (descripcion !== undefined) updateData.descripcion = descripcion.trim();
    if (descuentoPorc !== undefined) updateData.descuentoPorc = parseFloat(descuentoPorc);
    if (diasExtraTrial !== undefined) updateData.diasExtraTrial = parseInt(diasExtraTrial);
    if (usosMaximos !== undefined) updateData.usosMaximos = parseInt(usosMaximos);
    if (fechaFin !== undefined) updateData.fechaFin = fechaFin ? new Date(fechaFin).toISOString() : null;

    const actualizada = await prisma.promocion.update({
      where: { id },
      data: updateData
    });

    res.json(actualizada);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/activaciones/promociones/:id — Eliminar promoción
router.delete('/promociones/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.promocion.delete({ where: { id } });
    res.json({ message: 'Promoción eliminada correctamente' });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GESTIÓN DE NOTICIAS Y CONTENIDO DE LANDING PAGE (SUPER_ADMIN)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/activaciones/noticias — Listar todas las noticias (incluyendo no publicadas)
router.get('/noticias', async (req, res, next) => {
  try {
    const noticias = await prisma.noticia.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(noticias);
  } catch (err) {
    next(err);
  }
});

// POST /api/activaciones/noticias — Crear noticia/anuncio para Landing Page
router.post('/noticias', async (req, res, next) => {
  try {
    const { titulo, subtitulo, contenido, imagenUrl, categoria, destacado, publicado } = req.body;
    if (!titulo?.trim()) throw createBusinessError('El título es obligatorio');
    if (!contenido?.trim()) throw createBusinessError('El contenido es obligatorio');

    const nueva = await prisma.noticia.create({
      data: {
        titulo: titulo.trim(),
        subtitulo: subtitulo?.trim() || null,
        contenido: contenido.trim(),
        imagenUrl: imagenUrl?.trim() || null,
        categoria: categoria?.trim() || 'Anuncio',
        destacado: Boolean(destacado),
        publicado: publicado !== undefined ? Boolean(publicado) : true,
      }
    });

    res.status(201).json(nueva);
  } catch (err) {
    next(err);
  }
});

// PUT /api/activaciones/noticias/:id — Editar noticia
router.put('/noticias/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { titulo, subtitulo, contenido, imagenUrl, categoria, destacado, publicado } = req.body;

    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo.trim();
    if (subtitulo !== undefined) updateData.subtitulo = subtitulo.trim();
    if (contenido !== undefined) updateData.contenido = contenido.trim();
    if (imagenUrl !== undefined) updateData.imagenUrl = imagenUrl.trim();
    if (categoria !== undefined) updateData.categoria = categoria.trim();
    if (destacado !== undefined) updateData.destacado = Boolean(destacado);
    if (publicado !== undefined) updateData.publicado = Boolean(publicado);

    const actualizada = await prisma.noticia.update({
      where: { id },
      data: updateData
    });

    res.json(actualizada);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/activaciones/noticias/:id — Eliminar noticia
router.delete('/noticias/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.noticia.delete({ where: { id } });
    res.json({ message: 'Noticia eliminada correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
