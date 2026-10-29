const path = require('path');
const { PrismaClient } = require('@prisma/client');

let dbUrl = process.env.DATABASE_URL || '';
const isSqlite = dbUrl.startsWith('file:') || process.env.DB_PROVIDER === 'sqlite';
const Prisma = isSqlite
  ? require('../../src/generated/prisma-sqlite').PrismaClient
  : PrismaClient;

const prismaOptions = {
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
};

if (isSqlite) {
  // Asegura resolución de ruta absoluta para SQLite independientemente del CWD
  let sqlitePath;
  if (dbUrl.startsWith('file:')) {
    const raw = dbUrl.replace(/^file:/, '');
    sqlitePath = path.isAbsolute(raw)
      ? raw
      : path.resolve(__dirname, '../../prisma', path.basename(raw));
  } else {
    // Si DB_PROVIDER=sqlite pero DATABASE_URL apuntaba a postgres, usa dev.db local
    sqlitePath = path.resolve(__dirname, '../../prisma/dev.db');
  }
  prismaOptions.datasources = {
    db: { url: `file:${sqlitePath}` },
  };
}

const prisma = global.__prisma || new Prisma(prismaOptions);

if (isSqlite && !global.__sqliteNumericMiddleware) {
  const numericFields = new Set([
    'precioVenta', 'costoCompra', 'tasaImpuesto', 'stockActual', 'stockMinimo',
    'precioPorKilo', 'toleranciaPeso', 'subtotal', 'impuestoTotal', 'total',
    'tasaCambio', 'precioUnitarioHistorico', 'costoUnitarioHistoricoUSD', 'tasaImpuestoAplicada', 'subtotalLinea',
    'impuestoLinea', 'totalLinea', 'monto', 'montoInicial', 'montoFinal',
    'montoOriginal', 'montoCobrado', 'montoPendiente', 'tasaBCV',
    'ingresosEfectivo', 'ingresosBanco', 'ingresosEfectivoVES', 'ingresosBancoVES',
    'precioUnitario',
  ]);
  const convert = (value, key) => {
    if (value instanceof Date) return value;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const prototype = Object.getPrototypeOf(value);
      if (prototype !== Object.prototype && prototype !== null) return value;
      return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, convert(childValue, childKey)]));
    }
    if (Array.isArray(value)) return value.map((item) => convert(item, key));
    if (numericFields.has(key) && typeof value === 'string' && value.trim() !== '') return Number(value);
    return value;
  };
  prisma.$use((params, next) => next({ ...params, args: convert(params.args, '') }));
  global.__sqliteNumericMiddleware = true;
}

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// Namespace Prisma coherente con el cliente activo (sqlite o postgres)
module.exports = prisma;
module.exports.Prisma = isSqlite
  ? require('../../src/generated/prisma-sqlite').Prisma
  : require('@prisma/client').Prisma;
module.exports.IS_SQLITE = isSqlite;
