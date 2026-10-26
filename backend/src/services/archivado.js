const prisma = require('../db/prisma');
const { createBusinessError } = require('../middleware/errorHandler');
const { registrarAuditoria } = require('../utils/auditLog');
const { eliminarEmpresaEnCascada } = require('../utils/empresaCascade');
const { eliminarUsuarioEnCascada } = require('../utils/usuarioCascade');

const DIAS_ARCHIVO = (() => {
  const valor = Number.parseInt(process.env.EMPRESA_ARCHIVO_DIAS || '30', 10);
  return Number.isFinite(valor) && valor > 0 ? valor : 30;
})();

const PURGA_HABILITADA = process.env.ARCHIVO_PURGA_ENABLED !== 'false';
const INTERVALO_PURGA_MS = 24 * 60 * 60 * 1000;
const LIMITE_PURGA = 100;

function fechaProgramada(desde = new Date()) {
  return new Date(desde.getTime() + DIAS_ARCHIVO * 24 * 60 * 60 * 1000);
}

function datosEmpresa(usuario) {
  return {
    nombre: usuario.nombre,
    username: usuario.username,
    empresaRefId: usuario.empresaRefId,
    empresa: usuario.empresaRef?.nombre || null,
  };
}

/**
 * Archiva una empresa: corta el acceso de inmediato y programa el borrado
 * físico dentro de `EMPRESA_ARCHIVO_DIAS` (30 por defecto).
 *
 * No borra nada. El dueño queda `activo=false`; las subcuentas conservan su
 * `activo` para no perder el estado previo, pero quedan bloqueadas porque
 * login y subscriptionGuard validan al padre/Empresa. Se invalidan todas las
 * sesiones incrementando `sessionVersion`.
 */
async function archivarEmpresa({ empresaUsuarioId, req = null, motivo = null }) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: empresaUsuarioId },
    select: {
      id: true,
      rol: true,
      nombre: true,
      username: true,
      activo: true,
      empresaRefId: true,
      empresaRef: {
        select: {
          id: true,
          nombre: true,
          activo: true,
          archivedAt: true,
          scheduledDeletionAt: true,
        },
      },
    },
  });

  if (!usuario || usuario.rol !== 'EMPRESA') {
    throw createBusinessError('Empresa no encontrada');
  }
  if (!usuario.empresaRefId) {
    throw createBusinessError('La empresa no tiene un registro válido en empresas');
  }

  if (usuario.empresaRef?.archivedAt) {
    return {
      yaArchivada: true,
      empresaRefId: usuario.empresaRefId,
      ownerId: usuario.id,
      archivedAt: usuario.empresaRef.archivedAt,
      scheduledDeletionAt: usuario.empresaRef.scheduledDeletionAt,
      dias: DIAS_ARCHIVO,
    };
  }

  const ahora = new Date();
  const programada = fechaProgramada(ahora);

  const subcuentas = await prisma.usuario.findMany({
    where: { empresaId: usuario.id },
    select: { id: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.empresa.update({
      where: { id: usuario.empresaRefId },
      data: {
        activo: false,
        archivedAt: ahora,
        scheduledDeletionAt: programada,
      },
    });

    await tx.usuario.update({
      where: { id: usuario.id },
      data: { activo: false, sessionVersion: { increment: 1 } },
    });

    if (subcuentas.length > 0) {
      await tx.usuario.updateMany({
        where: { id: { in: subcuentas.map((sub) => sub.id) } },
        data: { sessionVersion: { increment: 1 } },
      });
    }
  }, { maxWait: 10000, timeout: 60000 });

  await registrarAuditoria(req, {
    accion: 'empresa.archivar',
    entidad: 'Empresa',
    entidadId: usuario.empresaRefId,
    empresaId: usuario.empresaRefId,
    datosAnteriores: datosEmpresa(usuario),
    datosNuevos: {
      archivedAt: ahora,
      scheduledDeletionAt: programada,
      dias: DIAS_ARCHIVO,
      subcuentas: subcuentas.length,
      motivo,
    },
  });

  return {
    yaArchivada: false,
    empresaRefId: usuario.empresaRefId,
    ownerId: usuario.id,
    archivedAt: ahora,
    scheduledDeletionAt: programada,
    dias: DIAS_ARCHIVO,
    subcuentas: subcuentas.length,
  };
}

