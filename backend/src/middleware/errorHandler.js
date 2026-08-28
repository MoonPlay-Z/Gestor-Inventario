/**
 * Middleware centralizado de manejo de errores
 */

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message);

  // Errores de Prisma conocidos
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflicto de datos',
      message: `Ya existe un registro con ese valor en: ${err.meta?.target?.join(', ')}`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'No encontrado',
      message: 'El registro solicitado no existe en la base de datos',
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      error: 'Referencia inválida',
      message: 'El ID de referencia proporcionado no existe',
    });
  }

  // Errores de validación personalizados
  if (err.type === 'VALIDATION_ERROR') {
    return res.status(422).json({
      error: 'Error de validación',
      message: err.message,
      fields: err.fields,
    });
  }

  if (err.type === 'BUSINESS_ERROR') {
    return res.status(400).json({
      error: 'Error de negocio',
      message: err.message,
    });
  }

  // Error genérico
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.name,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error inesperado',
  });
}

function createValidationError(message, fields = {}) {
  const err = new Error(message);
  err.type = 'VALIDATION_ERROR';
  err.fields = fields;
  return err;
}

function createBusinessError(message) {
  const err = new Error(message);
  err.type = 'BUSINESS_ERROR';
  return err;
}

module.exports = { errorHandler, createValidationError, createBusinessError };
