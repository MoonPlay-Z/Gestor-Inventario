const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no definida en las variables de entorno. Saliendo...');
  process.exit(1);
}

/**
 * Middleware de autenticación.
 * Verifica el JWT, comprueba que el usuario esté activo en DB y coloca req.user
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que el usuario exista y siga activo en BD
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, nombre: true, rol: true, empresaId: true, activo: true, deletedAt: true, sessionVersion: true }
    });

    if (!usuario || !usuario.activo || usuario.deletedAt) {
      return res.status(401).json({ error: 'Sesión revocada o usuario inactivo.' });
    }
    // Invalida tokens emitidos antes de un cambio de sessionVersion
    if (decoded.sessionVersion !== undefined && decoded.sessionVersion !== usuario.sessionVersion) {
      return res.status(401).json({ error: 'Sesión invalidada. Por favor, inicia sesión nuevamente.' });
    }

    req.user = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

/**
 * Middleware de autorización por rol.
 * Uso: requireRole('EMPRESA')  o  requireRole('EMPRESA', 'INVENTARIO')
 * Debe ir DESPUÉS del authMiddleware.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado.' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`
      });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole, JWT_SECRET };
