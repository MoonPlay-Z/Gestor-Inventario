/**
 * Utilidad de paginación reutilizable para todas las rutas.
 * Uso:
 *   const { paginate } = require('../utils/pagination');
 *   const { skip, take, page, limit } = paginate(req.query);
 */

function paginate(query, defaults = {}) {
  const page = Math.max(1, parseInt(query.page) || defaults.page || 1);
  const limit = Math.min(
    Math.max(1, parseInt(query.limit) || defaults.limit || 25),
    defaults.maxLimit || 100
  );
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

function paginatedResponse(data, total, page, limit) {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = { paginate, paginatedResponse };
