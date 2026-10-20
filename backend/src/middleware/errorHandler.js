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

  if (err.code === 'P2004') {
    return res.status(400).json({
      error: 'Violación de restricción',
      message: 'Los datos proporcionados violan una restricción de la base de datos',
    });
  }

  if (err.code === 'P2016') {
    return res.status(400).json({
      error: 'Error de consulta',
      message: 'La consulta no pudo ser interpretada correctamente',
    });
  }

  if (err.code === 'P2024') {
    return res.status(503).json({
      error: 'Tiempo agotado',
      message: 'La base de datos tardó demasiado en responder. Inténtalo de nuevo.',
    });
  }

  // Base de datos inalcanzable o sin inicializar
  if (err.code === 'P1001' || err.code === 'P1003' || /Can't reach database server/i.test(err.message || '')) {
    return res.status(503).json({
      error: 'Base de datos no disponible',
      message: 'No se pudo conectar con la base de datos. Verifica que el servidor esté activo.',
    });
  }

  // Errores de validación personalizados
  if (err.type === 'VALIDATION_ERROR') {
    return res.status(422).json({
      error: 'Error de validación',
      code: err.code || 'VALIDATION_ERROR',
      message: err.message,
      fields: err.fields,
    });
  }

  if (err.type === 'BUSINESS_ERROR') {
    return res.status(400).json({
      error: 'Error de negocio',
      code: err.code || 'BUSINESS_ERROR',
      message: err.message,
      details: err.details || null,
    });
  }

  // decimal.js lanza un Error cuyo mensaje empieza por `[DecimalError]` cuando
  // recibe un valor no numérico (su `name` es "Error", no "DecimalError"). Antes
  // caía en el 500 genérico; ahora se responde 422. Es una red de seguridad: las
  // rutas deben validar con `utils/decimal.js`, pero así ningún módulo pendiente
  // (p. ej. cotizaciones) filtra un 500 por un número malformado.
  if (typeof err.message === 'string' && err.message.startsWith('[DecimalError]')) {
    return res.status(422).json({
      error: 'Error de validación',
      code: 'INVALID_NUMBER',
      message: 'Uno de los valores numéricos enviados no es válido',
    });
  }

  // Error genérico
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.name,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error inesperado',
  });
}

function createValidationError(message, fields = {}, code = 'VALIDATION_ERROR') {
  const err = new Error(message);
  err.type = 'VALIDATION_ERROR';
  err.fields = fields;
  err.code = code;
  return err;
}

function createBusinessError(message, details = {}) {
  const err = new Error(message);
  err.type = 'BUSINESS_ERROR';
  err.code = details.code || 'BUSINESS_ERROR';
  err.details = details;
  return err;
}

module.exports = { errorHandler, createValidationError, createBusinessError };
