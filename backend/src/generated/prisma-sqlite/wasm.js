
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.ClienteScalarFieldEnum = {
  id: 'id',
  razonSocial: 'razonSocial',
  rifCedula: 'rifCedula',
  direccion: 'direccion',
  telefono: 'telefono',
  correo: 'correo',
  empresaId: 'empresaId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductoScalarFieldEnum = {
  id: 'id',
  sku: 'sku',
  nombre: 'nombre',
  descripcion: 'descripcion',
  stockActual: 'stockActual',
  stockMinimo: 'stockMinimo',
  precioVenta: 'precioVenta',
  costoCompra: 'costoCompra',
  tasaImpuesto: 'tasaImpuesto',
  categoria: 'categoria',
  activo: 'activo',
  empresaId: 'empresaId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FacturaScalarFieldEnum = {
  id: 'id',
  numeroFactura: 'numeroFactura',
  clienteId: 'clienteId',
  usuarioId: 'usuarioId',
  fechaEmision: 'fechaEmision',
  fechaVencimiento: 'fechaVencimiento',
  subtotal: 'subtotal',
  impuestoTotal: 'impuestoTotal',
  total: 'total',
  estado: 'estado',
  moneda: 'moneda',
  tasaCambio: 'tasaCambio',
  cuotasTotales: 'cuotasTotales',
  observaciones: 'observaciones',
  anuladoPor: 'anuladoPor',
  motivoAnulacion: 'motivoAnulacion',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemFacturaScalarFieldEnum = {
  id: 'id',
  facturaId: 'facturaId',
  productoId: 'productoId',
  descripcionHistorica: 'descripcionHistorica',
  cantidad: 'cantidad',
  precioUnitarioHistorico: 'precioUnitarioHistorico',
  tasaImpuestoAplicada: 'tasaImpuestoAplicada',
  subtotalLinea: 'subtotalLinea',
  impuestoLinea: 'impuestoLinea',
  totalLinea: 'totalLinea',
  createdAt: 'createdAt'
};

exports.Prisma.PagoScalarFieldEnum = {
  id: 'id',
  facturaId: 'facturaId',
  monto: 'monto',
  metodoPago: 'metodoPago',
  referenciaTransaccion: 'referenciaTransaccion',
  fechaPago: 'fechaPago',
  notas: 'notas',
  createdAt: 'createdAt'
};

exports.Prisma.CorrelativoScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  valor: 'valor'
};

exports.Prisma.CierreCajaScalarFieldEnum = {
  id: 'id',
  usuarioId: 'usuarioId',
  fechaApertura: 'fechaApertura',
  fechaCierre: 'fechaCierre',
  montoInicial: 'montoInicial',
  montoFinal: 'montoFinal',
  ingresosEfectivo: 'ingresosEfectivo',
  ingresosBanco: 'ingresosBanco',
  estado: 'estado',
  observaciones: 'observaciones',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CotizacionScalarFieldEnum = {
  id: 'id',
  numero: 'numero',
  clienteId: 'clienteId',
  usuarioId: 'usuarioId',
  fechaEmision: 'fechaEmision',
  fechaValidez: 'fechaValidez',
  subtotal: 'subtotal',
  impuestoTotal: 'impuestoTotal',
  total: 'total',
  moneda: 'moneda',
  estado: 'estado'
};

exports.Prisma.ItemCotizacionScalarFieldEnum = {
  id: 'id',
  cotizacionId: 'cotizacionId',
  productoId: 'productoId',
  descripcion: 'descripcion',
  cantidad: 'cantidad',
  precioUnitario: 'precioUnitario',
  totalLinea: 'totalLinea'
};

exports.Prisma.UsuarioScalarFieldEnum = {
  id: 'id',
  username: 'username',
  passwordHash: 'passwordHash',
  nombre: 'nombre',
  rol: 'rol',
  activo: 'activo',
  empresaId: 'empresaId',
  subscriptionStatus: 'subscriptionStatus',
  planType: 'planType',
  trialStartsAt: 'trialStartsAt',
  trialEndsAt: 'trialEndsAt',
  currentPeriodEnd: 'currentPeriodEnd',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SolicitudActivacionScalarFieldEnum = {
  id: 'id',
  usuarioId: 'usuarioId',
  plan: 'plan',
  metodoPago: 'metodoPago',
  referencia: 'referencia',
  estado: 'estado',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Cliente: 'Cliente',
  Producto: 'Producto',
  Factura: 'Factura',
  ItemFactura: 'ItemFactura',
  Pago: 'Pago',
  Correlativo: 'Correlativo',
  CierreCaja: 'CierreCaja',
  Cotizacion: 'Cotizacion',
  ItemCotizacion: 'ItemCotizacion',
  Usuario: 'Usuario',
  SolicitudActivacion: 'SolicitudActivacion'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
