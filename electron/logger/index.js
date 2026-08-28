/**
 * Sistema Centralizado de Logging — Gestor de Inventario POS
 * 
 * Captura TODOS los logs y errores de la aplicación y los guarda
 * en archivos organizados por fecha dentro de la carpeta `logs/`.
 * 
 * Archivos generados:
 *   logs/main-YYYY-MM-DD.log     → Logs del proceso principal de Electron
 *   logs/backend-YYYY-MM-DD.log  → Logs del servidor Express/Prisma
 *   logs/errors-YYYY-MM-DD.log   → Errores críticos (uncaught, unhandled)
 *
 * Uso:
 *   const logger = require('./logger');
 *   logger.info('Mensaje informativo');
 *   logger.error('Algo falló', error);
 *   logger.backend('Datos del backend stdout/stderr');
 */

const fs   = require('fs');
const path = require('path');
const { app } = require('electron');

// ─── Configuración de Rutas ─────────────────────────────────────────────────
const LOG_DIR = path.join(app.getPath('userData'), 'logs');

// Asegurar que la carpeta de logs existe al iniciar
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getDate() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getTimestamp() {
  return new Date().toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
}

function formatMessage(level, category, ...args) {
  const msg = args.map(a => {
    if (a instanceof Error) return `${a.message}\n${a.stack}`;
    if (typeof a === 'object') {
      try { return JSON.stringify(a, null, 2); } catch { return String(a); }
    }
    return String(a);
  }).join(' ');

  return `[${getTimestamp()}] [${level.toUpperCase()}] [${category}] ${msg}`;
}

function appendToFile(filename, content) {
  const filePath = path.join(LOG_DIR, filename);
  try {
    fs.appendFileSync(filePath, content + '\n', 'utf8');
  } catch (err) {
    // Si falla escribir logs, al menos intentar stderr
    process.stderr.write(`[LOGGER FALLBACK] No se pudo escribir en ${filePath}: ${err.message}\n`);
  }
}

// ─── Escritores de Log ──────────────────────────────────────────────────────
function writeMain(level, ...args) {
  const line = formatMessage(level, 'MAIN', ...args);
  appendToFile(`main-${getDate()}.log`, line);
  // También imprimir en consola para debug en desarrollo
  if (level === 'error') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

function writeBackend(level, ...args) {
  const line = formatMessage(level, 'BACKEND', ...args);
  appendToFile(`backend-${getDate()}.log`, line);
  // También escribir en main log para tener todo junto
  appendToFile(`main-${getDate()}.log`, line);
  process.stdout.write(line + '\n');
}

function writeError(...args) {
  const line = formatMessage('error', 'CRITICAL', ...args);
  appendToFile(`errors-${getDate()}.log`, line);
  appendToFile(`main-${getDate()}.log`, line);
  process.stderr.write(line + '\n');
}

// ─── API Pública del Logger ─────────────────────────────────────────────────
const logger = {
  // Logs del proceso principal
  info:  (...args) => writeMain('info', ...args),
  warn:  (...args) => writeMain('warn', ...args),
  error: (...args) => writeMain('error', ...args),
  debug: (...args) => writeMain('debug', ...args),

  // Logs del backend (Express/Prisma)
  backend:    (...args) => writeBackend('info', ...args),
  backendErr: (...args) => writeBackend('error', ...args),

  // Errores críticos
  critical: (...args) => writeError(...args),

  // Ruta de la carpeta de logs (para abrir desde el menú)
  getLogDir: () => LOG_DIR,

  // Limpiar logs viejos (más de N días)
  cleanOldLogs(maxDays = 30) {
    try {
      const files = fs.readdirSync(LOG_DIR);
      const now = Date.now();
      const maxAge = maxDays * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(LOG_DIR, file);
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          logger.info(`Log antiguo eliminado: ${file}`);
        }
      });
    } catch (err) {
      logger.error('Error limpiando logs antiguos:', err);
    }
  },

  // Obtener el contenido del log más reciente (para mostrar en ventana)
  getRecentLogs(category = 'main', maxLines = 200) {
    const filename = `${category}-${getDate()}.log`;
    const filePath = path.join(LOG_DIR, filename);
    
    if (!fs.existsSync(filePath)) return '(No hay logs de hoy)';
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    return lines.slice(-maxLines).join('\n');
  },

  // Interceptar console global para capturar TODOS los logs
  interceptConsole() {
    const originalLog   = console.log;
    const originalError = console.error;
    const originalWarn  = console.warn;
    const originalInfo  = console.info;

    console.log = (...args) => {
      writeMain('info', ...args);
    };
    console.error = (...args) => {
      writeMain('error', ...args);
    };
    console.warn = (...args) => {
      writeMain('warn', ...args);
    };
    console.info = (...args) => {
      writeMain('info', ...args);
    };

    logger.info('Console interceptado — todos los console.log ahora van a archivo');
    return { originalLog, originalError, originalWarn, originalInfo };
  }
};

module.exports = logger;
