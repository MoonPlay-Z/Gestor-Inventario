const { createValidationError } = require('../middleware/errorHandler');

function getRegistrationMetadata(req, body = {}) {
  const { locationLatitude, locationLongitude } = body;
  const hasLatitude = locationLatitude !== undefined && locationLatitude !== null;
  const hasLongitude = locationLongitude !== undefined && locationLongitude !== null;

  if (hasLatitude !== hasLongitude) {
    throw createValidationError('La ubicación debe incluir latitud y longitud');
  }

  if (hasLatitude && (
    typeof locationLatitude !== 'number' ||
    typeof locationLongitude !== 'number' ||
    !Number.isFinite(locationLatitude) ||
    !Number.isFinite(locationLongitude) ||
    locationLatitude < -90 ||
    locationLatitude > 90 ||
    locationLongitude < -180 ||
    locationLongitude > 180
  )) {
    throw createValidationError('Las coordenadas de ubicación no son válidas');
  }

  return {
    registrationIp: req.ip || null,
    registrationLatitude: hasLatitude ? locationLatitude : null,
    registrationLongitude: hasLongitude ? locationLongitude : null,
  };
}

module.exports = { getRegistrationMetadata };
