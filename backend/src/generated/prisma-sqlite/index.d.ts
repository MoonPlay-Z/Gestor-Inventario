
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Cliente
 * 
 */
export type Cliente = $Result.DefaultSelection<Prisma.$ClientePayload>
/**
 * Model Producto
 * 
 */
export type Producto = $Result.DefaultSelection<Prisma.$ProductoPayload>
/**
 * Model Factura
 * 
 */
export type Factura = $Result.DefaultSelection<Prisma.$FacturaPayload>
/**
 * Model ItemFactura
 * 
 */
export type ItemFactura = $Result.DefaultSelection<Prisma.$ItemFacturaPayload>
/**
 * Model Pago
 * 
 */
export type Pago = $Result.DefaultSelection<Prisma.$PagoPayload>
/**
 * Model Correlativo
 * 
 */
export type Correlativo = $Result.DefaultSelection<Prisma.$CorrelativoPayload>
/**
 * Model CierreCaja
 * 
 */
export type CierreCaja = $Result.DefaultSelection<Prisma.$CierreCajaPayload>
/**
 * Model Cotizacion
 * 
 */
export type Cotizacion = $Result.DefaultSelection<Prisma.$CotizacionPayload>
/**
 * Model ItemCotizacion
 * 
 */
export type ItemCotizacion = $Result.DefaultSelection<Prisma.$ItemCotizacionPayload>
/**
 * Model Usuario
 * 
 */
export type Usuario = $Result.DefaultSelection<Prisma.$UsuarioPayload>
/**
 * Model SolicitudActivacion
 * 
 */
export type SolicitudActivacion = $Result.DefaultSelection<Prisma.$SolicitudActivacionPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Clientes
 * const clientes = await prisma.cliente.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Clientes
   * const clientes = await prisma.cliente.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.cliente`: Exposes CRUD operations for the **Cliente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Clientes
    * const clientes = await prisma.cliente.findMany()
    * ```
    */
  get cliente(): Prisma.ClienteDelegate<ExtArgs>;

  /**
   * `prisma.producto`: Exposes CRUD operations for the **Producto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Productos
    * const productos = await prisma.producto.findMany()
    * ```
    */
  get producto(): Prisma.ProductoDelegate<ExtArgs>;

  /**
   * `prisma.factura`: Exposes CRUD operations for the **Factura** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Facturas
    * const facturas = await prisma.factura.findMany()
    * ```
    */
  get factura(): Prisma.FacturaDelegate<ExtArgs>;

  /**
   * `prisma.itemFactura`: Exposes CRUD operations for the **ItemFactura** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ItemFacturas
    * const itemFacturas = await prisma.itemFactura.findMany()
    * ```
    */
  get itemFactura(): Prisma.ItemFacturaDelegate<ExtArgs>;

  /**
   * `prisma.pago`: Exposes CRUD operations for the **Pago** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pagos
    * const pagos = await prisma.pago.findMany()
    * ```
    */
  get pago(): Prisma.PagoDelegate<ExtArgs>;

  /**
   * `prisma.correlativo`: Exposes CRUD operations for the **Correlativo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Correlativos
    * const correlativos = await prisma.correlativo.findMany()
    * ```
    */
  get correlativo(): Prisma.CorrelativoDelegate<ExtArgs>;

  /**
   * `prisma.cierreCaja`: Exposes CRUD operations for the **CierreCaja** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CierreCajas
    * const cierreCajas = await prisma.cierreCaja.findMany()
    * ```
    */
  get cierreCaja(): Prisma.CierreCajaDelegate<ExtArgs>;

  /**
   * `prisma.cotizacion`: Exposes CRUD operations for the **Cotizacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cotizacions
    * const cotizacions = await prisma.cotizacion.findMany()
    * ```
    */
  get cotizacion(): Prisma.CotizacionDelegate<ExtArgs>;

  /**
   * `prisma.itemCotizacion`: Exposes CRUD operations for the **ItemCotizacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ItemCotizacions
    * const itemCotizacions = await prisma.itemCotizacion.findMany()
    * ```
    */
  get itemCotizacion(): Prisma.ItemCotizacionDelegate<ExtArgs>;

  /**
   * `prisma.usuario`: Exposes CRUD operations for the **Usuario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Usuarios
    * const usuarios = await prisma.usuario.findMany()
    * ```
    */
  get usuario(): Prisma.UsuarioDelegate<ExtArgs>;

  /**
   * `prisma.solicitudActivacion`: Exposes CRUD operations for the **SolicitudActivacion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SolicitudActivacions
    * const solicitudActivacions = await prisma.solicitudActivacion.findMany()
    * ```
    */
  get solicitudActivacion(): Prisma.SolicitudActivacionDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "cliente" | "producto" | "factura" | "itemFactura" | "pago" | "correlativo" | "cierreCaja" | "cotizacion" | "itemCotizacion" | "usuario" | "solicitudActivacion"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Cliente: {
        payload: Prisma.$ClientePayload<ExtArgs>
        fields: Prisma.ClienteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClienteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClienteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          findFirst: {
            args: Prisma.ClienteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClienteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          findMany: {
            args: Prisma.ClienteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          create: {
            args: Prisma.ClienteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          createMany: {
            args: Prisma.ClienteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClienteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>[]
          }
          delete: {
            args: Prisma.ClienteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          update: {
            args: Prisma.ClienteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          deleteMany: {
            args: Prisma.ClienteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClienteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ClienteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientePayload>
          }
          aggregate: {
            args: Prisma.ClienteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCliente>
          }
          groupBy: {
            args: Prisma.ClienteGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClienteGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClienteCountArgs<ExtArgs>
            result: $Utils.Optional<ClienteCountAggregateOutputType> | number
          }
        }
      }
      Producto: {
        payload: Prisma.$ProductoPayload<ExtArgs>
        fields: Prisma.ProductoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload>
          }
          findFirst: {
            args: Prisma.ProductoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload>
          }
          findMany: {
            args: Prisma.ProductoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload>[]
          }
          create: {
            args: Prisma.ProductoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload>
          }
          createMany: {
            args: Prisma.ProductoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload>[]
          }
          delete: {
            args: Prisma.ProductoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload>
          }
          update: {
            args: Prisma.ProductoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload>
          }
          deleteMany: {
            args: Prisma.ProductoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductoPayload>
          }
          aggregate: {
            args: Prisma.ProductoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProducto>
          }
          groupBy: {
            args: Prisma.ProductoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductoCountArgs<ExtArgs>
            result: $Utils.Optional<ProductoCountAggregateOutputType> | number
          }
        }
      }
      Factura: {
        payload: Prisma.$FacturaPayload<ExtArgs>
        fields: Prisma.FacturaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FacturaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FacturaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          findFirst: {
            args: Prisma.FacturaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FacturaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          findMany: {
            args: Prisma.FacturaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>[]
          }
          create: {
            args: Prisma.FacturaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          createMany: {
            args: Prisma.FacturaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FacturaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>[]
          }
          delete: {
            args: Prisma.FacturaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          update: {
            args: Prisma.FacturaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          deleteMany: {
            args: Prisma.FacturaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FacturaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.FacturaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FacturaPayload>
          }
          aggregate: {
            args: Prisma.FacturaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFactura>
          }
          groupBy: {
            args: Prisma.FacturaGroupByArgs<ExtArgs>
            result: $Utils.Optional<FacturaGroupByOutputType>[]
          }
          count: {
            args: Prisma.FacturaCountArgs<ExtArgs>
            result: $Utils.Optional<FacturaCountAggregateOutputType> | number
          }
        }
      }
      ItemFactura: {
        payload: Prisma.$ItemFacturaPayload<ExtArgs>
        fields: Prisma.ItemFacturaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ItemFacturaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ItemFacturaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload>
          }
          findFirst: {
            args: Prisma.ItemFacturaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ItemFacturaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload>
          }
          findMany: {
            args: Prisma.ItemFacturaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload>[]
          }
          create: {
            args: Prisma.ItemFacturaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload>
          }
          createMany: {
            args: Prisma.ItemFacturaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ItemFacturaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload>[]
          }
          delete: {
            args: Prisma.ItemFacturaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload>
          }
          update: {
            args: Prisma.ItemFacturaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload>
          }
          deleteMany: {
            args: Prisma.ItemFacturaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ItemFacturaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ItemFacturaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemFacturaPayload>
          }
          aggregate: {
            args: Prisma.ItemFacturaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateItemFactura>
          }
          groupBy: {
            args: Prisma.ItemFacturaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ItemFacturaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ItemFacturaCountArgs<ExtArgs>
            result: $Utils.Optional<ItemFacturaCountAggregateOutputType> | number
          }
        }
      }
      Pago: {
        payload: Prisma.$PagoPayload<ExtArgs>
        fields: Prisma.PagoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PagoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PagoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload>
          }
          findFirst: {
            args: Prisma.PagoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PagoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload>
          }
          findMany: {
            args: Prisma.PagoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload>[]
          }
          create: {
            args: Prisma.PagoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload>
          }
          createMany: {
            args: Prisma.PagoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PagoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload>[]
          }
          delete: {
            args: Prisma.PagoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload>
          }
          update: {
            args: Prisma.PagoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload>
          }
          deleteMany: {
            args: Prisma.PagoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PagoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PagoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagoPayload>
          }
          aggregate: {
            args: Prisma.PagoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePago>
          }
          groupBy: {
            args: Prisma.PagoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PagoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PagoCountArgs<ExtArgs>
            result: $Utils.Optional<PagoCountAggregateOutputType> | number
          }
        }
      }
      Correlativo: {
        payload: Prisma.$CorrelativoPayload<ExtArgs>
        fields: Prisma.CorrelativoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CorrelativoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CorrelativoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload>
          }
          findFirst: {
            args: Prisma.CorrelativoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CorrelativoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload>
          }
          findMany: {
            args: Prisma.CorrelativoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload>[]
          }
          create: {
            args: Prisma.CorrelativoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload>
          }
          createMany: {
            args: Prisma.CorrelativoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CorrelativoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload>[]
          }
          delete: {
            args: Prisma.CorrelativoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload>
          }
          update: {
            args: Prisma.CorrelativoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload>
          }
          deleteMany: {
            args: Prisma.CorrelativoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CorrelativoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CorrelativoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CorrelativoPayload>
          }
          aggregate: {
            args: Prisma.CorrelativoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCorrelativo>
          }
          groupBy: {
            args: Prisma.CorrelativoGroupByArgs<ExtArgs>
            result: $Utils.Optional<CorrelativoGroupByOutputType>[]
          }
          count: {
            args: Prisma.CorrelativoCountArgs<ExtArgs>
            result: $Utils.Optional<CorrelativoCountAggregateOutputType> | number
          }
        }
      }
      CierreCaja: {
        payload: Prisma.$CierreCajaPayload<ExtArgs>
        fields: Prisma.CierreCajaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CierreCajaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CierreCajaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload>
          }
          findFirst: {
            args: Prisma.CierreCajaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CierreCajaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload>
          }
          findMany: {
            args: Prisma.CierreCajaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload>[]
          }
          create: {
            args: Prisma.CierreCajaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload>
          }
          createMany: {
            args: Prisma.CierreCajaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CierreCajaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload>[]
          }
          delete: {
            args: Prisma.CierreCajaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload>
          }
          update: {
            args: Prisma.CierreCajaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload>
          }
          deleteMany: {
            args: Prisma.CierreCajaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CierreCajaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CierreCajaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CierreCajaPayload>
          }
          aggregate: {
            args: Prisma.CierreCajaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCierreCaja>
          }
          groupBy: {
            args: Prisma.CierreCajaGroupByArgs<ExtArgs>
            result: $Utils.Optional<CierreCajaGroupByOutputType>[]
          }
          count: {
            args: Prisma.CierreCajaCountArgs<ExtArgs>
            result: $Utils.Optional<CierreCajaCountAggregateOutputType> | number
          }
        }
      }
      Cotizacion: {
        payload: Prisma.$CotizacionPayload<ExtArgs>
        fields: Prisma.CotizacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CotizacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CotizacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          findFirst: {
            args: Prisma.CotizacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CotizacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          findMany: {
            args: Prisma.CotizacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>[]
          }
          create: {
            args: Prisma.CotizacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          createMany: {
            args: Prisma.CotizacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CotizacionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>[]
          }
          delete: {
            args: Prisma.CotizacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          update: {
            args: Prisma.CotizacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          deleteMany: {
            args: Prisma.CotizacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CotizacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CotizacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CotizacionPayload>
          }
          aggregate: {
            args: Prisma.CotizacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCotizacion>
          }
          groupBy: {
            args: Prisma.CotizacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<CotizacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.CotizacionCountArgs<ExtArgs>
            result: $Utils.Optional<CotizacionCountAggregateOutputType> | number
          }
        }
      }
      ItemCotizacion: {
        payload: Prisma.$ItemCotizacionPayload<ExtArgs>
        fields: Prisma.ItemCotizacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ItemCotizacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ItemCotizacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload>
          }
          findFirst: {
            args: Prisma.ItemCotizacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ItemCotizacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload>
          }
          findMany: {
            args: Prisma.ItemCotizacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload>[]
          }
          create: {
            args: Prisma.ItemCotizacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload>
          }
          createMany: {
            args: Prisma.ItemCotizacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ItemCotizacionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload>[]
          }
          delete: {
            args: Prisma.ItemCotizacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload>
          }
          update: {
            args: Prisma.ItemCotizacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload>
          }
          deleteMany: {
            args: Prisma.ItemCotizacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ItemCotizacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ItemCotizacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCotizacionPayload>
          }
          aggregate: {
            args: Prisma.ItemCotizacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateItemCotizacion>
          }
          groupBy: {
            args: Prisma.ItemCotizacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ItemCotizacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ItemCotizacionCountArgs<ExtArgs>
            result: $Utils.Optional<ItemCotizacionCountAggregateOutputType> | number
          }
        }
      }
      Usuario: {
        payload: Prisma.$UsuarioPayload<ExtArgs>
        fields: Prisma.UsuarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsuarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsuarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findFirst: {
            args: Prisma.UsuarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsuarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findMany: {
            args: Prisma.UsuarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          create: {
            args: Prisma.UsuarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          createMany: {
            args: Prisma.UsuarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsuarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          delete: {
            args: Prisma.UsuarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          update: {
            args: Prisma.UsuarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          deleteMany: {
            args: Prisma.UsuarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsuarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UsuarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          aggregate: {
            args: Prisma.UsuarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsuario>
          }
          groupBy: {
            args: Prisma.UsuarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsuarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsuarioCountArgs<ExtArgs>
            result: $Utils.Optional<UsuarioCountAggregateOutputType> | number
          }
        }
      }
      SolicitudActivacion: {
        payload: Prisma.$SolicitudActivacionPayload<ExtArgs>
        fields: Prisma.SolicitudActivacionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SolicitudActivacionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SolicitudActivacionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload>
          }
          findFirst: {
            args: Prisma.SolicitudActivacionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SolicitudActivacionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload>
          }
          findMany: {
            args: Prisma.SolicitudActivacionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload>[]
          }
          create: {
            args: Prisma.SolicitudActivacionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload>
          }
          createMany: {
            args: Prisma.SolicitudActivacionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SolicitudActivacionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload>[]
          }
          delete: {
            args: Prisma.SolicitudActivacionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload>
          }
          update: {
            args: Prisma.SolicitudActivacionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload>
          }
          deleteMany: {
            args: Prisma.SolicitudActivacionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SolicitudActivacionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SolicitudActivacionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SolicitudActivacionPayload>
          }
          aggregate: {
            args: Prisma.SolicitudActivacionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSolicitudActivacion>
          }
          groupBy: {
            args: Prisma.SolicitudActivacionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SolicitudActivacionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SolicitudActivacionCountArgs<ExtArgs>
            result: $Utils.Optional<SolicitudActivacionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ClienteCountOutputType
   */

  export type ClienteCountOutputType = {
    facturas: number
    cotizaciones: number
  }

  export type ClienteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    facturas?: boolean | ClienteCountOutputTypeCountFacturasArgs
    cotizaciones?: boolean | ClienteCountOutputTypeCountCotizacionesArgs
  }

  // Custom InputTypes
  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClienteCountOutputType
     */
    select?: ClienteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountFacturasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FacturaWhereInput
  }

  /**
   * ClienteCountOutputType without action
   */
  export type ClienteCountOutputTypeCountCotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
  }


  /**
   * Count Type ProductoCountOutputType
   */

  export type ProductoCountOutputType = {
    itemsFactura: number
  }

  export type ProductoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    itemsFactura?: boolean | ProductoCountOutputTypeCountItemsFacturaArgs
  }

  // Custom InputTypes
  /**
   * ProductoCountOutputType without action
   */
  export type ProductoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductoCountOutputType
     */
    select?: ProductoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductoCountOutputType without action
   */
  export type ProductoCountOutputTypeCountItemsFacturaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemFacturaWhereInput
  }


  /**
   * Count Type FacturaCountOutputType
   */

  export type FacturaCountOutputType = {
    items: number
    pagos: number
  }

  export type FacturaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | FacturaCountOutputTypeCountItemsArgs
    pagos?: boolean | FacturaCountOutputTypeCountPagosArgs
  }

  // Custom InputTypes
  /**
   * FacturaCountOutputType without action
   */
  export type FacturaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FacturaCountOutputType
     */
    select?: FacturaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FacturaCountOutputType without action
   */
  export type FacturaCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemFacturaWhereInput
  }

  /**
   * FacturaCountOutputType without action
   */
  export type FacturaCountOutputTypeCountPagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PagoWhereInput
  }


  /**
   * Count Type CotizacionCountOutputType
   */

  export type CotizacionCountOutputType = {
    items: number
  }

  export type CotizacionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | CotizacionCountOutputTypeCountItemsArgs
  }

  // Custom InputTypes
  /**
   * CotizacionCountOutputType without action
   */
  export type CotizacionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CotizacionCountOutputType
     */
    select?: CotizacionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CotizacionCountOutputType without action
   */
  export type CotizacionCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemCotizacionWhereInput
  }


  /**
   * Count Type UsuarioCountOutputType
   */

  export type UsuarioCountOutputType = {
    subUsuarios: number
    productos: number
    clientes: number
    facturas: number
    cierresCaja: number
    cotizaciones: number
    solicitudesActivacion: number
  }

  export type UsuarioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subUsuarios?: boolean | UsuarioCountOutputTypeCountSubUsuariosArgs
    productos?: boolean | UsuarioCountOutputTypeCountProductosArgs
    clientes?: boolean | UsuarioCountOutputTypeCountClientesArgs
    facturas?: boolean | UsuarioCountOutputTypeCountFacturasArgs
    cierresCaja?: boolean | UsuarioCountOutputTypeCountCierresCajaArgs
    cotizaciones?: boolean | UsuarioCountOutputTypeCountCotizacionesArgs
    solicitudesActivacion?: boolean | UsuarioCountOutputTypeCountSolicitudesActivacionArgs
  }

  // Custom InputTypes
  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioCountOutputType
     */
    select?: UsuarioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountSubUsuariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsuarioWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountProductosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductoWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountClientesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountFacturasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FacturaWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountCierresCajaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CierreCajaWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountCotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountSolicitudesActivacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SolicitudActivacionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Cliente
   */

  export type AggregateCliente = {
    _count: ClienteCountAggregateOutputType | null
    _min: ClienteMinAggregateOutputType | null
    _max: ClienteMaxAggregateOutputType | null
  }

  export type ClienteMinAggregateOutputType = {
    id: string | null
    razonSocial: string | null
    rifCedula: string | null
    direccion: string | null
    telefono: string | null
    correo: string | null
    empresaId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClienteMaxAggregateOutputType = {
    id: string | null
    razonSocial: string | null
    rifCedula: string | null
    direccion: string | null
    telefono: string | null
    correo: string | null
    empresaId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClienteCountAggregateOutputType = {
    id: number
    razonSocial: number
    rifCedula: number
    direccion: number
    telefono: number
    correo: number
    empresaId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ClienteMinAggregateInputType = {
    id?: true
    razonSocial?: true
    rifCedula?: true
    direccion?: true
    telefono?: true
    correo?: true
    empresaId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClienteMaxAggregateInputType = {
    id?: true
    razonSocial?: true
    rifCedula?: true
    direccion?: true
    telefono?: true
    correo?: true
    empresaId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClienteCountAggregateInputType = {
    id?: true
    razonSocial?: true
    rifCedula?: true
    direccion?: true
    telefono?: true
    correo?: true
    empresaId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ClienteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cliente to aggregate.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Clientes
    **/
    _count?: true | ClienteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClienteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClienteMaxAggregateInputType
  }

  export type GetClienteAggregateType<T extends ClienteAggregateArgs> = {
        [P in keyof T & keyof AggregateCliente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCliente[P]>
      : GetScalarType<T[P], AggregateCliente[P]>
  }




  export type ClienteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClienteWhereInput
    orderBy?: ClienteOrderByWithAggregationInput | ClienteOrderByWithAggregationInput[]
    by: ClienteScalarFieldEnum[] | ClienteScalarFieldEnum
    having?: ClienteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClienteCountAggregateInputType | true
    _min?: ClienteMinAggregateInputType
    _max?: ClienteMaxAggregateInputType
  }

  export type ClienteGroupByOutputType = {
    id: string
    razonSocial: string
    rifCedula: string
    direccion: string | null
    telefono: string | null
    correo: string | null
    empresaId: string | null
    createdAt: Date
    updatedAt: Date
    _count: ClienteCountAggregateOutputType | null
    _min: ClienteMinAggregateOutputType | null
    _max: ClienteMaxAggregateOutputType | null
  }

  type GetClienteGroupByPayload<T extends ClienteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClienteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClienteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClienteGroupByOutputType[P]>
            : GetScalarType<T[P], ClienteGroupByOutputType[P]>
        }
      >
    >


  export type ClienteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    razonSocial?: boolean
    rifCedula?: boolean
    direccion?: boolean
    telefono?: boolean
    correo?: boolean
    empresaId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    empresa?: boolean | Cliente$empresaArgs<ExtArgs>
    facturas?: boolean | Cliente$facturasArgs<ExtArgs>
    cotizaciones?: boolean | Cliente$cotizacionesArgs<ExtArgs>
    _count?: boolean | ClienteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    razonSocial?: boolean
    rifCedula?: boolean
    direccion?: boolean
    telefono?: boolean
    correo?: boolean
    empresaId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    empresa?: boolean | Cliente$empresaArgs<ExtArgs>
  }, ExtArgs["result"]["cliente"]>

  export type ClienteSelectScalar = {
    id?: boolean
    razonSocial?: boolean
    rifCedula?: boolean
    direccion?: boolean
    telefono?: boolean
    correo?: boolean
    empresaId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ClienteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresa?: boolean | Cliente$empresaArgs<ExtArgs>
    facturas?: boolean | Cliente$facturasArgs<ExtArgs>
    cotizaciones?: boolean | Cliente$cotizacionesArgs<ExtArgs>
    _count?: boolean | ClienteCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClienteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresa?: boolean | Cliente$empresaArgs<ExtArgs>
  }

  export type $ClientePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cliente"
    objects: {
      empresa: Prisma.$UsuarioPayload<ExtArgs> | null
      facturas: Prisma.$FacturaPayload<ExtArgs>[]
      cotizaciones: Prisma.$CotizacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      razonSocial: string
      rifCedula: string
      direccion: string | null
      telefono: string | null
      correo: string | null
      empresaId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["cliente"]>
    composites: {}
  }

  type ClienteGetPayload<S extends boolean | null | undefined | ClienteDefaultArgs> = $Result.GetResult<Prisma.$ClientePayload, S>

  type ClienteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ClienteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ClienteCountAggregateInputType | true
    }

  export interface ClienteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cliente'], meta: { name: 'Cliente' } }
    /**
     * Find zero or one Cliente that matches the filter.
     * @param {ClienteFindUniqueArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClienteFindUniqueArgs>(args: SelectSubset<T, ClienteFindUniqueArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Cliente that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ClienteFindUniqueOrThrowArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClienteFindUniqueOrThrowArgs>(args: SelectSubset<T, ClienteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Cliente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindFirstArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClienteFindFirstArgs>(args?: SelectSubset<T, ClienteFindFirstArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Cliente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindFirstOrThrowArgs} args - Arguments to find a Cliente
     * @example
     * // Get one Cliente
     * const cliente = await prisma.cliente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClienteFindFirstOrThrowArgs>(args?: SelectSubset<T, ClienteFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Clientes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Clientes
     * const clientes = await prisma.cliente.findMany()
     * 
     * // Get first 10 Clientes
     * const clientes = await prisma.cliente.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clienteWithIdOnly = await prisma.cliente.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClienteFindManyArgs>(args?: SelectSubset<T, ClienteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Cliente.
     * @param {ClienteCreateArgs} args - Arguments to create a Cliente.
     * @example
     * // Create one Cliente
     * const Cliente = await prisma.cliente.create({
     *   data: {
     *     // ... data to create a Cliente
     *   }
     * })
     * 
     */
    create<T extends ClienteCreateArgs>(args: SelectSubset<T, ClienteCreateArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Clientes.
     * @param {ClienteCreateManyArgs} args - Arguments to create many Clientes.
     * @example
     * // Create many Clientes
     * const cliente = await prisma.cliente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClienteCreateManyArgs>(args?: SelectSubset<T, ClienteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Clientes and returns the data saved in the database.
     * @param {ClienteCreateManyAndReturnArgs} args - Arguments to create many Clientes.
     * @example
     * // Create many Clientes
     * const cliente = await prisma.cliente.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Clientes and only return the `id`
     * const clienteWithIdOnly = await prisma.cliente.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClienteCreateManyAndReturnArgs>(args?: SelectSubset<T, ClienteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Cliente.
     * @param {ClienteDeleteArgs} args - Arguments to delete one Cliente.
     * @example
     * // Delete one Cliente
     * const Cliente = await prisma.cliente.delete({
     *   where: {
     *     // ... filter to delete one Cliente
     *   }
     * })
     * 
     */
    delete<T extends ClienteDeleteArgs>(args: SelectSubset<T, ClienteDeleteArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Cliente.
     * @param {ClienteUpdateArgs} args - Arguments to update one Cliente.
     * @example
     * // Update one Cliente
     * const cliente = await prisma.cliente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClienteUpdateArgs>(args: SelectSubset<T, ClienteUpdateArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Clientes.
     * @param {ClienteDeleteManyArgs} args - Arguments to filter Clientes to delete.
     * @example
     * // Delete a few Clientes
     * const { count } = await prisma.cliente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClienteDeleteManyArgs>(args?: SelectSubset<T, ClienteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Clientes
     * const cliente = await prisma.cliente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClienteUpdateManyArgs>(args: SelectSubset<T, ClienteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Cliente.
     * @param {ClienteUpsertArgs} args - Arguments to update or create a Cliente.
     * @example
     * // Update or create a Cliente
     * const cliente = await prisma.cliente.upsert({
     *   create: {
     *     // ... data to create a Cliente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cliente we want to update
     *   }
     * })
     */
    upsert<T extends ClienteUpsertArgs>(args: SelectSubset<T, ClienteUpsertArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Clientes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteCountArgs} args - Arguments to filter Clientes to count.
     * @example
     * // Count the number of Clientes
     * const count = await prisma.cliente.count({
     *   where: {
     *     // ... the filter for the Clientes we want to count
     *   }
     * })
    **/
    count<T extends ClienteCountArgs>(
      args?: Subset<T, ClienteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClienteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cliente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClienteAggregateArgs>(args: Subset<T, ClienteAggregateArgs>): Prisma.PrismaPromise<GetClienteAggregateType<T>>

    /**
     * Group by Cliente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClienteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClienteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClienteGroupByArgs['orderBy'] }
        : { orderBy?: ClienteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClienteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClienteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cliente model
   */
  readonly fields: ClienteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cliente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClienteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empresa<T extends Cliente$empresaArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$empresaArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    facturas<T extends Cliente$facturasArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$facturasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findMany"> | Null>
    cotizaciones<T extends Cliente$cotizacionesArgs<ExtArgs> = {}>(args?: Subset<T, Cliente$cotizacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cliente model
   */ 
  interface ClienteFieldRefs {
    readonly id: FieldRef<"Cliente", 'String'>
    readonly razonSocial: FieldRef<"Cliente", 'String'>
    readonly rifCedula: FieldRef<"Cliente", 'String'>
    readonly direccion: FieldRef<"Cliente", 'String'>
    readonly telefono: FieldRef<"Cliente", 'String'>
    readonly correo: FieldRef<"Cliente", 'String'>
    readonly empresaId: FieldRef<"Cliente", 'String'>
    readonly createdAt: FieldRef<"Cliente", 'DateTime'>
    readonly updatedAt: FieldRef<"Cliente", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Cliente findUnique
   */
  export type ClienteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente findUniqueOrThrow
   */
  export type ClienteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente findFirst
   */
  export type ClienteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clientes.
     */
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente findFirstOrThrow
   */
  export type ClienteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Cliente to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clientes.
     */
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente findMany
   */
  export type ClienteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter, which Clientes to fetch.
     */
    where?: ClienteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clientes to fetch.
     */
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Clientes.
     */
    cursor?: ClienteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clientes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clientes.
     */
    skip?: number
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Cliente create
   */
  export type ClienteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The data needed to create a Cliente.
     */
    data: XOR<ClienteCreateInput, ClienteUncheckedCreateInput>
  }

  /**
   * Cliente createMany
   */
  export type ClienteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Clientes.
     */
    data: ClienteCreateManyInput | ClienteCreateManyInput[]
  }

  /**
   * Cliente createManyAndReturn
   */
  export type ClienteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Clientes.
     */
    data: ClienteCreateManyInput | ClienteCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cliente update
   */
  export type ClienteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The data needed to update a Cliente.
     */
    data: XOR<ClienteUpdateInput, ClienteUncheckedUpdateInput>
    /**
     * Choose, which Cliente to update.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente updateMany
   */
  export type ClienteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Clientes.
     */
    data: XOR<ClienteUpdateManyMutationInput, ClienteUncheckedUpdateManyInput>
    /**
     * Filter which Clientes to update
     */
    where?: ClienteWhereInput
  }

  /**
   * Cliente upsert
   */
  export type ClienteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * The filter to search for the Cliente to update in case it exists.
     */
    where: ClienteWhereUniqueInput
    /**
     * In case the Cliente found by the `where` argument doesn't exist, create a new Cliente with this data.
     */
    create: XOR<ClienteCreateInput, ClienteUncheckedCreateInput>
    /**
     * In case the Cliente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClienteUpdateInput, ClienteUncheckedUpdateInput>
  }

  /**
   * Cliente delete
   */
  export type ClienteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    /**
     * Filter which Cliente to delete.
     */
    where: ClienteWhereUniqueInput
  }

  /**
   * Cliente deleteMany
   */
  export type ClienteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Clientes to delete
     */
    where?: ClienteWhereInput
  }

  /**
   * Cliente.empresa
   */
  export type Cliente$empresaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
  }

  /**
   * Cliente.facturas
   */
  export type Cliente$facturasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    where?: FacturaWhereInput
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    cursor?: FacturaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Cliente.cotizaciones
   */
  export type Cliente$cotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    cursor?: CotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cliente without action
   */
  export type ClienteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
  }


  /**
   * Model Producto
   */

  export type AggregateProducto = {
    _count: ProductoCountAggregateOutputType | null
    _avg: ProductoAvgAggregateOutputType | null
    _sum: ProductoSumAggregateOutputType | null
    _min: ProductoMinAggregateOutputType | null
    _max: ProductoMaxAggregateOutputType | null
  }

  export type ProductoAvgAggregateOutputType = {
    stockActual: number | null
    stockMinimo: number | null
    precioVenta: number | null
    costoCompra: number | null
    tasaImpuesto: number | null
  }

  export type ProductoSumAggregateOutputType = {
    stockActual: number | null
    stockMinimo: number | null
    precioVenta: number | null
    costoCompra: number | null
    tasaImpuesto: number | null
  }

  export type ProductoMinAggregateOutputType = {
    id: string | null
    sku: string | null
    nombre: string | null
    descripcion: string | null
    stockActual: number | null
    stockMinimo: number | null
    precioVenta: number | null
    costoCompra: number | null
    tasaImpuesto: number | null
    categoria: string | null
    activo: boolean | null
    empresaId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductoMaxAggregateOutputType = {
    id: string | null
    sku: string | null
    nombre: string | null
    descripcion: string | null
    stockActual: number | null
    stockMinimo: number | null
    precioVenta: number | null
    costoCompra: number | null
    tasaImpuesto: number | null
    categoria: string | null
    activo: boolean | null
    empresaId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductoCountAggregateOutputType = {
    id: number
    sku: number
    nombre: number
    descripcion: number
    stockActual: number
    stockMinimo: number
    precioVenta: number
    costoCompra: number
    tasaImpuesto: number
    categoria: number
    activo: number
    empresaId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProductoAvgAggregateInputType = {
    stockActual?: true
    stockMinimo?: true
    precioVenta?: true
    costoCompra?: true
    tasaImpuesto?: true
  }

  export type ProductoSumAggregateInputType = {
    stockActual?: true
    stockMinimo?: true
    precioVenta?: true
    costoCompra?: true
    tasaImpuesto?: true
  }

  export type ProductoMinAggregateInputType = {
    id?: true
    sku?: true
    nombre?: true
    descripcion?: true
    stockActual?: true
    stockMinimo?: true
    precioVenta?: true
    costoCompra?: true
    tasaImpuesto?: true
    categoria?: true
    activo?: true
    empresaId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductoMaxAggregateInputType = {
    id?: true
    sku?: true
    nombre?: true
    descripcion?: true
    stockActual?: true
    stockMinimo?: true
    precioVenta?: true
    costoCompra?: true
    tasaImpuesto?: true
    categoria?: true
    activo?: true
    empresaId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductoCountAggregateInputType = {
    id?: true
    sku?: true
    nombre?: true
    descripcion?: true
    stockActual?: true
    stockMinimo?: true
    precioVenta?: true
    costoCompra?: true
    tasaImpuesto?: true
    categoria?: true
    activo?: true
    empresaId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Producto to aggregate.
     */
    where?: ProductoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Productos to fetch.
     */
    orderBy?: ProductoOrderByWithRelationInput | ProductoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Productos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Productos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Productos
    **/
    _count?: true | ProductoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductoMaxAggregateInputType
  }

  export type GetProductoAggregateType<T extends ProductoAggregateArgs> = {
        [P in keyof T & keyof AggregateProducto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProducto[P]>
      : GetScalarType<T[P], AggregateProducto[P]>
  }




  export type ProductoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductoWhereInput
    orderBy?: ProductoOrderByWithAggregationInput | ProductoOrderByWithAggregationInput[]
    by: ProductoScalarFieldEnum[] | ProductoScalarFieldEnum
    having?: ProductoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductoCountAggregateInputType | true
    _avg?: ProductoAvgAggregateInputType
    _sum?: ProductoSumAggregateInputType
    _min?: ProductoMinAggregateInputType
    _max?: ProductoMaxAggregateInputType
  }

  export type ProductoGroupByOutputType = {
    id: string
    sku: string
    nombre: string
    descripcion: string | null
    stockActual: number
    stockMinimo: number
    precioVenta: number
    costoCompra: number
    tasaImpuesto: number
    categoria: string
    activo: boolean
    empresaId: string
    createdAt: Date
    updatedAt: Date
    _count: ProductoCountAggregateOutputType | null
    _avg: ProductoAvgAggregateOutputType | null
    _sum: ProductoSumAggregateOutputType | null
    _min: ProductoMinAggregateOutputType | null
    _max: ProductoMaxAggregateOutputType | null
  }

  type GetProductoGroupByPayload<T extends ProductoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductoGroupByOutputType[P]>
            : GetScalarType<T[P], ProductoGroupByOutputType[P]>
        }
      >
    >


  export type ProductoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sku?: boolean
    nombre?: boolean
    descripcion?: boolean
    stockActual?: boolean
    stockMinimo?: boolean
    precioVenta?: boolean
    costoCompra?: boolean
    tasaImpuesto?: boolean
    categoria?: boolean
    activo?: boolean
    empresaId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    empresa?: boolean | UsuarioDefaultArgs<ExtArgs>
    itemsFactura?: boolean | Producto$itemsFacturaArgs<ExtArgs>
    _count?: boolean | ProductoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["producto"]>

  export type ProductoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sku?: boolean
    nombre?: boolean
    descripcion?: boolean
    stockActual?: boolean
    stockMinimo?: boolean
    precioVenta?: boolean
    costoCompra?: boolean
    tasaImpuesto?: boolean
    categoria?: boolean
    activo?: boolean
    empresaId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    empresa?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["producto"]>

  export type ProductoSelectScalar = {
    id?: boolean
    sku?: boolean
    nombre?: boolean
    descripcion?: boolean
    stockActual?: boolean
    stockMinimo?: boolean
    precioVenta?: boolean
    costoCompra?: boolean
    tasaImpuesto?: boolean
    categoria?: boolean
    activo?: boolean
    empresaId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProductoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresa?: boolean | UsuarioDefaultArgs<ExtArgs>
    itemsFactura?: boolean | Producto$itemsFacturaArgs<ExtArgs>
    _count?: boolean | ProductoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProductoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresa?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $ProductoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Producto"
    objects: {
      empresa: Prisma.$UsuarioPayload<ExtArgs>
      itemsFactura: Prisma.$ItemFacturaPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sku: string
      nombre: string
      descripcion: string | null
      stockActual: number
      stockMinimo: number
      precioVenta: number
      costoCompra: number
      tasaImpuesto: number
      categoria: string
      activo: boolean
      empresaId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["producto"]>
    composites: {}
  }

  type ProductoGetPayload<S extends boolean | null | undefined | ProductoDefaultArgs> = $Result.GetResult<Prisma.$ProductoPayload, S>

  type ProductoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductoCountAggregateInputType | true
    }

  export interface ProductoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Producto'], meta: { name: 'Producto' } }
    /**
     * Find zero or one Producto that matches the filter.
     * @param {ProductoFindUniqueArgs} args - Arguments to find a Producto
     * @example
     * // Get one Producto
     * const producto = await prisma.producto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductoFindUniqueArgs>(args: SelectSubset<T, ProductoFindUniqueArgs<ExtArgs>>): Prisma__ProductoClient<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Producto that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductoFindUniqueOrThrowArgs} args - Arguments to find a Producto
     * @example
     * // Get one Producto
     * const producto = await prisma.producto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductoFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductoClient<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Producto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductoFindFirstArgs} args - Arguments to find a Producto
     * @example
     * // Get one Producto
     * const producto = await prisma.producto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductoFindFirstArgs>(args?: SelectSubset<T, ProductoFindFirstArgs<ExtArgs>>): Prisma__ProductoClient<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Producto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductoFindFirstOrThrowArgs} args - Arguments to find a Producto
     * @example
     * // Get one Producto
     * const producto = await prisma.producto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductoFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductoClient<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Productos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Productos
     * const productos = await prisma.producto.findMany()
     * 
     * // Get first 10 Productos
     * const productos = await prisma.producto.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productoWithIdOnly = await prisma.producto.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductoFindManyArgs>(args?: SelectSubset<T, ProductoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Producto.
     * @param {ProductoCreateArgs} args - Arguments to create a Producto.
     * @example
     * // Create one Producto
     * const Producto = await prisma.producto.create({
     *   data: {
     *     // ... data to create a Producto
     *   }
     * })
     * 
     */
    create<T extends ProductoCreateArgs>(args: SelectSubset<T, ProductoCreateArgs<ExtArgs>>): Prisma__ProductoClient<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Productos.
     * @param {ProductoCreateManyArgs} args - Arguments to create many Productos.
     * @example
     * // Create many Productos
     * const producto = await prisma.producto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductoCreateManyArgs>(args?: SelectSubset<T, ProductoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Productos and returns the data saved in the database.
     * @param {ProductoCreateManyAndReturnArgs} args - Arguments to create many Productos.
     * @example
     * // Create many Productos
     * const producto = await prisma.producto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Productos and only return the `id`
     * const productoWithIdOnly = await prisma.producto.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductoCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Producto.
     * @param {ProductoDeleteArgs} args - Arguments to delete one Producto.
     * @example
     * // Delete one Producto
     * const Producto = await prisma.producto.delete({
     *   where: {
     *     // ... filter to delete one Producto
     *   }
     * })
     * 
     */
    delete<T extends ProductoDeleteArgs>(args: SelectSubset<T, ProductoDeleteArgs<ExtArgs>>): Prisma__ProductoClient<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Producto.
     * @param {ProductoUpdateArgs} args - Arguments to update one Producto.
     * @example
     * // Update one Producto
     * const producto = await prisma.producto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductoUpdateArgs>(args: SelectSubset<T, ProductoUpdateArgs<ExtArgs>>): Prisma__ProductoClient<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Productos.
     * @param {ProductoDeleteManyArgs} args - Arguments to filter Productos to delete.
     * @example
     * // Delete a few Productos
     * const { count } = await prisma.producto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductoDeleteManyArgs>(args?: SelectSubset<T, ProductoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Productos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Productos
     * const producto = await prisma.producto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductoUpdateManyArgs>(args: SelectSubset<T, ProductoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Producto.
     * @param {ProductoUpsertArgs} args - Arguments to update or create a Producto.
     * @example
     * // Update or create a Producto
     * const producto = await prisma.producto.upsert({
     *   create: {
     *     // ... data to create a Producto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Producto we want to update
     *   }
     * })
     */
    upsert<T extends ProductoUpsertArgs>(args: SelectSubset<T, ProductoUpsertArgs<ExtArgs>>): Prisma__ProductoClient<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Productos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductoCountArgs} args - Arguments to filter Productos to count.
     * @example
     * // Count the number of Productos
     * const count = await prisma.producto.count({
     *   where: {
     *     // ... the filter for the Productos we want to count
     *   }
     * })
    **/
    count<T extends ProductoCountArgs>(
      args?: Subset<T, ProductoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Producto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductoAggregateArgs>(args: Subset<T, ProductoAggregateArgs>): Prisma.PrismaPromise<GetProductoAggregateType<T>>

    /**
     * Group by Producto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductoGroupByArgs['orderBy'] }
        : { orderBy?: ProductoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Producto model
   */
  readonly fields: ProductoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Producto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empresa<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    itemsFactura<T extends Producto$itemsFacturaArgs<ExtArgs> = {}>(args?: Subset<T, Producto$itemsFacturaArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Producto model
   */ 
  interface ProductoFieldRefs {
    readonly id: FieldRef<"Producto", 'String'>
    readonly sku: FieldRef<"Producto", 'String'>
    readonly nombre: FieldRef<"Producto", 'String'>
    readonly descripcion: FieldRef<"Producto", 'String'>
    readonly stockActual: FieldRef<"Producto", 'Int'>
    readonly stockMinimo: FieldRef<"Producto", 'Int'>
    readonly precioVenta: FieldRef<"Producto", 'Float'>
    readonly costoCompra: FieldRef<"Producto", 'Float'>
    readonly tasaImpuesto: FieldRef<"Producto", 'Float'>
    readonly categoria: FieldRef<"Producto", 'String'>
    readonly activo: FieldRef<"Producto", 'Boolean'>
    readonly empresaId: FieldRef<"Producto", 'String'>
    readonly createdAt: FieldRef<"Producto", 'DateTime'>
    readonly updatedAt: FieldRef<"Producto", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Producto findUnique
   */
  export type ProductoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    /**
     * Filter, which Producto to fetch.
     */
    where: ProductoWhereUniqueInput
  }

  /**
   * Producto findUniqueOrThrow
   */
  export type ProductoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    /**
     * Filter, which Producto to fetch.
     */
    where: ProductoWhereUniqueInput
  }

  /**
   * Producto findFirst
   */
  export type ProductoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    /**
     * Filter, which Producto to fetch.
     */
    where?: ProductoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Productos to fetch.
     */
    orderBy?: ProductoOrderByWithRelationInput | ProductoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Productos.
     */
    cursor?: ProductoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Productos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Productos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Productos.
     */
    distinct?: ProductoScalarFieldEnum | ProductoScalarFieldEnum[]
  }

  /**
   * Producto findFirstOrThrow
   */
  export type ProductoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    /**
     * Filter, which Producto to fetch.
     */
    where?: ProductoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Productos to fetch.
     */
    orderBy?: ProductoOrderByWithRelationInput | ProductoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Productos.
     */
    cursor?: ProductoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Productos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Productos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Productos.
     */
    distinct?: ProductoScalarFieldEnum | ProductoScalarFieldEnum[]
  }

  /**
   * Producto findMany
   */
  export type ProductoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    /**
     * Filter, which Productos to fetch.
     */
    where?: ProductoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Productos to fetch.
     */
    orderBy?: ProductoOrderByWithRelationInput | ProductoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Productos.
     */
    cursor?: ProductoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Productos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Productos.
     */
    skip?: number
    distinct?: ProductoScalarFieldEnum | ProductoScalarFieldEnum[]
  }

  /**
   * Producto create
   */
  export type ProductoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    /**
     * The data needed to create a Producto.
     */
    data: XOR<ProductoCreateInput, ProductoUncheckedCreateInput>
  }

  /**
   * Producto createMany
   */
  export type ProductoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Productos.
     */
    data: ProductoCreateManyInput | ProductoCreateManyInput[]
  }

  /**
   * Producto createManyAndReturn
   */
  export type ProductoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Productos.
     */
    data: ProductoCreateManyInput | ProductoCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Producto update
   */
  export type ProductoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    /**
     * The data needed to update a Producto.
     */
    data: XOR<ProductoUpdateInput, ProductoUncheckedUpdateInput>
    /**
     * Choose, which Producto to update.
     */
    where: ProductoWhereUniqueInput
  }

  /**
   * Producto updateMany
   */
  export type ProductoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Productos.
     */
    data: XOR<ProductoUpdateManyMutationInput, ProductoUncheckedUpdateManyInput>
    /**
     * Filter which Productos to update
     */
    where?: ProductoWhereInput
  }

  /**
   * Producto upsert
   */
  export type ProductoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    /**
     * The filter to search for the Producto to update in case it exists.
     */
    where: ProductoWhereUniqueInput
    /**
     * In case the Producto found by the `where` argument doesn't exist, create a new Producto with this data.
     */
    create: XOR<ProductoCreateInput, ProductoUncheckedCreateInput>
    /**
     * In case the Producto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductoUpdateInput, ProductoUncheckedUpdateInput>
  }

  /**
   * Producto delete
   */
  export type ProductoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    /**
     * Filter which Producto to delete.
     */
    where: ProductoWhereUniqueInput
  }

  /**
   * Producto deleteMany
   */
  export type ProductoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Productos to delete
     */
    where?: ProductoWhereInput
  }

  /**
   * Producto.itemsFactura
   */
  export type Producto$itemsFacturaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    where?: ItemFacturaWhereInput
    orderBy?: ItemFacturaOrderByWithRelationInput | ItemFacturaOrderByWithRelationInput[]
    cursor?: ItemFacturaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ItemFacturaScalarFieldEnum | ItemFacturaScalarFieldEnum[]
  }

  /**
   * Producto without action
   */
  export type ProductoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
  }


  /**
   * Model Factura
   */

  export type AggregateFactura = {
    _count: FacturaCountAggregateOutputType | null
    _avg: FacturaAvgAggregateOutputType | null
    _sum: FacturaSumAggregateOutputType | null
    _min: FacturaMinAggregateOutputType | null
    _max: FacturaMaxAggregateOutputType | null
  }

  export type FacturaAvgAggregateOutputType = {
    numeroFactura: number | null
    subtotal: number | null
    impuestoTotal: number | null
    total: number | null
    tasaCambio: number | null
    cuotasTotales: number | null
  }

  export type FacturaSumAggregateOutputType = {
    numeroFactura: number | null
    subtotal: number | null
    impuestoTotal: number | null
    total: number | null
    tasaCambio: number | null
    cuotasTotales: number | null
  }

  export type FacturaMinAggregateOutputType = {
    id: string | null
    numeroFactura: number | null
    clienteId: string | null
    usuarioId: string | null
    fechaEmision: Date | null
    fechaVencimiento: Date | null
    subtotal: number | null
    impuestoTotal: number | null
    total: number | null
    estado: string | null
    moneda: string | null
    tasaCambio: number | null
    cuotasTotales: number | null
    observaciones: string | null
    anuladoPor: string | null
    motivoAnulacion: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FacturaMaxAggregateOutputType = {
    id: string | null
    numeroFactura: number | null
    clienteId: string | null
    usuarioId: string | null
    fechaEmision: Date | null
    fechaVencimiento: Date | null
    subtotal: number | null
    impuestoTotal: number | null
    total: number | null
    estado: string | null
    moneda: string | null
    tasaCambio: number | null
    cuotasTotales: number | null
    observaciones: string | null
    anuladoPor: string | null
    motivoAnulacion: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type FacturaCountAggregateOutputType = {
    id: number
    numeroFactura: number
    clienteId: number
    usuarioId: number
    fechaEmision: number
    fechaVencimiento: number
    subtotal: number
    impuestoTotal: number
    total: number
    estado: number
    moneda: number
    tasaCambio: number
    cuotasTotales: number
    observaciones: number
    anuladoPor: number
    motivoAnulacion: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type FacturaAvgAggregateInputType = {
    numeroFactura?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
    tasaCambio?: true
    cuotasTotales?: true
  }

  export type FacturaSumAggregateInputType = {
    numeroFactura?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
    tasaCambio?: true
    cuotasTotales?: true
  }

  export type FacturaMinAggregateInputType = {
    id?: true
    numeroFactura?: true
    clienteId?: true
    usuarioId?: true
    fechaEmision?: true
    fechaVencimiento?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
    estado?: true
    moneda?: true
    tasaCambio?: true
    cuotasTotales?: true
    observaciones?: true
    anuladoPor?: true
    motivoAnulacion?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FacturaMaxAggregateInputType = {
    id?: true
    numeroFactura?: true
    clienteId?: true
    usuarioId?: true
    fechaEmision?: true
    fechaVencimiento?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
    estado?: true
    moneda?: true
    tasaCambio?: true
    cuotasTotales?: true
    observaciones?: true
    anuladoPor?: true
    motivoAnulacion?: true
    createdAt?: true
    updatedAt?: true
  }

  export type FacturaCountAggregateInputType = {
    id?: true
    numeroFactura?: true
    clienteId?: true
    usuarioId?: true
    fechaEmision?: true
    fechaVencimiento?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
    estado?: true
    moneda?: true
    tasaCambio?: true
    cuotasTotales?: true
    observaciones?: true
    anuladoPor?: true
    motivoAnulacion?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type FacturaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Factura to aggregate.
     */
    where?: FacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Facturas to fetch.
     */
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Facturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Facturas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Facturas
    **/
    _count?: true | FacturaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FacturaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FacturaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FacturaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FacturaMaxAggregateInputType
  }

  export type GetFacturaAggregateType<T extends FacturaAggregateArgs> = {
        [P in keyof T & keyof AggregateFactura]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFactura[P]>
      : GetScalarType<T[P], AggregateFactura[P]>
  }




  export type FacturaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FacturaWhereInput
    orderBy?: FacturaOrderByWithAggregationInput | FacturaOrderByWithAggregationInput[]
    by: FacturaScalarFieldEnum[] | FacturaScalarFieldEnum
    having?: FacturaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FacturaCountAggregateInputType | true
    _avg?: FacturaAvgAggregateInputType
    _sum?: FacturaSumAggregateInputType
    _min?: FacturaMinAggregateInputType
    _max?: FacturaMaxAggregateInputType
  }

  export type FacturaGroupByOutputType = {
    id: string
    numeroFactura: number
    clienteId: string
    usuarioId: string | null
    fechaEmision: Date
    fechaVencimiento: Date
    subtotal: number
    impuestoTotal: number
    total: number
    estado: string
    moneda: string
    tasaCambio: number
    cuotasTotales: number
    observaciones: string | null
    anuladoPor: string | null
    motivoAnulacion: string | null
    createdAt: Date
    updatedAt: Date
    _count: FacturaCountAggregateOutputType | null
    _avg: FacturaAvgAggregateOutputType | null
    _sum: FacturaSumAggregateOutputType | null
    _min: FacturaMinAggregateOutputType | null
    _max: FacturaMaxAggregateOutputType | null
  }

  type GetFacturaGroupByPayload<T extends FacturaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FacturaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FacturaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FacturaGroupByOutputType[P]>
            : GetScalarType<T[P], FacturaGroupByOutputType[P]>
        }
      >
    >


  export type FacturaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    numeroFactura?: boolean
    clienteId?: boolean
    usuarioId?: boolean
    fechaEmision?: boolean
    fechaVencimiento?: boolean
    subtotal?: boolean
    impuestoTotal?: boolean
    total?: boolean
    estado?: boolean
    moneda?: boolean
    tasaCambio?: boolean
    cuotasTotales?: boolean
    observaciones?: boolean
    anuladoPor?: boolean
    motivoAnulacion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    usuario?: boolean | Factura$usuarioArgs<ExtArgs>
    items?: boolean | Factura$itemsArgs<ExtArgs>
    pagos?: boolean | Factura$pagosArgs<ExtArgs>
    _count?: boolean | FacturaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["factura"]>

  export type FacturaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    numeroFactura?: boolean
    clienteId?: boolean
    usuarioId?: boolean
    fechaEmision?: boolean
    fechaVencimiento?: boolean
    subtotal?: boolean
    impuestoTotal?: boolean
    total?: boolean
    estado?: boolean
    moneda?: boolean
    tasaCambio?: boolean
    cuotasTotales?: boolean
    observaciones?: boolean
    anuladoPor?: boolean
    motivoAnulacion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    usuario?: boolean | Factura$usuarioArgs<ExtArgs>
  }, ExtArgs["result"]["factura"]>

  export type FacturaSelectScalar = {
    id?: boolean
    numeroFactura?: boolean
    clienteId?: boolean
    usuarioId?: boolean
    fechaEmision?: boolean
    fechaVencimiento?: boolean
    subtotal?: boolean
    impuestoTotal?: boolean
    total?: boolean
    estado?: boolean
    moneda?: boolean
    tasaCambio?: boolean
    cuotasTotales?: boolean
    observaciones?: boolean
    anuladoPor?: boolean
    motivoAnulacion?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type FacturaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    usuario?: boolean | Factura$usuarioArgs<ExtArgs>
    items?: boolean | Factura$itemsArgs<ExtArgs>
    pagos?: boolean | Factura$pagosArgs<ExtArgs>
    _count?: boolean | FacturaCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type FacturaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    usuario?: boolean | Factura$usuarioArgs<ExtArgs>
  }

  export type $FacturaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Factura"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
      usuario: Prisma.$UsuarioPayload<ExtArgs> | null
      items: Prisma.$ItemFacturaPayload<ExtArgs>[]
      pagos: Prisma.$PagoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      numeroFactura: number
      clienteId: string
      usuarioId: string | null
      fechaEmision: Date
      fechaVencimiento: Date
      subtotal: number
      impuestoTotal: number
      total: number
      estado: string
      moneda: string
      tasaCambio: number
      cuotasTotales: number
      observaciones: string | null
      anuladoPor: string | null
      motivoAnulacion: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["factura"]>
    composites: {}
  }

  type FacturaGetPayload<S extends boolean | null | undefined | FacturaDefaultArgs> = $Result.GetResult<Prisma.$FacturaPayload, S>

  type FacturaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<FacturaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: FacturaCountAggregateInputType | true
    }

  export interface FacturaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Factura'], meta: { name: 'Factura' } }
    /**
     * Find zero or one Factura that matches the filter.
     * @param {FacturaFindUniqueArgs} args - Arguments to find a Factura
     * @example
     * // Get one Factura
     * const factura = await prisma.factura.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FacturaFindUniqueArgs>(args: SelectSubset<T, FacturaFindUniqueArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Factura that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {FacturaFindUniqueOrThrowArgs} args - Arguments to find a Factura
     * @example
     * // Get one Factura
     * const factura = await prisma.factura.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FacturaFindUniqueOrThrowArgs>(args: SelectSubset<T, FacturaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Factura that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaFindFirstArgs} args - Arguments to find a Factura
     * @example
     * // Get one Factura
     * const factura = await prisma.factura.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FacturaFindFirstArgs>(args?: SelectSubset<T, FacturaFindFirstArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Factura that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaFindFirstOrThrowArgs} args - Arguments to find a Factura
     * @example
     * // Get one Factura
     * const factura = await prisma.factura.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FacturaFindFirstOrThrowArgs>(args?: SelectSubset<T, FacturaFindFirstOrThrowArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Facturas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Facturas
     * const facturas = await prisma.factura.findMany()
     * 
     * // Get first 10 Facturas
     * const facturas = await prisma.factura.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const facturaWithIdOnly = await prisma.factura.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FacturaFindManyArgs>(args?: SelectSubset<T, FacturaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Factura.
     * @param {FacturaCreateArgs} args - Arguments to create a Factura.
     * @example
     * // Create one Factura
     * const Factura = await prisma.factura.create({
     *   data: {
     *     // ... data to create a Factura
     *   }
     * })
     * 
     */
    create<T extends FacturaCreateArgs>(args: SelectSubset<T, FacturaCreateArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Facturas.
     * @param {FacturaCreateManyArgs} args - Arguments to create many Facturas.
     * @example
     * // Create many Facturas
     * const factura = await prisma.factura.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FacturaCreateManyArgs>(args?: SelectSubset<T, FacturaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Facturas and returns the data saved in the database.
     * @param {FacturaCreateManyAndReturnArgs} args - Arguments to create many Facturas.
     * @example
     * // Create many Facturas
     * const factura = await prisma.factura.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Facturas and only return the `id`
     * const facturaWithIdOnly = await prisma.factura.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FacturaCreateManyAndReturnArgs>(args?: SelectSubset<T, FacturaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Factura.
     * @param {FacturaDeleteArgs} args - Arguments to delete one Factura.
     * @example
     * // Delete one Factura
     * const Factura = await prisma.factura.delete({
     *   where: {
     *     // ... filter to delete one Factura
     *   }
     * })
     * 
     */
    delete<T extends FacturaDeleteArgs>(args: SelectSubset<T, FacturaDeleteArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Factura.
     * @param {FacturaUpdateArgs} args - Arguments to update one Factura.
     * @example
     * // Update one Factura
     * const factura = await prisma.factura.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FacturaUpdateArgs>(args: SelectSubset<T, FacturaUpdateArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Facturas.
     * @param {FacturaDeleteManyArgs} args - Arguments to filter Facturas to delete.
     * @example
     * // Delete a few Facturas
     * const { count } = await prisma.factura.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FacturaDeleteManyArgs>(args?: SelectSubset<T, FacturaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Facturas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Facturas
     * const factura = await prisma.factura.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FacturaUpdateManyArgs>(args: SelectSubset<T, FacturaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Factura.
     * @param {FacturaUpsertArgs} args - Arguments to update or create a Factura.
     * @example
     * // Update or create a Factura
     * const factura = await prisma.factura.upsert({
     *   create: {
     *     // ... data to create a Factura
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Factura we want to update
     *   }
     * })
     */
    upsert<T extends FacturaUpsertArgs>(args: SelectSubset<T, FacturaUpsertArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Facturas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaCountArgs} args - Arguments to filter Facturas to count.
     * @example
     * // Count the number of Facturas
     * const count = await prisma.factura.count({
     *   where: {
     *     // ... the filter for the Facturas we want to count
     *   }
     * })
    **/
    count<T extends FacturaCountArgs>(
      args?: Subset<T, FacturaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FacturaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Factura.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FacturaAggregateArgs>(args: Subset<T, FacturaAggregateArgs>): Prisma.PrismaPromise<GetFacturaAggregateType<T>>

    /**
     * Group by Factura.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacturaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FacturaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FacturaGroupByArgs['orderBy'] }
        : { orderBy?: FacturaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FacturaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFacturaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Factura model
   */
  readonly fields: FacturaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Factura.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FacturaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    usuario<T extends Factura$usuarioArgs<ExtArgs> = {}>(args?: Subset<T, Factura$usuarioArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    items<T extends Factura$itemsArgs<ExtArgs> = {}>(args?: Subset<T, Factura$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "findMany"> | Null>
    pagos<T extends Factura$pagosArgs<ExtArgs> = {}>(args?: Subset<T, Factura$pagosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Factura model
   */ 
  interface FacturaFieldRefs {
    readonly id: FieldRef<"Factura", 'String'>
    readonly numeroFactura: FieldRef<"Factura", 'Int'>
    readonly clienteId: FieldRef<"Factura", 'String'>
    readonly usuarioId: FieldRef<"Factura", 'String'>
    readonly fechaEmision: FieldRef<"Factura", 'DateTime'>
    readonly fechaVencimiento: FieldRef<"Factura", 'DateTime'>
    readonly subtotal: FieldRef<"Factura", 'Float'>
    readonly impuestoTotal: FieldRef<"Factura", 'Float'>
    readonly total: FieldRef<"Factura", 'Float'>
    readonly estado: FieldRef<"Factura", 'String'>
    readonly moneda: FieldRef<"Factura", 'String'>
    readonly tasaCambio: FieldRef<"Factura", 'Float'>
    readonly cuotasTotales: FieldRef<"Factura", 'Int'>
    readonly observaciones: FieldRef<"Factura", 'String'>
    readonly anuladoPor: FieldRef<"Factura", 'String'>
    readonly motivoAnulacion: FieldRef<"Factura", 'String'>
    readonly createdAt: FieldRef<"Factura", 'DateTime'>
    readonly updatedAt: FieldRef<"Factura", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Factura findUnique
   */
  export type FacturaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Factura to fetch.
     */
    where: FacturaWhereUniqueInput
  }

  /**
   * Factura findUniqueOrThrow
   */
  export type FacturaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Factura to fetch.
     */
    where: FacturaWhereUniqueInput
  }

  /**
   * Factura findFirst
   */
  export type FacturaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Factura to fetch.
     */
    where?: FacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Facturas to fetch.
     */
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Facturas.
     */
    cursor?: FacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Facturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Facturas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Facturas.
     */
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Factura findFirstOrThrow
   */
  export type FacturaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Factura to fetch.
     */
    where?: FacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Facturas to fetch.
     */
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Facturas.
     */
    cursor?: FacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Facturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Facturas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Facturas.
     */
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Factura findMany
   */
  export type FacturaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter, which Facturas to fetch.
     */
    where?: FacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Facturas to fetch.
     */
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Facturas.
     */
    cursor?: FacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Facturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Facturas.
     */
    skip?: number
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Factura create
   */
  export type FacturaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * The data needed to create a Factura.
     */
    data: XOR<FacturaCreateInput, FacturaUncheckedCreateInput>
  }

  /**
   * Factura createMany
   */
  export type FacturaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Facturas.
     */
    data: FacturaCreateManyInput | FacturaCreateManyInput[]
  }

  /**
   * Factura createManyAndReturn
   */
  export type FacturaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Facturas.
     */
    data: FacturaCreateManyInput | FacturaCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Factura update
   */
  export type FacturaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * The data needed to update a Factura.
     */
    data: XOR<FacturaUpdateInput, FacturaUncheckedUpdateInput>
    /**
     * Choose, which Factura to update.
     */
    where: FacturaWhereUniqueInput
  }

  /**
   * Factura updateMany
   */
  export type FacturaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Facturas.
     */
    data: XOR<FacturaUpdateManyMutationInput, FacturaUncheckedUpdateManyInput>
    /**
     * Filter which Facturas to update
     */
    where?: FacturaWhereInput
  }

  /**
   * Factura upsert
   */
  export type FacturaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * The filter to search for the Factura to update in case it exists.
     */
    where: FacturaWhereUniqueInput
    /**
     * In case the Factura found by the `where` argument doesn't exist, create a new Factura with this data.
     */
    create: XOR<FacturaCreateInput, FacturaUncheckedCreateInput>
    /**
     * In case the Factura was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FacturaUpdateInput, FacturaUncheckedUpdateInput>
  }

  /**
   * Factura delete
   */
  export type FacturaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    /**
     * Filter which Factura to delete.
     */
    where: FacturaWhereUniqueInput
  }

  /**
   * Factura deleteMany
   */
  export type FacturaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Facturas to delete
     */
    where?: FacturaWhereInput
  }

  /**
   * Factura.usuario
   */
  export type Factura$usuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
  }

  /**
   * Factura.items
   */
  export type Factura$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    where?: ItemFacturaWhereInput
    orderBy?: ItemFacturaOrderByWithRelationInput | ItemFacturaOrderByWithRelationInput[]
    cursor?: ItemFacturaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ItemFacturaScalarFieldEnum | ItemFacturaScalarFieldEnum[]
  }

  /**
   * Factura.pagos
   */
  export type Factura$pagosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    where?: PagoWhereInput
    orderBy?: PagoOrderByWithRelationInput | PagoOrderByWithRelationInput[]
    cursor?: PagoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PagoScalarFieldEnum | PagoScalarFieldEnum[]
  }

  /**
   * Factura without action
   */
  export type FacturaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
  }


  /**
   * Model ItemFactura
   */

  export type AggregateItemFactura = {
    _count: ItemFacturaCountAggregateOutputType | null
    _avg: ItemFacturaAvgAggregateOutputType | null
    _sum: ItemFacturaSumAggregateOutputType | null
    _min: ItemFacturaMinAggregateOutputType | null
    _max: ItemFacturaMaxAggregateOutputType | null
  }

  export type ItemFacturaAvgAggregateOutputType = {
    cantidad: number | null
    precioUnitarioHistorico: number | null
    tasaImpuestoAplicada: number | null
    subtotalLinea: number | null
    impuestoLinea: number | null
    totalLinea: number | null
  }

  export type ItemFacturaSumAggregateOutputType = {
    cantidad: number | null
    precioUnitarioHistorico: number | null
    tasaImpuestoAplicada: number | null
    subtotalLinea: number | null
    impuestoLinea: number | null
    totalLinea: number | null
  }

  export type ItemFacturaMinAggregateOutputType = {
    id: string | null
    facturaId: string | null
    productoId: string | null
    descripcionHistorica: string | null
    cantidad: number | null
    precioUnitarioHistorico: number | null
    tasaImpuestoAplicada: number | null
    subtotalLinea: number | null
    impuestoLinea: number | null
    totalLinea: number | null
    createdAt: Date | null
  }

  export type ItemFacturaMaxAggregateOutputType = {
    id: string | null
    facturaId: string | null
    productoId: string | null
    descripcionHistorica: string | null
    cantidad: number | null
    precioUnitarioHistorico: number | null
    tasaImpuestoAplicada: number | null
    subtotalLinea: number | null
    impuestoLinea: number | null
    totalLinea: number | null
    createdAt: Date | null
  }

  export type ItemFacturaCountAggregateOutputType = {
    id: number
    facturaId: number
    productoId: number
    descripcionHistorica: number
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt: number
    _all: number
  }


  export type ItemFacturaAvgAggregateInputType = {
    cantidad?: true
    precioUnitarioHistorico?: true
    tasaImpuestoAplicada?: true
    subtotalLinea?: true
    impuestoLinea?: true
    totalLinea?: true
  }

  export type ItemFacturaSumAggregateInputType = {
    cantidad?: true
    precioUnitarioHistorico?: true
    tasaImpuestoAplicada?: true
    subtotalLinea?: true
    impuestoLinea?: true
    totalLinea?: true
  }

  export type ItemFacturaMinAggregateInputType = {
    id?: true
    facturaId?: true
    productoId?: true
    descripcionHistorica?: true
    cantidad?: true
    precioUnitarioHistorico?: true
    tasaImpuestoAplicada?: true
    subtotalLinea?: true
    impuestoLinea?: true
    totalLinea?: true
    createdAt?: true
  }

  export type ItemFacturaMaxAggregateInputType = {
    id?: true
    facturaId?: true
    productoId?: true
    descripcionHistorica?: true
    cantidad?: true
    precioUnitarioHistorico?: true
    tasaImpuestoAplicada?: true
    subtotalLinea?: true
    impuestoLinea?: true
    totalLinea?: true
    createdAt?: true
  }

  export type ItemFacturaCountAggregateInputType = {
    id?: true
    facturaId?: true
    productoId?: true
    descripcionHistorica?: true
    cantidad?: true
    precioUnitarioHistorico?: true
    tasaImpuestoAplicada?: true
    subtotalLinea?: true
    impuestoLinea?: true
    totalLinea?: true
    createdAt?: true
    _all?: true
  }

  export type ItemFacturaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemFactura to aggregate.
     */
    where?: ItemFacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemFacturas to fetch.
     */
    orderBy?: ItemFacturaOrderByWithRelationInput | ItemFacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ItemFacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemFacturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemFacturas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ItemFacturas
    **/
    _count?: true | ItemFacturaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ItemFacturaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ItemFacturaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ItemFacturaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ItemFacturaMaxAggregateInputType
  }

  export type GetItemFacturaAggregateType<T extends ItemFacturaAggregateArgs> = {
        [P in keyof T & keyof AggregateItemFactura]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateItemFactura[P]>
      : GetScalarType<T[P], AggregateItemFactura[P]>
  }




  export type ItemFacturaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemFacturaWhereInput
    orderBy?: ItemFacturaOrderByWithAggregationInput | ItemFacturaOrderByWithAggregationInput[]
    by: ItemFacturaScalarFieldEnum[] | ItemFacturaScalarFieldEnum
    having?: ItemFacturaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ItemFacturaCountAggregateInputType | true
    _avg?: ItemFacturaAvgAggregateInputType
    _sum?: ItemFacturaSumAggregateInputType
    _min?: ItemFacturaMinAggregateInputType
    _max?: ItemFacturaMaxAggregateInputType
  }

  export type ItemFacturaGroupByOutputType = {
    id: string
    facturaId: string
    productoId: string | null
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt: Date
    _count: ItemFacturaCountAggregateOutputType | null
    _avg: ItemFacturaAvgAggregateOutputType | null
    _sum: ItemFacturaSumAggregateOutputType | null
    _min: ItemFacturaMinAggregateOutputType | null
    _max: ItemFacturaMaxAggregateOutputType | null
  }

  type GetItemFacturaGroupByPayload<T extends ItemFacturaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ItemFacturaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ItemFacturaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ItemFacturaGroupByOutputType[P]>
            : GetScalarType<T[P], ItemFacturaGroupByOutputType[P]>
        }
      >
    >


  export type ItemFacturaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    facturaId?: boolean
    productoId?: boolean
    descripcionHistorica?: boolean
    cantidad?: boolean
    precioUnitarioHistorico?: boolean
    tasaImpuestoAplicada?: boolean
    subtotalLinea?: boolean
    impuestoLinea?: boolean
    totalLinea?: boolean
    createdAt?: boolean
    factura?: boolean | FacturaDefaultArgs<ExtArgs>
    producto?: boolean | ItemFactura$productoArgs<ExtArgs>
  }, ExtArgs["result"]["itemFactura"]>

  export type ItemFacturaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    facturaId?: boolean
    productoId?: boolean
    descripcionHistorica?: boolean
    cantidad?: boolean
    precioUnitarioHistorico?: boolean
    tasaImpuestoAplicada?: boolean
    subtotalLinea?: boolean
    impuestoLinea?: boolean
    totalLinea?: boolean
    createdAt?: boolean
    factura?: boolean | FacturaDefaultArgs<ExtArgs>
    producto?: boolean | ItemFactura$productoArgs<ExtArgs>
  }, ExtArgs["result"]["itemFactura"]>

  export type ItemFacturaSelectScalar = {
    id?: boolean
    facturaId?: boolean
    productoId?: boolean
    descripcionHistorica?: boolean
    cantidad?: boolean
    precioUnitarioHistorico?: boolean
    tasaImpuestoAplicada?: boolean
    subtotalLinea?: boolean
    impuestoLinea?: boolean
    totalLinea?: boolean
    createdAt?: boolean
  }

  export type ItemFacturaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    factura?: boolean | FacturaDefaultArgs<ExtArgs>
    producto?: boolean | ItemFactura$productoArgs<ExtArgs>
  }
  export type ItemFacturaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    factura?: boolean | FacturaDefaultArgs<ExtArgs>
    producto?: boolean | ItemFactura$productoArgs<ExtArgs>
  }

  export type $ItemFacturaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ItemFactura"
    objects: {
      factura: Prisma.$FacturaPayload<ExtArgs>
      producto: Prisma.$ProductoPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      facturaId: string
      productoId: string | null
      descripcionHistorica: string
      cantidad: number
      precioUnitarioHistorico: number
      tasaImpuestoAplicada: number
      subtotalLinea: number
      impuestoLinea: number
      totalLinea: number
      createdAt: Date
    }, ExtArgs["result"]["itemFactura"]>
    composites: {}
  }

  type ItemFacturaGetPayload<S extends boolean | null | undefined | ItemFacturaDefaultArgs> = $Result.GetResult<Prisma.$ItemFacturaPayload, S>

  type ItemFacturaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ItemFacturaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ItemFacturaCountAggregateInputType | true
    }

  export interface ItemFacturaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ItemFactura'], meta: { name: 'ItemFactura' } }
    /**
     * Find zero or one ItemFactura that matches the filter.
     * @param {ItemFacturaFindUniqueArgs} args - Arguments to find a ItemFactura
     * @example
     * // Get one ItemFactura
     * const itemFactura = await prisma.itemFactura.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ItemFacturaFindUniqueArgs>(args: SelectSubset<T, ItemFacturaFindUniqueArgs<ExtArgs>>): Prisma__ItemFacturaClient<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ItemFactura that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ItemFacturaFindUniqueOrThrowArgs} args - Arguments to find a ItemFactura
     * @example
     * // Get one ItemFactura
     * const itemFactura = await prisma.itemFactura.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ItemFacturaFindUniqueOrThrowArgs>(args: SelectSubset<T, ItemFacturaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ItemFacturaClient<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ItemFactura that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFacturaFindFirstArgs} args - Arguments to find a ItemFactura
     * @example
     * // Get one ItemFactura
     * const itemFactura = await prisma.itemFactura.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ItemFacturaFindFirstArgs>(args?: SelectSubset<T, ItemFacturaFindFirstArgs<ExtArgs>>): Prisma__ItemFacturaClient<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ItemFactura that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFacturaFindFirstOrThrowArgs} args - Arguments to find a ItemFactura
     * @example
     * // Get one ItemFactura
     * const itemFactura = await prisma.itemFactura.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ItemFacturaFindFirstOrThrowArgs>(args?: SelectSubset<T, ItemFacturaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ItemFacturaClient<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ItemFacturas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFacturaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ItemFacturas
     * const itemFacturas = await prisma.itemFactura.findMany()
     * 
     * // Get first 10 ItemFacturas
     * const itemFacturas = await prisma.itemFactura.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const itemFacturaWithIdOnly = await prisma.itemFactura.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ItemFacturaFindManyArgs>(args?: SelectSubset<T, ItemFacturaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ItemFactura.
     * @param {ItemFacturaCreateArgs} args - Arguments to create a ItemFactura.
     * @example
     * // Create one ItemFactura
     * const ItemFactura = await prisma.itemFactura.create({
     *   data: {
     *     // ... data to create a ItemFactura
     *   }
     * })
     * 
     */
    create<T extends ItemFacturaCreateArgs>(args: SelectSubset<T, ItemFacturaCreateArgs<ExtArgs>>): Prisma__ItemFacturaClient<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ItemFacturas.
     * @param {ItemFacturaCreateManyArgs} args - Arguments to create many ItemFacturas.
     * @example
     * // Create many ItemFacturas
     * const itemFactura = await prisma.itemFactura.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ItemFacturaCreateManyArgs>(args?: SelectSubset<T, ItemFacturaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ItemFacturas and returns the data saved in the database.
     * @param {ItemFacturaCreateManyAndReturnArgs} args - Arguments to create many ItemFacturas.
     * @example
     * // Create many ItemFacturas
     * const itemFactura = await prisma.itemFactura.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ItemFacturas and only return the `id`
     * const itemFacturaWithIdOnly = await prisma.itemFactura.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ItemFacturaCreateManyAndReturnArgs>(args?: SelectSubset<T, ItemFacturaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ItemFactura.
     * @param {ItemFacturaDeleteArgs} args - Arguments to delete one ItemFactura.
     * @example
     * // Delete one ItemFactura
     * const ItemFactura = await prisma.itemFactura.delete({
     *   where: {
     *     // ... filter to delete one ItemFactura
     *   }
     * })
     * 
     */
    delete<T extends ItemFacturaDeleteArgs>(args: SelectSubset<T, ItemFacturaDeleteArgs<ExtArgs>>): Prisma__ItemFacturaClient<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ItemFactura.
     * @param {ItemFacturaUpdateArgs} args - Arguments to update one ItemFactura.
     * @example
     * // Update one ItemFactura
     * const itemFactura = await prisma.itemFactura.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ItemFacturaUpdateArgs>(args: SelectSubset<T, ItemFacturaUpdateArgs<ExtArgs>>): Prisma__ItemFacturaClient<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ItemFacturas.
     * @param {ItemFacturaDeleteManyArgs} args - Arguments to filter ItemFacturas to delete.
     * @example
     * // Delete a few ItemFacturas
     * const { count } = await prisma.itemFactura.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ItemFacturaDeleteManyArgs>(args?: SelectSubset<T, ItemFacturaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ItemFacturas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFacturaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ItemFacturas
     * const itemFactura = await prisma.itemFactura.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ItemFacturaUpdateManyArgs>(args: SelectSubset<T, ItemFacturaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ItemFactura.
     * @param {ItemFacturaUpsertArgs} args - Arguments to update or create a ItemFactura.
     * @example
     * // Update or create a ItemFactura
     * const itemFactura = await prisma.itemFactura.upsert({
     *   create: {
     *     // ... data to create a ItemFactura
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ItemFactura we want to update
     *   }
     * })
     */
    upsert<T extends ItemFacturaUpsertArgs>(args: SelectSubset<T, ItemFacturaUpsertArgs<ExtArgs>>): Prisma__ItemFacturaClient<$Result.GetResult<Prisma.$ItemFacturaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ItemFacturas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFacturaCountArgs} args - Arguments to filter ItemFacturas to count.
     * @example
     * // Count the number of ItemFacturas
     * const count = await prisma.itemFactura.count({
     *   where: {
     *     // ... the filter for the ItemFacturas we want to count
     *   }
     * })
    **/
    count<T extends ItemFacturaCountArgs>(
      args?: Subset<T, ItemFacturaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ItemFacturaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ItemFactura.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFacturaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ItemFacturaAggregateArgs>(args: Subset<T, ItemFacturaAggregateArgs>): Prisma.PrismaPromise<GetItemFacturaAggregateType<T>>

    /**
     * Group by ItemFactura.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemFacturaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ItemFacturaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ItemFacturaGroupByArgs['orderBy'] }
        : { orderBy?: ItemFacturaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ItemFacturaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetItemFacturaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ItemFactura model
   */
  readonly fields: ItemFacturaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ItemFactura.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ItemFacturaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    factura<T extends FacturaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FacturaDefaultArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    producto<T extends ItemFactura$productoArgs<ExtArgs> = {}>(args?: Subset<T, ItemFactura$productoArgs<ExtArgs>>): Prisma__ProductoClient<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ItemFactura model
   */ 
  interface ItemFacturaFieldRefs {
    readonly id: FieldRef<"ItemFactura", 'String'>
    readonly facturaId: FieldRef<"ItemFactura", 'String'>
    readonly productoId: FieldRef<"ItemFactura", 'String'>
    readonly descripcionHistorica: FieldRef<"ItemFactura", 'String'>
    readonly cantidad: FieldRef<"ItemFactura", 'Int'>
    readonly precioUnitarioHistorico: FieldRef<"ItemFactura", 'Float'>
    readonly tasaImpuestoAplicada: FieldRef<"ItemFactura", 'Float'>
    readonly subtotalLinea: FieldRef<"ItemFactura", 'Float'>
    readonly impuestoLinea: FieldRef<"ItemFactura", 'Float'>
    readonly totalLinea: FieldRef<"ItemFactura", 'Float'>
    readonly createdAt: FieldRef<"ItemFactura", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ItemFactura findUnique
   */
  export type ItemFacturaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    /**
     * Filter, which ItemFactura to fetch.
     */
    where: ItemFacturaWhereUniqueInput
  }

  /**
   * ItemFactura findUniqueOrThrow
   */
  export type ItemFacturaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    /**
     * Filter, which ItemFactura to fetch.
     */
    where: ItemFacturaWhereUniqueInput
  }

  /**
   * ItemFactura findFirst
   */
  export type ItemFacturaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    /**
     * Filter, which ItemFactura to fetch.
     */
    where?: ItemFacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemFacturas to fetch.
     */
    orderBy?: ItemFacturaOrderByWithRelationInput | ItemFacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemFacturas.
     */
    cursor?: ItemFacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemFacturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemFacturas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemFacturas.
     */
    distinct?: ItemFacturaScalarFieldEnum | ItemFacturaScalarFieldEnum[]
  }

  /**
   * ItemFactura findFirstOrThrow
   */
  export type ItemFacturaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    /**
     * Filter, which ItemFactura to fetch.
     */
    where?: ItemFacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemFacturas to fetch.
     */
    orderBy?: ItemFacturaOrderByWithRelationInput | ItemFacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemFacturas.
     */
    cursor?: ItemFacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemFacturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemFacturas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemFacturas.
     */
    distinct?: ItemFacturaScalarFieldEnum | ItemFacturaScalarFieldEnum[]
  }

  /**
   * ItemFactura findMany
   */
  export type ItemFacturaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    /**
     * Filter, which ItemFacturas to fetch.
     */
    where?: ItemFacturaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemFacturas to fetch.
     */
    orderBy?: ItemFacturaOrderByWithRelationInput | ItemFacturaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ItemFacturas.
     */
    cursor?: ItemFacturaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemFacturas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemFacturas.
     */
    skip?: number
    distinct?: ItemFacturaScalarFieldEnum | ItemFacturaScalarFieldEnum[]
  }

  /**
   * ItemFactura create
   */
  export type ItemFacturaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    /**
     * The data needed to create a ItemFactura.
     */
    data: XOR<ItemFacturaCreateInput, ItemFacturaUncheckedCreateInput>
  }

  /**
   * ItemFactura createMany
   */
  export type ItemFacturaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ItemFacturas.
     */
    data: ItemFacturaCreateManyInput | ItemFacturaCreateManyInput[]
  }

  /**
   * ItemFactura createManyAndReturn
   */
  export type ItemFacturaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ItemFacturas.
     */
    data: ItemFacturaCreateManyInput | ItemFacturaCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ItemFactura update
   */
  export type ItemFacturaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    /**
     * The data needed to update a ItemFactura.
     */
    data: XOR<ItemFacturaUpdateInput, ItemFacturaUncheckedUpdateInput>
    /**
     * Choose, which ItemFactura to update.
     */
    where: ItemFacturaWhereUniqueInput
  }

  /**
   * ItemFactura updateMany
   */
  export type ItemFacturaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ItemFacturas.
     */
    data: XOR<ItemFacturaUpdateManyMutationInput, ItemFacturaUncheckedUpdateManyInput>
    /**
     * Filter which ItemFacturas to update
     */
    where?: ItemFacturaWhereInput
  }

  /**
   * ItemFactura upsert
   */
  export type ItemFacturaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    /**
     * The filter to search for the ItemFactura to update in case it exists.
     */
    where: ItemFacturaWhereUniqueInput
    /**
     * In case the ItemFactura found by the `where` argument doesn't exist, create a new ItemFactura with this data.
     */
    create: XOR<ItemFacturaCreateInput, ItemFacturaUncheckedCreateInput>
    /**
     * In case the ItemFactura was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ItemFacturaUpdateInput, ItemFacturaUncheckedUpdateInput>
  }

  /**
   * ItemFactura delete
   */
  export type ItemFacturaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
    /**
     * Filter which ItemFactura to delete.
     */
    where: ItemFacturaWhereUniqueInput
  }

  /**
   * ItemFactura deleteMany
   */
  export type ItemFacturaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemFacturas to delete
     */
    where?: ItemFacturaWhereInput
  }

  /**
   * ItemFactura.producto
   */
  export type ItemFactura$productoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    where?: ProductoWhereInput
  }

  /**
   * ItemFactura without action
   */
  export type ItemFacturaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemFactura
     */
    select?: ItemFacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemFacturaInclude<ExtArgs> | null
  }


  /**
   * Model Pago
   */

  export type AggregatePago = {
    _count: PagoCountAggregateOutputType | null
    _avg: PagoAvgAggregateOutputType | null
    _sum: PagoSumAggregateOutputType | null
    _min: PagoMinAggregateOutputType | null
    _max: PagoMaxAggregateOutputType | null
  }

  export type PagoAvgAggregateOutputType = {
    monto: number | null
  }

  export type PagoSumAggregateOutputType = {
    monto: number | null
  }

  export type PagoMinAggregateOutputType = {
    id: string | null
    facturaId: string | null
    monto: number | null
    metodoPago: string | null
    referenciaTransaccion: string | null
    fechaPago: Date | null
    notas: string | null
    createdAt: Date | null
  }

  export type PagoMaxAggregateOutputType = {
    id: string | null
    facturaId: string | null
    monto: number | null
    metodoPago: string | null
    referenciaTransaccion: string | null
    fechaPago: Date | null
    notas: string | null
    createdAt: Date | null
  }

  export type PagoCountAggregateOutputType = {
    id: number
    facturaId: number
    monto: number
    metodoPago: number
    referenciaTransaccion: number
    fechaPago: number
    notas: number
    createdAt: number
    _all: number
  }


  export type PagoAvgAggregateInputType = {
    monto?: true
  }

  export type PagoSumAggregateInputType = {
    monto?: true
  }

  export type PagoMinAggregateInputType = {
    id?: true
    facturaId?: true
    monto?: true
    metodoPago?: true
    referenciaTransaccion?: true
    fechaPago?: true
    notas?: true
    createdAt?: true
  }

  export type PagoMaxAggregateInputType = {
    id?: true
    facturaId?: true
    monto?: true
    metodoPago?: true
    referenciaTransaccion?: true
    fechaPago?: true
    notas?: true
    createdAt?: true
  }

  export type PagoCountAggregateInputType = {
    id?: true
    facturaId?: true
    monto?: true
    metodoPago?: true
    referenciaTransaccion?: true
    fechaPago?: true
    notas?: true
    createdAt?: true
    _all?: true
  }

  export type PagoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pago to aggregate.
     */
    where?: PagoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pagos to fetch.
     */
    orderBy?: PagoOrderByWithRelationInput | PagoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PagoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pagos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Pagos
    **/
    _count?: true | PagoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PagoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PagoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PagoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PagoMaxAggregateInputType
  }

  export type GetPagoAggregateType<T extends PagoAggregateArgs> = {
        [P in keyof T & keyof AggregatePago]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePago[P]>
      : GetScalarType<T[P], AggregatePago[P]>
  }




  export type PagoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PagoWhereInput
    orderBy?: PagoOrderByWithAggregationInput | PagoOrderByWithAggregationInput[]
    by: PagoScalarFieldEnum[] | PagoScalarFieldEnum
    having?: PagoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PagoCountAggregateInputType | true
    _avg?: PagoAvgAggregateInputType
    _sum?: PagoSumAggregateInputType
    _min?: PagoMinAggregateInputType
    _max?: PagoMaxAggregateInputType
  }

  export type PagoGroupByOutputType = {
    id: string
    facturaId: string
    monto: number
    metodoPago: string
    referenciaTransaccion: string | null
    fechaPago: Date
    notas: string | null
    createdAt: Date
    _count: PagoCountAggregateOutputType | null
    _avg: PagoAvgAggregateOutputType | null
    _sum: PagoSumAggregateOutputType | null
    _min: PagoMinAggregateOutputType | null
    _max: PagoMaxAggregateOutputType | null
  }

  type GetPagoGroupByPayload<T extends PagoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PagoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PagoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PagoGroupByOutputType[P]>
            : GetScalarType<T[P], PagoGroupByOutputType[P]>
        }
      >
    >


  export type PagoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    facturaId?: boolean
    monto?: boolean
    metodoPago?: boolean
    referenciaTransaccion?: boolean
    fechaPago?: boolean
    notas?: boolean
    createdAt?: boolean
    factura?: boolean | FacturaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pago"]>

  export type PagoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    facturaId?: boolean
    monto?: boolean
    metodoPago?: boolean
    referenciaTransaccion?: boolean
    fechaPago?: boolean
    notas?: boolean
    createdAt?: boolean
    factura?: boolean | FacturaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pago"]>

  export type PagoSelectScalar = {
    id?: boolean
    facturaId?: boolean
    monto?: boolean
    metodoPago?: boolean
    referenciaTransaccion?: boolean
    fechaPago?: boolean
    notas?: boolean
    createdAt?: boolean
  }

  export type PagoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    factura?: boolean | FacturaDefaultArgs<ExtArgs>
  }
  export type PagoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    factura?: boolean | FacturaDefaultArgs<ExtArgs>
  }

  export type $PagoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Pago"
    objects: {
      factura: Prisma.$FacturaPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      facturaId: string
      monto: number
      metodoPago: string
      referenciaTransaccion: string | null
      fechaPago: Date
      notas: string | null
      createdAt: Date
    }, ExtArgs["result"]["pago"]>
    composites: {}
  }

  type PagoGetPayload<S extends boolean | null | undefined | PagoDefaultArgs> = $Result.GetResult<Prisma.$PagoPayload, S>

  type PagoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PagoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PagoCountAggregateInputType | true
    }

  export interface PagoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Pago'], meta: { name: 'Pago' } }
    /**
     * Find zero or one Pago that matches the filter.
     * @param {PagoFindUniqueArgs} args - Arguments to find a Pago
     * @example
     * // Get one Pago
     * const pago = await prisma.pago.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PagoFindUniqueArgs>(args: SelectSubset<T, PagoFindUniqueArgs<ExtArgs>>): Prisma__PagoClient<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Pago that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PagoFindUniqueOrThrowArgs} args - Arguments to find a Pago
     * @example
     * // Get one Pago
     * const pago = await prisma.pago.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PagoFindUniqueOrThrowArgs>(args: SelectSubset<T, PagoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PagoClient<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Pago that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoFindFirstArgs} args - Arguments to find a Pago
     * @example
     * // Get one Pago
     * const pago = await prisma.pago.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PagoFindFirstArgs>(args?: SelectSubset<T, PagoFindFirstArgs<ExtArgs>>): Prisma__PagoClient<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Pago that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoFindFirstOrThrowArgs} args - Arguments to find a Pago
     * @example
     * // Get one Pago
     * const pago = await prisma.pago.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PagoFindFirstOrThrowArgs>(args?: SelectSubset<T, PagoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PagoClient<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Pagos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pagos
     * const pagos = await prisma.pago.findMany()
     * 
     * // Get first 10 Pagos
     * const pagos = await prisma.pago.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pagoWithIdOnly = await prisma.pago.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PagoFindManyArgs>(args?: SelectSubset<T, PagoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Pago.
     * @param {PagoCreateArgs} args - Arguments to create a Pago.
     * @example
     * // Create one Pago
     * const Pago = await prisma.pago.create({
     *   data: {
     *     // ... data to create a Pago
     *   }
     * })
     * 
     */
    create<T extends PagoCreateArgs>(args: SelectSubset<T, PagoCreateArgs<ExtArgs>>): Prisma__PagoClient<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Pagos.
     * @param {PagoCreateManyArgs} args - Arguments to create many Pagos.
     * @example
     * // Create many Pagos
     * const pago = await prisma.pago.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PagoCreateManyArgs>(args?: SelectSubset<T, PagoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pagos and returns the data saved in the database.
     * @param {PagoCreateManyAndReturnArgs} args - Arguments to create many Pagos.
     * @example
     * // Create many Pagos
     * const pago = await prisma.pago.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pagos and only return the `id`
     * const pagoWithIdOnly = await prisma.pago.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PagoCreateManyAndReturnArgs>(args?: SelectSubset<T, PagoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Pago.
     * @param {PagoDeleteArgs} args - Arguments to delete one Pago.
     * @example
     * // Delete one Pago
     * const Pago = await prisma.pago.delete({
     *   where: {
     *     // ... filter to delete one Pago
     *   }
     * })
     * 
     */
    delete<T extends PagoDeleteArgs>(args: SelectSubset<T, PagoDeleteArgs<ExtArgs>>): Prisma__PagoClient<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Pago.
     * @param {PagoUpdateArgs} args - Arguments to update one Pago.
     * @example
     * // Update one Pago
     * const pago = await prisma.pago.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PagoUpdateArgs>(args: SelectSubset<T, PagoUpdateArgs<ExtArgs>>): Prisma__PagoClient<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Pagos.
     * @param {PagoDeleteManyArgs} args - Arguments to filter Pagos to delete.
     * @example
     * // Delete a few Pagos
     * const { count } = await prisma.pago.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PagoDeleteManyArgs>(args?: SelectSubset<T, PagoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pagos
     * const pago = await prisma.pago.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PagoUpdateManyArgs>(args: SelectSubset<T, PagoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Pago.
     * @param {PagoUpsertArgs} args - Arguments to update or create a Pago.
     * @example
     * // Update or create a Pago
     * const pago = await prisma.pago.upsert({
     *   create: {
     *     // ... data to create a Pago
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pago we want to update
     *   }
     * })
     */
    upsert<T extends PagoUpsertArgs>(args: SelectSubset<T, PagoUpsertArgs<ExtArgs>>): Prisma__PagoClient<$Result.GetResult<Prisma.$PagoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Pagos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoCountArgs} args - Arguments to filter Pagos to count.
     * @example
     * // Count the number of Pagos
     * const count = await prisma.pago.count({
     *   where: {
     *     // ... the filter for the Pagos we want to count
     *   }
     * })
    **/
    count<T extends PagoCountArgs>(
      args?: Subset<T, PagoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PagoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Pago.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PagoAggregateArgs>(args: Subset<T, PagoAggregateArgs>): Prisma.PrismaPromise<GetPagoAggregateType<T>>

    /**
     * Group by Pago.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PagoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PagoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PagoGroupByArgs['orderBy'] }
        : { orderBy?: PagoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PagoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPagoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Pago model
   */
  readonly fields: PagoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Pago.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PagoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    factura<T extends FacturaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, FacturaDefaultArgs<ExtArgs>>): Prisma__FacturaClient<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Pago model
   */ 
  interface PagoFieldRefs {
    readonly id: FieldRef<"Pago", 'String'>
    readonly facturaId: FieldRef<"Pago", 'String'>
    readonly monto: FieldRef<"Pago", 'Float'>
    readonly metodoPago: FieldRef<"Pago", 'String'>
    readonly referenciaTransaccion: FieldRef<"Pago", 'String'>
    readonly fechaPago: FieldRef<"Pago", 'DateTime'>
    readonly notas: FieldRef<"Pago", 'String'>
    readonly createdAt: FieldRef<"Pago", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Pago findUnique
   */
  export type PagoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    /**
     * Filter, which Pago to fetch.
     */
    where: PagoWhereUniqueInput
  }

  /**
   * Pago findUniqueOrThrow
   */
  export type PagoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    /**
     * Filter, which Pago to fetch.
     */
    where: PagoWhereUniqueInput
  }

  /**
   * Pago findFirst
   */
  export type PagoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    /**
     * Filter, which Pago to fetch.
     */
    where?: PagoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pagos to fetch.
     */
    orderBy?: PagoOrderByWithRelationInput | PagoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pagos.
     */
    cursor?: PagoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pagos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pagos.
     */
    distinct?: PagoScalarFieldEnum | PagoScalarFieldEnum[]
  }

  /**
   * Pago findFirstOrThrow
   */
  export type PagoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    /**
     * Filter, which Pago to fetch.
     */
    where?: PagoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pagos to fetch.
     */
    orderBy?: PagoOrderByWithRelationInput | PagoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pagos.
     */
    cursor?: PagoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pagos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pagos.
     */
    distinct?: PagoScalarFieldEnum | PagoScalarFieldEnum[]
  }

  /**
   * Pago findMany
   */
  export type PagoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    /**
     * Filter, which Pagos to fetch.
     */
    where?: PagoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pagos to fetch.
     */
    orderBy?: PagoOrderByWithRelationInput | PagoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Pagos.
     */
    cursor?: PagoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pagos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pagos.
     */
    skip?: number
    distinct?: PagoScalarFieldEnum | PagoScalarFieldEnum[]
  }

  /**
   * Pago create
   */
  export type PagoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    /**
     * The data needed to create a Pago.
     */
    data: XOR<PagoCreateInput, PagoUncheckedCreateInput>
  }

  /**
   * Pago createMany
   */
  export type PagoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pagos.
     */
    data: PagoCreateManyInput | PagoCreateManyInput[]
  }

  /**
   * Pago createManyAndReturn
   */
  export type PagoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Pagos.
     */
    data: PagoCreateManyInput | PagoCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Pago update
   */
  export type PagoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    /**
     * The data needed to update a Pago.
     */
    data: XOR<PagoUpdateInput, PagoUncheckedUpdateInput>
    /**
     * Choose, which Pago to update.
     */
    where: PagoWhereUniqueInput
  }

  /**
   * Pago updateMany
   */
  export type PagoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Pagos.
     */
    data: XOR<PagoUpdateManyMutationInput, PagoUncheckedUpdateManyInput>
    /**
     * Filter which Pagos to update
     */
    where?: PagoWhereInput
  }

  /**
   * Pago upsert
   */
  export type PagoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    /**
     * The filter to search for the Pago to update in case it exists.
     */
    where: PagoWhereUniqueInput
    /**
     * In case the Pago found by the `where` argument doesn't exist, create a new Pago with this data.
     */
    create: XOR<PagoCreateInput, PagoUncheckedCreateInput>
    /**
     * In case the Pago was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PagoUpdateInput, PagoUncheckedUpdateInput>
  }

  /**
   * Pago delete
   */
  export type PagoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
    /**
     * Filter which Pago to delete.
     */
    where: PagoWhereUniqueInput
  }

  /**
   * Pago deleteMany
   */
  export type PagoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pagos to delete
     */
    where?: PagoWhereInput
  }

  /**
   * Pago without action
   */
  export type PagoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pago
     */
    select?: PagoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PagoInclude<ExtArgs> | null
  }


  /**
   * Model Correlativo
   */

  export type AggregateCorrelativo = {
    _count: CorrelativoCountAggregateOutputType | null
    _avg: CorrelativoAvgAggregateOutputType | null
    _sum: CorrelativoSumAggregateOutputType | null
    _min: CorrelativoMinAggregateOutputType | null
    _max: CorrelativoMaxAggregateOutputType | null
  }

  export type CorrelativoAvgAggregateOutputType = {
    id: number | null
    valor: number | null
  }

  export type CorrelativoSumAggregateOutputType = {
    id: number | null
    valor: number | null
  }

  export type CorrelativoMinAggregateOutputType = {
    id: number | null
    nombre: string | null
    valor: number | null
  }

  export type CorrelativoMaxAggregateOutputType = {
    id: number | null
    nombre: string | null
    valor: number | null
  }

  export type CorrelativoCountAggregateOutputType = {
    id: number
    nombre: number
    valor: number
    _all: number
  }


  export type CorrelativoAvgAggregateInputType = {
    id?: true
    valor?: true
  }

  export type CorrelativoSumAggregateInputType = {
    id?: true
    valor?: true
  }

  export type CorrelativoMinAggregateInputType = {
    id?: true
    nombre?: true
    valor?: true
  }

  export type CorrelativoMaxAggregateInputType = {
    id?: true
    nombre?: true
    valor?: true
  }

  export type CorrelativoCountAggregateInputType = {
    id?: true
    nombre?: true
    valor?: true
    _all?: true
  }

  export type CorrelativoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Correlativo to aggregate.
     */
    where?: CorrelativoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Correlativos to fetch.
     */
    orderBy?: CorrelativoOrderByWithRelationInput | CorrelativoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CorrelativoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Correlativos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Correlativos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Correlativos
    **/
    _count?: true | CorrelativoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CorrelativoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CorrelativoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CorrelativoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CorrelativoMaxAggregateInputType
  }

  export type GetCorrelativoAggregateType<T extends CorrelativoAggregateArgs> = {
        [P in keyof T & keyof AggregateCorrelativo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCorrelativo[P]>
      : GetScalarType<T[P], AggregateCorrelativo[P]>
  }




  export type CorrelativoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CorrelativoWhereInput
    orderBy?: CorrelativoOrderByWithAggregationInput | CorrelativoOrderByWithAggregationInput[]
    by: CorrelativoScalarFieldEnum[] | CorrelativoScalarFieldEnum
    having?: CorrelativoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CorrelativoCountAggregateInputType | true
    _avg?: CorrelativoAvgAggregateInputType
    _sum?: CorrelativoSumAggregateInputType
    _min?: CorrelativoMinAggregateInputType
    _max?: CorrelativoMaxAggregateInputType
  }

  export type CorrelativoGroupByOutputType = {
    id: number
    nombre: string
    valor: number
    _count: CorrelativoCountAggregateOutputType | null
    _avg: CorrelativoAvgAggregateOutputType | null
    _sum: CorrelativoSumAggregateOutputType | null
    _min: CorrelativoMinAggregateOutputType | null
    _max: CorrelativoMaxAggregateOutputType | null
  }

  type GetCorrelativoGroupByPayload<T extends CorrelativoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CorrelativoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CorrelativoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CorrelativoGroupByOutputType[P]>
            : GetScalarType<T[P], CorrelativoGroupByOutputType[P]>
        }
      >
    >


  export type CorrelativoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    valor?: boolean
  }, ExtArgs["result"]["correlativo"]>

  export type CorrelativoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nombre?: boolean
    valor?: boolean
  }, ExtArgs["result"]["correlativo"]>

  export type CorrelativoSelectScalar = {
    id?: boolean
    nombre?: boolean
    valor?: boolean
  }


  export type $CorrelativoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Correlativo"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      nombre: string
      valor: number
    }, ExtArgs["result"]["correlativo"]>
    composites: {}
  }

  type CorrelativoGetPayload<S extends boolean | null | undefined | CorrelativoDefaultArgs> = $Result.GetResult<Prisma.$CorrelativoPayload, S>

  type CorrelativoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CorrelativoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CorrelativoCountAggregateInputType | true
    }

  export interface CorrelativoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Correlativo'], meta: { name: 'Correlativo' } }
    /**
     * Find zero or one Correlativo that matches the filter.
     * @param {CorrelativoFindUniqueArgs} args - Arguments to find a Correlativo
     * @example
     * // Get one Correlativo
     * const correlativo = await prisma.correlativo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CorrelativoFindUniqueArgs>(args: SelectSubset<T, CorrelativoFindUniqueArgs<ExtArgs>>): Prisma__CorrelativoClient<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Correlativo that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CorrelativoFindUniqueOrThrowArgs} args - Arguments to find a Correlativo
     * @example
     * // Get one Correlativo
     * const correlativo = await prisma.correlativo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CorrelativoFindUniqueOrThrowArgs>(args: SelectSubset<T, CorrelativoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CorrelativoClient<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Correlativo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorrelativoFindFirstArgs} args - Arguments to find a Correlativo
     * @example
     * // Get one Correlativo
     * const correlativo = await prisma.correlativo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CorrelativoFindFirstArgs>(args?: SelectSubset<T, CorrelativoFindFirstArgs<ExtArgs>>): Prisma__CorrelativoClient<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Correlativo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorrelativoFindFirstOrThrowArgs} args - Arguments to find a Correlativo
     * @example
     * // Get one Correlativo
     * const correlativo = await prisma.correlativo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CorrelativoFindFirstOrThrowArgs>(args?: SelectSubset<T, CorrelativoFindFirstOrThrowArgs<ExtArgs>>): Prisma__CorrelativoClient<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Correlativos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorrelativoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Correlativos
     * const correlativos = await prisma.correlativo.findMany()
     * 
     * // Get first 10 Correlativos
     * const correlativos = await prisma.correlativo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const correlativoWithIdOnly = await prisma.correlativo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CorrelativoFindManyArgs>(args?: SelectSubset<T, CorrelativoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Correlativo.
     * @param {CorrelativoCreateArgs} args - Arguments to create a Correlativo.
     * @example
     * // Create one Correlativo
     * const Correlativo = await prisma.correlativo.create({
     *   data: {
     *     // ... data to create a Correlativo
     *   }
     * })
     * 
     */
    create<T extends CorrelativoCreateArgs>(args: SelectSubset<T, CorrelativoCreateArgs<ExtArgs>>): Prisma__CorrelativoClient<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Correlativos.
     * @param {CorrelativoCreateManyArgs} args - Arguments to create many Correlativos.
     * @example
     * // Create many Correlativos
     * const correlativo = await prisma.correlativo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CorrelativoCreateManyArgs>(args?: SelectSubset<T, CorrelativoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Correlativos and returns the data saved in the database.
     * @param {CorrelativoCreateManyAndReturnArgs} args - Arguments to create many Correlativos.
     * @example
     * // Create many Correlativos
     * const correlativo = await prisma.correlativo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Correlativos and only return the `id`
     * const correlativoWithIdOnly = await prisma.correlativo.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CorrelativoCreateManyAndReturnArgs>(args?: SelectSubset<T, CorrelativoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Correlativo.
     * @param {CorrelativoDeleteArgs} args - Arguments to delete one Correlativo.
     * @example
     * // Delete one Correlativo
     * const Correlativo = await prisma.correlativo.delete({
     *   where: {
     *     // ... filter to delete one Correlativo
     *   }
     * })
     * 
     */
    delete<T extends CorrelativoDeleteArgs>(args: SelectSubset<T, CorrelativoDeleteArgs<ExtArgs>>): Prisma__CorrelativoClient<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Correlativo.
     * @param {CorrelativoUpdateArgs} args - Arguments to update one Correlativo.
     * @example
     * // Update one Correlativo
     * const correlativo = await prisma.correlativo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CorrelativoUpdateArgs>(args: SelectSubset<T, CorrelativoUpdateArgs<ExtArgs>>): Prisma__CorrelativoClient<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Correlativos.
     * @param {CorrelativoDeleteManyArgs} args - Arguments to filter Correlativos to delete.
     * @example
     * // Delete a few Correlativos
     * const { count } = await prisma.correlativo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CorrelativoDeleteManyArgs>(args?: SelectSubset<T, CorrelativoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Correlativos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorrelativoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Correlativos
     * const correlativo = await prisma.correlativo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CorrelativoUpdateManyArgs>(args: SelectSubset<T, CorrelativoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Correlativo.
     * @param {CorrelativoUpsertArgs} args - Arguments to update or create a Correlativo.
     * @example
     * // Update or create a Correlativo
     * const correlativo = await prisma.correlativo.upsert({
     *   create: {
     *     // ... data to create a Correlativo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Correlativo we want to update
     *   }
     * })
     */
    upsert<T extends CorrelativoUpsertArgs>(args: SelectSubset<T, CorrelativoUpsertArgs<ExtArgs>>): Prisma__CorrelativoClient<$Result.GetResult<Prisma.$CorrelativoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Correlativos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorrelativoCountArgs} args - Arguments to filter Correlativos to count.
     * @example
     * // Count the number of Correlativos
     * const count = await prisma.correlativo.count({
     *   where: {
     *     // ... the filter for the Correlativos we want to count
     *   }
     * })
    **/
    count<T extends CorrelativoCountArgs>(
      args?: Subset<T, CorrelativoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CorrelativoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Correlativo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorrelativoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CorrelativoAggregateArgs>(args: Subset<T, CorrelativoAggregateArgs>): Prisma.PrismaPromise<GetCorrelativoAggregateType<T>>

    /**
     * Group by Correlativo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CorrelativoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CorrelativoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CorrelativoGroupByArgs['orderBy'] }
        : { orderBy?: CorrelativoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CorrelativoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCorrelativoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Correlativo model
   */
  readonly fields: CorrelativoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Correlativo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CorrelativoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Correlativo model
   */ 
  interface CorrelativoFieldRefs {
    readonly id: FieldRef<"Correlativo", 'Int'>
    readonly nombre: FieldRef<"Correlativo", 'String'>
    readonly valor: FieldRef<"Correlativo", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Correlativo findUnique
   */
  export type CorrelativoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
    /**
     * Filter, which Correlativo to fetch.
     */
    where: CorrelativoWhereUniqueInput
  }

  /**
   * Correlativo findUniqueOrThrow
   */
  export type CorrelativoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
    /**
     * Filter, which Correlativo to fetch.
     */
    where: CorrelativoWhereUniqueInput
  }

  /**
   * Correlativo findFirst
   */
  export type CorrelativoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
    /**
     * Filter, which Correlativo to fetch.
     */
    where?: CorrelativoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Correlativos to fetch.
     */
    orderBy?: CorrelativoOrderByWithRelationInput | CorrelativoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Correlativos.
     */
    cursor?: CorrelativoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Correlativos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Correlativos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Correlativos.
     */
    distinct?: CorrelativoScalarFieldEnum | CorrelativoScalarFieldEnum[]
  }

  /**
   * Correlativo findFirstOrThrow
   */
  export type CorrelativoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
    /**
     * Filter, which Correlativo to fetch.
     */
    where?: CorrelativoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Correlativos to fetch.
     */
    orderBy?: CorrelativoOrderByWithRelationInput | CorrelativoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Correlativos.
     */
    cursor?: CorrelativoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Correlativos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Correlativos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Correlativos.
     */
    distinct?: CorrelativoScalarFieldEnum | CorrelativoScalarFieldEnum[]
  }

  /**
   * Correlativo findMany
   */
  export type CorrelativoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
    /**
     * Filter, which Correlativos to fetch.
     */
    where?: CorrelativoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Correlativos to fetch.
     */
    orderBy?: CorrelativoOrderByWithRelationInput | CorrelativoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Correlativos.
     */
    cursor?: CorrelativoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Correlativos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Correlativos.
     */
    skip?: number
    distinct?: CorrelativoScalarFieldEnum | CorrelativoScalarFieldEnum[]
  }

  /**
   * Correlativo create
   */
  export type CorrelativoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
    /**
     * The data needed to create a Correlativo.
     */
    data: XOR<CorrelativoCreateInput, CorrelativoUncheckedCreateInput>
  }

  /**
   * Correlativo createMany
   */
  export type CorrelativoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Correlativos.
     */
    data: CorrelativoCreateManyInput | CorrelativoCreateManyInput[]
  }

  /**
   * Correlativo createManyAndReturn
   */
  export type CorrelativoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Correlativos.
     */
    data: CorrelativoCreateManyInput | CorrelativoCreateManyInput[]
  }

  /**
   * Correlativo update
   */
  export type CorrelativoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
    /**
     * The data needed to update a Correlativo.
     */
    data: XOR<CorrelativoUpdateInput, CorrelativoUncheckedUpdateInput>
    /**
     * Choose, which Correlativo to update.
     */
    where: CorrelativoWhereUniqueInput
  }

  /**
   * Correlativo updateMany
   */
  export type CorrelativoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Correlativos.
     */
    data: XOR<CorrelativoUpdateManyMutationInput, CorrelativoUncheckedUpdateManyInput>
    /**
     * Filter which Correlativos to update
     */
    where?: CorrelativoWhereInput
  }

  /**
   * Correlativo upsert
   */
  export type CorrelativoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
    /**
     * The filter to search for the Correlativo to update in case it exists.
     */
    where: CorrelativoWhereUniqueInput
    /**
     * In case the Correlativo found by the `where` argument doesn't exist, create a new Correlativo with this data.
     */
    create: XOR<CorrelativoCreateInput, CorrelativoUncheckedCreateInput>
    /**
     * In case the Correlativo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CorrelativoUpdateInput, CorrelativoUncheckedUpdateInput>
  }

  /**
   * Correlativo delete
   */
  export type CorrelativoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
    /**
     * Filter which Correlativo to delete.
     */
    where: CorrelativoWhereUniqueInput
  }

  /**
   * Correlativo deleteMany
   */
  export type CorrelativoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Correlativos to delete
     */
    where?: CorrelativoWhereInput
  }

  /**
   * Correlativo without action
   */
  export type CorrelativoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Correlativo
     */
    select?: CorrelativoSelect<ExtArgs> | null
  }


  /**
   * Model CierreCaja
   */

  export type AggregateCierreCaja = {
    _count: CierreCajaCountAggregateOutputType | null
    _avg: CierreCajaAvgAggregateOutputType | null
    _sum: CierreCajaSumAggregateOutputType | null
    _min: CierreCajaMinAggregateOutputType | null
    _max: CierreCajaMaxAggregateOutputType | null
  }

  export type CierreCajaAvgAggregateOutputType = {
    montoInicial: number | null
    montoFinal: number | null
    ingresosEfectivo: number | null
    ingresosBanco: number | null
  }

  export type CierreCajaSumAggregateOutputType = {
    montoInicial: number | null
    montoFinal: number | null
    ingresosEfectivo: number | null
    ingresosBanco: number | null
  }

  export type CierreCajaMinAggregateOutputType = {
    id: string | null
    usuarioId: string | null
    fechaApertura: Date | null
    fechaCierre: Date | null
    montoInicial: number | null
    montoFinal: number | null
    ingresosEfectivo: number | null
    ingresosBanco: number | null
    estado: string | null
    observaciones: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CierreCajaMaxAggregateOutputType = {
    id: string | null
    usuarioId: string | null
    fechaApertura: Date | null
    fechaCierre: Date | null
    montoInicial: number | null
    montoFinal: number | null
    ingresosEfectivo: number | null
    ingresosBanco: number | null
    estado: string | null
    observaciones: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CierreCajaCountAggregateOutputType = {
    id: number
    usuarioId: number
    fechaApertura: number
    fechaCierre: number
    montoInicial: number
    montoFinal: number
    ingresosEfectivo: number
    ingresosBanco: number
    estado: number
    observaciones: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CierreCajaAvgAggregateInputType = {
    montoInicial?: true
    montoFinal?: true
    ingresosEfectivo?: true
    ingresosBanco?: true
  }

  export type CierreCajaSumAggregateInputType = {
    montoInicial?: true
    montoFinal?: true
    ingresosEfectivo?: true
    ingresosBanco?: true
  }

  export type CierreCajaMinAggregateInputType = {
    id?: true
    usuarioId?: true
    fechaApertura?: true
    fechaCierre?: true
    montoInicial?: true
    montoFinal?: true
    ingresosEfectivo?: true
    ingresosBanco?: true
    estado?: true
    observaciones?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CierreCajaMaxAggregateInputType = {
    id?: true
    usuarioId?: true
    fechaApertura?: true
    fechaCierre?: true
    montoInicial?: true
    montoFinal?: true
    ingresosEfectivo?: true
    ingresosBanco?: true
    estado?: true
    observaciones?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CierreCajaCountAggregateInputType = {
    id?: true
    usuarioId?: true
    fechaApertura?: true
    fechaCierre?: true
    montoInicial?: true
    montoFinal?: true
    ingresosEfectivo?: true
    ingresosBanco?: true
    estado?: true
    observaciones?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CierreCajaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CierreCaja to aggregate.
     */
    where?: CierreCajaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CierreCajas to fetch.
     */
    orderBy?: CierreCajaOrderByWithRelationInput | CierreCajaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CierreCajaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CierreCajas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CierreCajas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CierreCajas
    **/
    _count?: true | CierreCajaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CierreCajaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CierreCajaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CierreCajaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CierreCajaMaxAggregateInputType
  }

  export type GetCierreCajaAggregateType<T extends CierreCajaAggregateArgs> = {
        [P in keyof T & keyof AggregateCierreCaja]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCierreCaja[P]>
      : GetScalarType<T[P], AggregateCierreCaja[P]>
  }




  export type CierreCajaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CierreCajaWhereInput
    orderBy?: CierreCajaOrderByWithAggregationInput | CierreCajaOrderByWithAggregationInput[]
    by: CierreCajaScalarFieldEnum[] | CierreCajaScalarFieldEnum
    having?: CierreCajaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CierreCajaCountAggregateInputType | true
    _avg?: CierreCajaAvgAggregateInputType
    _sum?: CierreCajaSumAggregateInputType
    _min?: CierreCajaMinAggregateInputType
    _max?: CierreCajaMaxAggregateInputType
  }

  export type CierreCajaGroupByOutputType = {
    id: string
    usuarioId: string | null
    fechaApertura: Date
    fechaCierre: Date | null
    montoInicial: number
    montoFinal: number | null
    ingresosEfectivo: number
    ingresosBanco: number
    estado: string
    observaciones: string | null
    createdAt: Date
    updatedAt: Date
    _count: CierreCajaCountAggregateOutputType | null
    _avg: CierreCajaAvgAggregateOutputType | null
    _sum: CierreCajaSumAggregateOutputType | null
    _min: CierreCajaMinAggregateOutputType | null
    _max: CierreCajaMaxAggregateOutputType | null
  }

  type GetCierreCajaGroupByPayload<T extends CierreCajaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CierreCajaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CierreCajaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CierreCajaGroupByOutputType[P]>
            : GetScalarType<T[P], CierreCajaGroupByOutputType[P]>
        }
      >
    >


  export type CierreCajaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    usuarioId?: boolean
    fechaApertura?: boolean
    fechaCierre?: boolean
    montoInicial?: boolean
    montoFinal?: boolean
    ingresosEfectivo?: boolean
    ingresosBanco?: boolean
    estado?: boolean
    observaciones?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    usuario?: boolean | CierreCaja$usuarioArgs<ExtArgs>
  }, ExtArgs["result"]["cierreCaja"]>

  export type CierreCajaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    usuarioId?: boolean
    fechaApertura?: boolean
    fechaCierre?: boolean
    montoInicial?: boolean
    montoFinal?: boolean
    ingresosEfectivo?: boolean
    ingresosBanco?: boolean
    estado?: boolean
    observaciones?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    usuario?: boolean | CierreCaja$usuarioArgs<ExtArgs>
  }, ExtArgs["result"]["cierreCaja"]>

  export type CierreCajaSelectScalar = {
    id?: boolean
    usuarioId?: boolean
    fechaApertura?: boolean
    fechaCierre?: boolean
    montoInicial?: boolean
    montoFinal?: boolean
    ingresosEfectivo?: boolean
    ingresosBanco?: boolean
    estado?: boolean
    observaciones?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CierreCajaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | CierreCaja$usuarioArgs<ExtArgs>
  }
  export type CierreCajaIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | CierreCaja$usuarioArgs<ExtArgs>
  }

  export type $CierreCajaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CierreCaja"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      usuarioId: string | null
      fechaApertura: Date
      fechaCierre: Date | null
      montoInicial: number
      montoFinal: number | null
      ingresosEfectivo: number
      ingresosBanco: number
      estado: string
      observaciones: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["cierreCaja"]>
    composites: {}
  }

  type CierreCajaGetPayload<S extends boolean | null | undefined | CierreCajaDefaultArgs> = $Result.GetResult<Prisma.$CierreCajaPayload, S>

  type CierreCajaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CierreCajaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CierreCajaCountAggregateInputType | true
    }

  export interface CierreCajaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CierreCaja'], meta: { name: 'CierreCaja' } }
    /**
     * Find zero or one CierreCaja that matches the filter.
     * @param {CierreCajaFindUniqueArgs} args - Arguments to find a CierreCaja
     * @example
     * // Get one CierreCaja
     * const cierreCaja = await prisma.cierreCaja.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CierreCajaFindUniqueArgs>(args: SelectSubset<T, CierreCajaFindUniqueArgs<ExtArgs>>): Prisma__CierreCajaClient<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CierreCaja that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CierreCajaFindUniqueOrThrowArgs} args - Arguments to find a CierreCaja
     * @example
     * // Get one CierreCaja
     * const cierreCaja = await prisma.cierreCaja.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CierreCajaFindUniqueOrThrowArgs>(args: SelectSubset<T, CierreCajaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CierreCajaClient<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CierreCaja that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CierreCajaFindFirstArgs} args - Arguments to find a CierreCaja
     * @example
     * // Get one CierreCaja
     * const cierreCaja = await prisma.cierreCaja.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CierreCajaFindFirstArgs>(args?: SelectSubset<T, CierreCajaFindFirstArgs<ExtArgs>>): Prisma__CierreCajaClient<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CierreCaja that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CierreCajaFindFirstOrThrowArgs} args - Arguments to find a CierreCaja
     * @example
     * // Get one CierreCaja
     * const cierreCaja = await prisma.cierreCaja.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CierreCajaFindFirstOrThrowArgs>(args?: SelectSubset<T, CierreCajaFindFirstOrThrowArgs<ExtArgs>>): Prisma__CierreCajaClient<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CierreCajas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CierreCajaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CierreCajas
     * const cierreCajas = await prisma.cierreCaja.findMany()
     * 
     * // Get first 10 CierreCajas
     * const cierreCajas = await prisma.cierreCaja.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cierreCajaWithIdOnly = await prisma.cierreCaja.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CierreCajaFindManyArgs>(args?: SelectSubset<T, CierreCajaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CierreCaja.
     * @param {CierreCajaCreateArgs} args - Arguments to create a CierreCaja.
     * @example
     * // Create one CierreCaja
     * const CierreCaja = await prisma.cierreCaja.create({
     *   data: {
     *     // ... data to create a CierreCaja
     *   }
     * })
     * 
     */
    create<T extends CierreCajaCreateArgs>(args: SelectSubset<T, CierreCajaCreateArgs<ExtArgs>>): Prisma__CierreCajaClient<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CierreCajas.
     * @param {CierreCajaCreateManyArgs} args - Arguments to create many CierreCajas.
     * @example
     * // Create many CierreCajas
     * const cierreCaja = await prisma.cierreCaja.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CierreCajaCreateManyArgs>(args?: SelectSubset<T, CierreCajaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CierreCajas and returns the data saved in the database.
     * @param {CierreCajaCreateManyAndReturnArgs} args - Arguments to create many CierreCajas.
     * @example
     * // Create many CierreCajas
     * const cierreCaja = await prisma.cierreCaja.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CierreCajas and only return the `id`
     * const cierreCajaWithIdOnly = await prisma.cierreCaja.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CierreCajaCreateManyAndReturnArgs>(args?: SelectSubset<T, CierreCajaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CierreCaja.
     * @param {CierreCajaDeleteArgs} args - Arguments to delete one CierreCaja.
     * @example
     * // Delete one CierreCaja
     * const CierreCaja = await prisma.cierreCaja.delete({
     *   where: {
     *     // ... filter to delete one CierreCaja
     *   }
     * })
     * 
     */
    delete<T extends CierreCajaDeleteArgs>(args: SelectSubset<T, CierreCajaDeleteArgs<ExtArgs>>): Prisma__CierreCajaClient<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CierreCaja.
     * @param {CierreCajaUpdateArgs} args - Arguments to update one CierreCaja.
     * @example
     * // Update one CierreCaja
     * const cierreCaja = await prisma.cierreCaja.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CierreCajaUpdateArgs>(args: SelectSubset<T, CierreCajaUpdateArgs<ExtArgs>>): Prisma__CierreCajaClient<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CierreCajas.
     * @param {CierreCajaDeleteManyArgs} args - Arguments to filter CierreCajas to delete.
     * @example
     * // Delete a few CierreCajas
     * const { count } = await prisma.cierreCaja.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CierreCajaDeleteManyArgs>(args?: SelectSubset<T, CierreCajaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CierreCajas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CierreCajaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CierreCajas
     * const cierreCaja = await prisma.cierreCaja.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CierreCajaUpdateManyArgs>(args: SelectSubset<T, CierreCajaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CierreCaja.
     * @param {CierreCajaUpsertArgs} args - Arguments to update or create a CierreCaja.
     * @example
     * // Update or create a CierreCaja
     * const cierreCaja = await prisma.cierreCaja.upsert({
     *   create: {
     *     // ... data to create a CierreCaja
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CierreCaja we want to update
     *   }
     * })
     */
    upsert<T extends CierreCajaUpsertArgs>(args: SelectSubset<T, CierreCajaUpsertArgs<ExtArgs>>): Prisma__CierreCajaClient<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CierreCajas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CierreCajaCountArgs} args - Arguments to filter CierreCajas to count.
     * @example
     * // Count the number of CierreCajas
     * const count = await prisma.cierreCaja.count({
     *   where: {
     *     // ... the filter for the CierreCajas we want to count
     *   }
     * })
    **/
    count<T extends CierreCajaCountArgs>(
      args?: Subset<T, CierreCajaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CierreCajaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CierreCaja.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CierreCajaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CierreCajaAggregateArgs>(args: Subset<T, CierreCajaAggregateArgs>): Prisma.PrismaPromise<GetCierreCajaAggregateType<T>>

    /**
     * Group by CierreCaja.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CierreCajaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CierreCajaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CierreCajaGroupByArgs['orderBy'] }
        : { orderBy?: CierreCajaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CierreCajaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCierreCajaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CierreCaja model
   */
  readonly fields: CierreCajaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CierreCaja.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CierreCajaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends CierreCaja$usuarioArgs<ExtArgs> = {}>(args?: Subset<T, CierreCaja$usuarioArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CierreCaja model
   */ 
  interface CierreCajaFieldRefs {
    readonly id: FieldRef<"CierreCaja", 'String'>
    readonly usuarioId: FieldRef<"CierreCaja", 'String'>
    readonly fechaApertura: FieldRef<"CierreCaja", 'DateTime'>
    readonly fechaCierre: FieldRef<"CierreCaja", 'DateTime'>
    readonly montoInicial: FieldRef<"CierreCaja", 'Float'>
    readonly montoFinal: FieldRef<"CierreCaja", 'Float'>
    readonly ingresosEfectivo: FieldRef<"CierreCaja", 'Float'>
    readonly ingresosBanco: FieldRef<"CierreCaja", 'Float'>
    readonly estado: FieldRef<"CierreCaja", 'String'>
    readonly observaciones: FieldRef<"CierreCaja", 'String'>
    readonly createdAt: FieldRef<"CierreCaja", 'DateTime'>
    readonly updatedAt: FieldRef<"CierreCaja", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CierreCaja findUnique
   */
  export type CierreCajaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    /**
     * Filter, which CierreCaja to fetch.
     */
    where: CierreCajaWhereUniqueInput
  }

  /**
   * CierreCaja findUniqueOrThrow
   */
  export type CierreCajaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    /**
     * Filter, which CierreCaja to fetch.
     */
    where: CierreCajaWhereUniqueInput
  }

  /**
   * CierreCaja findFirst
   */
  export type CierreCajaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    /**
     * Filter, which CierreCaja to fetch.
     */
    where?: CierreCajaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CierreCajas to fetch.
     */
    orderBy?: CierreCajaOrderByWithRelationInput | CierreCajaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CierreCajas.
     */
    cursor?: CierreCajaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CierreCajas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CierreCajas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CierreCajas.
     */
    distinct?: CierreCajaScalarFieldEnum | CierreCajaScalarFieldEnum[]
  }

  /**
   * CierreCaja findFirstOrThrow
   */
  export type CierreCajaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    /**
     * Filter, which CierreCaja to fetch.
     */
    where?: CierreCajaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CierreCajas to fetch.
     */
    orderBy?: CierreCajaOrderByWithRelationInput | CierreCajaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CierreCajas.
     */
    cursor?: CierreCajaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CierreCajas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CierreCajas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CierreCajas.
     */
    distinct?: CierreCajaScalarFieldEnum | CierreCajaScalarFieldEnum[]
  }

  /**
   * CierreCaja findMany
   */
  export type CierreCajaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    /**
     * Filter, which CierreCajas to fetch.
     */
    where?: CierreCajaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CierreCajas to fetch.
     */
    orderBy?: CierreCajaOrderByWithRelationInput | CierreCajaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CierreCajas.
     */
    cursor?: CierreCajaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CierreCajas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CierreCajas.
     */
    skip?: number
    distinct?: CierreCajaScalarFieldEnum | CierreCajaScalarFieldEnum[]
  }

  /**
   * CierreCaja create
   */
  export type CierreCajaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    /**
     * The data needed to create a CierreCaja.
     */
    data: XOR<CierreCajaCreateInput, CierreCajaUncheckedCreateInput>
  }

  /**
   * CierreCaja createMany
   */
  export type CierreCajaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CierreCajas.
     */
    data: CierreCajaCreateManyInput | CierreCajaCreateManyInput[]
  }

  /**
   * CierreCaja createManyAndReturn
   */
  export type CierreCajaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CierreCajas.
     */
    data: CierreCajaCreateManyInput | CierreCajaCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CierreCaja update
   */
  export type CierreCajaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    /**
     * The data needed to update a CierreCaja.
     */
    data: XOR<CierreCajaUpdateInput, CierreCajaUncheckedUpdateInput>
    /**
     * Choose, which CierreCaja to update.
     */
    where: CierreCajaWhereUniqueInput
  }

  /**
   * CierreCaja updateMany
   */
  export type CierreCajaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CierreCajas.
     */
    data: XOR<CierreCajaUpdateManyMutationInput, CierreCajaUncheckedUpdateManyInput>
    /**
     * Filter which CierreCajas to update
     */
    where?: CierreCajaWhereInput
  }

  /**
   * CierreCaja upsert
   */
  export type CierreCajaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    /**
     * The filter to search for the CierreCaja to update in case it exists.
     */
    where: CierreCajaWhereUniqueInput
    /**
     * In case the CierreCaja found by the `where` argument doesn't exist, create a new CierreCaja with this data.
     */
    create: XOR<CierreCajaCreateInput, CierreCajaUncheckedCreateInput>
    /**
     * In case the CierreCaja was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CierreCajaUpdateInput, CierreCajaUncheckedUpdateInput>
  }

  /**
   * CierreCaja delete
   */
  export type CierreCajaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    /**
     * Filter which CierreCaja to delete.
     */
    where: CierreCajaWhereUniqueInput
  }

  /**
   * CierreCaja deleteMany
   */
  export type CierreCajaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CierreCajas to delete
     */
    where?: CierreCajaWhereInput
  }

  /**
   * CierreCaja.usuario
   */
  export type CierreCaja$usuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
  }

  /**
   * CierreCaja without action
   */
  export type CierreCajaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
  }


  /**
   * Model Cotizacion
   */

  export type AggregateCotizacion = {
    _count: CotizacionCountAggregateOutputType | null
    _avg: CotizacionAvgAggregateOutputType | null
    _sum: CotizacionSumAggregateOutputType | null
    _min: CotizacionMinAggregateOutputType | null
    _max: CotizacionMaxAggregateOutputType | null
  }

  export type CotizacionAvgAggregateOutputType = {
    numero: number | null
    subtotal: number | null
    impuestoTotal: number | null
    total: number | null
  }

  export type CotizacionSumAggregateOutputType = {
    numero: number | null
    subtotal: number | null
    impuestoTotal: number | null
    total: number | null
  }

  export type CotizacionMinAggregateOutputType = {
    id: string | null
    numero: number | null
    clienteId: string | null
    usuarioId: string | null
    fechaEmision: Date | null
    fechaValidez: Date | null
    subtotal: number | null
    impuestoTotal: number | null
    total: number | null
    moneda: string | null
    estado: string | null
  }

  export type CotizacionMaxAggregateOutputType = {
    id: string | null
    numero: number | null
    clienteId: string | null
    usuarioId: string | null
    fechaEmision: Date | null
    fechaValidez: Date | null
    subtotal: number | null
    impuestoTotal: number | null
    total: number | null
    moneda: string | null
    estado: string | null
  }

  export type CotizacionCountAggregateOutputType = {
    id: number
    numero: number
    clienteId: number
    usuarioId: number
    fechaEmision: number
    fechaValidez: number
    subtotal: number
    impuestoTotal: number
    total: number
    moneda: number
    estado: number
    _all: number
  }


  export type CotizacionAvgAggregateInputType = {
    numero?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
  }

  export type CotizacionSumAggregateInputType = {
    numero?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
  }

  export type CotizacionMinAggregateInputType = {
    id?: true
    numero?: true
    clienteId?: true
    usuarioId?: true
    fechaEmision?: true
    fechaValidez?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
    moneda?: true
    estado?: true
  }

  export type CotizacionMaxAggregateInputType = {
    id?: true
    numero?: true
    clienteId?: true
    usuarioId?: true
    fechaEmision?: true
    fechaValidez?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
    moneda?: true
    estado?: true
  }

  export type CotizacionCountAggregateInputType = {
    id?: true
    numero?: true
    clienteId?: true
    usuarioId?: true
    fechaEmision?: true
    fechaValidez?: true
    subtotal?: true
    impuestoTotal?: true
    total?: true
    moneda?: true
    estado?: true
    _all?: true
  }

  export type CotizacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cotizacion to aggregate.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Cotizacions
    **/
    _count?: true | CotizacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CotizacionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CotizacionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CotizacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CotizacionMaxAggregateInputType
  }

  export type GetCotizacionAggregateType<T extends CotizacionAggregateArgs> = {
        [P in keyof T & keyof AggregateCotizacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCotizacion[P]>
      : GetScalarType<T[P], AggregateCotizacion[P]>
  }




  export type CotizacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithAggregationInput | CotizacionOrderByWithAggregationInput[]
    by: CotizacionScalarFieldEnum[] | CotizacionScalarFieldEnum
    having?: CotizacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CotizacionCountAggregateInputType | true
    _avg?: CotizacionAvgAggregateInputType
    _sum?: CotizacionSumAggregateInputType
    _min?: CotizacionMinAggregateInputType
    _max?: CotizacionMaxAggregateInputType
  }

  export type CotizacionGroupByOutputType = {
    id: string
    numero: number
    clienteId: string
    usuarioId: string | null
    fechaEmision: Date
    fechaValidez: Date
    subtotal: number
    impuestoTotal: number
    total: number
    moneda: string
    estado: string
    _count: CotizacionCountAggregateOutputType | null
    _avg: CotizacionAvgAggregateOutputType | null
    _sum: CotizacionSumAggregateOutputType | null
    _min: CotizacionMinAggregateOutputType | null
    _max: CotizacionMaxAggregateOutputType | null
  }

  type GetCotizacionGroupByPayload<T extends CotizacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CotizacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CotizacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CotizacionGroupByOutputType[P]>
            : GetScalarType<T[P], CotizacionGroupByOutputType[P]>
        }
      >
    >


  export type CotizacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    numero?: boolean
    clienteId?: boolean
    usuarioId?: boolean
    fechaEmision?: boolean
    fechaValidez?: boolean
    subtotal?: boolean
    impuestoTotal?: boolean
    total?: boolean
    moneda?: boolean
    estado?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    usuario?: boolean | Cotizacion$usuarioArgs<ExtArgs>
    items?: boolean | Cotizacion$itemsArgs<ExtArgs>
    _count?: boolean | CotizacionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["cotizacion"]>

  export type CotizacionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    numero?: boolean
    clienteId?: boolean
    usuarioId?: boolean
    fechaEmision?: boolean
    fechaValidez?: boolean
    subtotal?: boolean
    impuestoTotal?: boolean
    total?: boolean
    moneda?: boolean
    estado?: boolean
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    usuario?: boolean | Cotizacion$usuarioArgs<ExtArgs>
  }, ExtArgs["result"]["cotizacion"]>

  export type CotizacionSelectScalar = {
    id?: boolean
    numero?: boolean
    clienteId?: boolean
    usuarioId?: boolean
    fechaEmision?: boolean
    fechaValidez?: boolean
    subtotal?: boolean
    impuestoTotal?: boolean
    total?: boolean
    moneda?: boolean
    estado?: boolean
  }

  export type CotizacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    usuario?: boolean | Cotizacion$usuarioArgs<ExtArgs>
    items?: boolean | Cotizacion$itemsArgs<ExtArgs>
    _count?: boolean | CotizacionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CotizacionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cliente?: boolean | ClienteDefaultArgs<ExtArgs>
    usuario?: boolean | Cotizacion$usuarioArgs<ExtArgs>
  }

  export type $CotizacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Cotizacion"
    objects: {
      cliente: Prisma.$ClientePayload<ExtArgs>
      usuario: Prisma.$UsuarioPayload<ExtArgs> | null
      items: Prisma.$ItemCotizacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      numero: number
      clienteId: string
      usuarioId: string | null
      fechaEmision: Date
      fechaValidez: Date
      subtotal: number
      impuestoTotal: number
      total: number
      moneda: string
      estado: string
    }, ExtArgs["result"]["cotizacion"]>
    composites: {}
  }

  type CotizacionGetPayload<S extends boolean | null | undefined | CotizacionDefaultArgs> = $Result.GetResult<Prisma.$CotizacionPayload, S>

  type CotizacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CotizacionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CotizacionCountAggregateInputType | true
    }

  export interface CotizacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Cotizacion'], meta: { name: 'Cotizacion' } }
    /**
     * Find zero or one Cotizacion that matches the filter.
     * @param {CotizacionFindUniqueArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CotizacionFindUniqueArgs>(args: SelectSubset<T, CotizacionFindUniqueArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Cotizacion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CotizacionFindUniqueOrThrowArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CotizacionFindUniqueOrThrowArgs>(args: SelectSubset<T, CotizacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Cotizacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionFindFirstArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CotizacionFindFirstArgs>(args?: SelectSubset<T, CotizacionFindFirstArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Cotizacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionFindFirstOrThrowArgs} args - Arguments to find a Cotizacion
     * @example
     * // Get one Cotizacion
     * const cotizacion = await prisma.cotizacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CotizacionFindFirstOrThrowArgs>(args?: SelectSubset<T, CotizacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Cotizacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cotizacions
     * const cotizacions = await prisma.cotizacion.findMany()
     * 
     * // Get first 10 Cotizacions
     * const cotizacions = await prisma.cotizacion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cotizacionWithIdOnly = await prisma.cotizacion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CotizacionFindManyArgs>(args?: SelectSubset<T, CotizacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Cotizacion.
     * @param {CotizacionCreateArgs} args - Arguments to create a Cotizacion.
     * @example
     * // Create one Cotizacion
     * const Cotizacion = await prisma.cotizacion.create({
     *   data: {
     *     // ... data to create a Cotizacion
     *   }
     * })
     * 
     */
    create<T extends CotizacionCreateArgs>(args: SelectSubset<T, CotizacionCreateArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Cotizacions.
     * @param {CotizacionCreateManyArgs} args - Arguments to create many Cotizacions.
     * @example
     * // Create many Cotizacions
     * const cotizacion = await prisma.cotizacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CotizacionCreateManyArgs>(args?: SelectSubset<T, CotizacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cotizacions and returns the data saved in the database.
     * @param {CotizacionCreateManyAndReturnArgs} args - Arguments to create many Cotizacions.
     * @example
     * // Create many Cotizacions
     * const cotizacion = await prisma.cotizacion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cotizacions and only return the `id`
     * const cotizacionWithIdOnly = await prisma.cotizacion.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CotizacionCreateManyAndReturnArgs>(args?: SelectSubset<T, CotizacionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Cotizacion.
     * @param {CotizacionDeleteArgs} args - Arguments to delete one Cotizacion.
     * @example
     * // Delete one Cotizacion
     * const Cotizacion = await prisma.cotizacion.delete({
     *   where: {
     *     // ... filter to delete one Cotizacion
     *   }
     * })
     * 
     */
    delete<T extends CotizacionDeleteArgs>(args: SelectSubset<T, CotizacionDeleteArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Cotizacion.
     * @param {CotizacionUpdateArgs} args - Arguments to update one Cotizacion.
     * @example
     * // Update one Cotizacion
     * const cotizacion = await prisma.cotizacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CotizacionUpdateArgs>(args: SelectSubset<T, CotizacionUpdateArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Cotizacions.
     * @param {CotizacionDeleteManyArgs} args - Arguments to filter Cotizacions to delete.
     * @example
     * // Delete a few Cotizacions
     * const { count } = await prisma.cotizacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CotizacionDeleteManyArgs>(args?: SelectSubset<T, CotizacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cotizacions
     * const cotizacion = await prisma.cotizacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CotizacionUpdateManyArgs>(args: SelectSubset<T, CotizacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Cotizacion.
     * @param {CotizacionUpsertArgs} args - Arguments to update or create a Cotizacion.
     * @example
     * // Update or create a Cotizacion
     * const cotizacion = await prisma.cotizacion.upsert({
     *   create: {
     *     // ... data to create a Cotizacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cotizacion we want to update
     *   }
     * })
     */
    upsert<T extends CotizacionUpsertArgs>(args: SelectSubset<T, CotizacionUpsertArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Cotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionCountArgs} args - Arguments to filter Cotizacions to count.
     * @example
     * // Count the number of Cotizacions
     * const count = await prisma.cotizacion.count({
     *   where: {
     *     // ... the filter for the Cotizacions we want to count
     *   }
     * })
    **/
    count<T extends CotizacionCountArgs>(
      args?: Subset<T, CotizacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CotizacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CotizacionAggregateArgs>(args: Subset<T, CotizacionAggregateArgs>): Prisma.PrismaPromise<GetCotizacionAggregateType<T>>

    /**
     * Group by Cotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CotizacionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CotizacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CotizacionGroupByArgs['orderBy'] }
        : { orderBy?: CotizacionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CotizacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCotizacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Cotizacion model
   */
  readonly fields: CotizacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Cotizacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CotizacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cliente<T extends ClienteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClienteDefaultArgs<ExtArgs>>): Prisma__ClienteClient<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    usuario<T extends Cotizacion$usuarioArgs<ExtArgs> = {}>(args?: Subset<T, Cotizacion$usuarioArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    items<T extends Cotizacion$itemsArgs<ExtArgs> = {}>(args?: Subset<T, Cotizacion$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Cotizacion model
   */ 
  interface CotizacionFieldRefs {
    readonly id: FieldRef<"Cotizacion", 'String'>
    readonly numero: FieldRef<"Cotizacion", 'Int'>
    readonly clienteId: FieldRef<"Cotizacion", 'String'>
    readonly usuarioId: FieldRef<"Cotizacion", 'String'>
    readonly fechaEmision: FieldRef<"Cotizacion", 'DateTime'>
    readonly fechaValidez: FieldRef<"Cotizacion", 'DateTime'>
    readonly subtotal: FieldRef<"Cotizacion", 'Float'>
    readonly impuestoTotal: FieldRef<"Cotizacion", 'Float'>
    readonly total: FieldRef<"Cotizacion", 'Float'>
    readonly moneda: FieldRef<"Cotizacion", 'String'>
    readonly estado: FieldRef<"Cotizacion", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Cotizacion findUnique
   */
  export type CotizacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion findUniqueOrThrow
   */
  export type CotizacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion findFirst
   */
  export type CotizacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cotizacions.
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cotizacions.
     */
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion findFirstOrThrow
   */
  export type CotizacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacion to fetch.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Cotizacions.
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Cotizacions.
     */
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion findMany
   */
  export type CotizacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter, which Cotizacions to fetch.
     */
    where?: CotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Cotizacions to fetch.
     */
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Cotizacions.
     */
    cursor?: CotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Cotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Cotizacions.
     */
    skip?: number
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion create
   */
  export type CotizacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * The data needed to create a Cotizacion.
     */
    data: XOR<CotizacionCreateInput, CotizacionUncheckedCreateInput>
  }

  /**
   * Cotizacion createMany
   */
  export type CotizacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Cotizacions.
     */
    data: CotizacionCreateManyInput | CotizacionCreateManyInput[]
  }

  /**
   * Cotizacion createManyAndReturn
   */
  export type CotizacionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Cotizacions.
     */
    data: CotizacionCreateManyInput | CotizacionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Cotizacion update
   */
  export type CotizacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * The data needed to update a Cotizacion.
     */
    data: XOR<CotizacionUpdateInput, CotizacionUncheckedUpdateInput>
    /**
     * Choose, which Cotizacion to update.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion updateMany
   */
  export type CotizacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Cotizacions.
     */
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyInput>
    /**
     * Filter which Cotizacions to update
     */
    where?: CotizacionWhereInput
  }

  /**
   * Cotizacion upsert
   */
  export type CotizacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * The filter to search for the Cotizacion to update in case it exists.
     */
    where: CotizacionWhereUniqueInput
    /**
     * In case the Cotizacion found by the `where` argument doesn't exist, create a new Cotizacion with this data.
     */
    create: XOR<CotizacionCreateInput, CotizacionUncheckedCreateInput>
    /**
     * In case the Cotizacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CotizacionUpdateInput, CotizacionUncheckedUpdateInput>
  }

  /**
   * Cotizacion delete
   */
  export type CotizacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    /**
     * Filter which Cotizacion to delete.
     */
    where: CotizacionWhereUniqueInput
  }

  /**
   * Cotizacion deleteMany
   */
  export type CotizacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Cotizacions to delete
     */
    where?: CotizacionWhereInput
  }

  /**
   * Cotizacion.usuario
   */
  export type Cotizacion$usuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
  }

  /**
   * Cotizacion.items
   */
  export type Cotizacion$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    where?: ItemCotizacionWhereInput
    orderBy?: ItemCotizacionOrderByWithRelationInput | ItemCotizacionOrderByWithRelationInput[]
    cursor?: ItemCotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ItemCotizacionScalarFieldEnum | ItemCotizacionScalarFieldEnum[]
  }

  /**
   * Cotizacion without action
   */
  export type CotizacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
  }


  /**
   * Model ItemCotizacion
   */

  export type AggregateItemCotizacion = {
    _count: ItemCotizacionCountAggregateOutputType | null
    _avg: ItemCotizacionAvgAggregateOutputType | null
    _sum: ItemCotizacionSumAggregateOutputType | null
    _min: ItemCotizacionMinAggregateOutputType | null
    _max: ItemCotizacionMaxAggregateOutputType | null
  }

  export type ItemCotizacionAvgAggregateOutputType = {
    cantidad: number | null
    precioUnitario: number | null
    totalLinea: number | null
  }

  export type ItemCotizacionSumAggregateOutputType = {
    cantidad: number | null
    precioUnitario: number | null
    totalLinea: number | null
  }

  export type ItemCotizacionMinAggregateOutputType = {
    id: string | null
    cotizacionId: string | null
    productoId: string | null
    descripcion: string | null
    cantidad: number | null
    precioUnitario: number | null
    totalLinea: number | null
  }

  export type ItemCotizacionMaxAggregateOutputType = {
    id: string | null
    cotizacionId: string | null
    productoId: string | null
    descripcion: string | null
    cantidad: number | null
    precioUnitario: number | null
    totalLinea: number | null
  }

  export type ItemCotizacionCountAggregateOutputType = {
    id: number
    cotizacionId: number
    productoId: number
    descripcion: number
    cantidad: number
    precioUnitario: number
    totalLinea: number
    _all: number
  }


  export type ItemCotizacionAvgAggregateInputType = {
    cantidad?: true
    precioUnitario?: true
    totalLinea?: true
  }

  export type ItemCotizacionSumAggregateInputType = {
    cantidad?: true
    precioUnitario?: true
    totalLinea?: true
  }

  export type ItemCotizacionMinAggregateInputType = {
    id?: true
    cotizacionId?: true
    productoId?: true
    descripcion?: true
    cantidad?: true
    precioUnitario?: true
    totalLinea?: true
  }

  export type ItemCotizacionMaxAggregateInputType = {
    id?: true
    cotizacionId?: true
    productoId?: true
    descripcion?: true
    cantidad?: true
    precioUnitario?: true
    totalLinea?: true
  }

  export type ItemCotizacionCountAggregateInputType = {
    id?: true
    cotizacionId?: true
    productoId?: true
    descripcion?: true
    cantidad?: true
    precioUnitario?: true
    totalLinea?: true
    _all?: true
  }

  export type ItemCotizacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemCotizacion to aggregate.
     */
    where?: ItemCotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemCotizacions to fetch.
     */
    orderBy?: ItemCotizacionOrderByWithRelationInput | ItemCotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ItemCotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemCotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemCotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ItemCotizacions
    **/
    _count?: true | ItemCotizacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ItemCotizacionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ItemCotizacionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ItemCotizacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ItemCotizacionMaxAggregateInputType
  }

  export type GetItemCotizacionAggregateType<T extends ItemCotizacionAggregateArgs> = {
        [P in keyof T & keyof AggregateItemCotizacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateItemCotizacion[P]>
      : GetScalarType<T[P], AggregateItemCotizacion[P]>
  }




  export type ItemCotizacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemCotizacionWhereInput
    orderBy?: ItemCotizacionOrderByWithAggregationInput | ItemCotizacionOrderByWithAggregationInput[]
    by: ItemCotizacionScalarFieldEnum[] | ItemCotizacionScalarFieldEnum
    having?: ItemCotizacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ItemCotizacionCountAggregateInputType | true
    _avg?: ItemCotizacionAvgAggregateInputType
    _sum?: ItemCotizacionSumAggregateInputType
    _min?: ItemCotizacionMinAggregateInputType
    _max?: ItemCotizacionMaxAggregateInputType
  }

  export type ItemCotizacionGroupByOutputType = {
    id: string
    cotizacionId: string
    productoId: string | null
    descripcion: string
    cantidad: number
    precioUnitario: number
    totalLinea: number
    _count: ItemCotizacionCountAggregateOutputType | null
    _avg: ItemCotizacionAvgAggregateOutputType | null
    _sum: ItemCotizacionSumAggregateOutputType | null
    _min: ItemCotizacionMinAggregateOutputType | null
    _max: ItemCotizacionMaxAggregateOutputType | null
  }

  type GetItemCotizacionGroupByPayload<T extends ItemCotizacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ItemCotizacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ItemCotizacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ItemCotizacionGroupByOutputType[P]>
            : GetScalarType<T[P], ItemCotizacionGroupByOutputType[P]>
        }
      >
    >


  export type ItemCotizacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cotizacionId?: boolean
    productoId?: boolean
    descripcion?: boolean
    cantidad?: boolean
    precioUnitario?: boolean
    totalLinea?: boolean
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itemCotizacion"]>

  export type ItemCotizacionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cotizacionId?: boolean
    productoId?: boolean
    descripcion?: boolean
    cantidad?: boolean
    precioUnitario?: boolean
    totalLinea?: boolean
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itemCotizacion"]>

  export type ItemCotizacionSelectScalar = {
    id?: boolean
    cotizacionId?: boolean
    productoId?: boolean
    descripcion?: boolean
    cantidad?: boolean
    precioUnitario?: boolean
    totalLinea?: boolean
  }

  export type ItemCotizacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
  }
  export type ItemCotizacionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cotizacion?: boolean | CotizacionDefaultArgs<ExtArgs>
  }

  export type $ItemCotizacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ItemCotizacion"
    objects: {
      cotizacion: Prisma.$CotizacionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cotizacionId: string
      productoId: string | null
      descripcion: string
      cantidad: number
      precioUnitario: number
      totalLinea: number
    }, ExtArgs["result"]["itemCotizacion"]>
    composites: {}
  }

  type ItemCotizacionGetPayload<S extends boolean | null | undefined | ItemCotizacionDefaultArgs> = $Result.GetResult<Prisma.$ItemCotizacionPayload, S>

  type ItemCotizacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ItemCotizacionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ItemCotizacionCountAggregateInputType | true
    }

  export interface ItemCotizacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ItemCotizacion'], meta: { name: 'ItemCotizacion' } }
    /**
     * Find zero or one ItemCotizacion that matches the filter.
     * @param {ItemCotizacionFindUniqueArgs} args - Arguments to find a ItemCotizacion
     * @example
     * // Get one ItemCotizacion
     * const itemCotizacion = await prisma.itemCotizacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ItemCotizacionFindUniqueArgs>(args: SelectSubset<T, ItemCotizacionFindUniqueArgs<ExtArgs>>): Prisma__ItemCotizacionClient<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ItemCotizacion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ItemCotizacionFindUniqueOrThrowArgs} args - Arguments to find a ItemCotizacion
     * @example
     * // Get one ItemCotizacion
     * const itemCotizacion = await prisma.itemCotizacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ItemCotizacionFindUniqueOrThrowArgs>(args: SelectSubset<T, ItemCotizacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ItemCotizacionClient<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ItemCotizacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCotizacionFindFirstArgs} args - Arguments to find a ItemCotizacion
     * @example
     * // Get one ItemCotizacion
     * const itemCotizacion = await prisma.itemCotizacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ItemCotizacionFindFirstArgs>(args?: SelectSubset<T, ItemCotizacionFindFirstArgs<ExtArgs>>): Prisma__ItemCotizacionClient<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ItemCotizacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCotizacionFindFirstOrThrowArgs} args - Arguments to find a ItemCotizacion
     * @example
     * // Get one ItemCotizacion
     * const itemCotizacion = await prisma.itemCotizacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ItemCotizacionFindFirstOrThrowArgs>(args?: SelectSubset<T, ItemCotizacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ItemCotizacionClient<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ItemCotizacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCotizacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ItemCotizacions
     * const itemCotizacions = await prisma.itemCotizacion.findMany()
     * 
     * // Get first 10 ItemCotizacions
     * const itemCotizacions = await prisma.itemCotizacion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const itemCotizacionWithIdOnly = await prisma.itemCotizacion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ItemCotizacionFindManyArgs>(args?: SelectSubset<T, ItemCotizacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ItemCotizacion.
     * @param {ItemCotizacionCreateArgs} args - Arguments to create a ItemCotizacion.
     * @example
     * // Create one ItemCotizacion
     * const ItemCotizacion = await prisma.itemCotizacion.create({
     *   data: {
     *     // ... data to create a ItemCotizacion
     *   }
     * })
     * 
     */
    create<T extends ItemCotizacionCreateArgs>(args: SelectSubset<T, ItemCotizacionCreateArgs<ExtArgs>>): Prisma__ItemCotizacionClient<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ItemCotizacions.
     * @param {ItemCotizacionCreateManyArgs} args - Arguments to create many ItemCotizacions.
     * @example
     * // Create many ItemCotizacions
     * const itemCotizacion = await prisma.itemCotizacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ItemCotizacionCreateManyArgs>(args?: SelectSubset<T, ItemCotizacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ItemCotizacions and returns the data saved in the database.
     * @param {ItemCotizacionCreateManyAndReturnArgs} args - Arguments to create many ItemCotizacions.
     * @example
     * // Create many ItemCotizacions
     * const itemCotizacion = await prisma.itemCotizacion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ItemCotizacions and only return the `id`
     * const itemCotizacionWithIdOnly = await prisma.itemCotizacion.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ItemCotizacionCreateManyAndReturnArgs>(args?: SelectSubset<T, ItemCotizacionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ItemCotizacion.
     * @param {ItemCotizacionDeleteArgs} args - Arguments to delete one ItemCotizacion.
     * @example
     * // Delete one ItemCotizacion
     * const ItemCotizacion = await prisma.itemCotizacion.delete({
     *   where: {
     *     // ... filter to delete one ItemCotizacion
     *   }
     * })
     * 
     */
    delete<T extends ItemCotizacionDeleteArgs>(args: SelectSubset<T, ItemCotizacionDeleteArgs<ExtArgs>>): Prisma__ItemCotizacionClient<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ItemCotizacion.
     * @param {ItemCotizacionUpdateArgs} args - Arguments to update one ItemCotizacion.
     * @example
     * // Update one ItemCotizacion
     * const itemCotizacion = await prisma.itemCotizacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ItemCotizacionUpdateArgs>(args: SelectSubset<T, ItemCotizacionUpdateArgs<ExtArgs>>): Prisma__ItemCotizacionClient<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ItemCotizacions.
     * @param {ItemCotizacionDeleteManyArgs} args - Arguments to filter ItemCotizacions to delete.
     * @example
     * // Delete a few ItemCotizacions
     * const { count } = await prisma.itemCotizacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ItemCotizacionDeleteManyArgs>(args?: SelectSubset<T, ItemCotizacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ItemCotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCotizacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ItemCotizacions
     * const itemCotizacion = await prisma.itemCotizacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ItemCotizacionUpdateManyArgs>(args: SelectSubset<T, ItemCotizacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ItemCotizacion.
     * @param {ItemCotizacionUpsertArgs} args - Arguments to update or create a ItemCotizacion.
     * @example
     * // Update or create a ItemCotizacion
     * const itemCotizacion = await prisma.itemCotizacion.upsert({
     *   create: {
     *     // ... data to create a ItemCotizacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ItemCotizacion we want to update
     *   }
     * })
     */
    upsert<T extends ItemCotizacionUpsertArgs>(args: SelectSubset<T, ItemCotizacionUpsertArgs<ExtArgs>>): Prisma__ItemCotizacionClient<$Result.GetResult<Prisma.$ItemCotizacionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ItemCotizacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCotizacionCountArgs} args - Arguments to filter ItemCotizacions to count.
     * @example
     * // Count the number of ItemCotizacions
     * const count = await prisma.itemCotizacion.count({
     *   where: {
     *     // ... the filter for the ItemCotizacions we want to count
     *   }
     * })
    **/
    count<T extends ItemCotizacionCountArgs>(
      args?: Subset<T, ItemCotizacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ItemCotizacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ItemCotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCotizacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ItemCotizacionAggregateArgs>(args: Subset<T, ItemCotizacionAggregateArgs>): Prisma.PrismaPromise<GetItemCotizacionAggregateType<T>>

    /**
     * Group by ItemCotizacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCotizacionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ItemCotizacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ItemCotizacionGroupByArgs['orderBy'] }
        : { orderBy?: ItemCotizacionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ItemCotizacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetItemCotizacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ItemCotizacion model
   */
  readonly fields: ItemCotizacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ItemCotizacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ItemCotizacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cotizacion<T extends CotizacionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CotizacionDefaultArgs<ExtArgs>>): Prisma__CotizacionClient<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ItemCotizacion model
   */ 
  interface ItemCotizacionFieldRefs {
    readonly id: FieldRef<"ItemCotizacion", 'String'>
    readonly cotizacionId: FieldRef<"ItemCotizacion", 'String'>
    readonly productoId: FieldRef<"ItemCotizacion", 'String'>
    readonly descripcion: FieldRef<"ItemCotizacion", 'String'>
    readonly cantidad: FieldRef<"ItemCotizacion", 'Int'>
    readonly precioUnitario: FieldRef<"ItemCotizacion", 'Float'>
    readonly totalLinea: FieldRef<"ItemCotizacion", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * ItemCotizacion findUnique
   */
  export type ItemCotizacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which ItemCotizacion to fetch.
     */
    where: ItemCotizacionWhereUniqueInput
  }

  /**
   * ItemCotizacion findUniqueOrThrow
   */
  export type ItemCotizacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which ItemCotizacion to fetch.
     */
    where: ItemCotizacionWhereUniqueInput
  }

  /**
   * ItemCotizacion findFirst
   */
  export type ItemCotizacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which ItemCotizacion to fetch.
     */
    where?: ItemCotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemCotizacions to fetch.
     */
    orderBy?: ItemCotizacionOrderByWithRelationInput | ItemCotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemCotizacions.
     */
    cursor?: ItemCotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemCotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemCotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemCotizacions.
     */
    distinct?: ItemCotizacionScalarFieldEnum | ItemCotizacionScalarFieldEnum[]
  }

  /**
   * ItemCotizacion findFirstOrThrow
   */
  export type ItemCotizacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which ItemCotizacion to fetch.
     */
    where?: ItemCotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemCotizacions to fetch.
     */
    orderBy?: ItemCotizacionOrderByWithRelationInput | ItemCotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemCotizacions.
     */
    cursor?: ItemCotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemCotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemCotizacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemCotizacions.
     */
    distinct?: ItemCotizacionScalarFieldEnum | ItemCotizacionScalarFieldEnum[]
  }

  /**
   * ItemCotizacion findMany
   */
  export type ItemCotizacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    /**
     * Filter, which ItemCotizacions to fetch.
     */
    where?: ItemCotizacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemCotizacions to fetch.
     */
    orderBy?: ItemCotizacionOrderByWithRelationInput | ItemCotizacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ItemCotizacions.
     */
    cursor?: ItemCotizacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemCotizacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemCotizacions.
     */
    skip?: number
    distinct?: ItemCotizacionScalarFieldEnum | ItemCotizacionScalarFieldEnum[]
  }

  /**
   * ItemCotizacion create
   */
  export type ItemCotizacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    /**
     * The data needed to create a ItemCotizacion.
     */
    data: XOR<ItemCotizacionCreateInput, ItemCotizacionUncheckedCreateInput>
  }

  /**
   * ItemCotizacion createMany
   */
  export type ItemCotizacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ItemCotizacions.
     */
    data: ItemCotizacionCreateManyInput | ItemCotizacionCreateManyInput[]
  }

  /**
   * ItemCotizacion createManyAndReturn
   */
  export type ItemCotizacionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ItemCotizacions.
     */
    data: ItemCotizacionCreateManyInput | ItemCotizacionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ItemCotizacion update
   */
  export type ItemCotizacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    /**
     * The data needed to update a ItemCotizacion.
     */
    data: XOR<ItemCotizacionUpdateInput, ItemCotizacionUncheckedUpdateInput>
    /**
     * Choose, which ItemCotizacion to update.
     */
    where: ItemCotizacionWhereUniqueInput
  }

  /**
   * ItemCotizacion updateMany
   */
  export type ItemCotizacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ItemCotizacions.
     */
    data: XOR<ItemCotizacionUpdateManyMutationInput, ItemCotizacionUncheckedUpdateManyInput>
    /**
     * Filter which ItemCotizacions to update
     */
    where?: ItemCotizacionWhereInput
  }

  /**
   * ItemCotizacion upsert
   */
  export type ItemCotizacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    /**
     * The filter to search for the ItemCotizacion to update in case it exists.
     */
    where: ItemCotizacionWhereUniqueInput
    /**
     * In case the ItemCotizacion found by the `where` argument doesn't exist, create a new ItemCotizacion with this data.
     */
    create: XOR<ItemCotizacionCreateInput, ItemCotizacionUncheckedCreateInput>
    /**
     * In case the ItemCotizacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ItemCotizacionUpdateInput, ItemCotizacionUncheckedUpdateInput>
  }

  /**
   * ItemCotizacion delete
   */
  export type ItemCotizacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
    /**
     * Filter which ItemCotizacion to delete.
     */
    where: ItemCotizacionWhereUniqueInput
  }

  /**
   * ItemCotizacion deleteMany
   */
  export type ItemCotizacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemCotizacions to delete
     */
    where?: ItemCotizacionWhereInput
  }

  /**
   * ItemCotizacion without action
   */
  export type ItemCotizacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCotizacion
     */
    select?: ItemCotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCotizacionInclude<ExtArgs> | null
  }


  /**
   * Model Usuario
   */

  export type AggregateUsuario = {
    _count: UsuarioCountAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  export type UsuarioMinAggregateOutputType = {
    id: string | null
    username: string | null
    passwordHash: string | null
    nombre: string | null
    rol: string | null
    activo: boolean | null
    empresaId: string | null
    subscriptionStatus: string | null
    planType: string | null
    trialStartsAt: Date | null
    trialEndsAt: Date | null
    currentPeriodEnd: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UsuarioMaxAggregateOutputType = {
    id: string | null
    username: string | null
    passwordHash: string | null
    nombre: string | null
    rol: string | null
    activo: boolean | null
    empresaId: string | null
    subscriptionStatus: string | null
    planType: string | null
    trialStartsAt: Date | null
    trialEndsAt: Date | null
    currentPeriodEnd: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UsuarioCountAggregateOutputType = {
    id: number
    username: number
    passwordHash: number
    nombre: number
    rol: number
    activo: number
    empresaId: number
    subscriptionStatus: number
    planType: number
    trialStartsAt: number
    trialEndsAt: number
    currentPeriodEnd: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UsuarioMinAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    nombre?: true
    rol?: true
    activo?: true
    empresaId?: true
    subscriptionStatus?: true
    planType?: true
    trialStartsAt?: true
    trialEndsAt?: true
    currentPeriodEnd?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UsuarioMaxAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    nombre?: true
    rol?: true
    activo?: true
    empresaId?: true
    subscriptionStatus?: true
    planType?: true
    trialStartsAt?: true
    trialEndsAt?: true
    currentPeriodEnd?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UsuarioCountAggregateInputType = {
    id?: true
    username?: true
    passwordHash?: true
    nombre?: true
    rol?: true
    activo?: true
    empresaId?: true
    subscriptionStatus?: true
    planType?: true
    trialStartsAt?: true
    trialEndsAt?: true
    currentPeriodEnd?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UsuarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuario to aggregate.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Usuarios
    **/
    _count?: true | UsuarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsuarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsuarioMaxAggregateInputType
  }

  export type GetUsuarioAggregateType<T extends UsuarioAggregateArgs> = {
        [P in keyof T & keyof AggregateUsuario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsuario[P]>
      : GetScalarType<T[P], AggregateUsuario[P]>
  }




  export type UsuarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsuarioWhereInput
    orderBy?: UsuarioOrderByWithAggregationInput | UsuarioOrderByWithAggregationInput[]
    by: UsuarioScalarFieldEnum[] | UsuarioScalarFieldEnum
    having?: UsuarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsuarioCountAggregateInputType | true
    _min?: UsuarioMinAggregateInputType
    _max?: UsuarioMaxAggregateInputType
  }

  export type UsuarioGroupByOutputType = {
    id: string
    username: string
    passwordHash: string
    nombre: string
    rol: string
    activo: boolean
    empresaId: string | null
    subscriptionStatus: string
    planType: string | null
    trialStartsAt: Date | null
    trialEndsAt: Date | null
    currentPeriodEnd: Date | null
    createdAt: Date
    updatedAt: Date
    _count: UsuarioCountAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  type GetUsuarioGroupByPayload<T extends UsuarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsuarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsuarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
            : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
        }
      >
    >


  export type UsuarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    nombre?: boolean
    rol?: boolean
    activo?: boolean
    empresaId?: boolean
    subscriptionStatus?: boolean
    planType?: boolean
    trialStartsAt?: boolean
    trialEndsAt?: boolean
    currentPeriodEnd?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    empresa?: boolean | Usuario$empresaArgs<ExtArgs>
    subUsuarios?: boolean | Usuario$subUsuariosArgs<ExtArgs>
    productos?: boolean | Usuario$productosArgs<ExtArgs>
    clientes?: boolean | Usuario$clientesArgs<ExtArgs>
    facturas?: boolean | Usuario$facturasArgs<ExtArgs>
    cierresCaja?: boolean | Usuario$cierresCajaArgs<ExtArgs>
    cotizaciones?: boolean | Usuario$cotizacionesArgs<ExtArgs>
    solicitudesActivacion?: boolean | Usuario$solicitudesActivacionArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    nombre?: boolean
    rol?: boolean
    activo?: boolean
    empresaId?: boolean
    subscriptionStatus?: boolean
    planType?: boolean
    trialStartsAt?: boolean
    trialEndsAt?: boolean
    currentPeriodEnd?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    empresa?: boolean | Usuario$empresaArgs<ExtArgs>
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectScalar = {
    id?: boolean
    username?: boolean
    passwordHash?: boolean
    nombre?: boolean
    rol?: boolean
    activo?: boolean
    empresaId?: boolean
    subscriptionStatus?: boolean
    planType?: boolean
    trialStartsAt?: boolean
    trialEndsAt?: boolean
    currentPeriodEnd?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UsuarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresa?: boolean | Usuario$empresaArgs<ExtArgs>
    subUsuarios?: boolean | Usuario$subUsuariosArgs<ExtArgs>
    productos?: boolean | Usuario$productosArgs<ExtArgs>
    clientes?: boolean | Usuario$clientesArgs<ExtArgs>
    facturas?: boolean | Usuario$facturasArgs<ExtArgs>
    cierresCaja?: boolean | Usuario$cierresCajaArgs<ExtArgs>
    cotizaciones?: boolean | Usuario$cotizacionesArgs<ExtArgs>
    solicitudesActivacion?: boolean | Usuario$solicitudesActivacionArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UsuarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    empresa?: boolean | Usuario$empresaArgs<ExtArgs>
  }

  export type $UsuarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Usuario"
    objects: {
      empresa: Prisma.$UsuarioPayload<ExtArgs> | null
      subUsuarios: Prisma.$UsuarioPayload<ExtArgs>[]
      productos: Prisma.$ProductoPayload<ExtArgs>[]
      clientes: Prisma.$ClientePayload<ExtArgs>[]
      facturas: Prisma.$FacturaPayload<ExtArgs>[]
      cierresCaja: Prisma.$CierreCajaPayload<ExtArgs>[]
      cotizaciones: Prisma.$CotizacionPayload<ExtArgs>[]
      solicitudesActivacion: Prisma.$SolicitudActivacionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      username: string
      passwordHash: string
      nombre: string
      rol: string
      activo: boolean
      empresaId: string | null
      subscriptionStatus: string
      planType: string | null
      trialStartsAt: Date | null
      trialEndsAt: Date | null
      currentPeriodEnd: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["usuario"]>
    composites: {}
  }

  type UsuarioGetPayload<S extends boolean | null | undefined | UsuarioDefaultArgs> = $Result.GetResult<Prisma.$UsuarioPayload, S>

  type UsuarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UsuarioFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UsuarioCountAggregateInputType | true
    }

  export interface UsuarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Usuario'], meta: { name: 'Usuario' } }
    /**
     * Find zero or one Usuario that matches the filter.
     * @param {UsuarioFindUniqueArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsuarioFindUniqueArgs>(args: SelectSubset<T, UsuarioFindUniqueArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Usuario that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UsuarioFindUniqueOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsuarioFindUniqueOrThrowArgs>(args: SelectSubset<T, UsuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Usuario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsuarioFindFirstArgs>(args?: SelectSubset<T, UsuarioFindFirstArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Usuario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsuarioFindFirstOrThrowArgs>(args?: SelectSubset<T, UsuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Usuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Usuarios
     * const usuarios = await prisma.usuario.findMany()
     * 
     * // Get first 10 Usuarios
     * const usuarios = await prisma.usuario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usuarioWithIdOnly = await prisma.usuario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UsuarioFindManyArgs>(args?: SelectSubset<T, UsuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Usuario.
     * @param {UsuarioCreateArgs} args - Arguments to create a Usuario.
     * @example
     * // Create one Usuario
     * const Usuario = await prisma.usuario.create({
     *   data: {
     *     // ... data to create a Usuario
     *   }
     * })
     * 
     */
    create<T extends UsuarioCreateArgs>(args: SelectSubset<T, UsuarioCreateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Usuarios.
     * @param {UsuarioCreateManyArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsuarioCreateManyArgs>(args?: SelectSubset<T, UsuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Usuarios and returns the data saved in the database.
     * @param {UsuarioCreateManyAndReturnArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Usuarios and only return the `id`
     * const usuarioWithIdOnly = await prisma.usuario.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsuarioCreateManyAndReturnArgs>(args?: SelectSubset<T, UsuarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Usuario.
     * @param {UsuarioDeleteArgs} args - Arguments to delete one Usuario.
     * @example
     * // Delete one Usuario
     * const Usuario = await prisma.usuario.delete({
     *   where: {
     *     // ... filter to delete one Usuario
     *   }
     * })
     * 
     */
    delete<T extends UsuarioDeleteArgs>(args: SelectSubset<T, UsuarioDeleteArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Usuario.
     * @param {UsuarioUpdateArgs} args - Arguments to update one Usuario.
     * @example
     * // Update one Usuario
     * const usuario = await prisma.usuario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsuarioUpdateArgs>(args: SelectSubset<T, UsuarioUpdateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Usuarios.
     * @param {UsuarioDeleteManyArgs} args - Arguments to filter Usuarios to delete.
     * @example
     * // Delete a few Usuarios
     * const { count } = await prisma.usuario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsuarioDeleteManyArgs>(args?: SelectSubset<T, UsuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsuarioUpdateManyArgs>(args: SelectSubset<T, UsuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Usuario.
     * @param {UsuarioUpsertArgs} args - Arguments to update or create a Usuario.
     * @example
     * // Update or create a Usuario
     * const usuario = await prisma.usuario.upsert({
     *   create: {
     *     // ... data to create a Usuario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Usuario we want to update
     *   }
     * })
     */
    upsert<T extends UsuarioUpsertArgs>(args: SelectSubset<T, UsuarioUpsertArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioCountArgs} args - Arguments to filter Usuarios to count.
     * @example
     * // Count the number of Usuarios
     * const count = await prisma.usuario.count({
     *   where: {
     *     // ... the filter for the Usuarios we want to count
     *   }
     * })
    **/
    count<T extends UsuarioCountArgs>(
      args?: Subset<T, UsuarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsuarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsuarioAggregateArgs>(args: Subset<T, UsuarioAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAggregateType<T>>

    /**
     * Group by Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsuarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsuarioGroupByArgs['orderBy'] }
        : { orderBy?: UsuarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Usuario model
   */
  readonly fields: UsuarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Usuario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsuarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    empresa<T extends Usuario$empresaArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$empresaArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    subUsuarios<T extends Usuario$subUsuariosArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$subUsuariosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany"> | Null>
    productos<T extends Usuario$productosArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$productosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductoPayload<ExtArgs>, T, "findMany"> | Null>
    clientes<T extends Usuario$clientesArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$clientesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientePayload<ExtArgs>, T, "findMany"> | Null>
    facturas<T extends Usuario$facturasArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$facturasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FacturaPayload<ExtArgs>, T, "findMany"> | Null>
    cierresCaja<T extends Usuario$cierresCajaArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$cierresCajaArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CierreCajaPayload<ExtArgs>, T, "findMany"> | Null>
    cotizaciones<T extends Usuario$cotizacionesArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$cotizacionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CotizacionPayload<ExtArgs>, T, "findMany"> | Null>
    solicitudesActivacion<T extends Usuario$solicitudesActivacionArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$solicitudesActivacionArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Usuario model
   */ 
  interface UsuarioFieldRefs {
    readonly id: FieldRef<"Usuario", 'String'>
    readonly username: FieldRef<"Usuario", 'String'>
    readonly passwordHash: FieldRef<"Usuario", 'String'>
    readonly nombre: FieldRef<"Usuario", 'String'>
    readonly rol: FieldRef<"Usuario", 'String'>
    readonly activo: FieldRef<"Usuario", 'Boolean'>
    readonly empresaId: FieldRef<"Usuario", 'String'>
    readonly subscriptionStatus: FieldRef<"Usuario", 'String'>
    readonly planType: FieldRef<"Usuario", 'String'>
    readonly trialStartsAt: FieldRef<"Usuario", 'DateTime'>
    readonly trialEndsAt: FieldRef<"Usuario", 'DateTime'>
    readonly currentPeriodEnd: FieldRef<"Usuario", 'DateTime'>
    readonly createdAt: FieldRef<"Usuario", 'DateTime'>
    readonly updatedAt: FieldRef<"Usuario", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Usuario findUnique
   */
  export type UsuarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findUniqueOrThrow
   */
  export type UsuarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findFirst
   */
  export type UsuarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findFirstOrThrow
   */
  export type UsuarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findMany
   */
  export type UsuarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuarios to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario create
   */
  export type UsuarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to create a Usuario.
     */
    data: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
  }

  /**
   * Usuario createMany
   */
  export type UsuarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
  }

  /**
   * Usuario createManyAndReturn
   */
  export type UsuarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Usuario update
   */
  export type UsuarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to update a Usuario.
     */
    data: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
    /**
     * Choose, which Usuario to update.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario updateMany
   */
  export type UsuarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Usuarios.
     */
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyInput>
    /**
     * Filter which Usuarios to update
     */
    where?: UsuarioWhereInput
  }

  /**
   * Usuario upsert
   */
  export type UsuarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The filter to search for the Usuario to update in case it exists.
     */
    where: UsuarioWhereUniqueInput
    /**
     * In case the Usuario found by the `where` argument doesn't exist, create a new Usuario with this data.
     */
    create: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
    /**
     * In case the Usuario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
  }

  /**
   * Usuario delete
   */
  export type UsuarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter which Usuario to delete.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario deleteMany
   */
  export type UsuarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuarios to delete
     */
    where?: UsuarioWhereInput
  }

  /**
   * Usuario.empresa
   */
  export type Usuario$empresaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
  }

  /**
   * Usuario.subUsuarios
   */
  export type Usuario$subUsuariosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    cursor?: UsuarioWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario.productos
   */
  export type Usuario$productosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Producto
     */
    select?: ProductoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductoInclude<ExtArgs> | null
    where?: ProductoWhereInput
    orderBy?: ProductoOrderByWithRelationInput | ProductoOrderByWithRelationInput[]
    cursor?: ProductoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductoScalarFieldEnum | ProductoScalarFieldEnum[]
  }

  /**
   * Usuario.clientes
   */
  export type Usuario$clientesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cliente
     */
    select?: ClienteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClienteInclude<ExtArgs> | null
    where?: ClienteWhereInput
    orderBy?: ClienteOrderByWithRelationInput | ClienteOrderByWithRelationInput[]
    cursor?: ClienteWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClienteScalarFieldEnum | ClienteScalarFieldEnum[]
  }

  /**
   * Usuario.facturas
   */
  export type Usuario$facturasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Factura
     */
    select?: FacturaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FacturaInclude<ExtArgs> | null
    where?: FacturaWhereInput
    orderBy?: FacturaOrderByWithRelationInput | FacturaOrderByWithRelationInput[]
    cursor?: FacturaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FacturaScalarFieldEnum | FacturaScalarFieldEnum[]
  }

  /**
   * Usuario.cierresCaja
   */
  export type Usuario$cierresCajaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CierreCaja
     */
    select?: CierreCajaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CierreCajaInclude<ExtArgs> | null
    where?: CierreCajaWhereInput
    orderBy?: CierreCajaOrderByWithRelationInput | CierreCajaOrderByWithRelationInput[]
    cursor?: CierreCajaWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CierreCajaScalarFieldEnum | CierreCajaScalarFieldEnum[]
  }

  /**
   * Usuario.cotizaciones
   */
  export type Usuario$cotizacionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Cotizacion
     */
    select?: CotizacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CotizacionInclude<ExtArgs> | null
    where?: CotizacionWhereInput
    orderBy?: CotizacionOrderByWithRelationInput | CotizacionOrderByWithRelationInput[]
    cursor?: CotizacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CotizacionScalarFieldEnum | CotizacionScalarFieldEnum[]
  }

  /**
   * Usuario.solicitudesActivacion
   */
  export type Usuario$solicitudesActivacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    where?: SolicitudActivacionWhereInput
    orderBy?: SolicitudActivacionOrderByWithRelationInput | SolicitudActivacionOrderByWithRelationInput[]
    cursor?: SolicitudActivacionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SolicitudActivacionScalarFieldEnum | SolicitudActivacionScalarFieldEnum[]
  }

  /**
   * Usuario without action
   */
  export type UsuarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
  }


  /**
   * Model SolicitudActivacion
   */

  export type AggregateSolicitudActivacion = {
    _count: SolicitudActivacionCountAggregateOutputType | null
    _min: SolicitudActivacionMinAggregateOutputType | null
    _max: SolicitudActivacionMaxAggregateOutputType | null
  }

  export type SolicitudActivacionMinAggregateOutputType = {
    id: string | null
    usuarioId: string | null
    plan: string | null
    metodoPago: string | null
    referencia: string | null
    estado: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SolicitudActivacionMaxAggregateOutputType = {
    id: string | null
    usuarioId: string | null
    plan: string | null
    metodoPago: string | null
    referencia: string | null
    estado: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SolicitudActivacionCountAggregateOutputType = {
    id: number
    usuarioId: number
    plan: number
    metodoPago: number
    referencia: number
    estado: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SolicitudActivacionMinAggregateInputType = {
    id?: true
    usuarioId?: true
    plan?: true
    metodoPago?: true
    referencia?: true
    estado?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SolicitudActivacionMaxAggregateInputType = {
    id?: true
    usuarioId?: true
    plan?: true
    metodoPago?: true
    referencia?: true
    estado?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SolicitudActivacionCountAggregateInputType = {
    id?: true
    usuarioId?: true
    plan?: true
    metodoPago?: true
    referencia?: true
    estado?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SolicitudActivacionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SolicitudActivacion to aggregate.
     */
    where?: SolicitudActivacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SolicitudActivacions to fetch.
     */
    orderBy?: SolicitudActivacionOrderByWithRelationInput | SolicitudActivacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SolicitudActivacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SolicitudActivacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SolicitudActivacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SolicitudActivacions
    **/
    _count?: true | SolicitudActivacionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SolicitudActivacionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SolicitudActivacionMaxAggregateInputType
  }

  export type GetSolicitudActivacionAggregateType<T extends SolicitudActivacionAggregateArgs> = {
        [P in keyof T & keyof AggregateSolicitudActivacion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSolicitudActivacion[P]>
      : GetScalarType<T[P], AggregateSolicitudActivacion[P]>
  }




  export type SolicitudActivacionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SolicitudActivacionWhereInput
    orderBy?: SolicitudActivacionOrderByWithAggregationInput | SolicitudActivacionOrderByWithAggregationInput[]
    by: SolicitudActivacionScalarFieldEnum[] | SolicitudActivacionScalarFieldEnum
    having?: SolicitudActivacionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SolicitudActivacionCountAggregateInputType | true
    _min?: SolicitudActivacionMinAggregateInputType
    _max?: SolicitudActivacionMaxAggregateInputType
  }

  export type SolicitudActivacionGroupByOutputType = {
    id: string
    usuarioId: string
    plan: string
    metodoPago: string
    referencia: string
    estado: string
    createdAt: Date
    updatedAt: Date
    _count: SolicitudActivacionCountAggregateOutputType | null
    _min: SolicitudActivacionMinAggregateOutputType | null
    _max: SolicitudActivacionMaxAggregateOutputType | null
  }

  type GetSolicitudActivacionGroupByPayload<T extends SolicitudActivacionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SolicitudActivacionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SolicitudActivacionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SolicitudActivacionGroupByOutputType[P]>
            : GetScalarType<T[P], SolicitudActivacionGroupByOutputType[P]>
        }
      >
    >


  export type SolicitudActivacionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    usuarioId?: boolean
    plan?: boolean
    metodoPago?: boolean
    referencia?: boolean
    estado?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["solicitudActivacion"]>

  export type SolicitudActivacionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    usuarioId?: boolean
    plan?: boolean
    metodoPago?: boolean
    referencia?: boolean
    estado?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["solicitudActivacion"]>

  export type SolicitudActivacionSelectScalar = {
    id?: boolean
    usuarioId?: boolean
    plan?: boolean
    metodoPago?: boolean
    referencia?: boolean
    estado?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SolicitudActivacionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }
  export type SolicitudActivacionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | UsuarioDefaultArgs<ExtArgs>
  }

  export type $SolicitudActivacionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SolicitudActivacion"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      usuarioId: string
      plan: string
      metodoPago: string
      referencia: string
      estado: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["solicitudActivacion"]>
    composites: {}
  }

  type SolicitudActivacionGetPayload<S extends boolean | null | undefined | SolicitudActivacionDefaultArgs> = $Result.GetResult<Prisma.$SolicitudActivacionPayload, S>

  type SolicitudActivacionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SolicitudActivacionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SolicitudActivacionCountAggregateInputType | true
    }

  export interface SolicitudActivacionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SolicitudActivacion'], meta: { name: 'SolicitudActivacion' } }
    /**
     * Find zero or one SolicitudActivacion that matches the filter.
     * @param {SolicitudActivacionFindUniqueArgs} args - Arguments to find a SolicitudActivacion
     * @example
     * // Get one SolicitudActivacion
     * const solicitudActivacion = await prisma.solicitudActivacion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SolicitudActivacionFindUniqueArgs>(args: SelectSubset<T, SolicitudActivacionFindUniqueArgs<ExtArgs>>): Prisma__SolicitudActivacionClient<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SolicitudActivacion that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SolicitudActivacionFindUniqueOrThrowArgs} args - Arguments to find a SolicitudActivacion
     * @example
     * // Get one SolicitudActivacion
     * const solicitudActivacion = await prisma.solicitudActivacion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SolicitudActivacionFindUniqueOrThrowArgs>(args: SelectSubset<T, SolicitudActivacionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SolicitudActivacionClient<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SolicitudActivacion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolicitudActivacionFindFirstArgs} args - Arguments to find a SolicitudActivacion
     * @example
     * // Get one SolicitudActivacion
     * const solicitudActivacion = await prisma.solicitudActivacion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SolicitudActivacionFindFirstArgs>(args?: SelectSubset<T, SolicitudActivacionFindFirstArgs<ExtArgs>>): Prisma__SolicitudActivacionClient<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SolicitudActivacion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolicitudActivacionFindFirstOrThrowArgs} args - Arguments to find a SolicitudActivacion
     * @example
     * // Get one SolicitudActivacion
     * const solicitudActivacion = await prisma.solicitudActivacion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SolicitudActivacionFindFirstOrThrowArgs>(args?: SelectSubset<T, SolicitudActivacionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SolicitudActivacionClient<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SolicitudActivacions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolicitudActivacionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SolicitudActivacions
     * const solicitudActivacions = await prisma.solicitudActivacion.findMany()
     * 
     * // Get first 10 SolicitudActivacions
     * const solicitudActivacions = await prisma.solicitudActivacion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const solicitudActivacionWithIdOnly = await prisma.solicitudActivacion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SolicitudActivacionFindManyArgs>(args?: SelectSubset<T, SolicitudActivacionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SolicitudActivacion.
     * @param {SolicitudActivacionCreateArgs} args - Arguments to create a SolicitudActivacion.
     * @example
     * // Create one SolicitudActivacion
     * const SolicitudActivacion = await prisma.solicitudActivacion.create({
     *   data: {
     *     // ... data to create a SolicitudActivacion
     *   }
     * })
     * 
     */
    create<T extends SolicitudActivacionCreateArgs>(args: SelectSubset<T, SolicitudActivacionCreateArgs<ExtArgs>>): Prisma__SolicitudActivacionClient<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SolicitudActivacions.
     * @param {SolicitudActivacionCreateManyArgs} args - Arguments to create many SolicitudActivacions.
     * @example
     * // Create many SolicitudActivacions
     * const solicitudActivacion = await prisma.solicitudActivacion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SolicitudActivacionCreateManyArgs>(args?: SelectSubset<T, SolicitudActivacionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SolicitudActivacions and returns the data saved in the database.
     * @param {SolicitudActivacionCreateManyAndReturnArgs} args - Arguments to create many SolicitudActivacions.
     * @example
     * // Create many SolicitudActivacions
     * const solicitudActivacion = await prisma.solicitudActivacion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SolicitudActivacions and only return the `id`
     * const solicitudActivacionWithIdOnly = await prisma.solicitudActivacion.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SolicitudActivacionCreateManyAndReturnArgs>(args?: SelectSubset<T, SolicitudActivacionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SolicitudActivacion.
     * @param {SolicitudActivacionDeleteArgs} args - Arguments to delete one SolicitudActivacion.
     * @example
     * // Delete one SolicitudActivacion
     * const SolicitudActivacion = await prisma.solicitudActivacion.delete({
     *   where: {
     *     // ... filter to delete one SolicitudActivacion
     *   }
     * })
     * 
     */
    delete<T extends SolicitudActivacionDeleteArgs>(args: SelectSubset<T, SolicitudActivacionDeleteArgs<ExtArgs>>): Prisma__SolicitudActivacionClient<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SolicitudActivacion.
     * @param {SolicitudActivacionUpdateArgs} args - Arguments to update one SolicitudActivacion.
     * @example
     * // Update one SolicitudActivacion
     * const solicitudActivacion = await prisma.solicitudActivacion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SolicitudActivacionUpdateArgs>(args: SelectSubset<T, SolicitudActivacionUpdateArgs<ExtArgs>>): Prisma__SolicitudActivacionClient<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SolicitudActivacions.
     * @param {SolicitudActivacionDeleteManyArgs} args - Arguments to filter SolicitudActivacions to delete.
     * @example
     * // Delete a few SolicitudActivacions
     * const { count } = await prisma.solicitudActivacion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SolicitudActivacionDeleteManyArgs>(args?: SelectSubset<T, SolicitudActivacionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SolicitudActivacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolicitudActivacionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SolicitudActivacions
     * const solicitudActivacion = await prisma.solicitudActivacion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SolicitudActivacionUpdateManyArgs>(args: SelectSubset<T, SolicitudActivacionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SolicitudActivacion.
     * @param {SolicitudActivacionUpsertArgs} args - Arguments to update or create a SolicitudActivacion.
     * @example
     * // Update or create a SolicitudActivacion
     * const solicitudActivacion = await prisma.solicitudActivacion.upsert({
     *   create: {
     *     // ... data to create a SolicitudActivacion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SolicitudActivacion we want to update
     *   }
     * })
     */
    upsert<T extends SolicitudActivacionUpsertArgs>(args: SelectSubset<T, SolicitudActivacionUpsertArgs<ExtArgs>>): Prisma__SolicitudActivacionClient<$Result.GetResult<Prisma.$SolicitudActivacionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SolicitudActivacions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolicitudActivacionCountArgs} args - Arguments to filter SolicitudActivacions to count.
     * @example
     * // Count the number of SolicitudActivacions
     * const count = await prisma.solicitudActivacion.count({
     *   where: {
     *     // ... the filter for the SolicitudActivacions we want to count
     *   }
     * })
    **/
    count<T extends SolicitudActivacionCountArgs>(
      args?: Subset<T, SolicitudActivacionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SolicitudActivacionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SolicitudActivacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolicitudActivacionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SolicitudActivacionAggregateArgs>(args: Subset<T, SolicitudActivacionAggregateArgs>): Prisma.PrismaPromise<GetSolicitudActivacionAggregateType<T>>

    /**
     * Group by SolicitudActivacion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SolicitudActivacionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SolicitudActivacionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SolicitudActivacionGroupByArgs['orderBy'] }
        : { orderBy?: SolicitudActivacionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SolicitudActivacionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSolicitudActivacionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SolicitudActivacion model
   */
  readonly fields: SolicitudActivacionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SolicitudActivacion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SolicitudActivacionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends UsuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UsuarioDefaultArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SolicitudActivacion model
   */ 
  interface SolicitudActivacionFieldRefs {
    readonly id: FieldRef<"SolicitudActivacion", 'String'>
    readonly usuarioId: FieldRef<"SolicitudActivacion", 'String'>
    readonly plan: FieldRef<"SolicitudActivacion", 'String'>
    readonly metodoPago: FieldRef<"SolicitudActivacion", 'String'>
    readonly referencia: FieldRef<"SolicitudActivacion", 'String'>
    readonly estado: FieldRef<"SolicitudActivacion", 'String'>
    readonly createdAt: FieldRef<"SolicitudActivacion", 'DateTime'>
    readonly updatedAt: FieldRef<"SolicitudActivacion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SolicitudActivacion findUnique
   */
  export type SolicitudActivacionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    /**
     * Filter, which SolicitudActivacion to fetch.
     */
    where: SolicitudActivacionWhereUniqueInput
  }

  /**
   * SolicitudActivacion findUniqueOrThrow
   */
  export type SolicitudActivacionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    /**
     * Filter, which SolicitudActivacion to fetch.
     */
    where: SolicitudActivacionWhereUniqueInput
  }

  /**
   * SolicitudActivacion findFirst
   */
  export type SolicitudActivacionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    /**
     * Filter, which SolicitudActivacion to fetch.
     */
    where?: SolicitudActivacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SolicitudActivacions to fetch.
     */
    orderBy?: SolicitudActivacionOrderByWithRelationInput | SolicitudActivacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SolicitudActivacions.
     */
    cursor?: SolicitudActivacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SolicitudActivacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SolicitudActivacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SolicitudActivacions.
     */
    distinct?: SolicitudActivacionScalarFieldEnum | SolicitudActivacionScalarFieldEnum[]
  }

  /**
   * SolicitudActivacion findFirstOrThrow
   */
  export type SolicitudActivacionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    /**
     * Filter, which SolicitudActivacion to fetch.
     */
    where?: SolicitudActivacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SolicitudActivacions to fetch.
     */
    orderBy?: SolicitudActivacionOrderByWithRelationInput | SolicitudActivacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SolicitudActivacions.
     */
    cursor?: SolicitudActivacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SolicitudActivacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SolicitudActivacions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SolicitudActivacions.
     */
    distinct?: SolicitudActivacionScalarFieldEnum | SolicitudActivacionScalarFieldEnum[]
  }

  /**
   * SolicitudActivacion findMany
   */
  export type SolicitudActivacionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    /**
     * Filter, which SolicitudActivacions to fetch.
     */
    where?: SolicitudActivacionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SolicitudActivacions to fetch.
     */
    orderBy?: SolicitudActivacionOrderByWithRelationInput | SolicitudActivacionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SolicitudActivacions.
     */
    cursor?: SolicitudActivacionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SolicitudActivacions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SolicitudActivacions.
     */
    skip?: number
    distinct?: SolicitudActivacionScalarFieldEnum | SolicitudActivacionScalarFieldEnum[]
  }

  /**
   * SolicitudActivacion create
   */
  export type SolicitudActivacionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    /**
     * The data needed to create a SolicitudActivacion.
     */
    data: XOR<SolicitudActivacionCreateInput, SolicitudActivacionUncheckedCreateInput>
  }

  /**
   * SolicitudActivacion createMany
   */
  export type SolicitudActivacionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SolicitudActivacions.
     */
    data: SolicitudActivacionCreateManyInput | SolicitudActivacionCreateManyInput[]
  }

  /**
   * SolicitudActivacion createManyAndReturn
   */
  export type SolicitudActivacionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SolicitudActivacions.
     */
    data: SolicitudActivacionCreateManyInput | SolicitudActivacionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SolicitudActivacion update
   */
  export type SolicitudActivacionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    /**
     * The data needed to update a SolicitudActivacion.
     */
    data: XOR<SolicitudActivacionUpdateInput, SolicitudActivacionUncheckedUpdateInput>
    /**
     * Choose, which SolicitudActivacion to update.
     */
    where: SolicitudActivacionWhereUniqueInput
  }

  /**
   * SolicitudActivacion updateMany
   */
  export type SolicitudActivacionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SolicitudActivacions.
     */
    data: XOR<SolicitudActivacionUpdateManyMutationInput, SolicitudActivacionUncheckedUpdateManyInput>
    /**
     * Filter which SolicitudActivacions to update
     */
    where?: SolicitudActivacionWhereInput
  }

  /**
   * SolicitudActivacion upsert
   */
  export type SolicitudActivacionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    /**
     * The filter to search for the SolicitudActivacion to update in case it exists.
     */
    where: SolicitudActivacionWhereUniqueInput
    /**
     * In case the SolicitudActivacion found by the `where` argument doesn't exist, create a new SolicitudActivacion with this data.
     */
    create: XOR<SolicitudActivacionCreateInput, SolicitudActivacionUncheckedCreateInput>
    /**
     * In case the SolicitudActivacion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SolicitudActivacionUpdateInput, SolicitudActivacionUncheckedUpdateInput>
  }

  /**
   * SolicitudActivacion delete
   */
  export type SolicitudActivacionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
    /**
     * Filter which SolicitudActivacion to delete.
     */
    where: SolicitudActivacionWhereUniqueInput
  }

  /**
   * SolicitudActivacion deleteMany
   */
  export type SolicitudActivacionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SolicitudActivacions to delete
     */
    where?: SolicitudActivacionWhereInput
  }

  /**
   * SolicitudActivacion without action
   */
  export type SolicitudActivacionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SolicitudActivacion
     */
    select?: SolicitudActivacionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SolicitudActivacionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ClienteScalarFieldEnum: {
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

  export type ClienteScalarFieldEnum = (typeof ClienteScalarFieldEnum)[keyof typeof ClienteScalarFieldEnum]


  export const ProductoScalarFieldEnum: {
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

  export type ProductoScalarFieldEnum = (typeof ProductoScalarFieldEnum)[keyof typeof ProductoScalarFieldEnum]


  export const FacturaScalarFieldEnum: {
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

  export type FacturaScalarFieldEnum = (typeof FacturaScalarFieldEnum)[keyof typeof FacturaScalarFieldEnum]


  export const ItemFacturaScalarFieldEnum: {
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

  export type ItemFacturaScalarFieldEnum = (typeof ItemFacturaScalarFieldEnum)[keyof typeof ItemFacturaScalarFieldEnum]


  export const PagoScalarFieldEnum: {
    id: 'id',
    facturaId: 'facturaId',
    monto: 'monto',
    metodoPago: 'metodoPago',
    referenciaTransaccion: 'referenciaTransaccion',
    fechaPago: 'fechaPago',
    notas: 'notas',
    createdAt: 'createdAt'
  };

  export type PagoScalarFieldEnum = (typeof PagoScalarFieldEnum)[keyof typeof PagoScalarFieldEnum]


  export const CorrelativoScalarFieldEnum: {
    id: 'id',
    nombre: 'nombre',
    valor: 'valor'
  };

  export type CorrelativoScalarFieldEnum = (typeof CorrelativoScalarFieldEnum)[keyof typeof CorrelativoScalarFieldEnum]


  export const CierreCajaScalarFieldEnum: {
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

  export type CierreCajaScalarFieldEnum = (typeof CierreCajaScalarFieldEnum)[keyof typeof CierreCajaScalarFieldEnum]


  export const CotizacionScalarFieldEnum: {
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

  export type CotizacionScalarFieldEnum = (typeof CotizacionScalarFieldEnum)[keyof typeof CotizacionScalarFieldEnum]


  export const ItemCotizacionScalarFieldEnum: {
    id: 'id',
    cotizacionId: 'cotizacionId',
    productoId: 'productoId',
    descripcion: 'descripcion',
    cantidad: 'cantidad',
    precioUnitario: 'precioUnitario',
    totalLinea: 'totalLinea'
  };

  export type ItemCotizacionScalarFieldEnum = (typeof ItemCotizacionScalarFieldEnum)[keyof typeof ItemCotizacionScalarFieldEnum]


  export const UsuarioScalarFieldEnum: {
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

  export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum]


  export const SolicitudActivacionScalarFieldEnum: {
    id: 'id',
    usuarioId: 'usuarioId',
    plan: 'plan',
    metodoPago: 'metodoPago',
    referencia: 'referencia',
    estado: 'estado',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SolicitudActivacionScalarFieldEnum = (typeof SolicitudActivacionScalarFieldEnum)[keyof typeof SolicitudActivacionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type ClienteWhereInput = {
    AND?: ClienteWhereInput | ClienteWhereInput[]
    OR?: ClienteWhereInput[]
    NOT?: ClienteWhereInput | ClienteWhereInput[]
    id?: StringFilter<"Cliente"> | string
    razonSocial?: StringFilter<"Cliente"> | string
    rifCedula?: StringFilter<"Cliente"> | string
    direccion?: StringNullableFilter<"Cliente"> | string | null
    telefono?: StringNullableFilter<"Cliente"> | string | null
    correo?: StringNullableFilter<"Cliente"> | string | null
    empresaId?: StringNullableFilter<"Cliente"> | string | null
    createdAt?: DateTimeFilter<"Cliente"> | Date | string
    updatedAt?: DateTimeFilter<"Cliente"> | Date | string
    empresa?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
    facturas?: FacturaListRelationFilter
    cotizaciones?: CotizacionListRelationFilter
  }

  export type ClienteOrderByWithRelationInput = {
    id?: SortOrder
    razonSocial?: SortOrder
    rifCedula?: SortOrder
    direccion?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    correo?: SortOrderInput | SortOrder
    empresaId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    empresa?: UsuarioOrderByWithRelationInput
    facturas?: FacturaOrderByRelationAggregateInput
    cotizaciones?: CotizacionOrderByRelationAggregateInput
  }

  export type ClienteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    empresaId_rifCedula?: ClienteEmpresaIdRifCedulaCompoundUniqueInput
    AND?: ClienteWhereInput | ClienteWhereInput[]
    OR?: ClienteWhereInput[]
    NOT?: ClienteWhereInput | ClienteWhereInput[]
    razonSocial?: StringFilter<"Cliente"> | string
    rifCedula?: StringFilter<"Cliente"> | string
    direccion?: StringNullableFilter<"Cliente"> | string | null
    telefono?: StringNullableFilter<"Cliente"> | string | null
    correo?: StringNullableFilter<"Cliente"> | string | null
    empresaId?: StringNullableFilter<"Cliente"> | string | null
    createdAt?: DateTimeFilter<"Cliente"> | Date | string
    updatedAt?: DateTimeFilter<"Cliente"> | Date | string
    empresa?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
    facturas?: FacturaListRelationFilter
    cotizaciones?: CotizacionListRelationFilter
  }, "id" | "empresaId_rifCedula">

  export type ClienteOrderByWithAggregationInput = {
    id?: SortOrder
    razonSocial?: SortOrder
    rifCedula?: SortOrder
    direccion?: SortOrderInput | SortOrder
    telefono?: SortOrderInput | SortOrder
    correo?: SortOrderInput | SortOrder
    empresaId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ClienteCountOrderByAggregateInput
    _max?: ClienteMaxOrderByAggregateInput
    _min?: ClienteMinOrderByAggregateInput
  }

  export type ClienteScalarWhereWithAggregatesInput = {
    AND?: ClienteScalarWhereWithAggregatesInput | ClienteScalarWhereWithAggregatesInput[]
    OR?: ClienteScalarWhereWithAggregatesInput[]
    NOT?: ClienteScalarWhereWithAggregatesInput | ClienteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Cliente"> | string
    razonSocial?: StringWithAggregatesFilter<"Cliente"> | string
    rifCedula?: StringWithAggregatesFilter<"Cliente"> | string
    direccion?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    telefono?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    correo?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    empresaId?: StringNullableWithAggregatesFilter<"Cliente"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Cliente"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Cliente"> | Date | string
  }

  export type ProductoWhereInput = {
    AND?: ProductoWhereInput | ProductoWhereInput[]
    OR?: ProductoWhereInput[]
    NOT?: ProductoWhereInput | ProductoWhereInput[]
    id?: StringFilter<"Producto"> | string
    sku?: StringFilter<"Producto"> | string
    nombre?: StringFilter<"Producto"> | string
    descripcion?: StringNullableFilter<"Producto"> | string | null
    stockActual?: IntFilter<"Producto"> | number
    stockMinimo?: IntFilter<"Producto"> | number
    precioVenta?: FloatFilter<"Producto"> | number
    costoCompra?: FloatFilter<"Producto"> | number
    tasaImpuesto?: FloatFilter<"Producto"> | number
    categoria?: StringFilter<"Producto"> | string
    activo?: BoolFilter<"Producto"> | boolean
    empresaId?: StringFilter<"Producto"> | string
    createdAt?: DateTimeFilter<"Producto"> | Date | string
    updatedAt?: DateTimeFilter<"Producto"> | Date | string
    empresa?: XOR<UsuarioRelationFilter, UsuarioWhereInput>
    itemsFactura?: ItemFacturaListRelationFilter
  }

  export type ProductoOrderByWithRelationInput = {
    id?: SortOrder
    sku?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    stockActual?: SortOrder
    stockMinimo?: SortOrder
    precioVenta?: SortOrder
    costoCompra?: SortOrder
    tasaImpuesto?: SortOrder
    categoria?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    empresa?: UsuarioOrderByWithRelationInput
    itemsFactura?: ItemFacturaOrderByRelationAggregateInput
  }

  export type ProductoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    empresaId_sku?: ProductoEmpresaIdSkuCompoundUniqueInput
    AND?: ProductoWhereInput | ProductoWhereInput[]
    OR?: ProductoWhereInput[]
    NOT?: ProductoWhereInput | ProductoWhereInput[]
    sku?: StringFilter<"Producto"> | string
    nombre?: StringFilter<"Producto"> | string
    descripcion?: StringNullableFilter<"Producto"> | string | null
    stockActual?: IntFilter<"Producto"> | number
    stockMinimo?: IntFilter<"Producto"> | number
    precioVenta?: FloatFilter<"Producto"> | number
    costoCompra?: FloatFilter<"Producto"> | number
    tasaImpuesto?: FloatFilter<"Producto"> | number
    categoria?: StringFilter<"Producto"> | string
    activo?: BoolFilter<"Producto"> | boolean
    empresaId?: StringFilter<"Producto"> | string
    createdAt?: DateTimeFilter<"Producto"> | Date | string
    updatedAt?: DateTimeFilter<"Producto"> | Date | string
    empresa?: XOR<UsuarioRelationFilter, UsuarioWhereInput>
    itemsFactura?: ItemFacturaListRelationFilter
  }, "id" | "empresaId_sku">

  export type ProductoOrderByWithAggregationInput = {
    id?: SortOrder
    sku?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrderInput | SortOrder
    stockActual?: SortOrder
    stockMinimo?: SortOrder
    precioVenta?: SortOrder
    costoCompra?: SortOrder
    tasaImpuesto?: SortOrder
    categoria?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductoCountOrderByAggregateInput
    _avg?: ProductoAvgOrderByAggregateInput
    _max?: ProductoMaxOrderByAggregateInput
    _min?: ProductoMinOrderByAggregateInput
    _sum?: ProductoSumOrderByAggregateInput
  }

  export type ProductoScalarWhereWithAggregatesInput = {
    AND?: ProductoScalarWhereWithAggregatesInput | ProductoScalarWhereWithAggregatesInput[]
    OR?: ProductoScalarWhereWithAggregatesInput[]
    NOT?: ProductoScalarWhereWithAggregatesInput | ProductoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Producto"> | string
    sku?: StringWithAggregatesFilter<"Producto"> | string
    nombre?: StringWithAggregatesFilter<"Producto"> | string
    descripcion?: StringNullableWithAggregatesFilter<"Producto"> | string | null
    stockActual?: IntWithAggregatesFilter<"Producto"> | number
    stockMinimo?: IntWithAggregatesFilter<"Producto"> | number
    precioVenta?: FloatWithAggregatesFilter<"Producto"> | number
    costoCompra?: FloatWithAggregatesFilter<"Producto"> | number
    tasaImpuesto?: FloatWithAggregatesFilter<"Producto"> | number
    categoria?: StringWithAggregatesFilter<"Producto"> | string
    activo?: BoolWithAggregatesFilter<"Producto"> | boolean
    empresaId?: StringWithAggregatesFilter<"Producto"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Producto"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Producto"> | Date | string
  }

  export type FacturaWhereInput = {
    AND?: FacturaWhereInput | FacturaWhereInput[]
    OR?: FacturaWhereInput[]
    NOT?: FacturaWhereInput | FacturaWhereInput[]
    id?: StringFilter<"Factura"> | string
    numeroFactura?: IntFilter<"Factura"> | number
    clienteId?: StringFilter<"Factura"> | string
    usuarioId?: StringNullableFilter<"Factura"> | string | null
    fechaEmision?: DateTimeFilter<"Factura"> | Date | string
    fechaVencimiento?: DateTimeFilter<"Factura"> | Date | string
    subtotal?: FloatFilter<"Factura"> | number
    impuestoTotal?: FloatFilter<"Factura"> | number
    total?: FloatFilter<"Factura"> | number
    estado?: StringFilter<"Factura"> | string
    moneda?: StringFilter<"Factura"> | string
    tasaCambio?: FloatFilter<"Factura"> | number
    cuotasTotales?: IntFilter<"Factura"> | number
    observaciones?: StringNullableFilter<"Factura"> | string | null
    anuladoPor?: StringNullableFilter<"Factura"> | string | null
    motivoAnulacion?: StringNullableFilter<"Factura"> | string | null
    createdAt?: DateTimeFilter<"Factura"> | Date | string
    updatedAt?: DateTimeFilter<"Factura"> | Date | string
    cliente?: XOR<ClienteRelationFilter, ClienteWhereInput>
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
    items?: ItemFacturaListRelationFilter
    pagos?: PagoListRelationFilter
  }

  export type FacturaOrderByWithRelationInput = {
    id?: SortOrder
    numeroFactura?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrderInput | SortOrder
    fechaEmision?: SortOrder
    fechaVencimiento?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tasaCambio?: SortOrder
    cuotasTotales?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    anuladoPor?: SortOrderInput | SortOrder
    motivoAnulacion?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cliente?: ClienteOrderByWithRelationInput
    usuario?: UsuarioOrderByWithRelationInput
    items?: ItemFacturaOrderByRelationAggregateInput
    pagos?: PagoOrderByRelationAggregateInput
  }

  export type FacturaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    numeroFactura?: number
    AND?: FacturaWhereInput | FacturaWhereInput[]
    OR?: FacturaWhereInput[]
    NOT?: FacturaWhereInput | FacturaWhereInput[]
    clienteId?: StringFilter<"Factura"> | string
    usuarioId?: StringNullableFilter<"Factura"> | string | null
    fechaEmision?: DateTimeFilter<"Factura"> | Date | string
    fechaVencimiento?: DateTimeFilter<"Factura"> | Date | string
    subtotal?: FloatFilter<"Factura"> | number
    impuestoTotal?: FloatFilter<"Factura"> | number
    total?: FloatFilter<"Factura"> | number
    estado?: StringFilter<"Factura"> | string
    moneda?: StringFilter<"Factura"> | string
    tasaCambio?: FloatFilter<"Factura"> | number
    cuotasTotales?: IntFilter<"Factura"> | number
    observaciones?: StringNullableFilter<"Factura"> | string | null
    anuladoPor?: StringNullableFilter<"Factura"> | string | null
    motivoAnulacion?: StringNullableFilter<"Factura"> | string | null
    createdAt?: DateTimeFilter<"Factura"> | Date | string
    updatedAt?: DateTimeFilter<"Factura"> | Date | string
    cliente?: XOR<ClienteRelationFilter, ClienteWhereInput>
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
    items?: ItemFacturaListRelationFilter
    pagos?: PagoListRelationFilter
  }, "id" | "numeroFactura">

  export type FacturaOrderByWithAggregationInput = {
    id?: SortOrder
    numeroFactura?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrderInput | SortOrder
    fechaEmision?: SortOrder
    fechaVencimiento?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tasaCambio?: SortOrder
    cuotasTotales?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    anuladoPor?: SortOrderInput | SortOrder
    motivoAnulacion?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: FacturaCountOrderByAggregateInput
    _avg?: FacturaAvgOrderByAggregateInput
    _max?: FacturaMaxOrderByAggregateInput
    _min?: FacturaMinOrderByAggregateInput
    _sum?: FacturaSumOrderByAggregateInput
  }

  export type FacturaScalarWhereWithAggregatesInput = {
    AND?: FacturaScalarWhereWithAggregatesInput | FacturaScalarWhereWithAggregatesInput[]
    OR?: FacturaScalarWhereWithAggregatesInput[]
    NOT?: FacturaScalarWhereWithAggregatesInput | FacturaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Factura"> | string
    numeroFactura?: IntWithAggregatesFilter<"Factura"> | number
    clienteId?: StringWithAggregatesFilter<"Factura"> | string
    usuarioId?: StringNullableWithAggregatesFilter<"Factura"> | string | null
    fechaEmision?: DateTimeWithAggregatesFilter<"Factura"> | Date | string
    fechaVencimiento?: DateTimeWithAggregatesFilter<"Factura"> | Date | string
    subtotal?: FloatWithAggregatesFilter<"Factura"> | number
    impuestoTotal?: FloatWithAggregatesFilter<"Factura"> | number
    total?: FloatWithAggregatesFilter<"Factura"> | number
    estado?: StringWithAggregatesFilter<"Factura"> | string
    moneda?: StringWithAggregatesFilter<"Factura"> | string
    tasaCambio?: FloatWithAggregatesFilter<"Factura"> | number
    cuotasTotales?: IntWithAggregatesFilter<"Factura"> | number
    observaciones?: StringNullableWithAggregatesFilter<"Factura"> | string | null
    anuladoPor?: StringNullableWithAggregatesFilter<"Factura"> | string | null
    motivoAnulacion?: StringNullableWithAggregatesFilter<"Factura"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Factura"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Factura"> | Date | string
  }

  export type ItemFacturaWhereInput = {
    AND?: ItemFacturaWhereInput | ItemFacturaWhereInput[]
    OR?: ItemFacturaWhereInput[]
    NOT?: ItemFacturaWhereInput | ItemFacturaWhereInput[]
    id?: StringFilter<"ItemFactura"> | string
    facturaId?: StringFilter<"ItemFactura"> | string
    productoId?: StringNullableFilter<"ItemFactura"> | string | null
    descripcionHistorica?: StringFilter<"ItemFactura"> | string
    cantidad?: IntFilter<"ItemFactura"> | number
    precioUnitarioHistorico?: FloatFilter<"ItemFactura"> | number
    tasaImpuestoAplicada?: FloatFilter<"ItemFactura"> | number
    subtotalLinea?: FloatFilter<"ItemFactura"> | number
    impuestoLinea?: FloatFilter<"ItemFactura"> | number
    totalLinea?: FloatFilter<"ItemFactura"> | number
    createdAt?: DateTimeFilter<"ItemFactura"> | Date | string
    factura?: XOR<FacturaRelationFilter, FacturaWhereInput>
    producto?: XOR<ProductoNullableRelationFilter, ProductoWhereInput> | null
  }

  export type ItemFacturaOrderByWithRelationInput = {
    id?: SortOrder
    facturaId?: SortOrder
    productoId?: SortOrderInput | SortOrder
    descripcionHistorica?: SortOrder
    cantidad?: SortOrder
    precioUnitarioHistorico?: SortOrder
    tasaImpuestoAplicada?: SortOrder
    subtotalLinea?: SortOrder
    impuestoLinea?: SortOrder
    totalLinea?: SortOrder
    createdAt?: SortOrder
    factura?: FacturaOrderByWithRelationInput
    producto?: ProductoOrderByWithRelationInput
  }

  export type ItemFacturaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ItemFacturaWhereInput | ItemFacturaWhereInput[]
    OR?: ItemFacturaWhereInput[]
    NOT?: ItemFacturaWhereInput | ItemFacturaWhereInput[]
    facturaId?: StringFilter<"ItemFactura"> | string
    productoId?: StringNullableFilter<"ItemFactura"> | string | null
    descripcionHistorica?: StringFilter<"ItemFactura"> | string
    cantidad?: IntFilter<"ItemFactura"> | number
    precioUnitarioHistorico?: FloatFilter<"ItemFactura"> | number
    tasaImpuestoAplicada?: FloatFilter<"ItemFactura"> | number
    subtotalLinea?: FloatFilter<"ItemFactura"> | number
    impuestoLinea?: FloatFilter<"ItemFactura"> | number
    totalLinea?: FloatFilter<"ItemFactura"> | number
    createdAt?: DateTimeFilter<"ItemFactura"> | Date | string
    factura?: XOR<FacturaRelationFilter, FacturaWhereInput>
    producto?: XOR<ProductoNullableRelationFilter, ProductoWhereInput> | null
  }, "id">

  export type ItemFacturaOrderByWithAggregationInput = {
    id?: SortOrder
    facturaId?: SortOrder
    productoId?: SortOrderInput | SortOrder
    descripcionHistorica?: SortOrder
    cantidad?: SortOrder
    precioUnitarioHistorico?: SortOrder
    tasaImpuestoAplicada?: SortOrder
    subtotalLinea?: SortOrder
    impuestoLinea?: SortOrder
    totalLinea?: SortOrder
    createdAt?: SortOrder
    _count?: ItemFacturaCountOrderByAggregateInput
    _avg?: ItemFacturaAvgOrderByAggregateInput
    _max?: ItemFacturaMaxOrderByAggregateInput
    _min?: ItemFacturaMinOrderByAggregateInput
    _sum?: ItemFacturaSumOrderByAggregateInput
  }

  export type ItemFacturaScalarWhereWithAggregatesInput = {
    AND?: ItemFacturaScalarWhereWithAggregatesInput | ItemFacturaScalarWhereWithAggregatesInput[]
    OR?: ItemFacturaScalarWhereWithAggregatesInput[]
    NOT?: ItemFacturaScalarWhereWithAggregatesInput | ItemFacturaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ItemFactura"> | string
    facturaId?: StringWithAggregatesFilter<"ItemFactura"> | string
    productoId?: StringNullableWithAggregatesFilter<"ItemFactura"> | string | null
    descripcionHistorica?: StringWithAggregatesFilter<"ItemFactura"> | string
    cantidad?: IntWithAggregatesFilter<"ItemFactura"> | number
    precioUnitarioHistorico?: FloatWithAggregatesFilter<"ItemFactura"> | number
    tasaImpuestoAplicada?: FloatWithAggregatesFilter<"ItemFactura"> | number
    subtotalLinea?: FloatWithAggregatesFilter<"ItemFactura"> | number
    impuestoLinea?: FloatWithAggregatesFilter<"ItemFactura"> | number
    totalLinea?: FloatWithAggregatesFilter<"ItemFactura"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ItemFactura"> | Date | string
  }

  export type PagoWhereInput = {
    AND?: PagoWhereInput | PagoWhereInput[]
    OR?: PagoWhereInput[]
    NOT?: PagoWhereInput | PagoWhereInput[]
    id?: StringFilter<"Pago"> | string
    facturaId?: StringFilter<"Pago"> | string
    monto?: FloatFilter<"Pago"> | number
    metodoPago?: StringFilter<"Pago"> | string
    referenciaTransaccion?: StringNullableFilter<"Pago"> | string | null
    fechaPago?: DateTimeFilter<"Pago"> | Date | string
    notas?: StringNullableFilter<"Pago"> | string | null
    createdAt?: DateTimeFilter<"Pago"> | Date | string
    factura?: XOR<FacturaRelationFilter, FacturaWhereInput>
  }

  export type PagoOrderByWithRelationInput = {
    id?: SortOrder
    facturaId?: SortOrder
    monto?: SortOrder
    metodoPago?: SortOrder
    referenciaTransaccion?: SortOrderInput | SortOrder
    fechaPago?: SortOrder
    notas?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    factura?: FacturaOrderByWithRelationInput
  }

  export type PagoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PagoWhereInput | PagoWhereInput[]
    OR?: PagoWhereInput[]
    NOT?: PagoWhereInput | PagoWhereInput[]
    facturaId?: StringFilter<"Pago"> | string
    monto?: FloatFilter<"Pago"> | number
    metodoPago?: StringFilter<"Pago"> | string
    referenciaTransaccion?: StringNullableFilter<"Pago"> | string | null
    fechaPago?: DateTimeFilter<"Pago"> | Date | string
    notas?: StringNullableFilter<"Pago"> | string | null
    createdAt?: DateTimeFilter<"Pago"> | Date | string
    factura?: XOR<FacturaRelationFilter, FacturaWhereInput>
  }, "id">

  export type PagoOrderByWithAggregationInput = {
    id?: SortOrder
    facturaId?: SortOrder
    monto?: SortOrder
    metodoPago?: SortOrder
    referenciaTransaccion?: SortOrderInput | SortOrder
    fechaPago?: SortOrder
    notas?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PagoCountOrderByAggregateInput
    _avg?: PagoAvgOrderByAggregateInput
    _max?: PagoMaxOrderByAggregateInput
    _min?: PagoMinOrderByAggregateInput
    _sum?: PagoSumOrderByAggregateInput
  }

  export type PagoScalarWhereWithAggregatesInput = {
    AND?: PagoScalarWhereWithAggregatesInput | PagoScalarWhereWithAggregatesInput[]
    OR?: PagoScalarWhereWithAggregatesInput[]
    NOT?: PagoScalarWhereWithAggregatesInput | PagoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Pago"> | string
    facturaId?: StringWithAggregatesFilter<"Pago"> | string
    monto?: FloatWithAggregatesFilter<"Pago"> | number
    metodoPago?: StringWithAggregatesFilter<"Pago"> | string
    referenciaTransaccion?: StringNullableWithAggregatesFilter<"Pago"> | string | null
    fechaPago?: DateTimeWithAggregatesFilter<"Pago"> | Date | string
    notas?: StringNullableWithAggregatesFilter<"Pago"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Pago"> | Date | string
  }

  export type CorrelativoWhereInput = {
    AND?: CorrelativoWhereInput | CorrelativoWhereInput[]
    OR?: CorrelativoWhereInput[]
    NOT?: CorrelativoWhereInput | CorrelativoWhereInput[]
    id?: IntFilter<"Correlativo"> | number
    nombre?: StringFilter<"Correlativo"> | string
    valor?: IntFilter<"Correlativo"> | number
  }

  export type CorrelativoOrderByWithRelationInput = {
    id?: SortOrder
    nombre?: SortOrder
    valor?: SortOrder
  }

  export type CorrelativoWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    nombre?: string
    AND?: CorrelativoWhereInput | CorrelativoWhereInput[]
    OR?: CorrelativoWhereInput[]
    NOT?: CorrelativoWhereInput | CorrelativoWhereInput[]
    valor?: IntFilter<"Correlativo"> | number
  }, "id" | "nombre">

  export type CorrelativoOrderByWithAggregationInput = {
    id?: SortOrder
    nombre?: SortOrder
    valor?: SortOrder
    _count?: CorrelativoCountOrderByAggregateInput
    _avg?: CorrelativoAvgOrderByAggregateInput
    _max?: CorrelativoMaxOrderByAggregateInput
    _min?: CorrelativoMinOrderByAggregateInput
    _sum?: CorrelativoSumOrderByAggregateInput
  }

  export type CorrelativoScalarWhereWithAggregatesInput = {
    AND?: CorrelativoScalarWhereWithAggregatesInput | CorrelativoScalarWhereWithAggregatesInput[]
    OR?: CorrelativoScalarWhereWithAggregatesInput[]
    NOT?: CorrelativoScalarWhereWithAggregatesInput | CorrelativoScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Correlativo"> | number
    nombre?: StringWithAggregatesFilter<"Correlativo"> | string
    valor?: IntWithAggregatesFilter<"Correlativo"> | number
  }

  export type CierreCajaWhereInput = {
    AND?: CierreCajaWhereInput | CierreCajaWhereInput[]
    OR?: CierreCajaWhereInput[]
    NOT?: CierreCajaWhereInput | CierreCajaWhereInput[]
    id?: StringFilter<"CierreCaja"> | string
    usuarioId?: StringNullableFilter<"CierreCaja"> | string | null
    fechaApertura?: DateTimeFilter<"CierreCaja"> | Date | string
    fechaCierre?: DateTimeNullableFilter<"CierreCaja"> | Date | string | null
    montoInicial?: FloatFilter<"CierreCaja"> | number
    montoFinal?: FloatNullableFilter<"CierreCaja"> | number | null
    ingresosEfectivo?: FloatFilter<"CierreCaja"> | number
    ingresosBanco?: FloatFilter<"CierreCaja"> | number
    estado?: StringFilter<"CierreCaja"> | string
    observaciones?: StringNullableFilter<"CierreCaja"> | string | null
    createdAt?: DateTimeFilter<"CierreCaja"> | Date | string
    updatedAt?: DateTimeFilter<"CierreCaja"> | Date | string
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
  }

  export type CierreCajaOrderByWithRelationInput = {
    id?: SortOrder
    usuarioId?: SortOrderInput | SortOrder
    fechaApertura?: SortOrder
    fechaCierre?: SortOrderInput | SortOrder
    montoInicial?: SortOrder
    montoFinal?: SortOrderInput | SortOrder
    ingresosEfectivo?: SortOrder
    ingresosBanco?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type CierreCajaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CierreCajaWhereInput | CierreCajaWhereInput[]
    OR?: CierreCajaWhereInput[]
    NOT?: CierreCajaWhereInput | CierreCajaWhereInput[]
    usuarioId?: StringNullableFilter<"CierreCaja"> | string | null
    fechaApertura?: DateTimeFilter<"CierreCaja"> | Date | string
    fechaCierre?: DateTimeNullableFilter<"CierreCaja"> | Date | string | null
    montoInicial?: FloatFilter<"CierreCaja"> | number
    montoFinal?: FloatNullableFilter<"CierreCaja"> | number | null
    ingresosEfectivo?: FloatFilter<"CierreCaja"> | number
    ingresosBanco?: FloatFilter<"CierreCaja"> | number
    estado?: StringFilter<"CierreCaja"> | string
    observaciones?: StringNullableFilter<"CierreCaja"> | string | null
    createdAt?: DateTimeFilter<"CierreCaja"> | Date | string
    updatedAt?: DateTimeFilter<"CierreCaja"> | Date | string
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
  }, "id">

  export type CierreCajaOrderByWithAggregationInput = {
    id?: SortOrder
    usuarioId?: SortOrderInput | SortOrder
    fechaApertura?: SortOrder
    fechaCierre?: SortOrderInput | SortOrder
    montoInicial?: SortOrder
    montoFinal?: SortOrderInput | SortOrder
    ingresosEfectivo?: SortOrder
    ingresosBanco?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CierreCajaCountOrderByAggregateInput
    _avg?: CierreCajaAvgOrderByAggregateInput
    _max?: CierreCajaMaxOrderByAggregateInput
    _min?: CierreCajaMinOrderByAggregateInput
    _sum?: CierreCajaSumOrderByAggregateInput
  }

  export type CierreCajaScalarWhereWithAggregatesInput = {
    AND?: CierreCajaScalarWhereWithAggregatesInput | CierreCajaScalarWhereWithAggregatesInput[]
    OR?: CierreCajaScalarWhereWithAggregatesInput[]
    NOT?: CierreCajaScalarWhereWithAggregatesInput | CierreCajaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"CierreCaja"> | string
    usuarioId?: StringNullableWithAggregatesFilter<"CierreCaja"> | string | null
    fechaApertura?: DateTimeWithAggregatesFilter<"CierreCaja"> | Date | string
    fechaCierre?: DateTimeNullableWithAggregatesFilter<"CierreCaja"> | Date | string | null
    montoInicial?: FloatWithAggregatesFilter<"CierreCaja"> | number
    montoFinal?: FloatNullableWithAggregatesFilter<"CierreCaja"> | number | null
    ingresosEfectivo?: FloatWithAggregatesFilter<"CierreCaja"> | number
    ingresosBanco?: FloatWithAggregatesFilter<"CierreCaja"> | number
    estado?: StringWithAggregatesFilter<"CierreCaja"> | string
    observaciones?: StringNullableWithAggregatesFilter<"CierreCaja"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"CierreCaja"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CierreCaja"> | Date | string
  }

  export type CotizacionWhereInput = {
    AND?: CotizacionWhereInput | CotizacionWhereInput[]
    OR?: CotizacionWhereInput[]
    NOT?: CotizacionWhereInput | CotizacionWhereInput[]
    id?: StringFilter<"Cotizacion"> | string
    numero?: IntFilter<"Cotizacion"> | number
    clienteId?: StringFilter<"Cotizacion"> | string
    usuarioId?: StringNullableFilter<"Cotizacion"> | string | null
    fechaEmision?: DateTimeFilter<"Cotizacion"> | Date | string
    fechaValidez?: DateTimeFilter<"Cotizacion"> | Date | string
    subtotal?: FloatFilter<"Cotizacion"> | number
    impuestoTotal?: FloatFilter<"Cotizacion"> | number
    total?: FloatFilter<"Cotizacion"> | number
    moneda?: StringFilter<"Cotizacion"> | string
    estado?: StringFilter<"Cotizacion"> | string
    cliente?: XOR<ClienteRelationFilter, ClienteWhereInput>
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
    items?: ItemCotizacionListRelationFilter
  }

  export type CotizacionOrderByWithRelationInput = {
    id?: SortOrder
    numero?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrderInput | SortOrder
    fechaEmision?: SortOrder
    fechaValidez?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    moneda?: SortOrder
    estado?: SortOrder
    cliente?: ClienteOrderByWithRelationInput
    usuario?: UsuarioOrderByWithRelationInput
    items?: ItemCotizacionOrderByRelationAggregateInput
  }

  export type CotizacionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    numero?: number
    AND?: CotizacionWhereInput | CotizacionWhereInput[]
    OR?: CotizacionWhereInput[]
    NOT?: CotizacionWhereInput | CotizacionWhereInput[]
    clienteId?: StringFilter<"Cotizacion"> | string
    usuarioId?: StringNullableFilter<"Cotizacion"> | string | null
    fechaEmision?: DateTimeFilter<"Cotizacion"> | Date | string
    fechaValidez?: DateTimeFilter<"Cotizacion"> | Date | string
    subtotal?: FloatFilter<"Cotizacion"> | number
    impuestoTotal?: FloatFilter<"Cotizacion"> | number
    total?: FloatFilter<"Cotizacion"> | number
    moneda?: StringFilter<"Cotizacion"> | string
    estado?: StringFilter<"Cotizacion"> | string
    cliente?: XOR<ClienteRelationFilter, ClienteWhereInput>
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
    items?: ItemCotizacionListRelationFilter
  }, "id" | "numero">

  export type CotizacionOrderByWithAggregationInput = {
    id?: SortOrder
    numero?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrderInput | SortOrder
    fechaEmision?: SortOrder
    fechaValidez?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    moneda?: SortOrder
    estado?: SortOrder
    _count?: CotizacionCountOrderByAggregateInput
    _avg?: CotizacionAvgOrderByAggregateInput
    _max?: CotizacionMaxOrderByAggregateInput
    _min?: CotizacionMinOrderByAggregateInput
    _sum?: CotizacionSumOrderByAggregateInput
  }

  export type CotizacionScalarWhereWithAggregatesInput = {
    AND?: CotizacionScalarWhereWithAggregatesInput | CotizacionScalarWhereWithAggregatesInput[]
    OR?: CotizacionScalarWhereWithAggregatesInput[]
    NOT?: CotizacionScalarWhereWithAggregatesInput | CotizacionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Cotizacion"> | string
    numero?: IntWithAggregatesFilter<"Cotizacion"> | number
    clienteId?: StringWithAggregatesFilter<"Cotizacion"> | string
    usuarioId?: StringNullableWithAggregatesFilter<"Cotizacion"> | string | null
    fechaEmision?: DateTimeWithAggregatesFilter<"Cotizacion"> | Date | string
    fechaValidez?: DateTimeWithAggregatesFilter<"Cotizacion"> | Date | string
    subtotal?: FloatWithAggregatesFilter<"Cotizacion"> | number
    impuestoTotal?: FloatWithAggregatesFilter<"Cotizacion"> | number
    total?: FloatWithAggregatesFilter<"Cotizacion"> | number
    moneda?: StringWithAggregatesFilter<"Cotizacion"> | string
    estado?: StringWithAggregatesFilter<"Cotizacion"> | string
  }

  export type ItemCotizacionWhereInput = {
    AND?: ItemCotizacionWhereInput | ItemCotizacionWhereInput[]
    OR?: ItemCotizacionWhereInput[]
    NOT?: ItemCotizacionWhereInput | ItemCotizacionWhereInput[]
    id?: StringFilter<"ItemCotizacion"> | string
    cotizacionId?: StringFilter<"ItemCotizacion"> | string
    productoId?: StringNullableFilter<"ItemCotizacion"> | string | null
    descripcion?: StringFilter<"ItemCotizacion"> | string
    cantidad?: IntFilter<"ItemCotizacion"> | number
    precioUnitario?: FloatFilter<"ItemCotizacion"> | number
    totalLinea?: FloatFilter<"ItemCotizacion"> | number
    cotizacion?: XOR<CotizacionRelationFilter, CotizacionWhereInput>
  }

  export type ItemCotizacionOrderByWithRelationInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    productoId?: SortOrderInput | SortOrder
    descripcion?: SortOrder
    cantidad?: SortOrder
    precioUnitario?: SortOrder
    totalLinea?: SortOrder
    cotizacion?: CotizacionOrderByWithRelationInput
  }

  export type ItemCotizacionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ItemCotizacionWhereInput | ItemCotizacionWhereInput[]
    OR?: ItemCotizacionWhereInput[]
    NOT?: ItemCotizacionWhereInput | ItemCotizacionWhereInput[]
    cotizacionId?: StringFilter<"ItemCotizacion"> | string
    productoId?: StringNullableFilter<"ItemCotizacion"> | string | null
    descripcion?: StringFilter<"ItemCotizacion"> | string
    cantidad?: IntFilter<"ItemCotizacion"> | number
    precioUnitario?: FloatFilter<"ItemCotizacion"> | number
    totalLinea?: FloatFilter<"ItemCotizacion"> | number
    cotizacion?: XOR<CotizacionRelationFilter, CotizacionWhereInput>
  }, "id">

  export type ItemCotizacionOrderByWithAggregationInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    productoId?: SortOrderInput | SortOrder
    descripcion?: SortOrder
    cantidad?: SortOrder
    precioUnitario?: SortOrder
    totalLinea?: SortOrder
    _count?: ItemCotizacionCountOrderByAggregateInput
    _avg?: ItemCotizacionAvgOrderByAggregateInput
    _max?: ItemCotizacionMaxOrderByAggregateInput
    _min?: ItemCotizacionMinOrderByAggregateInput
    _sum?: ItemCotizacionSumOrderByAggregateInput
  }

  export type ItemCotizacionScalarWhereWithAggregatesInput = {
    AND?: ItemCotizacionScalarWhereWithAggregatesInput | ItemCotizacionScalarWhereWithAggregatesInput[]
    OR?: ItemCotizacionScalarWhereWithAggregatesInput[]
    NOT?: ItemCotizacionScalarWhereWithAggregatesInput | ItemCotizacionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ItemCotizacion"> | string
    cotizacionId?: StringWithAggregatesFilter<"ItemCotizacion"> | string
    productoId?: StringNullableWithAggregatesFilter<"ItemCotizacion"> | string | null
    descripcion?: StringWithAggregatesFilter<"ItemCotizacion"> | string
    cantidad?: IntWithAggregatesFilter<"ItemCotizacion"> | number
    precioUnitario?: FloatWithAggregatesFilter<"ItemCotizacion"> | number
    totalLinea?: FloatWithAggregatesFilter<"ItemCotizacion"> | number
  }

  export type UsuarioWhereInput = {
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    id?: StringFilter<"Usuario"> | string
    username?: StringFilter<"Usuario"> | string
    passwordHash?: StringFilter<"Usuario"> | string
    nombre?: StringFilter<"Usuario"> | string
    rol?: StringFilter<"Usuario"> | string
    activo?: BoolFilter<"Usuario"> | boolean
    empresaId?: StringNullableFilter<"Usuario"> | string | null
    subscriptionStatus?: StringFilter<"Usuario"> | string
    planType?: StringNullableFilter<"Usuario"> | string | null
    trialStartsAt?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    trialEndsAt?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    currentPeriodEnd?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    createdAt?: DateTimeFilter<"Usuario"> | Date | string
    updatedAt?: DateTimeFilter<"Usuario"> | Date | string
    empresa?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
    subUsuarios?: UsuarioListRelationFilter
    productos?: ProductoListRelationFilter
    clientes?: ClienteListRelationFilter
    facturas?: FacturaListRelationFilter
    cierresCaja?: CierreCajaListRelationFilter
    cotizaciones?: CotizacionListRelationFilter
    solicitudesActivacion?: SolicitudActivacionListRelationFilter
  }

  export type UsuarioOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    rol?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrderInput | SortOrder
    subscriptionStatus?: SortOrder
    planType?: SortOrderInput | SortOrder
    trialStartsAt?: SortOrderInput | SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    currentPeriodEnd?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    empresa?: UsuarioOrderByWithRelationInput
    subUsuarios?: UsuarioOrderByRelationAggregateInput
    productos?: ProductoOrderByRelationAggregateInput
    clientes?: ClienteOrderByRelationAggregateInput
    facturas?: FacturaOrderByRelationAggregateInput
    cierresCaja?: CierreCajaOrderByRelationAggregateInput
    cotizaciones?: CotizacionOrderByRelationAggregateInput
    solicitudesActivacion?: SolicitudActivacionOrderByRelationAggregateInput
  }

  export type UsuarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    username?: string
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    passwordHash?: StringFilter<"Usuario"> | string
    nombre?: StringFilter<"Usuario"> | string
    rol?: StringFilter<"Usuario"> | string
    activo?: BoolFilter<"Usuario"> | boolean
    empresaId?: StringNullableFilter<"Usuario"> | string | null
    subscriptionStatus?: StringFilter<"Usuario"> | string
    planType?: StringNullableFilter<"Usuario"> | string | null
    trialStartsAt?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    trialEndsAt?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    currentPeriodEnd?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    createdAt?: DateTimeFilter<"Usuario"> | Date | string
    updatedAt?: DateTimeFilter<"Usuario"> | Date | string
    empresa?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
    subUsuarios?: UsuarioListRelationFilter
    productos?: ProductoListRelationFilter
    clientes?: ClienteListRelationFilter
    facturas?: FacturaListRelationFilter
    cierresCaja?: CierreCajaListRelationFilter
    cotizaciones?: CotizacionListRelationFilter
    solicitudesActivacion?: SolicitudActivacionListRelationFilter
  }, "id" | "username">

  export type UsuarioOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    rol?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrderInput | SortOrder
    subscriptionStatus?: SortOrder
    planType?: SortOrderInput | SortOrder
    trialStartsAt?: SortOrderInput | SortOrder
    trialEndsAt?: SortOrderInput | SortOrder
    currentPeriodEnd?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UsuarioCountOrderByAggregateInput
    _max?: UsuarioMaxOrderByAggregateInput
    _min?: UsuarioMinOrderByAggregateInput
  }

  export type UsuarioScalarWhereWithAggregatesInput = {
    AND?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    OR?: UsuarioScalarWhereWithAggregatesInput[]
    NOT?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Usuario"> | string
    username?: StringWithAggregatesFilter<"Usuario"> | string
    passwordHash?: StringWithAggregatesFilter<"Usuario"> | string
    nombre?: StringWithAggregatesFilter<"Usuario"> | string
    rol?: StringWithAggregatesFilter<"Usuario"> | string
    activo?: BoolWithAggregatesFilter<"Usuario"> | boolean
    empresaId?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    subscriptionStatus?: StringWithAggregatesFilter<"Usuario"> | string
    planType?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    trialStartsAt?: DateTimeNullableWithAggregatesFilter<"Usuario"> | Date | string | null
    trialEndsAt?: DateTimeNullableWithAggregatesFilter<"Usuario"> | Date | string | null
    currentPeriodEnd?: DateTimeNullableWithAggregatesFilter<"Usuario"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
  }

  export type SolicitudActivacionWhereInput = {
    AND?: SolicitudActivacionWhereInput | SolicitudActivacionWhereInput[]
    OR?: SolicitudActivacionWhereInput[]
    NOT?: SolicitudActivacionWhereInput | SolicitudActivacionWhereInput[]
    id?: StringFilter<"SolicitudActivacion"> | string
    usuarioId?: StringFilter<"SolicitudActivacion"> | string
    plan?: StringFilter<"SolicitudActivacion"> | string
    metodoPago?: StringFilter<"SolicitudActivacion"> | string
    referencia?: StringFilter<"SolicitudActivacion"> | string
    estado?: StringFilter<"SolicitudActivacion"> | string
    createdAt?: DateTimeFilter<"SolicitudActivacion"> | Date | string
    updatedAt?: DateTimeFilter<"SolicitudActivacion"> | Date | string
    usuario?: XOR<UsuarioRelationFilter, UsuarioWhereInput>
  }

  export type SolicitudActivacionOrderByWithRelationInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    plan?: SortOrder
    metodoPago?: SortOrder
    referencia?: SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type SolicitudActivacionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SolicitudActivacionWhereInput | SolicitudActivacionWhereInput[]
    OR?: SolicitudActivacionWhereInput[]
    NOT?: SolicitudActivacionWhereInput | SolicitudActivacionWhereInput[]
    usuarioId?: StringFilter<"SolicitudActivacion"> | string
    plan?: StringFilter<"SolicitudActivacion"> | string
    metodoPago?: StringFilter<"SolicitudActivacion"> | string
    referencia?: StringFilter<"SolicitudActivacion"> | string
    estado?: StringFilter<"SolicitudActivacion"> | string
    createdAt?: DateTimeFilter<"SolicitudActivacion"> | Date | string
    updatedAt?: DateTimeFilter<"SolicitudActivacion"> | Date | string
    usuario?: XOR<UsuarioRelationFilter, UsuarioWhereInput>
  }, "id">

  export type SolicitudActivacionOrderByWithAggregationInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    plan?: SortOrder
    metodoPago?: SortOrder
    referencia?: SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SolicitudActivacionCountOrderByAggregateInput
    _max?: SolicitudActivacionMaxOrderByAggregateInput
    _min?: SolicitudActivacionMinOrderByAggregateInput
  }

  export type SolicitudActivacionScalarWhereWithAggregatesInput = {
    AND?: SolicitudActivacionScalarWhereWithAggregatesInput | SolicitudActivacionScalarWhereWithAggregatesInput[]
    OR?: SolicitudActivacionScalarWhereWithAggregatesInput[]
    NOT?: SolicitudActivacionScalarWhereWithAggregatesInput | SolicitudActivacionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SolicitudActivacion"> | string
    usuarioId?: StringWithAggregatesFilter<"SolicitudActivacion"> | string
    plan?: StringWithAggregatesFilter<"SolicitudActivacion"> | string
    metodoPago?: StringWithAggregatesFilter<"SolicitudActivacion"> | string
    referencia?: StringWithAggregatesFilter<"SolicitudActivacion"> | string
    estado?: StringWithAggregatesFilter<"SolicitudActivacion"> | string
    createdAt?: DateTimeWithAggregatesFilter<"SolicitudActivacion"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SolicitudActivacion"> | Date | string
  }

  export type ClienteCreateInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutClientesInput
    facturas?: FacturaCreateNestedManyWithoutClienteInput
    cotizaciones?: CotizacionCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    empresaId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    facturas?: FacturaUncheckedCreateNestedManyWithoutClienteInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutClientesNestedInput
    facturas?: FacturaUpdateManyWithoutClienteNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    facturas?: FacturaUncheckedUpdateManyWithoutClienteNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type ClienteCreateManyInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    empresaId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClienteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClienteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductoCreateInput = {
    id?: string
    sku: string
    nombre: string
    descripcion?: string | null
    stockActual?: number
    stockMinimo?: number
    precioVenta: number
    costoCompra?: number
    tasaImpuesto?: number
    categoria?: string
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa: UsuarioCreateNestedOneWithoutProductosInput
    itemsFactura?: ItemFacturaCreateNestedManyWithoutProductoInput
  }

  export type ProductoUncheckedCreateInput = {
    id?: string
    sku: string
    nombre: string
    descripcion?: string | null
    stockActual?: number
    stockMinimo?: number
    precioVenta: number
    costoCompra?: number
    tasaImpuesto?: number
    categoria?: string
    activo?: boolean
    empresaId: string
    createdAt?: Date | string
    updatedAt?: Date | string
    itemsFactura?: ItemFacturaUncheckedCreateNestedManyWithoutProductoInput
  }

  export type ProductoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    stockActual?: IntFieldUpdateOperationsInput | number
    stockMinimo?: IntFieldUpdateOperationsInput | number
    precioVenta?: FloatFieldUpdateOperationsInput | number
    costoCompra?: FloatFieldUpdateOperationsInput | number
    tasaImpuesto?: FloatFieldUpdateOperationsInput | number
    categoria?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneRequiredWithoutProductosNestedInput
    itemsFactura?: ItemFacturaUpdateManyWithoutProductoNestedInput
  }

  export type ProductoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    stockActual?: IntFieldUpdateOperationsInput | number
    stockMinimo?: IntFieldUpdateOperationsInput | number
    precioVenta?: FloatFieldUpdateOperationsInput | number
    costoCompra?: FloatFieldUpdateOperationsInput | number
    tasaImpuesto?: FloatFieldUpdateOperationsInput | number
    categoria?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    itemsFactura?: ItemFacturaUncheckedUpdateManyWithoutProductoNestedInput
  }

  export type ProductoCreateManyInput = {
    id?: string
    sku: string
    nombre: string
    descripcion?: string | null
    stockActual?: number
    stockMinimo?: number
    precioVenta: number
    costoCompra?: number
    tasaImpuesto?: number
    categoria?: string
    activo?: boolean
    empresaId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    stockActual?: IntFieldUpdateOperationsInput | number
    stockMinimo?: IntFieldUpdateOperationsInput | number
    precioVenta?: FloatFieldUpdateOperationsInput | number
    costoCompra?: FloatFieldUpdateOperationsInput | number
    tasaImpuesto?: FloatFieldUpdateOperationsInput | number
    categoria?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    stockActual?: IntFieldUpdateOperationsInput | number
    stockMinimo?: IntFieldUpdateOperationsInput | number
    precioVenta?: FloatFieldUpdateOperationsInput | number
    costoCompra?: FloatFieldUpdateOperationsInput | number
    tasaImpuesto?: FloatFieldUpdateOperationsInput | number
    categoria?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FacturaCreateInput = {
    id?: string
    numeroFactura: number
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutFacturasInput
    usuario?: UsuarioCreateNestedOneWithoutFacturasInput
    items?: ItemFacturaCreateNestedManyWithoutFacturaInput
    pagos?: PagoCreateNestedManyWithoutFacturaInput
  }

  export type FacturaUncheckedCreateInput = {
    id?: string
    numeroFactura: number
    clienteId: string
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: ItemFacturaUncheckedCreateNestedManyWithoutFacturaInput
    pagos?: PagoUncheckedCreateNestedManyWithoutFacturaInput
  }

  export type FacturaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutFacturasNestedInput
    usuario?: UsuarioUpdateOneWithoutFacturasNestedInput
    items?: ItemFacturaUpdateManyWithoutFacturaNestedInput
    pagos?: PagoUpdateManyWithoutFacturaNestedInput
  }

  export type FacturaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: ItemFacturaUncheckedUpdateManyWithoutFacturaNestedInput
    pagos?: PagoUncheckedUpdateManyWithoutFacturaNestedInput
  }

  export type FacturaCreateManyInput = {
    id?: string
    numeroFactura: number
    clienteId: string
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FacturaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FacturaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemFacturaCreateInput = {
    id?: string
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt?: Date | string
    factura: FacturaCreateNestedOneWithoutItemsInput
    producto?: ProductoCreateNestedOneWithoutItemsFacturaInput
  }

  export type ItemFacturaUncheckedCreateInput = {
    id?: string
    facturaId: string
    productoId?: string | null
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt?: Date | string
  }

  export type ItemFacturaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    factura?: FacturaUpdateOneRequiredWithoutItemsNestedInput
    producto?: ProductoUpdateOneWithoutItemsFacturaNestedInput
  }

  export type ItemFacturaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    facturaId?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemFacturaCreateManyInput = {
    id?: string
    facturaId: string
    productoId?: string | null
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt?: Date | string
  }

  export type ItemFacturaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemFacturaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    facturaId?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoCreateInput = {
    id?: string
    monto: number
    metodoPago: string
    referenciaTransaccion?: string | null
    fechaPago?: Date | string
    notas?: string | null
    createdAt?: Date | string
    factura: FacturaCreateNestedOneWithoutPagosInput
  }

  export type PagoUncheckedCreateInput = {
    id?: string
    facturaId: string
    monto: number
    metodoPago: string
    referenciaTransaccion?: string | null
    fechaPago?: Date | string
    notas?: string | null
    createdAt?: Date | string
  }

  export type PagoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    monto?: FloatFieldUpdateOperationsInput | number
    metodoPago?: StringFieldUpdateOperationsInput | string
    referenciaTransaccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPago?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    factura?: FacturaUpdateOneRequiredWithoutPagosNestedInput
  }

  export type PagoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    facturaId?: StringFieldUpdateOperationsInput | string
    monto?: FloatFieldUpdateOperationsInput | number
    metodoPago?: StringFieldUpdateOperationsInput | string
    referenciaTransaccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPago?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoCreateManyInput = {
    id?: string
    facturaId: string
    monto: number
    metodoPago: string
    referenciaTransaccion?: string | null
    fechaPago?: Date | string
    notas?: string | null
    createdAt?: Date | string
  }

  export type PagoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    monto?: FloatFieldUpdateOperationsInput | number
    metodoPago?: StringFieldUpdateOperationsInput | string
    referenciaTransaccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPago?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    facturaId?: StringFieldUpdateOperationsInput | string
    monto?: FloatFieldUpdateOperationsInput | number
    metodoPago?: StringFieldUpdateOperationsInput | string
    referenciaTransaccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPago?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CorrelativoCreateInput = {
    nombre: string
    valor?: number
  }

  export type CorrelativoUncheckedCreateInput = {
    id?: number
    nombre: string
    valor?: number
  }

  export type CorrelativoUpdateInput = {
    nombre?: StringFieldUpdateOperationsInput | string
    valor?: IntFieldUpdateOperationsInput | number
  }

  export type CorrelativoUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    valor?: IntFieldUpdateOperationsInput | number
  }

  export type CorrelativoCreateManyInput = {
    id?: number
    nombre: string
    valor?: number
  }

  export type CorrelativoUpdateManyMutationInput = {
    nombre?: StringFieldUpdateOperationsInput | string
    valor?: IntFieldUpdateOperationsInput | number
  }

  export type CorrelativoUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    nombre?: StringFieldUpdateOperationsInput | string
    valor?: IntFieldUpdateOperationsInput | number
  }

  export type CierreCajaCreateInput = {
    id?: string
    fechaApertura?: Date | string
    fechaCierre?: Date | string | null
    montoInicial: number
    montoFinal?: number | null
    ingresosEfectivo?: number
    ingresosBanco?: number
    estado?: string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usuario?: UsuarioCreateNestedOneWithoutCierresCajaInput
  }

  export type CierreCajaUncheckedCreateInput = {
    id?: string
    usuarioId?: string | null
    fechaApertura?: Date | string
    fechaCierre?: Date | string | null
    montoInicial: number
    montoFinal?: number | null
    ingresosEfectivo?: number
    ingresosBanco?: number
    estado?: string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CierreCajaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaApertura?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaCierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montoInicial?: FloatFieldUpdateOperationsInput | number
    montoFinal?: NullableFloatFieldUpdateOperationsInput | number | null
    ingresosEfectivo?: FloatFieldUpdateOperationsInput | number
    ingresosBanco?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usuario?: UsuarioUpdateOneWithoutCierresCajaNestedInput
  }

  export type CierreCajaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaApertura?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaCierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montoInicial?: FloatFieldUpdateOperationsInput | number
    montoFinal?: NullableFloatFieldUpdateOperationsInput | number | null
    ingresosEfectivo?: FloatFieldUpdateOperationsInput | number
    ingresosBanco?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CierreCajaCreateManyInput = {
    id?: string
    usuarioId?: string | null
    fechaApertura?: Date | string
    fechaCierre?: Date | string | null
    montoInicial: number
    montoFinal?: number | null
    ingresosEfectivo?: number
    ingresosBanco?: number
    estado?: string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CierreCajaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaApertura?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaCierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montoInicial?: FloatFieldUpdateOperationsInput | number
    montoFinal?: NullableFloatFieldUpdateOperationsInput | number | null
    ingresosEfectivo?: FloatFieldUpdateOperationsInput | number
    ingresosBanco?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CierreCajaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaApertura?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaCierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montoInicial?: FloatFieldUpdateOperationsInput | number
    montoFinal?: NullableFloatFieldUpdateOperationsInput | number | null
    ingresosEfectivo?: FloatFieldUpdateOperationsInput | number
    ingresosBanco?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CotizacionCreateInput = {
    id?: string
    numero: number
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
    usuario?: UsuarioCreateNestedOneWithoutCotizacionesInput
    items?: ItemCotizacionCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateInput = {
    id?: string
    numero: number
    clienteId: string
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
    items?: ItemCotizacionUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
    usuario?: UsuarioUpdateOneWithoutCotizacionesNestedInput
    items?: ItemCotizacionUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    items?: ItemCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionCreateManyInput = {
    id?: string
    numero: number
    clienteId: string
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
  }

  export type CotizacionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
  }

  export type CotizacionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
  }

  export type ItemCotizacionCreateInput = {
    id?: string
    productoId?: string | null
    descripcion: string
    cantidad: number
    precioUnitario: number
    totalLinea: number
    cotizacion: CotizacionCreateNestedOneWithoutItemsInput
  }

  export type ItemCotizacionUncheckedCreateInput = {
    id?: string
    cotizacionId: string
    productoId?: string | null
    descripcion: string
    cantidad: number
    precioUnitario: number
    totalLinea: number
  }

  export type ItemCotizacionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitario?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    cotizacion?: CotizacionUpdateOneRequiredWithoutItemsNestedInput
  }

  export type ItemCotizacionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cotizacionId?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitario?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
  }

  export type ItemCotizacionCreateManyInput = {
    id?: string
    cotizacionId: string
    productoId?: string | null
    descripcion: string
    cantidad: number
    precioUnitario: number
    totalLinea: number
  }

  export type ItemCotizacionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitario?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
  }

  export type ItemCotizacionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    cotizacionId?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitario?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
  }

  export type UsuarioCreateInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutSubUsuariosInput
    subUsuarios?: UsuarioCreateNestedManyWithoutEmpresaInput
    productos?: ProductoCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    empresaId?: string | null
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subUsuarios?: UsuarioUncheckedCreateNestedManyWithoutEmpresaInput
    productos?: ProductoUncheckedCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaUncheckedCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaUncheckedCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutSubUsuariosNestedInput
    subUsuarios?: UsuarioUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subUsuarios?: UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUncheckedUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUncheckedUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUncheckedUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateManyInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    empresaId?: string | null
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsuarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsuarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SolicitudActivacionCreateInput = {
    id?: string
    plan: string
    metodoPago: string
    referencia: string
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    usuario: UsuarioCreateNestedOneWithoutSolicitudesActivacionInput
  }

  export type SolicitudActivacionUncheckedCreateInput = {
    id?: string
    usuarioId: string
    plan: string
    metodoPago: string
    referencia: string
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SolicitudActivacionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    metodoPago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usuario?: UsuarioUpdateOneRequiredWithoutSolicitudesActivacionNestedInput
  }

  export type SolicitudActivacionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    metodoPago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SolicitudActivacionCreateManyInput = {
    id?: string
    usuarioId: string
    plan: string
    metodoPago: string
    referencia: string
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SolicitudActivacionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    metodoPago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SolicitudActivacionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    usuarioId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    metodoPago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UsuarioNullableRelationFilter = {
    is?: UsuarioWhereInput | null
    isNot?: UsuarioWhereInput | null
  }

  export type FacturaListRelationFilter = {
    every?: FacturaWhereInput
    some?: FacturaWhereInput
    none?: FacturaWhereInput
  }

  export type CotizacionListRelationFilter = {
    every?: CotizacionWhereInput
    some?: CotizacionWhereInput
    none?: CotizacionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type FacturaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CotizacionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClienteEmpresaIdRifCedulaCompoundUniqueInput = {
    empresaId: string
    rifCedula: string
  }

  export type ClienteCountOrderByAggregateInput = {
    id?: SortOrder
    razonSocial?: SortOrder
    rifCedula?: SortOrder
    direccion?: SortOrder
    telefono?: SortOrder
    correo?: SortOrder
    empresaId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClienteMaxOrderByAggregateInput = {
    id?: SortOrder
    razonSocial?: SortOrder
    rifCedula?: SortOrder
    direccion?: SortOrder
    telefono?: SortOrder
    correo?: SortOrder
    empresaId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClienteMinOrderByAggregateInput = {
    id?: SortOrder
    razonSocial?: SortOrder
    rifCedula?: SortOrder
    direccion?: SortOrder
    telefono?: SortOrder
    correo?: SortOrder
    empresaId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type UsuarioRelationFilter = {
    is?: UsuarioWhereInput
    isNot?: UsuarioWhereInput
  }

  export type ItemFacturaListRelationFilter = {
    every?: ItemFacturaWhereInput
    some?: ItemFacturaWhereInput
    none?: ItemFacturaWhereInput
  }

  export type ItemFacturaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductoEmpresaIdSkuCompoundUniqueInput = {
    empresaId: string
    sku: string
  }

  export type ProductoCountOrderByAggregateInput = {
    id?: SortOrder
    sku?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrder
    stockActual?: SortOrder
    stockMinimo?: SortOrder
    precioVenta?: SortOrder
    costoCompra?: SortOrder
    tasaImpuesto?: SortOrder
    categoria?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductoAvgOrderByAggregateInput = {
    stockActual?: SortOrder
    stockMinimo?: SortOrder
    precioVenta?: SortOrder
    costoCompra?: SortOrder
    tasaImpuesto?: SortOrder
  }

  export type ProductoMaxOrderByAggregateInput = {
    id?: SortOrder
    sku?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrder
    stockActual?: SortOrder
    stockMinimo?: SortOrder
    precioVenta?: SortOrder
    costoCompra?: SortOrder
    tasaImpuesto?: SortOrder
    categoria?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductoMinOrderByAggregateInput = {
    id?: SortOrder
    sku?: SortOrder
    nombre?: SortOrder
    descripcion?: SortOrder
    stockActual?: SortOrder
    stockMinimo?: SortOrder
    precioVenta?: SortOrder
    costoCompra?: SortOrder
    tasaImpuesto?: SortOrder
    categoria?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductoSumOrderByAggregateInput = {
    stockActual?: SortOrder
    stockMinimo?: SortOrder
    precioVenta?: SortOrder
    costoCompra?: SortOrder
    tasaImpuesto?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ClienteRelationFilter = {
    is?: ClienteWhereInput
    isNot?: ClienteWhereInput
  }

  export type PagoListRelationFilter = {
    every?: PagoWhereInput
    some?: PagoWhereInput
    none?: PagoWhereInput
  }

  export type PagoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type FacturaCountOrderByAggregateInput = {
    id?: SortOrder
    numeroFactura?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrder
    fechaEmision?: SortOrder
    fechaVencimiento?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tasaCambio?: SortOrder
    cuotasTotales?: SortOrder
    observaciones?: SortOrder
    anuladoPor?: SortOrder
    motivoAnulacion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FacturaAvgOrderByAggregateInput = {
    numeroFactura?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    tasaCambio?: SortOrder
    cuotasTotales?: SortOrder
  }

  export type FacturaMaxOrderByAggregateInput = {
    id?: SortOrder
    numeroFactura?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrder
    fechaEmision?: SortOrder
    fechaVencimiento?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tasaCambio?: SortOrder
    cuotasTotales?: SortOrder
    observaciones?: SortOrder
    anuladoPor?: SortOrder
    motivoAnulacion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FacturaMinOrderByAggregateInput = {
    id?: SortOrder
    numeroFactura?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrder
    fechaEmision?: SortOrder
    fechaVencimiento?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    estado?: SortOrder
    moneda?: SortOrder
    tasaCambio?: SortOrder
    cuotasTotales?: SortOrder
    observaciones?: SortOrder
    anuladoPor?: SortOrder
    motivoAnulacion?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FacturaSumOrderByAggregateInput = {
    numeroFactura?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    tasaCambio?: SortOrder
    cuotasTotales?: SortOrder
  }

  export type FacturaRelationFilter = {
    is?: FacturaWhereInput
    isNot?: FacturaWhereInput
  }

  export type ProductoNullableRelationFilter = {
    is?: ProductoWhereInput | null
    isNot?: ProductoWhereInput | null
  }

  export type ItemFacturaCountOrderByAggregateInput = {
    id?: SortOrder
    facturaId?: SortOrder
    productoId?: SortOrder
    descripcionHistorica?: SortOrder
    cantidad?: SortOrder
    precioUnitarioHistorico?: SortOrder
    tasaImpuestoAplicada?: SortOrder
    subtotalLinea?: SortOrder
    impuestoLinea?: SortOrder
    totalLinea?: SortOrder
    createdAt?: SortOrder
  }

  export type ItemFacturaAvgOrderByAggregateInput = {
    cantidad?: SortOrder
    precioUnitarioHistorico?: SortOrder
    tasaImpuestoAplicada?: SortOrder
    subtotalLinea?: SortOrder
    impuestoLinea?: SortOrder
    totalLinea?: SortOrder
  }

  export type ItemFacturaMaxOrderByAggregateInput = {
    id?: SortOrder
    facturaId?: SortOrder
    productoId?: SortOrder
    descripcionHistorica?: SortOrder
    cantidad?: SortOrder
    precioUnitarioHistorico?: SortOrder
    tasaImpuestoAplicada?: SortOrder
    subtotalLinea?: SortOrder
    impuestoLinea?: SortOrder
    totalLinea?: SortOrder
    createdAt?: SortOrder
  }

  export type ItemFacturaMinOrderByAggregateInput = {
    id?: SortOrder
    facturaId?: SortOrder
    productoId?: SortOrder
    descripcionHistorica?: SortOrder
    cantidad?: SortOrder
    precioUnitarioHistorico?: SortOrder
    tasaImpuestoAplicada?: SortOrder
    subtotalLinea?: SortOrder
    impuestoLinea?: SortOrder
    totalLinea?: SortOrder
    createdAt?: SortOrder
  }

  export type ItemFacturaSumOrderByAggregateInput = {
    cantidad?: SortOrder
    precioUnitarioHistorico?: SortOrder
    tasaImpuestoAplicada?: SortOrder
    subtotalLinea?: SortOrder
    impuestoLinea?: SortOrder
    totalLinea?: SortOrder
  }

  export type PagoCountOrderByAggregateInput = {
    id?: SortOrder
    facturaId?: SortOrder
    monto?: SortOrder
    metodoPago?: SortOrder
    referenciaTransaccion?: SortOrder
    fechaPago?: SortOrder
    notas?: SortOrder
    createdAt?: SortOrder
  }

  export type PagoAvgOrderByAggregateInput = {
    monto?: SortOrder
  }

  export type PagoMaxOrderByAggregateInput = {
    id?: SortOrder
    facturaId?: SortOrder
    monto?: SortOrder
    metodoPago?: SortOrder
    referenciaTransaccion?: SortOrder
    fechaPago?: SortOrder
    notas?: SortOrder
    createdAt?: SortOrder
  }

  export type PagoMinOrderByAggregateInput = {
    id?: SortOrder
    facturaId?: SortOrder
    monto?: SortOrder
    metodoPago?: SortOrder
    referenciaTransaccion?: SortOrder
    fechaPago?: SortOrder
    notas?: SortOrder
    createdAt?: SortOrder
  }

  export type PagoSumOrderByAggregateInput = {
    monto?: SortOrder
  }

  export type CorrelativoCountOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    valor?: SortOrder
  }

  export type CorrelativoAvgOrderByAggregateInput = {
    id?: SortOrder
    valor?: SortOrder
  }

  export type CorrelativoMaxOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    valor?: SortOrder
  }

  export type CorrelativoMinOrderByAggregateInput = {
    id?: SortOrder
    nombre?: SortOrder
    valor?: SortOrder
  }

  export type CorrelativoSumOrderByAggregateInput = {
    id?: SortOrder
    valor?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type CierreCajaCountOrderByAggregateInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    fechaApertura?: SortOrder
    fechaCierre?: SortOrder
    montoInicial?: SortOrder
    montoFinal?: SortOrder
    ingresosEfectivo?: SortOrder
    ingresosBanco?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CierreCajaAvgOrderByAggregateInput = {
    montoInicial?: SortOrder
    montoFinal?: SortOrder
    ingresosEfectivo?: SortOrder
    ingresosBanco?: SortOrder
  }

  export type CierreCajaMaxOrderByAggregateInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    fechaApertura?: SortOrder
    fechaCierre?: SortOrder
    montoInicial?: SortOrder
    montoFinal?: SortOrder
    ingresosEfectivo?: SortOrder
    ingresosBanco?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CierreCajaMinOrderByAggregateInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    fechaApertura?: SortOrder
    fechaCierre?: SortOrder
    montoInicial?: SortOrder
    montoFinal?: SortOrder
    ingresosEfectivo?: SortOrder
    ingresosBanco?: SortOrder
    estado?: SortOrder
    observaciones?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CierreCajaSumOrderByAggregateInput = {
    montoInicial?: SortOrder
    montoFinal?: SortOrder
    ingresosEfectivo?: SortOrder
    ingresosBanco?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type ItemCotizacionListRelationFilter = {
    every?: ItemCotizacionWhereInput
    some?: ItemCotizacionWhereInput
    none?: ItemCotizacionWhereInput
  }

  export type ItemCotizacionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CotizacionCountOrderByAggregateInput = {
    id?: SortOrder
    numero?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrder
    fechaEmision?: SortOrder
    fechaValidez?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    moneda?: SortOrder
    estado?: SortOrder
  }

  export type CotizacionAvgOrderByAggregateInput = {
    numero?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
  }

  export type CotizacionMaxOrderByAggregateInput = {
    id?: SortOrder
    numero?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrder
    fechaEmision?: SortOrder
    fechaValidez?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    moneda?: SortOrder
    estado?: SortOrder
  }

  export type CotizacionMinOrderByAggregateInput = {
    id?: SortOrder
    numero?: SortOrder
    clienteId?: SortOrder
    usuarioId?: SortOrder
    fechaEmision?: SortOrder
    fechaValidez?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
    moneda?: SortOrder
    estado?: SortOrder
  }

  export type CotizacionSumOrderByAggregateInput = {
    numero?: SortOrder
    subtotal?: SortOrder
    impuestoTotal?: SortOrder
    total?: SortOrder
  }

  export type CotizacionRelationFilter = {
    is?: CotizacionWhereInput
    isNot?: CotizacionWhereInput
  }

  export type ItemCotizacionCountOrderByAggregateInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    productoId?: SortOrder
    descripcion?: SortOrder
    cantidad?: SortOrder
    precioUnitario?: SortOrder
    totalLinea?: SortOrder
  }

  export type ItemCotizacionAvgOrderByAggregateInput = {
    cantidad?: SortOrder
    precioUnitario?: SortOrder
    totalLinea?: SortOrder
  }

  export type ItemCotizacionMaxOrderByAggregateInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    productoId?: SortOrder
    descripcion?: SortOrder
    cantidad?: SortOrder
    precioUnitario?: SortOrder
    totalLinea?: SortOrder
  }

  export type ItemCotizacionMinOrderByAggregateInput = {
    id?: SortOrder
    cotizacionId?: SortOrder
    productoId?: SortOrder
    descripcion?: SortOrder
    cantidad?: SortOrder
    precioUnitario?: SortOrder
    totalLinea?: SortOrder
  }

  export type ItemCotizacionSumOrderByAggregateInput = {
    cantidad?: SortOrder
    precioUnitario?: SortOrder
    totalLinea?: SortOrder
  }

  export type UsuarioListRelationFilter = {
    every?: UsuarioWhereInput
    some?: UsuarioWhereInput
    none?: UsuarioWhereInput
  }

  export type ProductoListRelationFilter = {
    every?: ProductoWhereInput
    some?: ProductoWhereInput
    none?: ProductoWhereInput
  }

  export type ClienteListRelationFilter = {
    every?: ClienteWhereInput
    some?: ClienteWhereInput
    none?: ClienteWhereInput
  }

  export type CierreCajaListRelationFilter = {
    every?: CierreCajaWhereInput
    some?: CierreCajaWhereInput
    none?: CierreCajaWhereInput
  }

  export type SolicitudActivacionListRelationFilter = {
    every?: SolicitudActivacionWhereInput
    some?: SolicitudActivacionWhereInput
    none?: SolicitudActivacionWhereInput
  }

  export type UsuarioOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClienteOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CierreCajaOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SolicitudActivacionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsuarioCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    rol?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrder
    subscriptionStatus?: SortOrder
    planType?: SortOrder
    trialStartsAt?: SortOrder
    trialEndsAt?: SortOrder
    currentPeriodEnd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UsuarioMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    rol?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrder
    subscriptionStatus?: SortOrder
    planType?: SortOrder
    trialStartsAt?: SortOrder
    trialEndsAt?: SortOrder
    currentPeriodEnd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UsuarioMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    passwordHash?: SortOrder
    nombre?: SortOrder
    rol?: SortOrder
    activo?: SortOrder
    empresaId?: SortOrder
    subscriptionStatus?: SortOrder
    planType?: SortOrder
    trialStartsAt?: SortOrder
    trialEndsAt?: SortOrder
    currentPeriodEnd?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SolicitudActivacionCountOrderByAggregateInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    plan?: SortOrder
    metodoPago?: SortOrder
    referencia?: SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SolicitudActivacionMaxOrderByAggregateInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    plan?: SortOrder
    metodoPago?: SortOrder
    referencia?: SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SolicitudActivacionMinOrderByAggregateInput = {
    id?: SortOrder
    usuarioId?: SortOrder
    plan?: SortOrder
    metodoPago?: SortOrder
    referencia?: SortOrder
    estado?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UsuarioCreateNestedOneWithoutClientesInput = {
    create?: XOR<UsuarioCreateWithoutClientesInput, UsuarioUncheckedCreateWithoutClientesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutClientesInput
    connect?: UsuarioWhereUniqueInput
  }

  export type FacturaCreateNestedManyWithoutClienteInput = {
    create?: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput> | FacturaCreateWithoutClienteInput[] | FacturaUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutClienteInput | FacturaCreateOrConnectWithoutClienteInput[]
    createMany?: FacturaCreateManyClienteInputEnvelope
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
  }

  export type CotizacionCreateNestedManyWithoutClienteInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type FacturaUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput> | FacturaCreateWithoutClienteInput[] | FacturaUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutClienteInput | FacturaCreateOrConnectWithoutClienteInput[]
    createMany?: FacturaCreateManyClienteInputEnvelope
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
  }

  export type CotizacionUncheckedCreateNestedManyWithoutClienteInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UsuarioUpdateOneWithoutClientesNestedInput = {
    create?: XOR<UsuarioCreateWithoutClientesInput, UsuarioUncheckedCreateWithoutClientesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutClientesInput
    upsert?: UsuarioUpsertWithoutClientesInput
    disconnect?: UsuarioWhereInput | boolean
    delete?: UsuarioWhereInput | boolean
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutClientesInput, UsuarioUpdateWithoutClientesInput>, UsuarioUncheckedUpdateWithoutClientesInput>
  }

  export type FacturaUpdateManyWithoutClienteNestedInput = {
    create?: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput> | FacturaCreateWithoutClienteInput[] | FacturaUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutClienteInput | FacturaCreateOrConnectWithoutClienteInput[]
    upsert?: FacturaUpsertWithWhereUniqueWithoutClienteInput | FacturaUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: FacturaCreateManyClienteInputEnvelope
    set?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    disconnect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    delete?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    update?: FacturaUpdateWithWhereUniqueWithoutClienteInput | FacturaUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: FacturaUpdateManyWithWhereWithoutClienteInput | FacturaUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
  }

  export type CotizacionUpdateManyWithoutClienteNestedInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutClienteInput | CotizacionUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutClienteInput | CotizacionUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutClienteInput | CotizacionUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type FacturaUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput> | FacturaCreateWithoutClienteInput[] | FacturaUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutClienteInput | FacturaCreateOrConnectWithoutClienteInput[]
    upsert?: FacturaUpsertWithWhereUniqueWithoutClienteInput | FacturaUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: FacturaCreateManyClienteInputEnvelope
    set?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    disconnect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    delete?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    update?: FacturaUpdateWithWhereUniqueWithoutClienteInput | FacturaUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: FacturaUpdateManyWithWhereWithoutClienteInput | FacturaUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
  }

  export type CotizacionUncheckedUpdateManyWithoutClienteNestedInput = {
    create?: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput> | CotizacionCreateWithoutClienteInput[] | CotizacionUncheckedCreateWithoutClienteInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutClienteInput | CotizacionCreateOrConnectWithoutClienteInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutClienteInput | CotizacionUpsertWithWhereUniqueWithoutClienteInput[]
    createMany?: CotizacionCreateManyClienteInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutClienteInput | CotizacionUpdateWithWhereUniqueWithoutClienteInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutClienteInput | CotizacionUpdateManyWithWhereWithoutClienteInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type UsuarioCreateNestedOneWithoutProductosInput = {
    create?: XOR<UsuarioCreateWithoutProductosInput, UsuarioUncheckedCreateWithoutProductosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutProductosInput
    connect?: UsuarioWhereUniqueInput
  }

  export type ItemFacturaCreateNestedManyWithoutProductoInput = {
    create?: XOR<ItemFacturaCreateWithoutProductoInput, ItemFacturaUncheckedCreateWithoutProductoInput> | ItemFacturaCreateWithoutProductoInput[] | ItemFacturaUncheckedCreateWithoutProductoInput[]
    connectOrCreate?: ItemFacturaCreateOrConnectWithoutProductoInput | ItemFacturaCreateOrConnectWithoutProductoInput[]
    createMany?: ItemFacturaCreateManyProductoInputEnvelope
    connect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
  }

  export type ItemFacturaUncheckedCreateNestedManyWithoutProductoInput = {
    create?: XOR<ItemFacturaCreateWithoutProductoInput, ItemFacturaUncheckedCreateWithoutProductoInput> | ItemFacturaCreateWithoutProductoInput[] | ItemFacturaUncheckedCreateWithoutProductoInput[]
    connectOrCreate?: ItemFacturaCreateOrConnectWithoutProductoInput | ItemFacturaCreateOrConnectWithoutProductoInput[]
    createMany?: ItemFacturaCreateManyProductoInputEnvelope
    connect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UsuarioUpdateOneRequiredWithoutProductosNestedInput = {
    create?: XOR<UsuarioCreateWithoutProductosInput, UsuarioUncheckedCreateWithoutProductosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutProductosInput
    upsert?: UsuarioUpsertWithoutProductosInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutProductosInput, UsuarioUpdateWithoutProductosInput>, UsuarioUncheckedUpdateWithoutProductosInput>
  }

  export type ItemFacturaUpdateManyWithoutProductoNestedInput = {
    create?: XOR<ItemFacturaCreateWithoutProductoInput, ItemFacturaUncheckedCreateWithoutProductoInput> | ItemFacturaCreateWithoutProductoInput[] | ItemFacturaUncheckedCreateWithoutProductoInput[]
    connectOrCreate?: ItemFacturaCreateOrConnectWithoutProductoInput | ItemFacturaCreateOrConnectWithoutProductoInput[]
    upsert?: ItemFacturaUpsertWithWhereUniqueWithoutProductoInput | ItemFacturaUpsertWithWhereUniqueWithoutProductoInput[]
    createMany?: ItemFacturaCreateManyProductoInputEnvelope
    set?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    disconnect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    delete?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    connect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    update?: ItemFacturaUpdateWithWhereUniqueWithoutProductoInput | ItemFacturaUpdateWithWhereUniqueWithoutProductoInput[]
    updateMany?: ItemFacturaUpdateManyWithWhereWithoutProductoInput | ItemFacturaUpdateManyWithWhereWithoutProductoInput[]
    deleteMany?: ItemFacturaScalarWhereInput | ItemFacturaScalarWhereInput[]
  }

  export type ItemFacturaUncheckedUpdateManyWithoutProductoNestedInput = {
    create?: XOR<ItemFacturaCreateWithoutProductoInput, ItemFacturaUncheckedCreateWithoutProductoInput> | ItemFacturaCreateWithoutProductoInput[] | ItemFacturaUncheckedCreateWithoutProductoInput[]
    connectOrCreate?: ItemFacturaCreateOrConnectWithoutProductoInput | ItemFacturaCreateOrConnectWithoutProductoInput[]
    upsert?: ItemFacturaUpsertWithWhereUniqueWithoutProductoInput | ItemFacturaUpsertWithWhereUniqueWithoutProductoInput[]
    createMany?: ItemFacturaCreateManyProductoInputEnvelope
    set?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    disconnect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    delete?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    connect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    update?: ItemFacturaUpdateWithWhereUniqueWithoutProductoInput | ItemFacturaUpdateWithWhereUniqueWithoutProductoInput[]
    updateMany?: ItemFacturaUpdateManyWithWhereWithoutProductoInput | ItemFacturaUpdateManyWithWhereWithoutProductoInput[]
    deleteMany?: ItemFacturaScalarWhereInput | ItemFacturaScalarWhereInput[]
  }

  export type ClienteCreateNestedOneWithoutFacturasInput = {
    create?: XOR<ClienteCreateWithoutFacturasInput, ClienteUncheckedCreateWithoutFacturasInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutFacturasInput
    connect?: ClienteWhereUniqueInput
  }

  export type UsuarioCreateNestedOneWithoutFacturasInput = {
    create?: XOR<UsuarioCreateWithoutFacturasInput, UsuarioUncheckedCreateWithoutFacturasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutFacturasInput
    connect?: UsuarioWhereUniqueInput
  }

  export type ItemFacturaCreateNestedManyWithoutFacturaInput = {
    create?: XOR<ItemFacturaCreateWithoutFacturaInput, ItemFacturaUncheckedCreateWithoutFacturaInput> | ItemFacturaCreateWithoutFacturaInput[] | ItemFacturaUncheckedCreateWithoutFacturaInput[]
    connectOrCreate?: ItemFacturaCreateOrConnectWithoutFacturaInput | ItemFacturaCreateOrConnectWithoutFacturaInput[]
    createMany?: ItemFacturaCreateManyFacturaInputEnvelope
    connect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
  }

  export type PagoCreateNestedManyWithoutFacturaInput = {
    create?: XOR<PagoCreateWithoutFacturaInput, PagoUncheckedCreateWithoutFacturaInput> | PagoCreateWithoutFacturaInput[] | PagoUncheckedCreateWithoutFacturaInput[]
    connectOrCreate?: PagoCreateOrConnectWithoutFacturaInput | PagoCreateOrConnectWithoutFacturaInput[]
    createMany?: PagoCreateManyFacturaInputEnvelope
    connect?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
  }

  export type ItemFacturaUncheckedCreateNestedManyWithoutFacturaInput = {
    create?: XOR<ItemFacturaCreateWithoutFacturaInput, ItemFacturaUncheckedCreateWithoutFacturaInput> | ItemFacturaCreateWithoutFacturaInput[] | ItemFacturaUncheckedCreateWithoutFacturaInput[]
    connectOrCreate?: ItemFacturaCreateOrConnectWithoutFacturaInput | ItemFacturaCreateOrConnectWithoutFacturaInput[]
    createMany?: ItemFacturaCreateManyFacturaInputEnvelope
    connect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
  }

  export type PagoUncheckedCreateNestedManyWithoutFacturaInput = {
    create?: XOR<PagoCreateWithoutFacturaInput, PagoUncheckedCreateWithoutFacturaInput> | PagoCreateWithoutFacturaInput[] | PagoUncheckedCreateWithoutFacturaInput[]
    connectOrCreate?: PagoCreateOrConnectWithoutFacturaInput | PagoCreateOrConnectWithoutFacturaInput[]
    createMany?: PagoCreateManyFacturaInputEnvelope
    connect?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
  }

  export type ClienteUpdateOneRequiredWithoutFacturasNestedInput = {
    create?: XOR<ClienteCreateWithoutFacturasInput, ClienteUncheckedCreateWithoutFacturasInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutFacturasInput
    upsert?: ClienteUpsertWithoutFacturasInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutFacturasInput, ClienteUpdateWithoutFacturasInput>, ClienteUncheckedUpdateWithoutFacturasInput>
  }

  export type UsuarioUpdateOneWithoutFacturasNestedInput = {
    create?: XOR<UsuarioCreateWithoutFacturasInput, UsuarioUncheckedCreateWithoutFacturasInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutFacturasInput
    upsert?: UsuarioUpsertWithoutFacturasInput
    disconnect?: UsuarioWhereInput | boolean
    delete?: UsuarioWhereInput | boolean
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutFacturasInput, UsuarioUpdateWithoutFacturasInput>, UsuarioUncheckedUpdateWithoutFacturasInput>
  }

  export type ItemFacturaUpdateManyWithoutFacturaNestedInput = {
    create?: XOR<ItemFacturaCreateWithoutFacturaInput, ItemFacturaUncheckedCreateWithoutFacturaInput> | ItemFacturaCreateWithoutFacturaInput[] | ItemFacturaUncheckedCreateWithoutFacturaInput[]
    connectOrCreate?: ItemFacturaCreateOrConnectWithoutFacturaInput | ItemFacturaCreateOrConnectWithoutFacturaInput[]
    upsert?: ItemFacturaUpsertWithWhereUniqueWithoutFacturaInput | ItemFacturaUpsertWithWhereUniqueWithoutFacturaInput[]
    createMany?: ItemFacturaCreateManyFacturaInputEnvelope
    set?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    disconnect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    delete?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    connect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    update?: ItemFacturaUpdateWithWhereUniqueWithoutFacturaInput | ItemFacturaUpdateWithWhereUniqueWithoutFacturaInput[]
    updateMany?: ItemFacturaUpdateManyWithWhereWithoutFacturaInput | ItemFacturaUpdateManyWithWhereWithoutFacturaInput[]
    deleteMany?: ItemFacturaScalarWhereInput | ItemFacturaScalarWhereInput[]
  }

  export type PagoUpdateManyWithoutFacturaNestedInput = {
    create?: XOR<PagoCreateWithoutFacturaInput, PagoUncheckedCreateWithoutFacturaInput> | PagoCreateWithoutFacturaInput[] | PagoUncheckedCreateWithoutFacturaInput[]
    connectOrCreate?: PagoCreateOrConnectWithoutFacturaInput | PagoCreateOrConnectWithoutFacturaInput[]
    upsert?: PagoUpsertWithWhereUniqueWithoutFacturaInput | PagoUpsertWithWhereUniqueWithoutFacturaInput[]
    createMany?: PagoCreateManyFacturaInputEnvelope
    set?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
    disconnect?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
    delete?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
    connect?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
    update?: PagoUpdateWithWhereUniqueWithoutFacturaInput | PagoUpdateWithWhereUniqueWithoutFacturaInput[]
    updateMany?: PagoUpdateManyWithWhereWithoutFacturaInput | PagoUpdateManyWithWhereWithoutFacturaInput[]
    deleteMany?: PagoScalarWhereInput | PagoScalarWhereInput[]
  }

  export type ItemFacturaUncheckedUpdateManyWithoutFacturaNestedInput = {
    create?: XOR<ItemFacturaCreateWithoutFacturaInput, ItemFacturaUncheckedCreateWithoutFacturaInput> | ItemFacturaCreateWithoutFacturaInput[] | ItemFacturaUncheckedCreateWithoutFacturaInput[]
    connectOrCreate?: ItemFacturaCreateOrConnectWithoutFacturaInput | ItemFacturaCreateOrConnectWithoutFacturaInput[]
    upsert?: ItemFacturaUpsertWithWhereUniqueWithoutFacturaInput | ItemFacturaUpsertWithWhereUniqueWithoutFacturaInput[]
    createMany?: ItemFacturaCreateManyFacturaInputEnvelope
    set?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    disconnect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    delete?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    connect?: ItemFacturaWhereUniqueInput | ItemFacturaWhereUniqueInput[]
    update?: ItemFacturaUpdateWithWhereUniqueWithoutFacturaInput | ItemFacturaUpdateWithWhereUniqueWithoutFacturaInput[]
    updateMany?: ItemFacturaUpdateManyWithWhereWithoutFacturaInput | ItemFacturaUpdateManyWithWhereWithoutFacturaInput[]
    deleteMany?: ItemFacturaScalarWhereInput | ItemFacturaScalarWhereInput[]
  }

  export type PagoUncheckedUpdateManyWithoutFacturaNestedInput = {
    create?: XOR<PagoCreateWithoutFacturaInput, PagoUncheckedCreateWithoutFacturaInput> | PagoCreateWithoutFacturaInput[] | PagoUncheckedCreateWithoutFacturaInput[]
    connectOrCreate?: PagoCreateOrConnectWithoutFacturaInput | PagoCreateOrConnectWithoutFacturaInput[]
    upsert?: PagoUpsertWithWhereUniqueWithoutFacturaInput | PagoUpsertWithWhereUniqueWithoutFacturaInput[]
    createMany?: PagoCreateManyFacturaInputEnvelope
    set?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
    disconnect?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
    delete?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
    connect?: PagoWhereUniqueInput | PagoWhereUniqueInput[]
    update?: PagoUpdateWithWhereUniqueWithoutFacturaInput | PagoUpdateWithWhereUniqueWithoutFacturaInput[]
    updateMany?: PagoUpdateManyWithWhereWithoutFacturaInput | PagoUpdateManyWithWhereWithoutFacturaInput[]
    deleteMany?: PagoScalarWhereInput | PagoScalarWhereInput[]
  }

  export type FacturaCreateNestedOneWithoutItemsInput = {
    create?: XOR<FacturaCreateWithoutItemsInput, FacturaUncheckedCreateWithoutItemsInput>
    connectOrCreate?: FacturaCreateOrConnectWithoutItemsInput
    connect?: FacturaWhereUniqueInput
  }

  export type ProductoCreateNestedOneWithoutItemsFacturaInput = {
    create?: XOR<ProductoCreateWithoutItemsFacturaInput, ProductoUncheckedCreateWithoutItemsFacturaInput>
    connectOrCreate?: ProductoCreateOrConnectWithoutItemsFacturaInput
    connect?: ProductoWhereUniqueInput
  }

  export type FacturaUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<FacturaCreateWithoutItemsInput, FacturaUncheckedCreateWithoutItemsInput>
    connectOrCreate?: FacturaCreateOrConnectWithoutItemsInput
    upsert?: FacturaUpsertWithoutItemsInput
    connect?: FacturaWhereUniqueInput
    update?: XOR<XOR<FacturaUpdateToOneWithWhereWithoutItemsInput, FacturaUpdateWithoutItemsInput>, FacturaUncheckedUpdateWithoutItemsInput>
  }

  export type ProductoUpdateOneWithoutItemsFacturaNestedInput = {
    create?: XOR<ProductoCreateWithoutItemsFacturaInput, ProductoUncheckedCreateWithoutItemsFacturaInput>
    connectOrCreate?: ProductoCreateOrConnectWithoutItemsFacturaInput
    upsert?: ProductoUpsertWithoutItemsFacturaInput
    disconnect?: ProductoWhereInput | boolean
    delete?: ProductoWhereInput | boolean
    connect?: ProductoWhereUniqueInput
    update?: XOR<XOR<ProductoUpdateToOneWithWhereWithoutItemsFacturaInput, ProductoUpdateWithoutItemsFacturaInput>, ProductoUncheckedUpdateWithoutItemsFacturaInput>
  }

  export type FacturaCreateNestedOneWithoutPagosInput = {
    create?: XOR<FacturaCreateWithoutPagosInput, FacturaUncheckedCreateWithoutPagosInput>
    connectOrCreate?: FacturaCreateOrConnectWithoutPagosInput
    connect?: FacturaWhereUniqueInput
  }

  export type FacturaUpdateOneRequiredWithoutPagosNestedInput = {
    create?: XOR<FacturaCreateWithoutPagosInput, FacturaUncheckedCreateWithoutPagosInput>
    connectOrCreate?: FacturaCreateOrConnectWithoutPagosInput
    upsert?: FacturaUpsertWithoutPagosInput
    connect?: FacturaWhereUniqueInput
    update?: XOR<XOR<FacturaUpdateToOneWithWhereWithoutPagosInput, FacturaUpdateWithoutPagosInput>, FacturaUncheckedUpdateWithoutPagosInput>
  }

  export type UsuarioCreateNestedOneWithoutCierresCajaInput = {
    create?: XOR<UsuarioCreateWithoutCierresCajaInput, UsuarioUncheckedCreateWithoutCierresCajaInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutCierresCajaInput
    connect?: UsuarioWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UsuarioUpdateOneWithoutCierresCajaNestedInput = {
    create?: XOR<UsuarioCreateWithoutCierresCajaInput, UsuarioUncheckedCreateWithoutCierresCajaInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutCierresCajaInput
    upsert?: UsuarioUpsertWithoutCierresCajaInput
    disconnect?: UsuarioWhereInput | boolean
    delete?: UsuarioWhereInput | boolean
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutCierresCajaInput, UsuarioUpdateWithoutCierresCajaInput>, UsuarioUncheckedUpdateWithoutCierresCajaInput>
  }

  export type ClienteCreateNestedOneWithoutCotizacionesInput = {
    create?: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutCotizacionesInput
    connect?: ClienteWhereUniqueInput
  }

  export type UsuarioCreateNestedOneWithoutCotizacionesInput = {
    create?: XOR<UsuarioCreateWithoutCotizacionesInput, UsuarioUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutCotizacionesInput
    connect?: UsuarioWhereUniqueInput
  }

  export type ItemCotizacionCreateNestedManyWithoutCotizacionInput = {
    create?: XOR<ItemCotizacionCreateWithoutCotizacionInput, ItemCotizacionUncheckedCreateWithoutCotizacionInput> | ItemCotizacionCreateWithoutCotizacionInput[] | ItemCotizacionUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: ItemCotizacionCreateOrConnectWithoutCotizacionInput | ItemCotizacionCreateOrConnectWithoutCotizacionInput[]
    createMany?: ItemCotizacionCreateManyCotizacionInputEnvelope
    connect?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
  }

  export type ItemCotizacionUncheckedCreateNestedManyWithoutCotizacionInput = {
    create?: XOR<ItemCotizacionCreateWithoutCotizacionInput, ItemCotizacionUncheckedCreateWithoutCotizacionInput> | ItemCotizacionCreateWithoutCotizacionInput[] | ItemCotizacionUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: ItemCotizacionCreateOrConnectWithoutCotizacionInput | ItemCotizacionCreateOrConnectWithoutCotizacionInput[]
    createMany?: ItemCotizacionCreateManyCotizacionInputEnvelope
    connect?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
  }

  export type ClienteUpdateOneRequiredWithoutCotizacionesNestedInput = {
    create?: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: ClienteCreateOrConnectWithoutCotizacionesInput
    upsert?: ClienteUpsertWithoutCotizacionesInput
    connect?: ClienteWhereUniqueInput
    update?: XOR<XOR<ClienteUpdateToOneWithWhereWithoutCotizacionesInput, ClienteUpdateWithoutCotizacionesInput>, ClienteUncheckedUpdateWithoutCotizacionesInput>
  }

  export type UsuarioUpdateOneWithoutCotizacionesNestedInput = {
    create?: XOR<UsuarioCreateWithoutCotizacionesInput, UsuarioUncheckedCreateWithoutCotizacionesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutCotizacionesInput
    upsert?: UsuarioUpsertWithoutCotizacionesInput
    disconnect?: UsuarioWhereInput | boolean
    delete?: UsuarioWhereInput | boolean
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutCotizacionesInput, UsuarioUpdateWithoutCotizacionesInput>, UsuarioUncheckedUpdateWithoutCotizacionesInput>
  }

  export type ItemCotizacionUpdateManyWithoutCotizacionNestedInput = {
    create?: XOR<ItemCotizacionCreateWithoutCotizacionInput, ItemCotizacionUncheckedCreateWithoutCotizacionInput> | ItemCotizacionCreateWithoutCotizacionInput[] | ItemCotizacionUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: ItemCotizacionCreateOrConnectWithoutCotizacionInput | ItemCotizacionCreateOrConnectWithoutCotizacionInput[]
    upsert?: ItemCotizacionUpsertWithWhereUniqueWithoutCotizacionInput | ItemCotizacionUpsertWithWhereUniqueWithoutCotizacionInput[]
    createMany?: ItemCotizacionCreateManyCotizacionInputEnvelope
    set?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
    disconnect?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
    delete?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
    connect?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
    update?: ItemCotizacionUpdateWithWhereUniqueWithoutCotizacionInput | ItemCotizacionUpdateWithWhereUniqueWithoutCotizacionInput[]
    updateMany?: ItemCotizacionUpdateManyWithWhereWithoutCotizacionInput | ItemCotizacionUpdateManyWithWhereWithoutCotizacionInput[]
    deleteMany?: ItemCotizacionScalarWhereInput | ItemCotizacionScalarWhereInput[]
  }

  export type ItemCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput = {
    create?: XOR<ItemCotizacionCreateWithoutCotizacionInput, ItemCotizacionUncheckedCreateWithoutCotizacionInput> | ItemCotizacionCreateWithoutCotizacionInput[] | ItemCotizacionUncheckedCreateWithoutCotizacionInput[]
    connectOrCreate?: ItemCotizacionCreateOrConnectWithoutCotizacionInput | ItemCotizacionCreateOrConnectWithoutCotizacionInput[]
    upsert?: ItemCotizacionUpsertWithWhereUniqueWithoutCotizacionInput | ItemCotizacionUpsertWithWhereUniqueWithoutCotizacionInput[]
    createMany?: ItemCotizacionCreateManyCotizacionInputEnvelope
    set?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
    disconnect?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
    delete?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
    connect?: ItemCotizacionWhereUniqueInput | ItemCotizacionWhereUniqueInput[]
    update?: ItemCotizacionUpdateWithWhereUniqueWithoutCotizacionInput | ItemCotizacionUpdateWithWhereUniqueWithoutCotizacionInput[]
    updateMany?: ItemCotizacionUpdateManyWithWhereWithoutCotizacionInput | ItemCotizacionUpdateManyWithWhereWithoutCotizacionInput[]
    deleteMany?: ItemCotizacionScalarWhereInput | ItemCotizacionScalarWhereInput[]
  }

  export type CotizacionCreateNestedOneWithoutItemsInput = {
    create?: XOR<CotizacionCreateWithoutItemsInput, CotizacionUncheckedCreateWithoutItemsInput>
    connectOrCreate?: CotizacionCreateOrConnectWithoutItemsInput
    connect?: CotizacionWhereUniqueInput
  }

  export type CotizacionUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<CotizacionCreateWithoutItemsInput, CotizacionUncheckedCreateWithoutItemsInput>
    connectOrCreate?: CotizacionCreateOrConnectWithoutItemsInput
    upsert?: CotizacionUpsertWithoutItemsInput
    connect?: CotizacionWhereUniqueInput
    update?: XOR<XOR<CotizacionUpdateToOneWithWhereWithoutItemsInput, CotizacionUpdateWithoutItemsInput>, CotizacionUncheckedUpdateWithoutItemsInput>
  }

  export type UsuarioCreateNestedOneWithoutSubUsuariosInput = {
    create?: XOR<UsuarioCreateWithoutSubUsuariosInput, UsuarioUncheckedCreateWithoutSubUsuariosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutSubUsuariosInput
    connect?: UsuarioWhereUniqueInput
  }

  export type UsuarioCreateNestedManyWithoutEmpresaInput = {
    create?: XOR<UsuarioCreateWithoutEmpresaInput, UsuarioUncheckedCreateWithoutEmpresaInput> | UsuarioCreateWithoutEmpresaInput[] | UsuarioUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: UsuarioCreateOrConnectWithoutEmpresaInput | UsuarioCreateOrConnectWithoutEmpresaInput[]
    createMany?: UsuarioCreateManyEmpresaInputEnvelope
    connect?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
  }

  export type ProductoCreateNestedManyWithoutEmpresaInput = {
    create?: XOR<ProductoCreateWithoutEmpresaInput, ProductoUncheckedCreateWithoutEmpresaInput> | ProductoCreateWithoutEmpresaInput[] | ProductoUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: ProductoCreateOrConnectWithoutEmpresaInput | ProductoCreateOrConnectWithoutEmpresaInput[]
    createMany?: ProductoCreateManyEmpresaInputEnvelope
    connect?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
  }

  export type ClienteCreateNestedManyWithoutEmpresaInput = {
    create?: XOR<ClienteCreateWithoutEmpresaInput, ClienteUncheckedCreateWithoutEmpresaInput> | ClienteCreateWithoutEmpresaInput[] | ClienteUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutEmpresaInput | ClienteCreateOrConnectWithoutEmpresaInput[]
    createMany?: ClienteCreateManyEmpresaInputEnvelope
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
  }

  export type FacturaCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<FacturaCreateWithoutUsuarioInput, FacturaUncheckedCreateWithoutUsuarioInput> | FacturaCreateWithoutUsuarioInput[] | FacturaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutUsuarioInput | FacturaCreateOrConnectWithoutUsuarioInput[]
    createMany?: FacturaCreateManyUsuarioInputEnvelope
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
  }

  export type CierreCajaCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<CierreCajaCreateWithoutUsuarioInput, CierreCajaUncheckedCreateWithoutUsuarioInput> | CierreCajaCreateWithoutUsuarioInput[] | CierreCajaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: CierreCajaCreateOrConnectWithoutUsuarioInput | CierreCajaCreateOrConnectWithoutUsuarioInput[]
    createMany?: CierreCajaCreateManyUsuarioInputEnvelope
    connect?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
  }

  export type CotizacionCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<CotizacionCreateWithoutUsuarioInput, CotizacionUncheckedCreateWithoutUsuarioInput> | CotizacionCreateWithoutUsuarioInput[] | CotizacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutUsuarioInput | CotizacionCreateOrConnectWithoutUsuarioInput[]
    createMany?: CotizacionCreateManyUsuarioInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type SolicitudActivacionCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<SolicitudActivacionCreateWithoutUsuarioInput, SolicitudActivacionUncheckedCreateWithoutUsuarioInput> | SolicitudActivacionCreateWithoutUsuarioInput[] | SolicitudActivacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: SolicitudActivacionCreateOrConnectWithoutUsuarioInput | SolicitudActivacionCreateOrConnectWithoutUsuarioInput[]
    createMany?: SolicitudActivacionCreateManyUsuarioInputEnvelope
    connect?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
  }

  export type UsuarioUncheckedCreateNestedManyWithoutEmpresaInput = {
    create?: XOR<UsuarioCreateWithoutEmpresaInput, UsuarioUncheckedCreateWithoutEmpresaInput> | UsuarioCreateWithoutEmpresaInput[] | UsuarioUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: UsuarioCreateOrConnectWithoutEmpresaInput | UsuarioCreateOrConnectWithoutEmpresaInput[]
    createMany?: UsuarioCreateManyEmpresaInputEnvelope
    connect?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
  }

  export type ProductoUncheckedCreateNestedManyWithoutEmpresaInput = {
    create?: XOR<ProductoCreateWithoutEmpresaInput, ProductoUncheckedCreateWithoutEmpresaInput> | ProductoCreateWithoutEmpresaInput[] | ProductoUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: ProductoCreateOrConnectWithoutEmpresaInput | ProductoCreateOrConnectWithoutEmpresaInput[]
    createMany?: ProductoCreateManyEmpresaInputEnvelope
    connect?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
  }

  export type ClienteUncheckedCreateNestedManyWithoutEmpresaInput = {
    create?: XOR<ClienteCreateWithoutEmpresaInput, ClienteUncheckedCreateWithoutEmpresaInput> | ClienteCreateWithoutEmpresaInput[] | ClienteUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutEmpresaInput | ClienteCreateOrConnectWithoutEmpresaInput[]
    createMany?: ClienteCreateManyEmpresaInputEnvelope
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
  }

  export type FacturaUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<FacturaCreateWithoutUsuarioInput, FacturaUncheckedCreateWithoutUsuarioInput> | FacturaCreateWithoutUsuarioInput[] | FacturaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutUsuarioInput | FacturaCreateOrConnectWithoutUsuarioInput[]
    createMany?: FacturaCreateManyUsuarioInputEnvelope
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
  }

  export type CierreCajaUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<CierreCajaCreateWithoutUsuarioInput, CierreCajaUncheckedCreateWithoutUsuarioInput> | CierreCajaCreateWithoutUsuarioInput[] | CierreCajaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: CierreCajaCreateOrConnectWithoutUsuarioInput | CierreCajaCreateOrConnectWithoutUsuarioInput[]
    createMany?: CierreCajaCreateManyUsuarioInputEnvelope
    connect?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
  }

  export type CotizacionUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<CotizacionCreateWithoutUsuarioInput, CotizacionUncheckedCreateWithoutUsuarioInput> | CotizacionCreateWithoutUsuarioInput[] | CotizacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutUsuarioInput | CotizacionCreateOrConnectWithoutUsuarioInput[]
    createMany?: CotizacionCreateManyUsuarioInputEnvelope
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
  }

  export type SolicitudActivacionUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<SolicitudActivacionCreateWithoutUsuarioInput, SolicitudActivacionUncheckedCreateWithoutUsuarioInput> | SolicitudActivacionCreateWithoutUsuarioInput[] | SolicitudActivacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: SolicitudActivacionCreateOrConnectWithoutUsuarioInput | SolicitudActivacionCreateOrConnectWithoutUsuarioInput[]
    createMany?: SolicitudActivacionCreateManyUsuarioInputEnvelope
    connect?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
  }

  export type UsuarioUpdateOneWithoutSubUsuariosNestedInput = {
    create?: XOR<UsuarioCreateWithoutSubUsuariosInput, UsuarioUncheckedCreateWithoutSubUsuariosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutSubUsuariosInput
    upsert?: UsuarioUpsertWithoutSubUsuariosInput
    disconnect?: UsuarioWhereInput | boolean
    delete?: UsuarioWhereInput | boolean
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutSubUsuariosInput, UsuarioUpdateWithoutSubUsuariosInput>, UsuarioUncheckedUpdateWithoutSubUsuariosInput>
  }

  export type UsuarioUpdateManyWithoutEmpresaNestedInput = {
    create?: XOR<UsuarioCreateWithoutEmpresaInput, UsuarioUncheckedCreateWithoutEmpresaInput> | UsuarioCreateWithoutEmpresaInput[] | UsuarioUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: UsuarioCreateOrConnectWithoutEmpresaInput | UsuarioCreateOrConnectWithoutEmpresaInput[]
    upsert?: UsuarioUpsertWithWhereUniqueWithoutEmpresaInput | UsuarioUpsertWithWhereUniqueWithoutEmpresaInput[]
    createMany?: UsuarioCreateManyEmpresaInputEnvelope
    set?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
    disconnect?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
    delete?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
    connect?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
    update?: UsuarioUpdateWithWhereUniqueWithoutEmpresaInput | UsuarioUpdateWithWhereUniqueWithoutEmpresaInput[]
    updateMany?: UsuarioUpdateManyWithWhereWithoutEmpresaInput | UsuarioUpdateManyWithWhereWithoutEmpresaInput[]
    deleteMany?: UsuarioScalarWhereInput | UsuarioScalarWhereInput[]
  }

  export type ProductoUpdateManyWithoutEmpresaNestedInput = {
    create?: XOR<ProductoCreateWithoutEmpresaInput, ProductoUncheckedCreateWithoutEmpresaInput> | ProductoCreateWithoutEmpresaInput[] | ProductoUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: ProductoCreateOrConnectWithoutEmpresaInput | ProductoCreateOrConnectWithoutEmpresaInput[]
    upsert?: ProductoUpsertWithWhereUniqueWithoutEmpresaInput | ProductoUpsertWithWhereUniqueWithoutEmpresaInput[]
    createMany?: ProductoCreateManyEmpresaInputEnvelope
    set?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
    disconnect?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
    delete?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
    connect?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
    update?: ProductoUpdateWithWhereUniqueWithoutEmpresaInput | ProductoUpdateWithWhereUniqueWithoutEmpresaInput[]
    updateMany?: ProductoUpdateManyWithWhereWithoutEmpresaInput | ProductoUpdateManyWithWhereWithoutEmpresaInput[]
    deleteMany?: ProductoScalarWhereInput | ProductoScalarWhereInput[]
  }

  export type ClienteUpdateManyWithoutEmpresaNestedInput = {
    create?: XOR<ClienteCreateWithoutEmpresaInput, ClienteUncheckedCreateWithoutEmpresaInput> | ClienteCreateWithoutEmpresaInput[] | ClienteUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutEmpresaInput | ClienteCreateOrConnectWithoutEmpresaInput[]
    upsert?: ClienteUpsertWithWhereUniqueWithoutEmpresaInput | ClienteUpsertWithWhereUniqueWithoutEmpresaInput[]
    createMany?: ClienteCreateManyEmpresaInputEnvelope
    set?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    disconnect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    delete?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    update?: ClienteUpdateWithWhereUniqueWithoutEmpresaInput | ClienteUpdateWithWhereUniqueWithoutEmpresaInput[]
    updateMany?: ClienteUpdateManyWithWhereWithoutEmpresaInput | ClienteUpdateManyWithWhereWithoutEmpresaInput[]
    deleteMany?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
  }

  export type FacturaUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<FacturaCreateWithoutUsuarioInput, FacturaUncheckedCreateWithoutUsuarioInput> | FacturaCreateWithoutUsuarioInput[] | FacturaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutUsuarioInput | FacturaCreateOrConnectWithoutUsuarioInput[]
    upsert?: FacturaUpsertWithWhereUniqueWithoutUsuarioInput | FacturaUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: FacturaCreateManyUsuarioInputEnvelope
    set?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    disconnect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    delete?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    update?: FacturaUpdateWithWhereUniqueWithoutUsuarioInput | FacturaUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: FacturaUpdateManyWithWhereWithoutUsuarioInput | FacturaUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
  }

  export type CierreCajaUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<CierreCajaCreateWithoutUsuarioInput, CierreCajaUncheckedCreateWithoutUsuarioInput> | CierreCajaCreateWithoutUsuarioInput[] | CierreCajaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: CierreCajaCreateOrConnectWithoutUsuarioInput | CierreCajaCreateOrConnectWithoutUsuarioInput[]
    upsert?: CierreCajaUpsertWithWhereUniqueWithoutUsuarioInput | CierreCajaUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: CierreCajaCreateManyUsuarioInputEnvelope
    set?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
    disconnect?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
    delete?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
    connect?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
    update?: CierreCajaUpdateWithWhereUniqueWithoutUsuarioInput | CierreCajaUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: CierreCajaUpdateManyWithWhereWithoutUsuarioInput | CierreCajaUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: CierreCajaScalarWhereInput | CierreCajaScalarWhereInput[]
  }

  export type CotizacionUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<CotizacionCreateWithoutUsuarioInput, CotizacionUncheckedCreateWithoutUsuarioInput> | CotizacionCreateWithoutUsuarioInput[] | CotizacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutUsuarioInput | CotizacionCreateOrConnectWithoutUsuarioInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutUsuarioInput | CotizacionUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: CotizacionCreateManyUsuarioInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutUsuarioInput | CotizacionUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutUsuarioInput | CotizacionUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type SolicitudActivacionUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<SolicitudActivacionCreateWithoutUsuarioInput, SolicitudActivacionUncheckedCreateWithoutUsuarioInput> | SolicitudActivacionCreateWithoutUsuarioInput[] | SolicitudActivacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: SolicitudActivacionCreateOrConnectWithoutUsuarioInput | SolicitudActivacionCreateOrConnectWithoutUsuarioInput[]
    upsert?: SolicitudActivacionUpsertWithWhereUniqueWithoutUsuarioInput | SolicitudActivacionUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: SolicitudActivacionCreateManyUsuarioInputEnvelope
    set?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
    disconnect?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
    delete?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
    connect?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
    update?: SolicitudActivacionUpdateWithWhereUniqueWithoutUsuarioInput | SolicitudActivacionUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: SolicitudActivacionUpdateManyWithWhereWithoutUsuarioInput | SolicitudActivacionUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: SolicitudActivacionScalarWhereInput | SolicitudActivacionScalarWhereInput[]
  }

  export type UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput = {
    create?: XOR<UsuarioCreateWithoutEmpresaInput, UsuarioUncheckedCreateWithoutEmpresaInput> | UsuarioCreateWithoutEmpresaInput[] | UsuarioUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: UsuarioCreateOrConnectWithoutEmpresaInput | UsuarioCreateOrConnectWithoutEmpresaInput[]
    upsert?: UsuarioUpsertWithWhereUniqueWithoutEmpresaInput | UsuarioUpsertWithWhereUniqueWithoutEmpresaInput[]
    createMany?: UsuarioCreateManyEmpresaInputEnvelope
    set?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
    disconnect?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
    delete?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
    connect?: UsuarioWhereUniqueInput | UsuarioWhereUniqueInput[]
    update?: UsuarioUpdateWithWhereUniqueWithoutEmpresaInput | UsuarioUpdateWithWhereUniqueWithoutEmpresaInput[]
    updateMany?: UsuarioUpdateManyWithWhereWithoutEmpresaInput | UsuarioUpdateManyWithWhereWithoutEmpresaInput[]
    deleteMany?: UsuarioScalarWhereInput | UsuarioScalarWhereInput[]
  }

  export type ProductoUncheckedUpdateManyWithoutEmpresaNestedInput = {
    create?: XOR<ProductoCreateWithoutEmpresaInput, ProductoUncheckedCreateWithoutEmpresaInput> | ProductoCreateWithoutEmpresaInput[] | ProductoUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: ProductoCreateOrConnectWithoutEmpresaInput | ProductoCreateOrConnectWithoutEmpresaInput[]
    upsert?: ProductoUpsertWithWhereUniqueWithoutEmpresaInput | ProductoUpsertWithWhereUniqueWithoutEmpresaInput[]
    createMany?: ProductoCreateManyEmpresaInputEnvelope
    set?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
    disconnect?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
    delete?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
    connect?: ProductoWhereUniqueInput | ProductoWhereUniqueInput[]
    update?: ProductoUpdateWithWhereUniqueWithoutEmpresaInput | ProductoUpdateWithWhereUniqueWithoutEmpresaInput[]
    updateMany?: ProductoUpdateManyWithWhereWithoutEmpresaInput | ProductoUpdateManyWithWhereWithoutEmpresaInput[]
    deleteMany?: ProductoScalarWhereInput | ProductoScalarWhereInput[]
  }

  export type ClienteUncheckedUpdateManyWithoutEmpresaNestedInput = {
    create?: XOR<ClienteCreateWithoutEmpresaInput, ClienteUncheckedCreateWithoutEmpresaInput> | ClienteCreateWithoutEmpresaInput[] | ClienteUncheckedCreateWithoutEmpresaInput[]
    connectOrCreate?: ClienteCreateOrConnectWithoutEmpresaInput | ClienteCreateOrConnectWithoutEmpresaInput[]
    upsert?: ClienteUpsertWithWhereUniqueWithoutEmpresaInput | ClienteUpsertWithWhereUniqueWithoutEmpresaInput[]
    createMany?: ClienteCreateManyEmpresaInputEnvelope
    set?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    disconnect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    delete?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    connect?: ClienteWhereUniqueInput | ClienteWhereUniqueInput[]
    update?: ClienteUpdateWithWhereUniqueWithoutEmpresaInput | ClienteUpdateWithWhereUniqueWithoutEmpresaInput[]
    updateMany?: ClienteUpdateManyWithWhereWithoutEmpresaInput | ClienteUpdateManyWithWhereWithoutEmpresaInput[]
    deleteMany?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
  }

  export type FacturaUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<FacturaCreateWithoutUsuarioInput, FacturaUncheckedCreateWithoutUsuarioInput> | FacturaCreateWithoutUsuarioInput[] | FacturaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: FacturaCreateOrConnectWithoutUsuarioInput | FacturaCreateOrConnectWithoutUsuarioInput[]
    upsert?: FacturaUpsertWithWhereUniqueWithoutUsuarioInput | FacturaUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: FacturaCreateManyUsuarioInputEnvelope
    set?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    disconnect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    delete?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    connect?: FacturaWhereUniqueInput | FacturaWhereUniqueInput[]
    update?: FacturaUpdateWithWhereUniqueWithoutUsuarioInput | FacturaUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: FacturaUpdateManyWithWhereWithoutUsuarioInput | FacturaUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
  }

  export type CierreCajaUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<CierreCajaCreateWithoutUsuarioInput, CierreCajaUncheckedCreateWithoutUsuarioInput> | CierreCajaCreateWithoutUsuarioInput[] | CierreCajaUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: CierreCajaCreateOrConnectWithoutUsuarioInput | CierreCajaCreateOrConnectWithoutUsuarioInput[]
    upsert?: CierreCajaUpsertWithWhereUniqueWithoutUsuarioInput | CierreCajaUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: CierreCajaCreateManyUsuarioInputEnvelope
    set?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
    disconnect?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
    delete?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
    connect?: CierreCajaWhereUniqueInput | CierreCajaWhereUniqueInput[]
    update?: CierreCajaUpdateWithWhereUniqueWithoutUsuarioInput | CierreCajaUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: CierreCajaUpdateManyWithWhereWithoutUsuarioInput | CierreCajaUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: CierreCajaScalarWhereInput | CierreCajaScalarWhereInput[]
  }

  export type CotizacionUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<CotizacionCreateWithoutUsuarioInput, CotizacionUncheckedCreateWithoutUsuarioInput> | CotizacionCreateWithoutUsuarioInput[] | CotizacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: CotizacionCreateOrConnectWithoutUsuarioInput | CotizacionCreateOrConnectWithoutUsuarioInput[]
    upsert?: CotizacionUpsertWithWhereUniqueWithoutUsuarioInput | CotizacionUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: CotizacionCreateManyUsuarioInputEnvelope
    set?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    disconnect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    delete?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    connect?: CotizacionWhereUniqueInput | CotizacionWhereUniqueInput[]
    update?: CotizacionUpdateWithWhereUniqueWithoutUsuarioInput | CotizacionUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: CotizacionUpdateManyWithWhereWithoutUsuarioInput | CotizacionUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
  }

  export type SolicitudActivacionUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<SolicitudActivacionCreateWithoutUsuarioInput, SolicitudActivacionUncheckedCreateWithoutUsuarioInput> | SolicitudActivacionCreateWithoutUsuarioInput[] | SolicitudActivacionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: SolicitudActivacionCreateOrConnectWithoutUsuarioInput | SolicitudActivacionCreateOrConnectWithoutUsuarioInput[]
    upsert?: SolicitudActivacionUpsertWithWhereUniqueWithoutUsuarioInput | SolicitudActivacionUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: SolicitudActivacionCreateManyUsuarioInputEnvelope
    set?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
    disconnect?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
    delete?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
    connect?: SolicitudActivacionWhereUniqueInput | SolicitudActivacionWhereUniqueInput[]
    update?: SolicitudActivacionUpdateWithWhereUniqueWithoutUsuarioInput | SolicitudActivacionUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: SolicitudActivacionUpdateManyWithWhereWithoutUsuarioInput | SolicitudActivacionUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: SolicitudActivacionScalarWhereInput | SolicitudActivacionScalarWhereInput[]
  }

  export type UsuarioCreateNestedOneWithoutSolicitudesActivacionInput = {
    create?: XOR<UsuarioCreateWithoutSolicitudesActivacionInput, UsuarioUncheckedCreateWithoutSolicitudesActivacionInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutSolicitudesActivacionInput
    connect?: UsuarioWhereUniqueInput
  }

  export type UsuarioUpdateOneRequiredWithoutSolicitudesActivacionNestedInput = {
    create?: XOR<UsuarioCreateWithoutSolicitudesActivacionInput, UsuarioUncheckedCreateWithoutSolicitudesActivacionInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutSolicitudesActivacionInput
    upsert?: UsuarioUpsertWithoutSolicitudesActivacionInput
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutSolicitudesActivacionInput, UsuarioUpdateWithoutSolicitudesActivacionInput>, UsuarioUncheckedUpdateWithoutSolicitudesActivacionInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type UsuarioCreateWithoutClientesInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutSubUsuariosInput
    subUsuarios?: UsuarioCreateNestedManyWithoutEmpresaInput
    productos?: ProductoCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutClientesInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    empresaId?: string | null
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subUsuarios?: UsuarioUncheckedCreateNestedManyWithoutEmpresaInput
    productos?: ProductoUncheckedCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaUncheckedCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaUncheckedCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutClientesInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutClientesInput, UsuarioUncheckedCreateWithoutClientesInput>
  }

  export type FacturaCreateWithoutClienteInput = {
    id?: string
    numeroFactura: number
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usuario?: UsuarioCreateNestedOneWithoutFacturasInput
    items?: ItemFacturaCreateNestedManyWithoutFacturaInput
    pagos?: PagoCreateNestedManyWithoutFacturaInput
  }

  export type FacturaUncheckedCreateWithoutClienteInput = {
    id?: string
    numeroFactura: number
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: ItemFacturaUncheckedCreateNestedManyWithoutFacturaInput
    pagos?: PagoUncheckedCreateNestedManyWithoutFacturaInput
  }

  export type FacturaCreateOrConnectWithoutClienteInput = {
    where: FacturaWhereUniqueInput
    create: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput>
  }

  export type FacturaCreateManyClienteInputEnvelope = {
    data: FacturaCreateManyClienteInput | FacturaCreateManyClienteInput[]
  }

  export type CotizacionCreateWithoutClienteInput = {
    id?: string
    numero: number
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
    usuario?: UsuarioCreateNestedOneWithoutCotizacionesInput
    items?: ItemCotizacionCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateWithoutClienteInput = {
    id?: string
    numero: number
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
    items?: ItemCotizacionUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionCreateOrConnectWithoutClienteInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput>
  }

  export type CotizacionCreateManyClienteInputEnvelope = {
    data: CotizacionCreateManyClienteInput | CotizacionCreateManyClienteInput[]
  }

  export type UsuarioUpsertWithoutClientesInput = {
    update: XOR<UsuarioUpdateWithoutClientesInput, UsuarioUncheckedUpdateWithoutClientesInput>
    create: XOR<UsuarioCreateWithoutClientesInput, UsuarioUncheckedCreateWithoutClientesInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutClientesInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutClientesInput, UsuarioUncheckedUpdateWithoutClientesInput>
  }

  export type UsuarioUpdateWithoutClientesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutSubUsuariosNestedInput
    subUsuarios?: UsuarioUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutClientesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subUsuarios?: UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUncheckedUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUncheckedUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUncheckedUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type FacturaUpsertWithWhereUniqueWithoutClienteInput = {
    where: FacturaWhereUniqueInput
    update: XOR<FacturaUpdateWithoutClienteInput, FacturaUncheckedUpdateWithoutClienteInput>
    create: XOR<FacturaCreateWithoutClienteInput, FacturaUncheckedCreateWithoutClienteInput>
  }

  export type FacturaUpdateWithWhereUniqueWithoutClienteInput = {
    where: FacturaWhereUniqueInput
    data: XOR<FacturaUpdateWithoutClienteInput, FacturaUncheckedUpdateWithoutClienteInput>
  }

  export type FacturaUpdateManyWithWhereWithoutClienteInput = {
    where: FacturaScalarWhereInput
    data: XOR<FacturaUpdateManyMutationInput, FacturaUncheckedUpdateManyWithoutClienteInput>
  }

  export type FacturaScalarWhereInput = {
    AND?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
    OR?: FacturaScalarWhereInput[]
    NOT?: FacturaScalarWhereInput | FacturaScalarWhereInput[]
    id?: StringFilter<"Factura"> | string
    numeroFactura?: IntFilter<"Factura"> | number
    clienteId?: StringFilter<"Factura"> | string
    usuarioId?: StringNullableFilter<"Factura"> | string | null
    fechaEmision?: DateTimeFilter<"Factura"> | Date | string
    fechaVencimiento?: DateTimeFilter<"Factura"> | Date | string
    subtotal?: FloatFilter<"Factura"> | number
    impuestoTotal?: FloatFilter<"Factura"> | number
    total?: FloatFilter<"Factura"> | number
    estado?: StringFilter<"Factura"> | string
    moneda?: StringFilter<"Factura"> | string
    tasaCambio?: FloatFilter<"Factura"> | number
    cuotasTotales?: IntFilter<"Factura"> | number
    observaciones?: StringNullableFilter<"Factura"> | string | null
    anuladoPor?: StringNullableFilter<"Factura"> | string | null
    motivoAnulacion?: StringNullableFilter<"Factura"> | string | null
    createdAt?: DateTimeFilter<"Factura"> | Date | string
    updatedAt?: DateTimeFilter<"Factura"> | Date | string
  }

  export type CotizacionUpsertWithWhereUniqueWithoutClienteInput = {
    where: CotizacionWhereUniqueInput
    update: XOR<CotizacionUpdateWithoutClienteInput, CotizacionUncheckedUpdateWithoutClienteInput>
    create: XOR<CotizacionCreateWithoutClienteInput, CotizacionUncheckedCreateWithoutClienteInput>
  }

  export type CotizacionUpdateWithWhereUniqueWithoutClienteInput = {
    where: CotizacionWhereUniqueInput
    data: XOR<CotizacionUpdateWithoutClienteInput, CotizacionUncheckedUpdateWithoutClienteInput>
  }

  export type CotizacionUpdateManyWithWhereWithoutClienteInput = {
    where: CotizacionScalarWhereInput
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyWithoutClienteInput>
  }

  export type CotizacionScalarWhereInput = {
    AND?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
    OR?: CotizacionScalarWhereInput[]
    NOT?: CotizacionScalarWhereInput | CotizacionScalarWhereInput[]
    id?: StringFilter<"Cotizacion"> | string
    numero?: IntFilter<"Cotizacion"> | number
    clienteId?: StringFilter<"Cotizacion"> | string
    usuarioId?: StringNullableFilter<"Cotizacion"> | string | null
    fechaEmision?: DateTimeFilter<"Cotizacion"> | Date | string
    fechaValidez?: DateTimeFilter<"Cotizacion"> | Date | string
    subtotal?: FloatFilter<"Cotizacion"> | number
    impuestoTotal?: FloatFilter<"Cotizacion"> | number
    total?: FloatFilter<"Cotizacion"> | number
    moneda?: StringFilter<"Cotizacion"> | string
    estado?: StringFilter<"Cotizacion"> | string
  }

  export type UsuarioCreateWithoutProductosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutSubUsuariosInput
    subUsuarios?: UsuarioCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutProductosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    empresaId?: string | null
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subUsuarios?: UsuarioUncheckedCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaUncheckedCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaUncheckedCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutProductosInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutProductosInput, UsuarioUncheckedCreateWithoutProductosInput>
  }

  export type ItemFacturaCreateWithoutProductoInput = {
    id?: string
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt?: Date | string
    factura: FacturaCreateNestedOneWithoutItemsInput
  }

  export type ItemFacturaUncheckedCreateWithoutProductoInput = {
    id?: string
    facturaId: string
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt?: Date | string
  }

  export type ItemFacturaCreateOrConnectWithoutProductoInput = {
    where: ItemFacturaWhereUniqueInput
    create: XOR<ItemFacturaCreateWithoutProductoInput, ItemFacturaUncheckedCreateWithoutProductoInput>
  }

  export type ItemFacturaCreateManyProductoInputEnvelope = {
    data: ItemFacturaCreateManyProductoInput | ItemFacturaCreateManyProductoInput[]
  }

  export type UsuarioUpsertWithoutProductosInput = {
    update: XOR<UsuarioUpdateWithoutProductosInput, UsuarioUncheckedUpdateWithoutProductosInput>
    create: XOR<UsuarioCreateWithoutProductosInput, UsuarioUncheckedCreateWithoutProductosInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutProductosInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutProductosInput, UsuarioUncheckedUpdateWithoutProductosInput>
  }

  export type UsuarioUpdateWithoutProductosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutSubUsuariosNestedInput
    subUsuarios?: UsuarioUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutProductosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subUsuarios?: UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUncheckedUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUncheckedUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type ItemFacturaUpsertWithWhereUniqueWithoutProductoInput = {
    where: ItemFacturaWhereUniqueInput
    update: XOR<ItemFacturaUpdateWithoutProductoInput, ItemFacturaUncheckedUpdateWithoutProductoInput>
    create: XOR<ItemFacturaCreateWithoutProductoInput, ItemFacturaUncheckedCreateWithoutProductoInput>
  }

  export type ItemFacturaUpdateWithWhereUniqueWithoutProductoInput = {
    where: ItemFacturaWhereUniqueInput
    data: XOR<ItemFacturaUpdateWithoutProductoInput, ItemFacturaUncheckedUpdateWithoutProductoInput>
  }

  export type ItemFacturaUpdateManyWithWhereWithoutProductoInput = {
    where: ItemFacturaScalarWhereInput
    data: XOR<ItemFacturaUpdateManyMutationInput, ItemFacturaUncheckedUpdateManyWithoutProductoInput>
  }

  export type ItemFacturaScalarWhereInput = {
    AND?: ItemFacturaScalarWhereInput | ItemFacturaScalarWhereInput[]
    OR?: ItemFacturaScalarWhereInput[]
    NOT?: ItemFacturaScalarWhereInput | ItemFacturaScalarWhereInput[]
    id?: StringFilter<"ItemFactura"> | string
    facturaId?: StringFilter<"ItemFactura"> | string
    productoId?: StringNullableFilter<"ItemFactura"> | string | null
    descripcionHistorica?: StringFilter<"ItemFactura"> | string
    cantidad?: IntFilter<"ItemFactura"> | number
    precioUnitarioHistorico?: FloatFilter<"ItemFactura"> | number
    tasaImpuestoAplicada?: FloatFilter<"ItemFactura"> | number
    subtotalLinea?: FloatFilter<"ItemFactura"> | number
    impuestoLinea?: FloatFilter<"ItemFactura"> | number
    totalLinea?: FloatFilter<"ItemFactura"> | number
    createdAt?: DateTimeFilter<"ItemFactura"> | Date | string
  }

  export type ClienteCreateWithoutFacturasInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutClientesInput
    cotizaciones?: CotizacionCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutFacturasInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    empresaId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutFacturasInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutFacturasInput, ClienteUncheckedCreateWithoutFacturasInput>
  }

  export type UsuarioCreateWithoutFacturasInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutSubUsuariosInput
    subUsuarios?: UsuarioCreateNestedManyWithoutEmpresaInput
    productos?: ProductoCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteCreateNestedManyWithoutEmpresaInput
    cierresCaja?: CierreCajaCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutFacturasInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    empresaId?: string | null
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subUsuarios?: UsuarioUncheckedCreateNestedManyWithoutEmpresaInput
    productos?: ProductoUncheckedCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutEmpresaInput
    cierresCaja?: CierreCajaUncheckedCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutFacturasInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutFacturasInput, UsuarioUncheckedCreateWithoutFacturasInput>
  }

  export type ItemFacturaCreateWithoutFacturaInput = {
    id?: string
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt?: Date | string
    producto?: ProductoCreateNestedOneWithoutItemsFacturaInput
  }

  export type ItemFacturaUncheckedCreateWithoutFacturaInput = {
    id?: string
    productoId?: string | null
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt?: Date | string
  }

  export type ItemFacturaCreateOrConnectWithoutFacturaInput = {
    where: ItemFacturaWhereUniqueInput
    create: XOR<ItemFacturaCreateWithoutFacturaInput, ItemFacturaUncheckedCreateWithoutFacturaInput>
  }

  export type ItemFacturaCreateManyFacturaInputEnvelope = {
    data: ItemFacturaCreateManyFacturaInput | ItemFacturaCreateManyFacturaInput[]
  }

  export type PagoCreateWithoutFacturaInput = {
    id?: string
    monto: number
    metodoPago: string
    referenciaTransaccion?: string | null
    fechaPago?: Date | string
    notas?: string | null
    createdAt?: Date | string
  }

  export type PagoUncheckedCreateWithoutFacturaInput = {
    id?: string
    monto: number
    metodoPago: string
    referenciaTransaccion?: string | null
    fechaPago?: Date | string
    notas?: string | null
    createdAt?: Date | string
  }

  export type PagoCreateOrConnectWithoutFacturaInput = {
    where: PagoWhereUniqueInput
    create: XOR<PagoCreateWithoutFacturaInput, PagoUncheckedCreateWithoutFacturaInput>
  }

  export type PagoCreateManyFacturaInputEnvelope = {
    data: PagoCreateManyFacturaInput | PagoCreateManyFacturaInput[]
  }

  export type ClienteUpsertWithoutFacturasInput = {
    update: XOR<ClienteUpdateWithoutFacturasInput, ClienteUncheckedUpdateWithoutFacturasInput>
    create: XOR<ClienteCreateWithoutFacturasInput, ClienteUncheckedCreateWithoutFacturasInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutFacturasInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutFacturasInput, ClienteUncheckedUpdateWithoutFacturasInput>
  }

  export type ClienteUpdateWithoutFacturasInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutClientesNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutFacturasInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type UsuarioUpsertWithoutFacturasInput = {
    update: XOR<UsuarioUpdateWithoutFacturasInput, UsuarioUncheckedUpdateWithoutFacturasInput>
    create: XOR<UsuarioCreateWithoutFacturasInput, UsuarioUncheckedCreateWithoutFacturasInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutFacturasInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutFacturasInput, UsuarioUncheckedUpdateWithoutFacturasInput>
  }

  export type UsuarioUpdateWithoutFacturasInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutSubUsuariosNestedInput
    subUsuarios?: UsuarioUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUpdateManyWithoutEmpresaNestedInput
    cierresCaja?: CierreCajaUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutFacturasInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subUsuarios?: UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUncheckedUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutEmpresaNestedInput
    cierresCaja?: CierreCajaUncheckedUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type ItemFacturaUpsertWithWhereUniqueWithoutFacturaInput = {
    where: ItemFacturaWhereUniqueInput
    update: XOR<ItemFacturaUpdateWithoutFacturaInput, ItemFacturaUncheckedUpdateWithoutFacturaInput>
    create: XOR<ItemFacturaCreateWithoutFacturaInput, ItemFacturaUncheckedCreateWithoutFacturaInput>
  }

  export type ItemFacturaUpdateWithWhereUniqueWithoutFacturaInput = {
    where: ItemFacturaWhereUniqueInput
    data: XOR<ItemFacturaUpdateWithoutFacturaInput, ItemFacturaUncheckedUpdateWithoutFacturaInput>
  }

  export type ItemFacturaUpdateManyWithWhereWithoutFacturaInput = {
    where: ItemFacturaScalarWhereInput
    data: XOR<ItemFacturaUpdateManyMutationInput, ItemFacturaUncheckedUpdateManyWithoutFacturaInput>
  }

  export type PagoUpsertWithWhereUniqueWithoutFacturaInput = {
    where: PagoWhereUniqueInput
    update: XOR<PagoUpdateWithoutFacturaInput, PagoUncheckedUpdateWithoutFacturaInput>
    create: XOR<PagoCreateWithoutFacturaInput, PagoUncheckedCreateWithoutFacturaInput>
  }

  export type PagoUpdateWithWhereUniqueWithoutFacturaInput = {
    where: PagoWhereUniqueInput
    data: XOR<PagoUpdateWithoutFacturaInput, PagoUncheckedUpdateWithoutFacturaInput>
  }

  export type PagoUpdateManyWithWhereWithoutFacturaInput = {
    where: PagoScalarWhereInput
    data: XOR<PagoUpdateManyMutationInput, PagoUncheckedUpdateManyWithoutFacturaInput>
  }

  export type PagoScalarWhereInput = {
    AND?: PagoScalarWhereInput | PagoScalarWhereInput[]
    OR?: PagoScalarWhereInput[]
    NOT?: PagoScalarWhereInput | PagoScalarWhereInput[]
    id?: StringFilter<"Pago"> | string
    facturaId?: StringFilter<"Pago"> | string
    monto?: FloatFilter<"Pago"> | number
    metodoPago?: StringFilter<"Pago"> | string
    referenciaTransaccion?: StringNullableFilter<"Pago"> | string | null
    fechaPago?: DateTimeFilter<"Pago"> | Date | string
    notas?: StringNullableFilter<"Pago"> | string | null
    createdAt?: DateTimeFilter<"Pago"> | Date | string
  }

  export type FacturaCreateWithoutItemsInput = {
    id?: string
    numeroFactura: number
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutFacturasInput
    usuario?: UsuarioCreateNestedOneWithoutFacturasInput
    pagos?: PagoCreateNestedManyWithoutFacturaInput
  }

  export type FacturaUncheckedCreateWithoutItemsInput = {
    id?: string
    numeroFactura: number
    clienteId: string
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    pagos?: PagoUncheckedCreateNestedManyWithoutFacturaInput
  }

  export type FacturaCreateOrConnectWithoutItemsInput = {
    where: FacturaWhereUniqueInput
    create: XOR<FacturaCreateWithoutItemsInput, FacturaUncheckedCreateWithoutItemsInput>
  }

  export type ProductoCreateWithoutItemsFacturaInput = {
    id?: string
    sku: string
    nombre: string
    descripcion?: string | null
    stockActual?: number
    stockMinimo?: number
    precioVenta: number
    costoCompra?: number
    tasaImpuesto?: number
    categoria?: string
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa: UsuarioCreateNestedOneWithoutProductosInput
  }

  export type ProductoUncheckedCreateWithoutItemsFacturaInput = {
    id?: string
    sku: string
    nombre: string
    descripcion?: string | null
    stockActual?: number
    stockMinimo?: number
    precioVenta: number
    costoCompra?: number
    tasaImpuesto?: number
    categoria?: string
    activo?: boolean
    empresaId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductoCreateOrConnectWithoutItemsFacturaInput = {
    where: ProductoWhereUniqueInput
    create: XOR<ProductoCreateWithoutItemsFacturaInput, ProductoUncheckedCreateWithoutItemsFacturaInput>
  }

  export type FacturaUpsertWithoutItemsInput = {
    update: XOR<FacturaUpdateWithoutItemsInput, FacturaUncheckedUpdateWithoutItemsInput>
    create: XOR<FacturaCreateWithoutItemsInput, FacturaUncheckedCreateWithoutItemsInput>
    where?: FacturaWhereInput
  }

  export type FacturaUpdateToOneWithWhereWithoutItemsInput = {
    where?: FacturaWhereInput
    data: XOR<FacturaUpdateWithoutItemsInput, FacturaUncheckedUpdateWithoutItemsInput>
  }

  export type FacturaUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutFacturasNestedInput
    usuario?: UsuarioUpdateOneWithoutFacturasNestedInput
    pagos?: PagoUpdateManyWithoutFacturaNestedInput
  }

  export type FacturaUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pagos?: PagoUncheckedUpdateManyWithoutFacturaNestedInput
  }

  export type ProductoUpsertWithoutItemsFacturaInput = {
    update: XOR<ProductoUpdateWithoutItemsFacturaInput, ProductoUncheckedUpdateWithoutItemsFacturaInput>
    create: XOR<ProductoCreateWithoutItemsFacturaInput, ProductoUncheckedCreateWithoutItemsFacturaInput>
    where?: ProductoWhereInput
  }

  export type ProductoUpdateToOneWithWhereWithoutItemsFacturaInput = {
    where?: ProductoWhereInput
    data: XOR<ProductoUpdateWithoutItemsFacturaInput, ProductoUncheckedUpdateWithoutItemsFacturaInput>
  }

  export type ProductoUpdateWithoutItemsFacturaInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    stockActual?: IntFieldUpdateOperationsInput | number
    stockMinimo?: IntFieldUpdateOperationsInput | number
    precioVenta?: FloatFieldUpdateOperationsInput | number
    costoCompra?: FloatFieldUpdateOperationsInput | number
    tasaImpuesto?: FloatFieldUpdateOperationsInput | number
    categoria?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneRequiredWithoutProductosNestedInput
  }

  export type ProductoUncheckedUpdateWithoutItemsFacturaInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    stockActual?: IntFieldUpdateOperationsInput | number
    stockMinimo?: IntFieldUpdateOperationsInput | number
    precioVenta?: FloatFieldUpdateOperationsInput | number
    costoCompra?: FloatFieldUpdateOperationsInput | number
    tasaImpuesto?: FloatFieldUpdateOperationsInput | number
    categoria?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FacturaCreateWithoutPagosInput = {
    id?: string
    numeroFactura: number
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutFacturasInput
    usuario?: UsuarioCreateNestedOneWithoutFacturasInput
    items?: ItemFacturaCreateNestedManyWithoutFacturaInput
  }

  export type FacturaUncheckedCreateWithoutPagosInput = {
    id?: string
    numeroFactura: number
    clienteId: string
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: ItemFacturaUncheckedCreateNestedManyWithoutFacturaInput
  }

  export type FacturaCreateOrConnectWithoutPagosInput = {
    where: FacturaWhereUniqueInput
    create: XOR<FacturaCreateWithoutPagosInput, FacturaUncheckedCreateWithoutPagosInput>
  }

  export type FacturaUpsertWithoutPagosInput = {
    update: XOR<FacturaUpdateWithoutPagosInput, FacturaUncheckedUpdateWithoutPagosInput>
    create: XOR<FacturaCreateWithoutPagosInput, FacturaUncheckedCreateWithoutPagosInput>
    where?: FacturaWhereInput
  }

  export type FacturaUpdateToOneWithWhereWithoutPagosInput = {
    where?: FacturaWhereInput
    data: XOR<FacturaUpdateWithoutPagosInput, FacturaUncheckedUpdateWithoutPagosInput>
  }

  export type FacturaUpdateWithoutPagosInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutFacturasNestedInput
    usuario?: UsuarioUpdateOneWithoutFacturasNestedInput
    items?: ItemFacturaUpdateManyWithoutFacturaNestedInput
  }

  export type FacturaUncheckedUpdateWithoutPagosInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: ItemFacturaUncheckedUpdateManyWithoutFacturaNestedInput
  }

  export type UsuarioCreateWithoutCierresCajaInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutSubUsuariosInput
    subUsuarios?: UsuarioCreateNestedManyWithoutEmpresaInput
    productos?: ProductoCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutCierresCajaInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    empresaId?: string | null
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subUsuarios?: UsuarioUncheckedCreateNestedManyWithoutEmpresaInput
    productos?: ProductoUncheckedCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaUncheckedCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutCierresCajaInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutCierresCajaInput, UsuarioUncheckedCreateWithoutCierresCajaInput>
  }

  export type UsuarioUpsertWithoutCierresCajaInput = {
    update: XOR<UsuarioUpdateWithoutCierresCajaInput, UsuarioUncheckedUpdateWithoutCierresCajaInput>
    create: XOR<UsuarioCreateWithoutCierresCajaInput, UsuarioUncheckedCreateWithoutCierresCajaInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutCierresCajaInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutCierresCajaInput, UsuarioUncheckedUpdateWithoutCierresCajaInput>
  }

  export type UsuarioUpdateWithoutCierresCajaInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutSubUsuariosNestedInput
    subUsuarios?: UsuarioUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutCierresCajaInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subUsuarios?: UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUncheckedUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUncheckedUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type ClienteCreateWithoutCotizacionesInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutClientesInput
    facturas?: FacturaCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutCotizacionesInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    empresaId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    facturas?: FacturaUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutCotizacionesInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
  }

  export type UsuarioCreateWithoutCotizacionesInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutSubUsuariosInput
    subUsuarios?: UsuarioCreateNestedManyWithoutEmpresaInput
    productos?: ProductoCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutCotizacionesInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    empresaId?: string | null
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subUsuarios?: UsuarioUncheckedCreateNestedManyWithoutEmpresaInput
    productos?: ProductoUncheckedCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaUncheckedCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaUncheckedCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutCotizacionesInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutCotizacionesInput, UsuarioUncheckedCreateWithoutCotizacionesInput>
  }

  export type ItemCotizacionCreateWithoutCotizacionInput = {
    id?: string
    productoId?: string | null
    descripcion: string
    cantidad: number
    precioUnitario: number
    totalLinea: number
  }

  export type ItemCotizacionUncheckedCreateWithoutCotizacionInput = {
    id?: string
    productoId?: string | null
    descripcion: string
    cantidad: number
    precioUnitario: number
    totalLinea: number
  }

  export type ItemCotizacionCreateOrConnectWithoutCotizacionInput = {
    where: ItemCotizacionWhereUniqueInput
    create: XOR<ItemCotizacionCreateWithoutCotizacionInput, ItemCotizacionUncheckedCreateWithoutCotizacionInput>
  }

  export type ItemCotizacionCreateManyCotizacionInputEnvelope = {
    data: ItemCotizacionCreateManyCotizacionInput | ItemCotizacionCreateManyCotizacionInput[]
  }

  export type ClienteUpsertWithoutCotizacionesInput = {
    update: XOR<ClienteUpdateWithoutCotizacionesInput, ClienteUncheckedUpdateWithoutCotizacionesInput>
    create: XOR<ClienteCreateWithoutCotizacionesInput, ClienteUncheckedCreateWithoutCotizacionesInput>
    where?: ClienteWhereInput
  }

  export type ClienteUpdateToOneWithWhereWithoutCotizacionesInput = {
    where?: ClienteWhereInput
    data: XOR<ClienteUpdateWithoutCotizacionesInput, ClienteUncheckedUpdateWithoutCotizacionesInput>
  }

  export type ClienteUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutClientesNestedInput
    facturas?: FacturaUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    facturas?: FacturaUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type UsuarioUpsertWithoutCotizacionesInput = {
    update: XOR<UsuarioUpdateWithoutCotizacionesInput, UsuarioUncheckedUpdateWithoutCotizacionesInput>
    create: XOR<UsuarioCreateWithoutCotizacionesInput, UsuarioUncheckedCreateWithoutCotizacionesInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutCotizacionesInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutCotizacionesInput, UsuarioUncheckedUpdateWithoutCotizacionesInput>
  }

  export type UsuarioUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutSubUsuariosNestedInput
    subUsuarios?: UsuarioUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutCotizacionesInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subUsuarios?: UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUncheckedUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUncheckedUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUncheckedUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type ItemCotizacionUpsertWithWhereUniqueWithoutCotizacionInput = {
    where: ItemCotizacionWhereUniqueInput
    update: XOR<ItemCotizacionUpdateWithoutCotizacionInput, ItemCotizacionUncheckedUpdateWithoutCotizacionInput>
    create: XOR<ItemCotizacionCreateWithoutCotizacionInput, ItemCotizacionUncheckedCreateWithoutCotizacionInput>
  }

  export type ItemCotizacionUpdateWithWhereUniqueWithoutCotizacionInput = {
    where: ItemCotizacionWhereUniqueInput
    data: XOR<ItemCotizacionUpdateWithoutCotizacionInput, ItemCotizacionUncheckedUpdateWithoutCotizacionInput>
  }

  export type ItemCotizacionUpdateManyWithWhereWithoutCotizacionInput = {
    where: ItemCotizacionScalarWhereInput
    data: XOR<ItemCotizacionUpdateManyMutationInput, ItemCotizacionUncheckedUpdateManyWithoutCotizacionInput>
  }

  export type ItemCotizacionScalarWhereInput = {
    AND?: ItemCotizacionScalarWhereInput | ItemCotizacionScalarWhereInput[]
    OR?: ItemCotizacionScalarWhereInput[]
    NOT?: ItemCotizacionScalarWhereInput | ItemCotizacionScalarWhereInput[]
    id?: StringFilter<"ItemCotizacion"> | string
    cotizacionId?: StringFilter<"ItemCotizacion"> | string
    productoId?: StringNullableFilter<"ItemCotizacion"> | string | null
    descripcion?: StringFilter<"ItemCotizacion"> | string
    cantidad?: IntFilter<"ItemCotizacion"> | number
    precioUnitario?: FloatFilter<"ItemCotizacion"> | number
    totalLinea?: FloatFilter<"ItemCotizacion"> | number
  }

  export type CotizacionCreateWithoutItemsInput = {
    id?: string
    numero: number
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
    usuario?: UsuarioCreateNestedOneWithoutCotizacionesInput
  }

  export type CotizacionUncheckedCreateWithoutItemsInput = {
    id?: string
    numero: number
    clienteId: string
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
  }

  export type CotizacionCreateOrConnectWithoutItemsInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutItemsInput, CotizacionUncheckedCreateWithoutItemsInput>
  }

  export type CotizacionUpsertWithoutItemsInput = {
    update: XOR<CotizacionUpdateWithoutItemsInput, CotizacionUncheckedUpdateWithoutItemsInput>
    create: XOR<CotizacionCreateWithoutItemsInput, CotizacionUncheckedCreateWithoutItemsInput>
    where?: CotizacionWhereInput
  }

  export type CotizacionUpdateToOneWithWhereWithoutItemsInput = {
    where?: CotizacionWhereInput
    data: XOR<CotizacionUpdateWithoutItemsInput, CotizacionUncheckedUpdateWithoutItemsInput>
  }

  export type CotizacionUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
    usuario?: UsuarioUpdateOneWithoutCotizacionesNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
  }

  export type UsuarioCreateWithoutSubUsuariosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutSubUsuariosInput
    productos?: ProductoCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutSubUsuariosInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    empresaId?: string | null
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    productos?: ProductoUncheckedCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaUncheckedCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaUncheckedCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutSubUsuariosInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutSubUsuariosInput, UsuarioUncheckedCreateWithoutSubUsuariosInput>
  }

  export type UsuarioCreateWithoutEmpresaInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subUsuarios?: UsuarioCreateNestedManyWithoutEmpresaInput
    productos?: ProductoCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutEmpresaInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subUsuarios?: UsuarioUncheckedCreateNestedManyWithoutEmpresaInput
    productos?: ProductoUncheckedCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaUncheckedCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaUncheckedCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutUsuarioInput
    solicitudesActivacion?: SolicitudActivacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutEmpresaInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutEmpresaInput, UsuarioUncheckedCreateWithoutEmpresaInput>
  }

  export type UsuarioCreateManyEmpresaInputEnvelope = {
    data: UsuarioCreateManyEmpresaInput | UsuarioCreateManyEmpresaInput[]
  }

  export type ProductoCreateWithoutEmpresaInput = {
    id?: string
    sku: string
    nombre: string
    descripcion?: string | null
    stockActual?: number
    stockMinimo?: number
    precioVenta: number
    costoCompra?: number
    tasaImpuesto?: number
    categoria?: string
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    itemsFactura?: ItemFacturaCreateNestedManyWithoutProductoInput
  }

  export type ProductoUncheckedCreateWithoutEmpresaInput = {
    id?: string
    sku: string
    nombre: string
    descripcion?: string | null
    stockActual?: number
    stockMinimo?: number
    precioVenta: number
    costoCompra?: number
    tasaImpuesto?: number
    categoria?: string
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    itemsFactura?: ItemFacturaUncheckedCreateNestedManyWithoutProductoInput
  }

  export type ProductoCreateOrConnectWithoutEmpresaInput = {
    where: ProductoWhereUniqueInput
    create: XOR<ProductoCreateWithoutEmpresaInput, ProductoUncheckedCreateWithoutEmpresaInput>
  }

  export type ProductoCreateManyEmpresaInputEnvelope = {
    data: ProductoCreateManyEmpresaInput | ProductoCreateManyEmpresaInput[]
  }

  export type ClienteCreateWithoutEmpresaInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    facturas?: FacturaCreateNestedManyWithoutClienteInput
    cotizaciones?: CotizacionCreateNestedManyWithoutClienteInput
  }

  export type ClienteUncheckedCreateWithoutEmpresaInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    facturas?: FacturaUncheckedCreateNestedManyWithoutClienteInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutClienteInput
  }

  export type ClienteCreateOrConnectWithoutEmpresaInput = {
    where: ClienteWhereUniqueInput
    create: XOR<ClienteCreateWithoutEmpresaInput, ClienteUncheckedCreateWithoutEmpresaInput>
  }

  export type ClienteCreateManyEmpresaInputEnvelope = {
    data: ClienteCreateManyEmpresaInput | ClienteCreateManyEmpresaInput[]
  }

  export type FacturaCreateWithoutUsuarioInput = {
    id?: string
    numeroFactura: number
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    cliente: ClienteCreateNestedOneWithoutFacturasInput
    items?: ItemFacturaCreateNestedManyWithoutFacturaInput
    pagos?: PagoCreateNestedManyWithoutFacturaInput
  }

  export type FacturaUncheckedCreateWithoutUsuarioInput = {
    id?: string
    numeroFactura: number
    clienteId: string
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: ItemFacturaUncheckedCreateNestedManyWithoutFacturaInput
    pagos?: PagoUncheckedCreateNestedManyWithoutFacturaInput
  }

  export type FacturaCreateOrConnectWithoutUsuarioInput = {
    where: FacturaWhereUniqueInput
    create: XOR<FacturaCreateWithoutUsuarioInput, FacturaUncheckedCreateWithoutUsuarioInput>
  }

  export type FacturaCreateManyUsuarioInputEnvelope = {
    data: FacturaCreateManyUsuarioInput | FacturaCreateManyUsuarioInput[]
  }

  export type CierreCajaCreateWithoutUsuarioInput = {
    id?: string
    fechaApertura?: Date | string
    fechaCierre?: Date | string | null
    montoInicial: number
    montoFinal?: number | null
    ingresosEfectivo?: number
    ingresosBanco?: number
    estado?: string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CierreCajaUncheckedCreateWithoutUsuarioInput = {
    id?: string
    fechaApertura?: Date | string
    fechaCierre?: Date | string | null
    montoInicial: number
    montoFinal?: number | null
    ingresosEfectivo?: number
    ingresosBanco?: number
    estado?: string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CierreCajaCreateOrConnectWithoutUsuarioInput = {
    where: CierreCajaWhereUniqueInput
    create: XOR<CierreCajaCreateWithoutUsuarioInput, CierreCajaUncheckedCreateWithoutUsuarioInput>
  }

  export type CierreCajaCreateManyUsuarioInputEnvelope = {
    data: CierreCajaCreateManyUsuarioInput | CierreCajaCreateManyUsuarioInput[]
  }

  export type CotizacionCreateWithoutUsuarioInput = {
    id?: string
    numero: number
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
    cliente: ClienteCreateNestedOneWithoutCotizacionesInput
    items?: ItemCotizacionCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionUncheckedCreateWithoutUsuarioInput = {
    id?: string
    numero: number
    clienteId: string
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
    items?: ItemCotizacionUncheckedCreateNestedManyWithoutCotizacionInput
  }

  export type CotizacionCreateOrConnectWithoutUsuarioInput = {
    where: CotizacionWhereUniqueInput
    create: XOR<CotizacionCreateWithoutUsuarioInput, CotizacionUncheckedCreateWithoutUsuarioInput>
  }

  export type CotizacionCreateManyUsuarioInputEnvelope = {
    data: CotizacionCreateManyUsuarioInput | CotizacionCreateManyUsuarioInput[]
  }

  export type SolicitudActivacionCreateWithoutUsuarioInput = {
    id?: string
    plan: string
    metodoPago: string
    referencia: string
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SolicitudActivacionUncheckedCreateWithoutUsuarioInput = {
    id?: string
    plan: string
    metodoPago: string
    referencia: string
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SolicitudActivacionCreateOrConnectWithoutUsuarioInput = {
    where: SolicitudActivacionWhereUniqueInput
    create: XOR<SolicitudActivacionCreateWithoutUsuarioInput, SolicitudActivacionUncheckedCreateWithoutUsuarioInput>
  }

  export type SolicitudActivacionCreateManyUsuarioInputEnvelope = {
    data: SolicitudActivacionCreateManyUsuarioInput | SolicitudActivacionCreateManyUsuarioInput[]
  }

  export type UsuarioUpsertWithoutSubUsuariosInput = {
    update: XOR<UsuarioUpdateWithoutSubUsuariosInput, UsuarioUncheckedUpdateWithoutSubUsuariosInput>
    create: XOR<UsuarioCreateWithoutSubUsuariosInput, UsuarioUncheckedCreateWithoutSubUsuariosInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutSubUsuariosInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutSubUsuariosInput, UsuarioUncheckedUpdateWithoutSubUsuariosInput>
  }

  export type UsuarioUpdateWithoutSubUsuariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutSubUsuariosNestedInput
    productos?: ProductoUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutSubUsuariosInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    productos?: ProductoUncheckedUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUncheckedUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUncheckedUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUpsertWithWhereUniqueWithoutEmpresaInput = {
    where: UsuarioWhereUniqueInput
    update: XOR<UsuarioUpdateWithoutEmpresaInput, UsuarioUncheckedUpdateWithoutEmpresaInput>
    create: XOR<UsuarioCreateWithoutEmpresaInput, UsuarioUncheckedCreateWithoutEmpresaInput>
  }

  export type UsuarioUpdateWithWhereUniqueWithoutEmpresaInput = {
    where: UsuarioWhereUniqueInput
    data: XOR<UsuarioUpdateWithoutEmpresaInput, UsuarioUncheckedUpdateWithoutEmpresaInput>
  }

  export type UsuarioUpdateManyWithWhereWithoutEmpresaInput = {
    where: UsuarioScalarWhereInput
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyWithoutEmpresaInput>
  }

  export type UsuarioScalarWhereInput = {
    AND?: UsuarioScalarWhereInput | UsuarioScalarWhereInput[]
    OR?: UsuarioScalarWhereInput[]
    NOT?: UsuarioScalarWhereInput | UsuarioScalarWhereInput[]
    id?: StringFilter<"Usuario"> | string
    username?: StringFilter<"Usuario"> | string
    passwordHash?: StringFilter<"Usuario"> | string
    nombre?: StringFilter<"Usuario"> | string
    rol?: StringFilter<"Usuario"> | string
    activo?: BoolFilter<"Usuario"> | boolean
    empresaId?: StringNullableFilter<"Usuario"> | string | null
    subscriptionStatus?: StringFilter<"Usuario"> | string
    planType?: StringNullableFilter<"Usuario"> | string | null
    trialStartsAt?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    trialEndsAt?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    currentPeriodEnd?: DateTimeNullableFilter<"Usuario"> | Date | string | null
    createdAt?: DateTimeFilter<"Usuario"> | Date | string
    updatedAt?: DateTimeFilter<"Usuario"> | Date | string
  }

  export type ProductoUpsertWithWhereUniqueWithoutEmpresaInput = {
    where: ProductoWhereUniqueInput
    update: XOR<ProductoUpdateWithoutEmpresaInput, ProductoUncheckedUpdateWithoutEmpresaInput>
    create: XOR<ProductoCreateWithoutEmpresaInput, ProductoUncheckedCreateWithoutEmpresaInput>
  }

  export type ProductoUpdateWithWhereUniqueWithoutEmpresaInput = {
    where: ProductoWhereUniqueInput
    data: XOR<ProductoUpdateWithoutEmpresaInput, ProductoUncheckedUpdateWithoutEmpresaInput>
  }

  export type ProductoUpdateManyWithWhereWithoutEmpresaInput = {
    where: ProductoScalarWhereInput
    data: XOR<ProductoUpdateManyMutationInput, ProductoUncheckedUpdateManyWithoutEmpresaInput>
  }

  export type ProductoScalarWhereInput = {
    AND?: ProductoScalarWhereInput | ProductoScalarWhereInput[]
    OR?: ProductoScalarWhereInput[]
    NOT?: ProductoScalarWhereInput | ProductoScalarWhereInput[]
    id?: StringFilter<"Producto"> | string
    sku?: StringFilter<"Producto"> | string
    nombre?: StringFilter<"Producto"> | string
    descripcion?: StringNullableFilter<"Producto"> | string | null
    stockActual?: IntFilter<"Producto"> | number
    stockMinimo?: IntFilter<"Producto"> | number
    precioVenta?: FloatFilter<"Producto"> | number
    costoCompra?: FloatFilter<"Producto"> | number
    tasaImpuesto?: FloatFilter<"Producto"> | number
    categoria?: StringFilter<"Producto"> | string
    activo?: BoolFilter<"Producto"> | boolean
    empresaId?: StringFilter<"Producto"> | string
    createdAt?: DateTimeFilter<"Producto"> | Date | string
    updatedAt?: DateTimeFilter<"Producto"> | Date | string
  }

  export type ClienteUpsertWithWhereUniqueWithoutEmpresaInput = {
    where: ClienteWhereUniqueInput
    update: XOR<ClienteUpdateWithoutEmpresaInput, ClienteUncheckedUpdateWithoutEmpresaInput>
    create: XOR<ClienteCreateWithoutEmpresaInput, ClienteUncheckedCreateWithoutEmpresaInput>
  }

  export type ClienteUpdateWithWhereUniqueWithoutEmpresaInput = {
    where: ClienteWhereUniqueInput
    data: XOR<ClienteUpdateWithoutEmpresaInput, ClienteUncheckedUpdateWithoutEmpresaInput>
  }

  export type ClienteUpdateManyWithWhereWithoutEmpresaInput = {
    where: ClienteScalarWhereInput
    data: XOR<ClienteUpdateManyMutationInput, ClienteUncheckedUpdateManyWithoutEmpresaInput>
  }

  export type ClienteScalarWhereInput = {
    AND?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
    OR?: ClienteScalarWhereInput[]
    NOT?: ClienteScalarWhereInput | ClienteScalarWhereInput[]
    id?: StringFilter<"Cliente"> | string
    razonSocial?: StringFilter<"Cliente"> | string
    rifCedula?: StringFilter<"Cliente"> | string
    direccion?: StringNullableFilter<"Cliente"> | string | null
    telefono?: StringNullableFilter<"Cliente"> | string | null
    correo?: StringNullableFilter<"Cliente"> | string | null
    empresaId?: StringNullableFilter<"Cliente"> | string | null
    createdAt?: DateTimeFilter<"Cliente"> | Date | string
    updatedAt?: DateTimeFilter<"Cliente"> | Date | string
  }

  export type FacturaUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: FacturaWhereUniqueInput
    update: XOR<FacturaUpdateWithoutUsuarioInput, FacturaUncheckedUpdateWithoutUsuarioInput>
    create: XOR<FacturaCreateWithoutUsuarioInput, FacturaUncheckedCreateWithoutUsuarioInput>
  }

  export type FacturaUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: FacturaWhereUniqueInput
    data: XOR<FacturaUpdateWithoutUsuarioInput, FacturaUncheckedUpdateWithoutUsuarioInput>
  }

  export type FacturaUpdateManyWithWhereWithoutUsuarioInput = {
    where: FacturaScalarWhereInput
    data: XOR<FacturaUpdateManyMutationInput, FacturaUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type CierreCajaUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: CierreCajaWhereUniqueInput
    update: XOR<CierreCajaUpdateWithoutUsuarioInput, CierreCajaUncheckedUpdateWithoutUsuarioInput>
    create: XOR<CierreCajaCreateWithoutUsuarioInput, CierreCajaUncheckedCreateWithoutUsuarioInput>
  }

  export type CierreCajaUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: CierreCajaWhereUniqueInput
    data: XOR<CierreCajaUpdateWithoutUsuarioInput, CierreCajaUncheckedUpdateWithoutUsuarioInput>
  }

  export type CierreCajaUpdateManyWithWhereWithoutUsuarioInput = {
    where: CierreCajaScalarWhereInput
    data: XOR<CierreCajaUpdateManyMutationInput, CierreCajaUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type CierreCajaScalarWhereInput = {
    AND?: CierreCajaScalarWhereInput | CierreCajaScalarWhereInput[]
    OR?: CierreCajaScalarWhereInput[]
    NOT?: CierreCajaScalarWhereInput | CierreCajaScalarWhereInput[]
    id?: StringFilter<"CierreCaja"> | string
    usuarioId?: StringNullableFilter<"CierreCaja"> | string | null
    fechaApertura?: DateTimeFilter<"CierreCaja"> | Date | string
    fechaCierre?: DateTimeNullableFilter<"CierreCaja"> | Date | string | null
    montoInicial?: FloatFilter<"CierreCaja"> | number
    montoFinal?: FloatNullableFilter<"CierreCaja"> | number | null
    ingresosEfectivo?: FloatFilter<"CierreCaja"> | number
    ingresosBanco?: FloatFilter<"CierreCaja"> | number
    estado?: StringFilter<"CierreCaja"> | string
    observaciones?: StringNullableFilter<"CierreCaja"> | string | null
    createdAt?: DateTimeFilter<"CierreCaja"> | Date | string
    updatedAt?: DateTimeFilter<"CierreCaja"> | Date | string
  }

  export type CotizacionUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: CotizacionWhereUniqueInput
    update: XOR<CotizacionUpdateWithoutUsuarioInput, CotizacionUncheckedUpdateWithoutUsuarioInput>
    create: XOR<CotizacionCreateWithoutUsuarioInput, CotizacionUncheckedCreateWithoutUsuarioInput>
  }

  export type CotizacionUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: CotizacionWhereUniqueInput
    data: XOR<CotizacionUpdateWithoutUsuarioInput, CotizacionUncheckedUpdateWithoutUsuarioInput>
  }

  export type CotizacionUpdateManyWithWhereWithoutUsuarioInput = {
    where: CotizacionScalarWhereInput
    data: XOR<CotizacionUpdateManyMutationInput, CotizacionUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type SolicitudActivacionUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: SolicitudActivacionWhereUniqueInput
    update: XOR<SolicitudActivacionUpdateWithoutUsuarioInput, SolicitudActivacionUncheckedUpdateWithoutUsuarioInput>
    create: XOR<SolicitudActivacionCreateWithoutUsuarioInput, SolicitudActivacionUncheckedCreateWithoutUsuarioInput>
  }

  export type SolicitudActivacionUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: SolicitudActivacionWhereUniqueInput
    data: XOR<SolicitudActivacionUpdateWithoutUsuarioInput, SolicitudActivacionUncheckedUpdateWithoutUsuarioInput>
  }

  export type SolicitudActivacionUpdateManyWithWhereWithoutUsuarioInput = {
    where: SolicitudActivacionScalarWhereInput
    data: XOR<SolicitudActivacionUpdateManyMutationInput, SolicitudActivacionUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type SolicitudActivacionScalarWhereInput = {
    AND?: SolicitudActivacionScalarWhereInput | SolicitudActivacionScalarWhereInput[]
    OR?: SolicitudActivacionScalarWhereInput[]
    NOT?: SolicitudActivacionScalarWhereInput | SolicitudActivacionScalarWhereInput[]
    id?: StringFilter<"SolicitudActivacion"> | string
    usuarioId?: StringFilter<"SolicitudActivacion"> | string
    plan?: StringFilter<"SolicitudActivacion"> | string
    metodoPago?: StringFilter<"SolicitudActivacion"> | string
    referencia?: StringFilter<"SolicitudActivacion"> | string
    estado?: StringFilter<"SolicitudActivacion"> | string
    createdAt?: DateTimeFilter<"SolicitudActivacion"> | Date | string
    updatedAt?: DateTimeFilter<"SolicitudActivacion"> | Date | string
  }

  export type UsuarioCreateWithoutSolicitudesActivacionInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    empresa?: UsuarioCreateNestedOneWithoutSubUsuariosInput
    subUsuarios?: UsuarioCreateNestedManyWithoutEmpresaInput
    productos?: ProductoCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutSolicitudesActivacionInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    empresaId?: string | null
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    subUsuarios?: UsuarioUncheckedCreateNestedManyWithoutEmpresaInput
    productos?: ProductoUncheckedCreateNestedManyWithoutEmpresaInput
    clientes?: ClienteUncheckedCreateNestedManyWithoutEmpresaInput
    facturas?: FacturaUncheckedCreateNestedManyWithoutUsuarioInput
    cierresCaja?: CierreCajaUncheckedCreateNestedManyWithoutUsuarioInput
    cotizaciones?: CotizacionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutSolicitudesActivacionInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutSolicitudesActivacionInput, UsuarioUncheckedCreateWithoutSolicitudesActivacionInput>
  }

  export type UsuarioUpsertWithoutSolicitudesActivacionInput = {
    update: XOR<UsuarioUpdateWithoutSolicitudesActivacionInput, UsuarioUncheckedUpdateWithoutSolicitudesActivacionInput>
    create: XOR<UsuarioCreateWithoutSolicitudesActivacionInput, UsuarioUncheckedCreateWithoutSolicitudesActivacionInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutSolicitudesActivacionInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutSolicitudesActivacionInput, UsuarioUncheckedUpdateWithoutSolicitudesActivacionInput>
  }

  export type UsuarioUpdateWithoutSolicitudesActivacionInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    empresa?: UsuarioUpdateOneWithoutSubUsuariosNestedInput
    subUsuarios?: UsuarioUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutSolicitudesActivacionInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    empresaId?: NullableStringFieldUpdateOperationsInput | string | null
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subUsuarios?: UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUncheckedUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUncheckedUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUncheckedUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type FacturaCreateManyClienteInput = {
    id?: string
    numeroFactura: number
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CotizacionCreateManyClienteInput = {
    id?: string
    numero: number
    usuarioId?: string | null
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
  }

  export type FacturaUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usuario?: UsuarioUpdateOneWithoutFacturasNestedInput
    items?: ItemFacturaUpdateManyWithoutFacturaNestedInput
    pagos?: PagoUpdateManyWithoutFacturaNestedInput
  }

  export type FacturaUncheckedUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: ItemFacturaUncheckedUpdateManyWithoutFacturaNestedInput
    pagos?: PagoUncheckedUpdateManyWithoutFacturaNestedInput
  }

  export type FacturaUncheckedUpdateManyWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CotizacionUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    usuario?: UsuarioUpdateOneWithoutCotizacionesNestedInput
    items?: ItemCotizacionUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    items?: ItemCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateManyWithoutClienteInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
  }

  export type ItemFacturaCreateManyProductoInput = {
    id?: string
    facturaId: string
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt?: Date | string
  }

  export type ItemFacturaUpdateWithoutProductoInput = {
    id?: StringFieldUpdateOperationsInput | string
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    factura?: FacturaUpdateOneRequiredWithoutItemsNestedInput
  }

  export type ItemFacturaUncheckedUpdateWithoutProductoInput = {
    id?: StringFieldUpdateOperationsInput | string
    facturaId?: StringFieldUpdateOperationsInput | string
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemFacturaUncheckedUpdateManyWithoutProductoInput = {
    id?: StringFieldUpdateOperationsInput | string
    facturaId?: StringFieldUpdateOperationsInput | string
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemFacturaCreateManyFacturaInput = {
    id?: string
    productoId?: string | null
    descripcionHistorica: string
    cantidad: number
    precioUnitarioHistorico: number
    tasaImpuestoAplicada: number
    subtotalLinea: number
    impuestoLinea: number
    totalLinea: number
    createdAt?: Date | string
  }

  export type PagoCreateManyFacturaInput = {
    id?: string
    monto: number
    metodoPago: string
    referenciaTransaccion?: string | null
    fechaPago?: Date | string
    notas?: string | null
    createdAt?: Date | string
  }

  export type ItemFacturaUpdateWithoutFacturaInput = {
    id?: StringFieldUpdateOperationsInput | string
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    producto?: ProductoUpdateOneWithoutItemsFacturaNestedInput
  }

  export type ItemFacturaUncheckedUpdateWithoutFacturaInput = {
    id?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemFacturaUncheckedUpdateManyWithoutFacturaInput = {
    id?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcionHistorica?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitarioHistorico?: FloatFieldUpdateOperationsInput | number
    tasaImpuestoAplicada?: FloatFieldUpdateOperationsInput | number
    subtotalLinea?: FloatFieldUpdateOperationsInput | number
    impuestoLinea?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoUpdateWithoutFacturaInput = {
    id?: StringFieldUpdateOperationsInput | string
    monto?: FloatFieldUpdateOperationsInput | number
    metodoPago?: StringFieldUpdateOperationsInput | string
    referenciaTransaccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPago?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoUncheckedUpdateWithoutFacturaInput = {
    id?: StringFieldUpdateOperationsInput | string
    monto?: FloatFieldUpdateOperationsInput | number
    metodoPago?: StringFieldUpdateOperationsInput | string
    referenciaTransaccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPago?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PagoUncheckedUpdateManyWithoutFacturaInput = {
    id?: StringFieldUpdateOperationsInput | string
    monto?: FloatFieldUpdateOperationsInput | number
    metodoPago?: StringFieldUpdateOperationsInput | string
    referenciaTransaccion?: NullableStringFieldUpdateOperationsInput | string | null
    fechaPago?: DateTimeFieldUpdateOperationsInput | Date | string
    notas?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemCotizacionCreateManyCotizacionInput = {
    id?: string
    productoId?: string | null
    descripcion: string
    cantidad: number
    precioUnitario: number
    totalLinea: number
  }

  export type ItemCotizacionUpdateWithoutCotizacionInput = {
    id?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitario?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
  }

  export type ItemCotizacionUncheckedUpdateWithoutCotizacionInput = {
    id?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitario?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
  }

  export type ItemCotizacionUncheckedUpdateManyWithoutCotizacionInput = {
    id?: StringFieldUpdateOperationsInput | string
    productoId?: NullableStringFieldUpdateOperationsInput | string | null
    descripcion?: StringFieldUpdateOperationsInput | string
    cantidad?: IntFieldUpdateOperationsInput | number
    precioUnitario?: FloatFieldUpdateOperationsInput | number
    totalLinea?: FloatFieldUpdateOperationsInput | number
  }

  export type UsuarioCreateManyEmpresaInput = {
    id?: string
    username: string
    passwordHash: string
    nombre?: string
    rol?: string
    activo?: boolean
    subscriptionStatus?: string
    planType?: string | null
    trialStartsAt?: Date | string | null
    trialEndsAt?: Date | string | null
    currentPeriodEnd?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductoCreateManyEmpresaInput = {
    id?: string
    sku: string
    nombre: string
    descripcion?: string | null
    stockActual?: number
    stockMinimo?: number
    precioVenta: number
    costoCompra?: number
    tasaImpuesto?: number
    categoria?: string
    activo?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClienteCreateManyEmpresaInput = {
    id?: string
    razonSocial: string
    rifCedula: string
    direccion?: string | null
    telefono?: string | null
    correo?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type FacturaCreateManyUsuarioInput = {
    id?: string
    numeroFactura: number
    clienteId: string
    fechaEmision?: Date | string
    fechaVencimiento: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    estado?: string
    moneda?: string
    tasaCambio?: number
    cuotasTotales?: number
    observaciones?: string | null
    anuladoPor?: string | null
    motivoAnulacion?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CierreCajaCreateManyUsuarioInput = {
    id?: string
    fechaApertura?: Date | string
    fechaCierre?: Date | string | null
    montoInicial: number
    montoFinal?: number | null
    ingresosEfectivo?: number
    ingresosBanco?: number
    estado?: string
    observaciones?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CotizacionCreateManyUsuarioInput = {
    id?: string
    numero: number
    clienteId: string
    fechaEmision?: Date | string
    fechaValidez: Date | string
    subtotal: number
    impuestoTotal: number
    total: number
    moneda?: string
    estado?: string
  }

  export type SolicitudActivacionCreateManyUsuarioInput = {
    id?: string
    plan: string
    metodoPago: string
    referencia: string
    estado?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UsuarioUpdateWithoutEmpresaInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subUsuarios?: UsuarioUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutEmpresaInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    subUsuarios?: UsuarioUncheckedUpdateManyWithoutEmpresaNestedInput
    productos?: ProductoUncheckedUpdateManyWithoutEmpresaNestedInput
    clientes?: ClienteUncheckedUpdateManyWithoutEmpresaNestedInput
    facturas?: FacturaUncheckedUpdateManyWithoutUsuarioNestedInput
    cierresCaja?: CierreCajaUncheckedUpdateManyWithoutUsuarioNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutUsuarioNestedInput
    solicitudesActivacion?: SolicitudActivacionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateManyWithoutEmpresaInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    rol?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    subscriptionStatus?: StringFieldUpdateOperationsInput | string
    planType?: NullableStringFieldUpdateOperationsInput | string | null
    trialStartsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trialEndsAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    currentPeriodEnd?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductoUpdateWithoutEmpresaInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    stockActual?: IntFieldUpdateOperationsInput | number
    stockMinimo?: IntFieldUpdateOperationsInput | number
    precioVenta?: FloatFieldUpdateOperationsInput | number
    costoCompra?: FloatFieldUpdateOperationsInput | number
    tasaImpuesto?: FloatFieldUpdateOperationsInput | number
    categoria?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    itemsFactura?: ItemFacturaUpdateManyWithoutProductoNestedInput
  }

  export type ProductoUncheckedUpdateWithoutEmpresaInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    stockActual?: IntFieldUpdateOperationsInput | number
    stockMinimo?: IntFieldUpdateOperationsInput | number
    precioVenta?: FloatFieldUpdateOperationsInput | number
    costoCompra?: FloatFieldUpdateOperationsInput | number
    tasaImpuesto?: FloatFieldUpdateOperationsInput | number
    categoria?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    itemsFactura?: ItemFacturaUncheckedUpdateManyWithoutProductoNestedInput
  }

  export type ProductoUncheckedUpdateManyWithoutEmpresaInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    nombre?: StringFieldUpdateOperationsInput | string
    descripcion?: NullableStringFieldUpdateOperationsInput | string | null
    stockActual?: IntFieldUpdateOperationsInput | number
    stockMinimo?: IntFieldUpdateOperationsInput | number
    precioVenta?: FloatFieldUpdateOperationsInput | number
    costoCompra?: FloatFieldUpdateOperationsInput | number
    tasaImpuesto?: FloatFieldUpdateOperationsInput | number
    categoria?: StringFieldUpdateOperationsInput | string
    activo?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClienteUpdateWithoutEmpresaInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    facturas?: FacturaUpdateManyWithoutClienteNestedInput
    cotizaciones?: CotizacionUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateWithoutEmpresaInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    facturas?: FacturaUncheckedUpdateManyWithoutClienteNestedInput
    cotizaciones?: CotizacionUncheckedUpdateManyWithoutClienteNestedInput
  }

  export type ClienteUncheckedUpdateManyWithoutEmpresaInput = {
    id?: StringFieldUpdateOperationsInput | string
    razonSocial?: StringFieldUpdateOperationsInput | string
    rifCedula?: StringFieldUpdateOperationsInput | string
    direccion?: NullableStringFieldUpdateOperationsInput | string | null
    telefono?: NullableStringFieldUpdateOperationsInput | string | null
    correo?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FacturaUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cliente?: ClienteUpdateOneRequiredWithoutFacturasNestedInput
    items?: ItemFacturaUpdateManyWithoutFacturaNestedInput
    pagos?: PagoUpdateManyWithoutFacturaNestedInput
  }

  export type FacturaUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: ItemFacturaUncheckedUpdateManyWithoutFacturaNestedInput
    pagos?: PagoUncheckedUpdateManyWithoutFacturaNestedInput
  }

  export type FacturaUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    numeroFactura?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaVencimiento?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    moneda?: StringFieldUpdateOperationsInput | string
    tasaCambio?: FloatFieldUpdateOperationsInput | number
    cuotasTotales?: IntFieldUpdateOperationsInput | number
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    anuladoPor?: NullableStringFieldUpdateOperationsInput | string | null
    motivoAnulacion?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CierreCajaUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaApertura?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaCierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montoInicial?: FloatFieldUpdateOperationsInput | number
    montoFinal?: NullableFloatFieldUpdateOperationsInput | number | null
    ingresosEfectivo?: FloatFieldUpdateOperationsInput | number
    ingresosBanco?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CierreCajaUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaApertura?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaCierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montoInicial?: FloatFieldUpdateOperationsInput | number
    montoFinal?: NullableFloatFieldUpdateOperationsInput | number | null
    ingresosEfectivo?: FloatFieldUpdateOperationsInput | number
    ingresosBanco?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CierreCajaUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    fechaApertura?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaCierre?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    montoInicial?: FloatFieldUpdateOperationsInput | number
    montoFinal?: NullableFloatFieldUpdateOperationsInput | number | null
    ingresosEfectivo?: FloatFieldUpdateOperationsInput | number
    ingresosBanco?: FloatFieldUpdateOperationsInput | number
    estado?: StringFieldUpdateOperationsInput | string
    observaciones?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CotizacionUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    cliente?: ClienteUpdateOneRequiredWithoutCotizacionesNestedInput
    items?: ItemCotizacionUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    items?: ItemCotizacionUncheckedUpdateManyWithoutCotizacionNestedInput
  }

  export type CotizacionUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    numero?: IntFieldUpdateOperationsInput | number
    clienteId?: StringFieldUpdateOperationsInput | string
    fechaEmision?: DateTimeFieldUpdateOperationsInput | Date | string
    fechaValidez?: DateTimeFieldUpdateOperationsInput | Date | string
    subtotal?: FloatFieldUpdateOperationsInput | number
    impuestoTotal?: FloatFieldUpdateOperationsInput | number
    total?: FloatFieldUpdateOperationsInput | number
    moneda?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
  }

  export type SolicitudActivacionUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    metodoPago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SolicitudActivacionUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    metodoPago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SolicitudActivacionUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    metodoPago?: StringFieldUpdateOperationsInput | string
    referencia?: StringFieldUpdateOperationsInput | string
    estado?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ClienteCountOutputTypeDefaultArgs instead
     */
    export type ClienteCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ClienteCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductoCountOutputTypeDefaultArgs instead
     */
    export type ProductoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FacturaCountOutputTypeDefaultArgs instead
     */
    export type FacturaCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FacturaCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CotizacionCountOutputTypeDefaultArgs instead
     */
    export type CotizacionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CotizacionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UsuarioCountOutputTypeDefaultArgs instead
     */
    export type UsuarioCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UsuarioCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ClienteDefaultArgs instead
     */
    export type ClienteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ClienteDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductoDefaultArgs instead
     */
    export type ProductoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use FacturaDefaultArgs instead
     */
    export type FacturaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = FacturaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ItemFacturaDefaultArgs instead
     */
    export type ItemFacturaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ItemFacturaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PagoDefaultArgs instead
     */
    export type PagoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PagoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CorrelativoDefaultArgs instead
     */
    export type CorrelativoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CorrelativoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CierreCajaDefaultArgs instead
     */
    export type CierreCajaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CierreCajaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CotizacionDefaultArgs instead
     */
    export type CotizacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CotizacionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ItemCotizacionDefaultArgs instead
     */
    export type ItemCotizacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ItemCotizacionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UsuarioDefaultArgs instead
     */
    export type UsuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UsuarioDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SolicitudActivacionDefaultArgs instead
     */
    export type SolicitudActivacionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SolicitudActivacionDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}