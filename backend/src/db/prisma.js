const { PrismaClient } = require('@prisma/client');

const isSqlite = (process.env.DATABASE_URL || '').startsWith('file:') || process.env.DB_PROVIDER === 'sqlite';
const Prisma = isSqlite
  ? require('../../src/generated/prisma-sqlite').PrismaClient
  : PrismaClient;

const prisma = global.__prisma || new Prisma({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (isSqlite && !global.__sqliteNumericMiddleware) {
  const numericFields = new Set([
    'precioVenta', 'costoCompra', 'tasaImpuesto', 'subtotal', 'impuestoTotal', 'total',
    'tasaCambio', 'precioUnitarioHistorico', 'tasaImpuestoAplicada', 'subtotalLinea',
    'impuestoLinea', 'totalLinea', 'monto', 'montoInicial', 'montoFinal',
    'ingresosEfectivo', 'ingresosBanco', 'precioUnitario',
  ]);
  const convert = (value, key) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
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

module.exports = prisma;