/** Restaura una empresa archivada antes de la purga programada. */
async function restaurarEmpresa({ empresaUsuarioId, req = null }) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: empresaUsuarioId },
    select: {
      id: true,
      rol: true,
      nombre: true,
      username: true,
      activo: true,
      empresaRefId: true,
      empresaRef: {
        select: {
          id: true,
          nombre: true,
          activo: true,
          archivedAt: true,
          scheduledDeletionAt: true,
        },
      },
    },
  });

  if (!usuario || usuario.rol !== 'EMPRESA') {
    throw createBusinessError('Empresa no encontrada');
  }
  if (!usuario.empresaRefId || !usuario.empresaRef?.archivedAt) {
    throw createBusinessError('La empresa no está archivada');
  }

  await prisma.$transaction(async (tx) => {
    await tx.empresa.update({
      where: { id: usuario.empresaRefId },
      data: {
        activo: true,
        archivedAt: null,
        scheduledDeletionAt: null,
      },
    });

    await tx.usuario.update({
      where: { id: usuario.id },
      data: {
        activo: true,
        deletedAt: null,
        sessionVersion: { increment: 1 },
      },
    });
  }, { maxWait: 10000, timeout: 60000 });

  await registrarAuditoria(req, {
    accion: 'empresa.restaurar',
    entidad: 'Empresa',
    entidadId: usuario.empresaRefId,
    empresaId: usuario.empresaRefId,
    datosAnteriores: {
      archivedAt: usuario.empresaRef.archivedAt,
      scheduledDeletionAt: usuario.empresaRef.scheduledDeletionAt,
    },
    datosNuevos: { activo: true, archivedAt: null, scheduledDeletionAt: null },
  });

  return {
    empresaRefId: usuario.empresaRefId,
    ownerId: usuario.id,
    nombre: usuario.empresaRef.nombre,
  };
}

/**
 * Archiva un usuario no-EMPRESA. Una cuenta EMPRESA delega en
 * `archivarEmpresa` para archivar toda la empresa.
 */
async function archivarUsuario({ usuarioId, req = null, motivo = null }) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      username: true,
      nombre: true,
      rol: true,
      activo: true,
      empresaRefId: true,
      deletedAt: true,
      scheduledDeletionAt: true,
    },
  });

  if (!usuario || usuario.rol === 'SUPER_ADMIN') {
    throw createBusinessError('Usuario no encontrado o no se permite archivar esta cuenta');
  }

  if (usuario.rol === 'EMPRESA') {
    return archivarEmpresa({ empresaUsuarioId: usuario.id, req, motivo });
  }

  if (usuario.deletedAt) {
    return {
      yaArchivado: true,
      usuarioId: usuario.id,
      deletedAt: usuario.deletedAt,
      scheduledDeletionAt: usuario.scheduledDeletionAt,
      dias: DIAS_ARCHIVO,
    };
  }

  const ahora = new Date();
  const programada = fechaProgramada(ahora);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      activo: false,
      deletedAt: ahora,
      scheduledDeletionAt: programada,
      sessionVersion: { increment: 1 },
    },
  });

  await registrarAuditoria(req, {
    accion: 'usuario.archivar',
    entidad: 'Usuario',
    entidadId: usuario.id,
    empresaId: usuario.empresaRefId,
    datosAnteriores: {
      username: usuario.username,
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo,
    },
    datosNuevos: {
      deletedAt: ahora,
      scheduledDeletionAt: programada,
      dias: DIAS_ARCHIVO,
      motivo,
    },
  });

  return {
    yaArchivado: false,
    usuarioId: usuario.id,
    deletedAt: ahora,
    scheduledDeletionAt: programada,
    dias: DIAS_ARCHIVO,
  };
}

/** Restaura un usuario archivado antes de la purga programada. */
async function restaurarUsuario({ usuarioId, req = null }) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      username: true,
      nombre: true,
      rol: true,
      empresaRefId: true,
      deletedAt: true,
      scheduledDeletionAt: true,
    },
  });

  if (!usuario || usuario.rol === 'SUPER_ADMIN') {
    throw createBusinessError('Usuario no encontrado o no se permite restaurar esta cuenta');
  }

  if (usuario.rol === 'EMPRESA') {
    return restaurarEmpresa({ empresaUsuarioId: usuario.id, req });
  }

  if (!usuario.deletedAt) {
    throw createBusinessError('El usuario no está archivado');
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      activo: true,
      deletedAt: null,
      scheduledDeletionAt: null,
      sessionVersion: { increment: 1 },
    },
  });

  await registrarAuditoria(req, {
    accion: 'usuario.restaurar',
    entidad: 'Usuario',
    entidadId: usuario.id,
    empresaId: usuario.empresaRefId,
    datosAnteriores: {
      deletedAt: usuario.deletedAt,
      scheduledDeletionAt: usuario.scheduledDeletionAt,
    },
    datosNuevos: { activo: true, deletedAt: null, scheduledDeletionAt: null },
  });

  return {
    usuarioId: usuario.id,
    username: usuario.username,
    nombre: usuario.nombre,
  };
}

/**
 * Job de purga: borra físicamente lo que ya cumplió su ventana de archivo.
 * Es idempotente: si no hay nada vencido, no hace nada.
 */
