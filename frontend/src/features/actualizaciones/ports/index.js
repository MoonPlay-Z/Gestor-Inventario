/* =========================================================================
   Puertos del módulo de actualizaciones
   -------------------------------------------------------------------------
   Contratos que el dominio y los casos de uso necesitan. No hay clases ni
   inyección automática: cada adaptador es una función que devuelve un objeto
   con esta forma y se pasa como parámetro. Esto permite probar la lógica sin
   navegador, sin red y sin un dispositivo Android conectado.
   ========================================================================= */

/**
 * @typedef {object} Manifiesto
 * @property {number} versionCode
 * @property {string} versionName
 * @property {string} url
 * @property {string} sha256
 * @property {number} size
 * @property {string} publishedAt
 * @property {number} minVersionCode
 * @property {string[]} notes
 */

/**
 * Fuente del manifiesto (HTTP hoy; CDN, GitHub o backend mañana).
 * @typedef {object} ManifiestoRepository
 * @property {() => Promise<unknown>} obtener
 */

/**
 * Persistencia de las marcas de tiempo y de la versión aplazada.
 * @typedef {object} RevisionStore
 * @property {(clave: string) => number} leer
 * @property {(clave: string, valor: number) => void} guardar
 */

/**
 * Versión que el usuario tiene instalada.
 * @typedef {object} LectorVersion
 * @property {() => Promise<null | { versionCode: number, versionName: string }>} obtener
 */

/**
 * Puente con el instalador del sistema. El adaptador web (`instaladorNulo`)
 * cumple el mismo contrato y responde `no-nativo` en vez de lanzar.
 * @typedef {object} InstaladorNativo
 * @property {() => boolean} disponible
 * @property {(manifiesto: Manifiesto) => Promise<ResultadoNativo>} descargar
 * @property {() => Promise<null | { estado: string, progreso?: number, mensaje?: string }>} estado
 * @property {() => Promise<ResultadoNativo>} instalar
 * @property {() => Promise<void>} ajustes
 * @property {() => Promise<void>} cancelar
 */

/**
 * @typedef {object} ResultadoNativo
 * @property {boolean} ok
 * @property {boolean} [permiso]
 * @property {string} [motivo]
 */

/**
 * @typedef {object} Reloj
 * @property {() => number} ahora
 */

export {};
