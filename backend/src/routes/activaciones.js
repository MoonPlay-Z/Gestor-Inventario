const express = require('express');
const prisma = require('../db/prisma');
const { requireRole } = require('../middleware/auth');
const { createBusinessError } = require('../middleware/errorHandler');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { registrarAuditoria } = require('../utils/auditLog');
const {
  DIAS_ARCHIVO,
  archivarEmpresa,
  restaurarEmpresa,
  archivarUsuario,
  restaurarUsuario,
  purgarArchivados,
} = require('../services/archivado');

const router = express.Router();

function parsePromotionNumber(value, label, { min, max, integer = false, nullable = false }) {
  if (nullable && (value === undefined || value === null || value === '')) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (integer && !Number.isInteger(parsed)) || parsed < min || parsed > max) {
    const range = min === max ? `${min}` : `${min} y ${max}`;
    throw createBusinessError(`${label} debe ser ${integer ? 'un entero' : 'un número'} entre ${range}`);
  }
  return parsed;
}

function parsePromotionDate(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    throw createBusinessError('La fecha de fin de la promoción no es válida');
  }
  return parsed;
}

function parsePlanYMes(body = {}, planSolicitud = 'monthly') {
  const planPedido = body.plan_type || body.plan;
  const planType = ['monthly', 'lifetime'].includes(planPedido)
    ? planPedido
    : (planSolicitud === 'lifetime' ? 'lifetime' : 'monthly');

  if (planType === 'lifetime') {
    return { planType, meses: 1 };
  }

  const meses = body.meses === undefined || body.meses === null || body.meses === ''
    ? 1
    : Number(body.meses);

  if (!Number.isInteger(meses) || meses < 1 || meses > 12) {
    throw createBusinessError('La cantidad de meses debe ser un entero entre 1 y 12');
  }

  return { planType, meses };
}

/**
 * Calcula los cambios de suscripción de un usuario. Si aún le queda período,
 * los meses se suman a la fecha existente (renovación anticipada).
 */
function construirActivacion(usuario, planType, meses) {
  const updateData = { activo: true, planType };

  if (planType === 'lifetime') {
    updateData.subscriptionStatus = 'lifetime';
    updateData.currentPeriodEnd = null;
    return updateData;
  }

  updateData.subscriptionStatus = 'active';
  let baseDate = new Date();
  if (usuario.currentPeriodEnd && new Date(usuario.currentPeriodEnd) > baseDate) {
    baseDate = new Date(usuario.currentPeriodEnd);
  }
  updateData.currentPeriodEnd = new Date(baseDate.setMonth(baseDate.getMonth() + meses)).toISOString();
  return updateData;
}

/** Sincroniza el estado de suscripción con la tabla `empresas`. */
async function sincronizarEmpresa(tx, empresaRefId, updateData) {
  if (!empresaRefId) return;

  const empresa = await tx.empresa.findUnique({
    where: { id: empresaRefId },
    select: { archivedAt: true },
  });
  if (empresa?.archivedAt) {
    throw createBusinessError('La empresa está archivada. Restáurala antes de activarla.');
  }

  const { subscriptionStatus, planType, currentPeriodEnd } = updateData;
  await tx.empresa.update({
    where: { id: empresaRefId },
    data: {
      ...(subscriptionStatus !== undefined && { subscriptionStatus }),
      ...(planType !== undefined && { planType }),
      ...(currentPeriodEnd !== undefined && { currentPeriodEnd }),
      activo: true,
    },
  }).catch(() => null);
}

function limpiarNotas(value, { requerido = false, max = 1000 } = {}) {
  const notas = typeof value === 'string' ? value.trim() : '';
  if (requerido && notas.length < 3) {
    throw createBusinessError('Indica el motivo en las notas (mínimo 3 caracteres)');
  }
  return notas ? notas.slice(0, max) : null;
}

/**
 * Normaliza una URL de imagen/video. Acepta http(s), rutas internas que
 * empiezan por `/` y dominios sin protocolo (se les añade https://). Rechaza
 * esquemas peligrosos (`javascript:`, `data:`, etc.).
 */