async function purgarArchivados({ req = null, limite = LIMITE_PURGA } = {}) {
  const ahora = new Date();
  const resultado = { empresas: [], usuarios: [], errores: [] };

  const empresas = await prisma.empresa.findMany({
    where: {
      archivedAt: { not: null },
      scheduledDeletionAt: { lte: ahora },
    },
    select: { id: true, nombre: true, archivedAt: true, scheduledDeletionAt: true },
    orderBy: { scheduledDeletionAt: 'asc' },
    take: limite,
  });

  for (const empresa of empresas) {
    try {
      const owner = await prisma.usuario.findFirst({
        where: { empresaRefId: empresa.id, rol: 'EMPRESA' },
        select: { id: true, username: true, nombre: true, empresaRefId: true },
      });

      const eliminados = await prisma.$transaction(async (tx) => {
        return eliminarEmpresaEnCascada(tx, {
          empresaUsuarioId: owner?.id || null,
          empresaRefId: empresa.id,
        });
      }, { maxWait: 10000, timeout: 120000 });

      await registrarAuditoria(req, {
        accion: 'empresa.purgar',
        entidad: 'Empresa',
        entidadId: empresa.id,
        datosAnteriores: {
          nombre: empresa.nombre,
          archivedAt: empresa.archivedAt,
          scheduledDeletionAt: empresa.scheduledDeletionAt,
          owner: owner ? { id: owner.id, username: owner.username, nombre: owner.nombre } : null,
        },
        datosNuevos: {
          usuariosEliminados: eliminados.userIds.length,
          registrosEliminados: eliminados.eliminados,
        },
      });

      resultado.empresas.push({
        id: empresa.id,
        nombre: empresa.nombre,
        usuariosEliminados: eliminados.userIds.length,
        registrosEliminados: eliminados.eliminados,
      });
    } catch (err) {
      console.error(`[archivado] No se pudo purgar la empresa ${empresa.id}:`, err.message);
      resultado.errores.push({ tipo: 'empresa', id: empresa.id, error: err.message });
    }
  }

  const usuarios = await prisma.usuario.findMany({
    where: {
      rol: { notIn: ['SUPER_ADMIN', 'EMPRESA'] },
      deletedAt: { not: null },
      scheduledDeletionAt: { lte: ahora },
    },
    select: {
      id: true,
      username: true,
      nombre: true,
      rol: true,
      empresaRefId: true,
      deletedAt: true,
      scheduledDeletionAt: true,
    },
    orderBy: { scheduledDeletionAt: 'asc' },
    take: limite,
  });

  for (const usuario of usuarios) {
    try {
      const eliminados = await prisma.$transaction(async (tx) => {
        return eliminarUsuarioEnCascada(tx, usuario);
      }, { maxWait: 10000, timeout: 120000 });

      await registrarAuditoria(req, {
        accion: 'usuario.purgar',
        entidad: 'Usuario',
        entidadId: usuario.id,
        empresaId: usuario.empresaRefId,
        datosAnteriores: {
          username: usuario.username,
          nombre: usuario.nombre,
          rol: usuario.rol,
          deletedAt: usuario.deletedAt,
          scheduledDeletionAt: usuario.scheduledDeletionAt,
        },
        datosNuevos: {
          usuariosEliminados: eliminados.userIds.length,
          registrosEliminados: eliminados.eliminados,
        },
      });

      resultado.usuarios.push({
        id: usuario.id,
        username: usuario.username,
        usuariosEliminados: eliminados.userIds.length,
        registrosEliminados: eliminados.eliminados,
      });
    } catch (err) {
      console.error(`[archivado] No se pudo purgar el usuario ${usuario.id}:`, err.message);
      resultado.errores.push({ tipo: 'usuario', id: usuario.id, error: err.message });
    }
  }

  return resultado;
}

/**
 * Programa la purga diaria. Se ejecuta una vez al arrancar (con un margen
 * para que Prisma termine de conectar) y luego cada 24 h. En Render free el
 * backend puede dormir; al despertar, el arranque vuelve a ejecutar la purga.
 */
function iniciarPurgaArchivados() {
  if (!PURGA_HABILITADA) {
    console.log('[archivado] Purga automática desactivada (ARCHIVO_PURGA_ENABLED=false).');
    return;
  }

  const ejecutar = () => {
    purgarArchivados()
      .then((resultado) => {
        const total = resultado.empresas.length + resultado.usuarios.length;
        if (total > 0 || resultado.errores.length > 0) {
          console.log(
            `[archivado] Purga: ${resultado.empresas.length} empresa(s), ` +
            `${resultado.usuarios.length} usuario(s), ${resultado.errores.length} error(es).`
          );
        }
      })
      .catch((err) => console.error('[archivado] Error en purga programada:', err.message));
  };

  const timer = setTimeout(ejecutar, 60 * 1000);
  if (typeof timer.unref === 'function') timer.unref();

  const intervalo = setInterval(ejecutar, INTERVALO_PURGA_MS);
  if (typeof intervalo.unref === 'function') intervalo.unref();
}

module.exports = {
  DIAS_ARCHIVO,
  fechaProgramada,
  archivarEmpresa,
  restaurarEmpresa,
  archivarUsuario,
  restaurarUsuario,
  purgarArchivados,
  iniciarPurgaArchivados,
};