function normalizarMediaUrl(value, label) {
  if (value === undefined || value === null) return null;
  const url = typeof value === 'string' ? value.trim() : '';
  if (!url) return null;
  if (url.length > 2048) throw createBusinessError(`${label} es demasiado larga`);

  if (url.startsWith('/')) return url;

  try {
    let candidata = url;
    if (url.startsWith('//')) candidata = `https:${url}`;
    else if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) candidata = `https://${url}`;

    const parsed = new URL(candidata);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocolo no permitido');
    return parsed.toString();
  } catch {
    throw createBusinessError(`${label} debe ser una URL http(s) válida o una ruta interna que empiece por /`);
  }
}

async function empresaIdDeUsuario(usuarioId) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { empresaRefId: true, empresa: { select: { empresaRefId: true } } },
    });
    return usuario?.empresaRefId || usuario?.empresa?.empresaRefId || null;
  } catch {
    return null;
  }
}

// Todas las rutas de activaciones requieren rol SUPER_ADMIN (administrador único del sistema)
router.use(requireRole('SUPER_ADMIN'));

// GET /api/activaciones — Bandeja de pagos / historial de solicitudes
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

// GET /api/activaciones/salud — Inconsistencias de suscripción (Usuario vs Empresa)
router.get('/salud', async (req, res, next) => {
  try {
    const [empresas, subcuentas] = await Promise.all([
      prisma.usuario.findMany({
        where: { rol: 'EMPRESA' },
        select: {
          id: true,
          username: true,
          nombre: true,
          activo: true,
          subscriptionStatus: true,
          empresaRefId: true,
          empresaRef: {
            select: { id: true, nombre: true, activo: true, subscriptionStatus: true, archivedAt: true },
          },
        },
      }),
      prisma.usuario.findMany({
        where: { rol: { in: ['CAJA', 'INVENTARIO', 'VISOR'] } },
        select: {
          id: true,
          username: true,
          activo: true,
          empresaId: true,
          empresa: { select: { id: true, nombre: true, activo: true } },
        },
      }),
    ]);

    const items = [];

    for (const empresa of empresas) {
      // Una empresa archivada está suspendida a propósito: no es una
      // inconsistencia de suscripción y no debe llenar la bandeja de salud.
      if (empresa.empresaRef?.archivedAt) continue;

      if (empresa.empresaRef && empresa.empresaRef.subscriptionStatus !== empresa.subscriptionStatus) {
        items.push({
          tipo: 'SUSCRIPCION_DESINCRONIZADA',
          empresa: empresa.empresaRef.nombre,
          detalle: `Usuario=${empresa.subscriptionStatus} / Empresa=${empresa.empresaRef.subscriptionStatus}`,
          usuarioId: empresa.id,
          accion: 'Volver a activar o bloquear la empresa para sincronizar.',
        });
      }
      if (empresa.empresaRef?.activo === false && empresa.activo) {
        items.push({
          tipo: 'EMPRESA_SUSPENDIDA_USUARIO_ACTIVO',
          empresa: empresa.empresaRef.nombre,
          detalle: 'La empresa está suspendida pero su cuenta dueña sigue activa.',
          usuarioId: empresa.id,
          accion: 'Volver a aplicar el bloqueo.',
        });
      }
      if (!empresa.activo) {
        const activas = subcuentas.filter((sub) => sub.empresaId === empresa.id && sub.activo);
        if (activas.length > 0) {
          items.push({
            tipo: 'SUBCUENTAS_ACTIVAS_EN_EMPRESA_BLOQUEADA',
            empresa: empresa.nombre,
            detalle: `${activas.length} subcuenta(s) activa(s) bajo una empresa bloqueada.`,
            usuarioId: empresa.id,
            accion: 'El guard de suscripción ya las bloquea; pueden desactivarse manualmente.',
          });
        }
      }
    }

    res.json({
      generadoEn: new Date().toISOString(),
      total: items.length,
      items: items.slice(0, 100),
    });
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
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        empresaRef: {
          select: {
            id: true,
            nombre: true,
            archivedAt: true,
            scheduledDeletionAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(usuarios.map((usuario) => ({
      ...usuario,
      archivedAt: usuario.empresaRef?.archivedAt || null,
      scheduledDeletionAt: usuario.empresaRef?.scheduledDeletionAt || null,
      archivada: Boolean(usuario.empresaRef?.archivedAt),
    })));
  } catch (err) {
    next(err);
  }
});

// GET /api/activaciones/usuarios — Listar cuentas para el panel Super Admin
router.get('/usuarios', async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query, { limit: 50 });
    const where = { rol: { not: 'SUPER_ADMIN' } };

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          username: true,
          nombre: true,
          email: true,
          rol: true,
          activo: true,
          createdAt: true,
          lastLoginAt: true,
          lastLoginIp: true,
          registrationIp: true,
          registrationLatitude: true,
          registrationLongitude: true,
          deletedAt: true,
          scheduledDeletionAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ]);

    res.json(paginatedResponse(
      usuarios.map((usuario) => ({
        ...usuario,
        archivado: Boolean(usuario.deletedAt),
      })),
      total,
      page,
      limit
    ));
  } catch (err) {
    next(err);
  }
});

// GET /api/activaciones/auditoria — Timeline de acciones del Super Admin
router.get('/auditoria', async (req, res, next) => {
  try {
    const { accion, entidad } = req.query;
    const { skip, take, page, limit } = paginate(req.query, { limit: 50 });
    const where = {
      ...(accion ? { accion } : {}),
      ...(entidad ? { entidad } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          usuario: { select: { id: true, username: true, nombre: true } },
          empresa: { select: { id: true, nombre: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json(paginatedResponse(logs, total, page, limit));
  } catch (err) {
    next(err);
  }
});

// PUT /api/activaciones/empresas/:id/estado — Bloquear o suspender empresa
// Bloquea al dueño y a sus subcuentas de forma efectiva (el guard de
// suscripción valida al padre), invalida sus sesiones y sincroniza Empresa.activo.
router.put('/empresas/:id/estado', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      throw createBusinessError('El campo activo debe ser booleano');
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id, rol: 'EMPRESA' },
      select: {
        id: true,
        nombre: true,
        username: true,
        activo: true,
        empresaRefId: true,
        empresaRef: { select: { archivedAt: true } },
      },
    });
    if (!usuario) throw createBusinessError('Empresa no encontrada');
    if (activo && usuario.empresaRef?.archivedAt) {
      throw createBusinessError('La empresa está archivada. Usa la opción Restaurar.');
    }

    const subcuentas = await prisma.usuario.findMany({
      where: { empresaId: id },
      select: { id: true },
    });
    const subcuentaIds = subcuentas.map((sub) => sub.id);

    await prisma.$transaction(async (tx) => {
      if (activo) {
        await tx.usuario.update({ where: { id }, data: { activo: true } });
      } else {
        await tx.usuario.update({
          where: { id },
          data: { activo: false, sessionVersion: { increment: 1 } },
        });
        if (subcuentaIds.length > 0) {
          await tx.usuario.updateMany({
            where: { id: { in: subcuentaIds } },
            data: { sessionVersion: { increment: 1 } },
          });
        }
      }

      if (usuario.empresaRefId) {
        await tx.empresa
          .update({ where: { id: usuario.empresaRefId }, data: { activo } })
          .catch(() => null);
      }
    });

    await registrarAuditoria(req, {
      accion: activo ? 'empresa.desbloquear' : 'empresa.bloquear',
      entidad: 'Usuario',
      entidadId: id,
      empresaId: usuario.empresaRefId,
      datosNuevos: { activo, subcuentas: subcuentaIds.length },
    });

    const sufijo = !activo && subcuentaIds.length > 0
      ? ` También se cerraron ${subcuentaIds.length} subcuenta(s).`
      : '';

    res.json({ message: `Empresa ${activo ? 'desbloqueada' : 'bloqueada'} exitosamente.${sufijo}` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/activaciones/empresas/:id — Archivar empresa (borrado diferido)
// No borra nada de inmediato: desactiva el acceso y programa la purga física
// dentro de EMPRESA_ARCHIVO_DIAS (30 por defecto). El Super Admin puede
// restaurarla mientras la ventana siga abierta.
router.delete('/empresas/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nameConfirmation, deleteConfirmation, motivo } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { id, rol: 'EMPRESA' },
      select: { id: true, rol: true, empresaRefId: true, nombre: true, username: true },
    });
    if (!usuario) throw createBusinessError('Empresa no encontrada');

    const expectedName = usuario.nombre || usuario.username;
    const confirmacionValida = ['archivar', 'eliminar'].includes(deleteConfirmation);
    if (nameConfirmation !== expectedName || !confirmacionValida) {
      throw createBusinessError('La validación de archivado no coincide');
    }

    const resultado = await archivarEmpresa({
      empresaUsuarioId: id,
      req,
      motivo: typeof motivo === 'string' ? motivo.trim().slice(0, 500) : null,
    });

    if (resultado.yaArchivada) {
      return res.json({
        message: `La empresa ya estaba archivada. Su borrado definitivo está programado para ${resultado.scheduledDeletionAt?.toISOString?.() || resultado.scheduledDeletionAt}.`,
        archivada: true,
        yaArchivada: true,
        dias: resultado.dias,
        scheduledDeletionAt: resultado.scheduledDeletionAt,
      });
    }

    res.json({
      message: `Empresa archivada. Se eliminará definitivamente el ${resultado.scheduledDeletionAt.toISOString()} (${resultado.dias} días). Puedes restaurarla antes de esa fecha.`,
      archivada: true,
      yaArchivada: false,
      dias: resultado.dias,
      archivedAt: resultado.archivedAt,
      scheduledDeletionAt: resultado.scheduledDeletionAt,
      subcuentas: resultado.subcuentas,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/activaciones/empresas/:id/restaurar — Restaurar empresa archivada
router.post('/empresas/:id/restaurar', async (req, res, next) => {
  try {
    const resultado = await restaurarEmpresa({ empresaUsuarioId: req.params.id, req });
    res.json({
      message: `Empresa ${resultado.nombre} restaurada. El borrado programado fue cancelado.`,
      ...resultado,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/activaciones/:id/activar-manual — Activación manual con soporte de meses
router.put('/:id/activar-manual', async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, username: true, empresaRefId: true, currentPeriodEnd: true, subscriptionStatus: true },
    });
    if (!usuario) throw createBusinessError('Usuario no encontrado');

    const { planType, meses } = parsePlanYMes(req.body);
    const updateData = construirActivacion(usuario, planType, meses);

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({ where: { id }, data: updateData });
      await sincronizarEmpresa(tx, usuario.empresaRefId, updateData);
      await tx.solicitudActivacion.create({
        data: {
          usuarioId: id,
          plan: planType,
          metodoPago: 'MANUAL_ADMIN',
          referencia: `Activación manual ${planType === 'monthly' ? `(${meses} mes(es))` : '(lifetime)'}`,
          estado: 'APROBADA',
          revisadoPor: req.user.id,
          revisadoEn: new Date(),
        }
      });
    });

    await registrarAuditoria(req, {
      accion: 'empresa.activar',
      entidad: 'Usuario',
      entidadId: id,
      empresaId: usuario.empresaRefId,
      datosAnteriores: {
        subscriptionStatus: usuario.subscriptionStatus,
        currentPeriodEnd: usuario.currentPeriodEnd,
      },
      datosNuevos: {
        subscriptionStatus: updateData.subscriptionStatus,
        planType,
        currentPeriodEnd: updateData.currentPeriodEnd,
      },
    });

    res.json({ message: `Usuario activado exitosamente con plan ${planType}` });
  } catch (err) {
    next(err);
  }
});

// PUT /api/activaciones/:id/aprobar — Aprobar una solicitud de pago pendiente
router.put('/:id/aprobar', async (req, res, next) => {
  try {
    const { id } = req.params;
    const solicitud = await prisma.solicitudActivacion.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            nombre: true,
            rol: true,
            empresaId: true,
            empresaRefId: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!solicitud) throw createBusinessError('Solicitud no encontrada');
    if (solicitud.estado !== 'PENDIENTE') {
      throw createBusinessError(`Esta solicitud ya fue ${solicitud.estado.toLowerCase()}`);
    }
    if (!solicitud.usuario) throw createBusinessError('El usuario de la solicitud ya no existe');

    // Solicitudes antiguas pudieron crearse a nombre de una subcuenta. La
    // activación debe aplicarse siempre a la EMPRESA padre.
    let destino = solicitud.usuario;
    if (['CAJA', 'INVENTARIO', 'VISOR'].includes(destino.rol) && destino.empresaId) {
      destino = await prisma.usuario.findUnique({
        where: { id: destino.empresaId },
        select: {
          id: true,
          username: true,
          nombre: true,
          empresaRefId: true,
          currentPeriodEnd: true,
        },
      });
      if (!destino) throw createBusinessError('La cuenta principal de la empresa ya no existe');
    }

    const { planType, meses } = parsePlanYMes(req.body, solicitud.plan);
    const notas = limpiarNotas(req.body.notas);
    const updateData = construirActivacion(destino, planType, meses);

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({ where: { id: destino.id }, data: updateData });
      await sincronizarEmpresa(tx, destino.empresaRefId, updateData);
      await tx.solicitudActivacion.update({
        where: { id },
        data: {
          estado: 'APROBADA',
          plan: planType,
          notas,
          revisadoPor: req.user.id,
          revisadoEn: new Date(),
        },
      });
    });

    await registrarAuditoria(req, {
      accion: 'solicitud.aprobar',
      entidad: 'SolicitudActivacion',
      entidadId: id,
      empresaId: destino.empresaRefId,
      datosAnteriores: {
        estado: 'PENDIENTE',
        plan: solicitud.plan,
        referencia: solicitud.referencia,
      },
      datosNuevos: {
        estado: 'APROBADA',
        plan: planType,
        meses: planType === 'monthly' ? meses : null,
        notas,
        currentPeriodEnd: updateData.currentPeriodEnd,
      },
    });

    res.json({
      message: `Pago aprobado. ${destino.nombre || destino.username} quedó activo con plan ${planType}.`,
      planType,
      meses: planType === 'monthly' ? meses : null,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/activaciones/:id/rechazar — Rechazar una solicitud de pago pendiente
router.put('/:id/rechazar', async (req, res, next) => {
  try {
    const { id } = req.params;
    const notas = limpiarNotas(req.body.notas, { requerido: true });

    const solicitud = await prisma.solicitudActivacion.findUnique({
      where: { id },
      include: { usuario: { select: { id: true, username: true, nombre: true, empresaRefId: true } } },
    });

    if (!solicitud) throw createBusinessError('Solicitud no encontrada');
    if (solicitud.estado !== 'PENDIENTE') {
      throw createBusinessError(`Esta solicitud ya fue ${solicitud.estado.toLowerCase()}`);
    }

    await prisma.solicitudActivacion.update({
      where: { id },
      data: {
        estado: 'RECHAZADA',
        notas,
        revisadoPor: req.user.id,
        revisadoEn: new Date(),
      },
    });

    await registrarAuditoria(req, {
      accion: 'solicitud.rechazar',
      entidad: 'SolicitudActivacion',
      entidadId: id,
      empresaId: solicitud.usuario?.empresaRefId || null,
      datosAnteriores: {
        estado: 'PENDIENTE',
        plan: solicitud.plan,
        referencia: solicitud.referencia,
      },
      datosNuevos: { estado: 'RECHAZADA', notas },
    });

    res.json({ message: `Solicitud de ${solicitud.usuario?.nombre || solicitud.usuario?.username || 'la empresa'} rechazada.` });
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
    const targetUser = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, username: true, empresaRefId: true },
    });
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

    const empresaId = targetUser.empresaRefId || await empresaIdDeUsuario(id);
    await registrarAuditoria(req, {
      accion: 'usuario.reset_password',
      entidad: 'Usuario',
      entidadId: id,
      empresaId,
      datosNuevos: { username: targetUser.username, sesionesInvalidadas: true },
    });

    res.json({ message: `Contraseña para el usuario '${targetUser.username}' actualizada exitosamente` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/activaciones/usuarios/:id — Archivar cuenta (borrado diferido)
// Si la cuenta es EMPRESA se archiva toda la empresa. Para el resto se marca
// `deletedAt` y se programa la purga física dentro de EMPRESA_ARCHIVO_DIAS.
router.delete('/usuarios/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { usernameConfirmation, deleteConfirmation, motivo } = req.body;
    const targetUser = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, username: true, nombre: true, rol: true, empresaRefId: true },
    });

    if (!targetUser || targetUser.rol === 'SUPER_ADMIN') {
      throw createBusinessError('Usuario no encontrado o no se permite archivar esta cuenta');
    }

    const confirmacionValida = ['archivar', 'eliminar'].includes(deleteConfirmation);
    if (usernameConfirmation !== targetUser.username || !confirmacionValida) {
      throw createBusinessError('La validación de archivado no coincide');
    }

    const resultado = await archivarUsuario({
      usuarioId: id,
      req,
      motivo: typeof motivo === 'string' ? motivo.trim().slice(0, 500) : null,
    });

    if (resultado.yaArchivado || resultado.yaArchivada) {
      return res.json({
        message: `La cuenta '${targetUser.username}' ya estaba archivada. Su borrado definitivo está programado para ${resultado.scheduledDeletionAt?.toISOString?.() || resultado.scheduledDeletionAt}.`,
        archivada: true,
        yaArchivada: true,
        dias: resultado.dias,
        scheduledDeletionAt: resultado.scheduledDeletionAt,
      });
    }

    const esEmpresa = targetUser.rol === 'EMPRESA';
    res.json({
      message: esEmpresa
        ? `Empresa archivada. Se eliminará definitivamente el ${resultado.scheduledDeletionAt.toISOString()} (${resultado.dias} días). Puedes restaurarla antes de esa fecha.`
        : `Usuario '${targetUser.username}' archivado. Se eliminará definitivamente el ${resultado.scheduledDeletionAt.toISOString()} (${resultado.dias} días). Puedes restaurarlo antes de esa fecha.`,
      archivada: true,
      yaArchivada: false,
      dias: resultado.dias,
      deletedAt: resultado.deletedAt || resultado.archivedAt,
      archivedAt: resultado.archivedAt || null,
      scheduledDeletionAt: resultado.scheduledDeletionAt,
      subcuentas: resultado.subcuentas,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/activaciones/usuarios/:id/restaurar — Restaurar cuenta archivada
router.post('/usuarios/:id/restaurar', async (req, res, next) => {
  try {
    const resultado = await restaurarUsuario({ usuarioId: req.params.id, req });
    res.json({
      message: `Cuenta '${resultado.username || resultado.nombre}' restaurada. El borrado programado fue cancelado.`,
      ...resultado,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/activaciones/archivados/purgar — Ejecutar la purga ahora (SUPER_ADMIN)
// Sirve para pruebas y para forzar el cierre de la ventana desde el panel.
router.post('/archivados/purgar', async (req, res, next) => {
  try {
    const resultado = await purgarArchivados({ req });
    res.json({
      message: `Purga ejecutada: ${resultado.empresas.length} empresa(s) y ${resultado.usuarios.length} usuario(s) eliminados definitivamente.`,
      ...resultado,
    });
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
    if (typeof codigo !== 'string' || !codigo.trim()) throw createBusinessError('El código de la promoción es obligatorio');
    if (typeof titulo !== 'string' || !titulo.trim()) throw createBusinessError('El título de la promoción es obligatorio');

    const nueva = await prisma.promocion.create({
      data: {
        codigo: codigo.trim().toUpperCase(),
        titulo: titulo.trim(),
        descripcion: typeof descripcion === 'string' ? descripcion.trim() || null : null,
        descuentoPorc: parsePromotionNumber(descuentoPorc, 'El descuento', { min: 0, max: 100, nullable: true }),
        diasExtraTrial: diasExtraTrial === undefined || diasExtraTrial === null || diasExtraTrial === ''
          ? 0
          : parsePromotionNumber(diasExtraTrial, 'Los días extra de prueba', { min: 0, max: 2147483647, integer: true }),
        planDestino: planDestino || null,
        usosMaximos: usosMaximos === undefined || usosMaximos === null || usosMaximos === ''
          ? 100
          : parsePromotionNumber(usosMaximos, 'Los usos máximos', { min: 1, max: 2147483647, integer: true }),
        fechaFin: parsePromotionDate(fechaFin),
      }
    });

    await registrarAuditoria(req, {
      accion: 'promocion.crear',
      entidad: 'Promocion',
      entidadId: nueva.id,
      datosNuevos: { codigo: nueva.codigo, titulo: nueva.titulo, diasExtraTrial: nueva.diasExtraTrial },
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
    if (titulo !== undefined) {
      if (typeof titulo !== 'string' || !titulo.trim()) throw createBusinessError('El título de la promoción es obligatorio');
      updateData.titulo = titulo.trim();
    }
    if (descripcion !== undefined) {
      if (typeof descripcion !== 'string') throw createBusinessError('La descripción de la promoción no es válida');
      updateData.descripcion = descripcion.trim() || null;
    }
    if (descuentoPorc !== undefined) {
      updateData.descuentoPorc = parsePromotionNumber(descuentoPorc, 'El descuento', { min: 0, max: 100, nullable: true });
    }
    if (diasExtraTrial !== undefined) {
      updateData.diasExtraTrial = parsePromotionNumber(diasExtraTrial, 'Los días extra de prueba', { min: 0, max: 2147483647, integer: true });
    }
    if (usosMaximos !== undefined) {
      updateData.usosMaximos = parsePromotionNumber(usosMaximos, 'Los usos máximos', { min: 1, max: 2147483647, integer: true });
    }
    if (fechaFin !== undefined) updateData.fechaFin = parsePromotionDate(fechaFin);

    const actualizada = await prisma.promocion.update({
      where: { id },
      data: updateData
    });

    await registrarAuditoria(req, {
      accion: 'promocion.actualizar',
      entidad: 'Promocion',
      entidadId: id,
      datosNuevos: updateData,
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
    const anterior = await prisma.promocion.findUnique({
      where: { id },
      select: { codigo: true, titulo: true },
    });
    await prisma.promocion.delete({ where: { id } });

    await registrarAuditoria(req, {
      accion: 'promocion.eliminar',
      entidad: 'Promocion',
      entidadId: id,
      datosAnteriores: anterior,
    });

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
    const { titulo, subtitulo, contenido, imagenUrl, videoUrl, categoria, destacado, publicado } = req.body;
    if (!titulo?.trim()) throw createBusinessError('El título es obligatorio');
    if (!contenido?.trim()) throw createBusinessError('El contenido es obligatorio');

    const nueva = await prisma.noticia.create({
      data: {
        titulo: titulo.trim(),
        subtitulo: subtitulo?.trim() || null,
        contenido: contenido.trim(),
        imagenUrl: normalizarMediaUrl(imagenUrl, 'La URL de la imagen'),
        videoUrl: normalizarMediaUrl(videoUrl, 'La URL del video'),
        categoria: categoria?.trim() || 'Anuncio',
        destacado: Boolean(destacado),
        publicado: publicado !== undefined ? Boolean(publicado) : true,
      }
    });

    await registrarAuditoria(req, {
      accion: 'noticia.crear',
      entidad: 'Noticia',
      entidadId: nueva.id,
      datosNuevos: { titulo: nueva.titulo, categoria: nueva.categoria, publicado: nueva.publicado },
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
    const { titulo, subtitulo, contenido, imagenUrl, videoUrl, categoria, destacado, publicado } = req.body;

    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo.trim();
    if (subtitulo !== undefined) updateData.subtitulo = subtitulo.trim();
    if (contenido !== undefined) updateData.contenido = contenido.trim();
    if (imagenUrl !== undefined) updateData.imagenUrl = normalizarMediaUrl(imagenUrl, 'La URL de la imagen');
    if (videoUrl !== undefined) updateData.videoUrl = normalizarMediaUrl(videoUrl, 'La URL del video');
    if (categoria !== undefined) updateData.categoria = categoria.trim();
    if (destacado !== undefined) updateData.destacado = Boolean(destacado);
    if (publicado !== undefined) updateData.publicado = Boolean(publicado);

    const actualizada = await prisma.noticia.update({
      where: { id },
      data: updateData
    });

    await registrarAuditoria(req, {
      accion: 'noticia.actualizar',
      entidad: 'Noticia',
      entidadId: id,
      datosNuevos: {
        titulo: updateData.titulo,
        categoria: updateData.categoria,
        destacado: updateData.destacado,
        publicado: updateData.publicado,
      },
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
    const anterior = await prisma.noticia.findUnique({
      where: { id },
      select: { titulo: true, categoria: true },
    });
    await prisma.noticia.delete({ where: { id } });

    await registrarAuditoria(req, {
      accion: 'noticia.eliminar',
      entidad: 'Noticia',
      entidadId: id,
      datosAnteriores: anterior,
    });

    res.json({ message: 'Noticia eliminada correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
