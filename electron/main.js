/**
 * Electron Main Process — Gestor de Inventario POS
 *
 * Arquitectura:
 *  1. Inicializa el sistema de logging centralizado.
 *  2. Muestra splash screen inmediatamente.
 *  3. Lanza el servidor Express/Prisma backend como proceso hijo.
 *  4. Espera a que el backend responda en /api/health.
 *  5. Carga la URL del frontend en la ventana principal y cierra el splash.
 */

const { app, BrowserWindow, Menu, Tray, ipcMain, dialog, shell } = require('electron');
const path   = require('path');
const http   = require('http');
const fs     = require('fs');
const crypto = require('crypto');
const net    = require('net');
const { spawn, spawnSync } = require('child_process');

// ─── Single Instance Lock ─────────────────────────────────────────────────────
// Debe ejecutarse ANTES de app.whenReady() para evitar condiciones de carrera.
const instanceLock = app.requestSingleInstanceLock();
if (!instanceLock) {
  // Segunda instancia detectada: ceder el foco a la primera y salir.
  app.quit();
  process.exit(0);
}
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// ─── Logger centralizado (reemplaza electron-log) ─────────────────────────────
// Se importa DESPUÉS de que electron esté disponible
let logger;

// ─── Config ───────────────────────────────────────────────────────────────────
const DEFAULT_BACKEND_PORT = 3001;
const BACKEND_PORT_RANGE = 10;
const POLL_INTERVAL = 400;   // ms
const MAX_WAIT_MS   = 30000; // 30 s timeout

// ─── State ────────────────────────────────────────────────────────────────────
let mainWindow   = null;
let splashWindow = null;
let logViewerWindow = null;
let tray         = null;
let backendProc  = null;
let IS_DEV       = false;
let backendPort  = DEFAULT_BACKEND_PORT;
let postgresDataDir = null;
let postgresBinDir = null;
let postgresPort = null;
let postgresStartedByApp = false;
let postgresFirstRun = false;
let sqliteFirstRun = false;
let startupProgress = { percent: 0, message: 'Iniciando aplicación...' };

function updateStartupProgress(percent, message) {
  startupProgress = { percent, message };
  if (splashWindow && !splashWindow.isDestroyed() && splashWindow.webContents) {
    splashWindow.webContents.send('startup:progress', startupProgress);
  }
}

function backendUrl(pathname = '') {
  return `http://127.0.0.1:${backendPort}${pathname}`;
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '127.0.0.1');
  });
}

async function selectBackendPort() {
  const manualPath = path.join(app.getPath('userData'), 'backend-port.txt');
  let configuredPort = Number(process.env.BACKEND_PORT || 0);
  try {
    if (!configuredPort && fs.existsSync(manualPath)) {
      configuredPort = Number(fs.readFileSync(manualPath, 'utf8').trim());
    }
  } catch {}

  if (configuredPort >= 1024 && configuredPort <= 65535 && await isPortAvailable(configuredPort)) {
    backendPort = configuredPort;
    return;
  }

  for (let port = DEFAULT_BACKEND_PORT; port < DEFAULT_BACKEND_PORT + BACKEND_PORT_RANGE; port += 1) {
    if (await isPortAvailable(port)) {
      backendPort = port;
      return;
    }
  }

  const message = 'No se encontró un puerto libre automáticamente.\\n\\n' +
    `Escriba un puerto libre en:\\n${manualPath}\\n\\n` +
    'Use un valor entre 1024 y 65535 y reinicie la aplicación.';
  dialog.showErrorBox('Puerto del servidor no disponible', message);
  throw new Error('No hay un puerto libre para el backend');
}

async function selectPort(startPort, count) {
  for (let port = startPort; port < startPort + count; port += 1) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No hay puertos libres en el rango ${startPort}-${startPort + count - 1}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code !== 0) {
        const details = (stderr || stdout).trim();
        reject(new Error(`${path.basename(command)} terminó con código ${code}${details ? `: ${details}` : ''}`));
        return;
      }
      resolve(stdout);
    });
  });
}

function getPostgresPassword() {
  const passwordPath = path.join(app.getPath('userData'), 'postgres-password');
  try {
    const password = fs.readFileSync(passwordPath, 'utf8').trim();
    if (password) return password;
  } catch {}
  const password = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(passwordPath, password, { encoding: 'utf8', mode: 0o600 });
  return password;
}

async function ensureEmbeddedPostgres() {
  updateStartupProgress(12, 'Preparando PostgreSQL portable...');
  if (IS_DEV) return null;

  const postgresRoot = path.join(app.getPath('userData'), 'postgres');
  postgresDataDir = path.join(postgresRoot, 'data');
  if (process.platform !== 'win32') {
    logger.info('[POSTGRES] Linux/macOS: se usará DATABASE_URL externa configurada.');
    return null;
  }
  const zipPath = path.join(process.resourcesPath, 'postgresql-windows-x64.zip');
  const devZipPath = path.join(ROOT_DIR, 'vendor', 'postgresql-windows-x64.zip');
  const sourceZip = fs.existsSync(zipPath) ? zipPath : devZipPath;

  if (!fs.existsSync(sourceZip)) {
    throw new Error(`No se encontró PostgreSQL portable: ${sourceZip}`);
  }

  function findPostgresInstallRoot(base) {
    const q = [base];
    const seen = new Set();
    while (q.length) {
      const dir = q.shift();
      if (seen.has(dir)) continue;
      seen.add(dir);
      try {
        const maybeInit = path.join(dir, 'bin', 'initdb.exe');
        const maybeBki = path.join(dir, 'share', 'postgres.bki');
        if (fs.existsSync(maybeInit) && fs.existsSync(maybeBki)) return dir;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          if (e.isDirectory()) q.push(path.join(dir, e.name));
        }
      } catch (e) {
        // ignorar permisos/archivo no encontrado y continuar
      }
    }
    return null;
  }

  fs.mkdirSync(postgresRoot, { recursive: true });
  let installedRoot = findPostgresInstallRoot(postgresRoot);
  if (!installedRoot) {
    updateStartupProgress(20, 'Extrayendo PostgreSQL portable...');
    await runCommand('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
      'Expand-Archive -LiteralPath $env:PG_ZIP -DestinationPath $env:PG_DEST -Force'], {
      env: { ...process.env, PG_ZIP: sourceZip, PG_DEST: postgresRoot },
    });
    installedRoot = findPostgresInstallRoot(postgresRoot);
  }

  if (!installedRoot) {
    throw new Error(
      `Instalación de PostgreSQL incompleta en ${postgresRoot}: faltan bin/initdb.exe o share/postgres.bki. ` +
      'La instalación está corrupta; reinstale la aplicación.'
    );
  }
  postgresBinDir = path.join(installedRoot, 'bin');
  const shareDir = path.join(installedRoot, 'share');
  const postgresBki = path.join(shareDir, 'postgres.bki');
  let shareFiles = 0;
  let shareBytes = 0;
  const pendingShare = [shareDir];
  while (pendingShare.length) {
    const current = pendingShare.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pendingShare.push(entryPath);
      } else if (entry.isFile()) {
        shareFiles += 1;
        shareBytes += fs.statSync(entryPath).size;
      }
    }
  }
  logger.info(`[POSTGRES] share verificado: ${shareFiles} archivos, ${shareBytes} bytes, postgres.bki=${fs.statSync(postgresBki).size} bytes`);
  updateStartupProgress(32, 'Archivos de PostgreSQL verificados...');

  const password = getPostgresPassword();
  const passwordFile = path.join(postgresRoot, 'initdb-password.txt');
  fs.writeFileSync(passwordFile, password, { encoding: 'utf8', mode: 0o600 });
  const initdb = path.join(postgresBinDir, 'initdb.exe');
  const pgCtl = path.join(postgresBinDir, 'pg_ctl.exe');
  const psql = path.join(postgresBinDir, 'psql.exe');
  const persistedPortPath = path.join(postgresRoot, 'port.txt');
  let configuredPort = 0;
  try { configuredPort = Number(fs.readFileSync(persistedPortPath, 'utf8').trim()); } catch {}

  // Si la instancia portátil ya está activa, reutilizar su puerto y no intentar
  // arrancar una segunda instancia sobre la misma data directory.
  let postgresAlreadyRunning = false;
  if (configuredPort >= 1024 && configuredPort <= 65535) {
    const status = spawnSync(pgCtl, ['status', '-D', postgresDataDir], {
      windowsHide: true,
      encoding: 'utf8',
    });
    postgresAlreadyRunning = status.status === 0;
  }

  postgresPort = postgresAlreadyRunning
    ? configuredPort
    : configuredPort >= 1024 && configuredPort <= 65535 && await isPortAvailable(configuredPort)
      ? configuredPort
      : await selectPort(5432, 20);
  fs.writeFileSync(persistedPortPath, String(postgresPort), 'utf8');

  let newDatabase = false;
  postgresFirstRun = !fs.existsSync(path.join(postgresDataDir, 'PG_VERSION'));
  if (postgresFirstRun) {
    updateStartupProgress(40, 'Inicializando la base de datos...');
    fs.mkdirSync(postgresDataDir, { recursive: true });
    await runCommand(initdb, ['-D', postgresDataDir, '-U', 'postgres', '--pwfile', passwordFile, '--auth=scram-sha-256', '--encoding=UTF8', '-L', shareDir]);
  }

  // Asegurar que el archivo de log existe y es escribible antes de arrancar
  const pgLog = path.join(postgresRoot, 'postgres.log');
  try {
    fs.mkdirSync(path.dirname(pgLog), { recursive: true });
    const fd = fs.openSync(pgLog, 'a');
    fs.closeSync(fd);
  } catch (e) {
    logger && logger.warn('[POSTGRES] no se pudo crear o asegurar postgres.log:', e.message);
  }

  // Manejar postmaster.pid huérfano: si existe pero el PID no está en ejecución, eliminarlo
  try {
    const pidFile = path.join(postgresDataDir, 'postmaster.pid');
    if (fs.existsSync(pidFile)) {
      try {
        const pid = Number(fs.readFileSync(pidFile, 'utf8').split(/\s+/)[0]);
        let running = false;
        if (pid && Number.isFinite(pid)) {
          try { process.kill(pid, 0); running = true; } catch (err) { running = false; }
        }
        if (!running) {
          logger && logger.info(`[POSTGRES] Eliminando PID huérfano ${pid} en ${pidFile}`);
          try { fs.unlinkSync(pidFile); } catch (e) { /* noop */ }
        } else {
          logger && logger.info(`[POSTGRES] postmaster.pid presente y proceso ${pid} en ejecución`);
        }
      } catch (e) {
        logger && logger.warn('[POSTGRES] no se pudo procesar postmaster.pid:', e.message);
      }
    }
  } catch (e) {
    logger && logger.warn('[POSTGRES] error comprobando postmaster.pid:', e.message);
  }

  try {
    if (postgresAlreadyRunning) {
      logger && logger.info(`[POSTGRES] instancia existente reutilizada en el puerto ${postgresPort}`);
    } else {
      updateStartupProgress(55, `Iniciando PostgreSQL en el puerto ${postgresPort}...`);
      await runCommand(pgCtl, ['-D', postgresDataDir, '-l', pgLog, '-o', `-p ${postgresPort}`, '-w', 'start']);
      postgresStartedByApp = true;
    }
  } catch (err) {
    // Ampliar información de diagnóstico: tamaño y cola del log
    try {
      const stat = fs.statSync(pgLog);
      const tail = fs.readFileSync(pgLog, 'utf8').slice(-8192);
      logger && logger.error(`[POSTGRES] pg_ctl falló: ${err.message}; postgres.log size=${stat.size}`);
      logger && logger.error('[POSTGRES] tail postgres.log:\n' + tail);
    } catch (e) {
      logger && logger.error('[POSTGRES] pg_ctl falló y no se pudo leer postgres.log:', e.message);
    }
    throw err;
  }

  const psqlEnv = { ...process.env, PGPASSWORD: password };
  const exists = await runCommand(psql, ['-h', '127.0.0.1', '-p', String(postgresPort), '-U', 'postgres', '-d', 'postgres', '-tAc', `SELECT 1 FROM pg_database WHERE datname = 'gestor_inventario'`], { env: psqlEnv });
  if (exists.trim() !== '1') {
    await runCommand(psql, ['-h', '127.0.0.1', '-p', String(postgresPort), '-U', 'postgres', '-d', 'postgres', '-c', 'CREATE DATABASE gestor_inventario'], { env: psqlEnv });
    newDatabase = true;
  }

  const databaseUrl = `postgresql://postgres:${encodeURIComponent(password)}@127.0.0.1:${postgresPort}/gestor_inventario?schema=public`;
  const prismaCli = path.join(ROOT_DIR, 'backend', 'node_modules', 'prisma', 'build', 'index.js');
  updateStartupProgress(70, 'Aplicando migraciones de la base de datos...');
  await runCommand(NODE_EXEC, [prismaCli, 'migrate', 'deploy', '--schema', path.join(ROOT_DIR, 'backend', 'prisma', 'schema.prisma')], {
    cwd: path.join(ROOT_DIR, 'backend'),
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', DATABASE_URL: databaseUrl },
  });
  if (newDatabase) {
    updateStartupProgress(86, 'Cargando datos iniciales...');
    await runCommand(NODE_EXEC, [path.join(ROOT_DIR, 'backend', 'prisma', 'seed.js')], {
      cwd: path.join(ROOT_DIR, 'backend'),
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', DATABASE_URL: databaseUrl },
    });
  }
  fs.writeFileSync(path.join(app.getPath('userData'), 'database-url.txt'), databaseUrl, 'utf8');
  return databaseUrl;
}

async function ensureWindowsSqlite() {
  if (process.platform !== 'win32') return null;

  const dataDir = path.join(app.getPath('userData'), 'data');
  const databasePath = path.join(dataDir, 'gestor-inventario.sqlite');
  const databaseUrl = `file:${databasePath}`;
  const schemaPath = path.join(ROOT_DIR, 'backend', 'prisma', 'schema.sqlite.prisma');
  const prismaCli = path.join(ROOT_DIR, 'backend', 'node_modules', 'prisma', 'build', 'index.js');

  updateStartupProgress(35, 'Preparando base de datos SQLite...');
  fs.mkdirSync(dataDir, { recursive: true });
  sqliteFirstRun = !fs.existsSync(databasePath);

  updateStartupProgress(70, 'Aplicando estructura de la base de datos...');
  await runCommand(NODE_EXEC, [prismaCli, 'db', 'push', '--schema', schemaPath, '--skip-generate', '--accept-data-loss'], {
    cwd: path.join(ROOT_DIR, 'backend'),
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', DATABASE_URL: databaseUrl, DB_PROVIDER: 'sqlite' },
  });

  if (sqliteFirstRun) {
    updateStartupProgress(86, 'Cargando datos iniciales...');
    await runCommand(NODE_EXEC, [path.join(ROOT_DIR, 'backend', 'prisma', 'seed.js')], {
      cwd: path.join(ROOT_DIR, 'backend'),
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', DATABASE_URL: databaseUrl, DB_PROVIDER: 'sqlite' },
    });
  }

  fs.writeFileSync(path.join(app.getPath('userData'), 'database-url.txt'), databaseUrl, 'utf8');
  return databaseUrl;
}

// ─── Paths (se calculan después de app.ready) ─────────────────────────────────
let ROOT_DIR, BACKEND_ENTRY, NODE_EXEC, ICON_PATH, SPLASH_PATH;

function initPaths() {
  IS_DEV = !app.isPackaged;
  ROOT_DIR = IS_DEV
    ? path.join(__dirname, '..')
    : path.join(process.resourcesPath, 'app');

  BACKEND_ENTRY = path.join(ROOT_DIR, 'backend', 'src', 'electron-start.js');
  NODE_EXEC     = process.execPath;
  ICON_PATH     = path.join(__dirname, 'assets', 'icon.png');
  SPLASH_PATH   = path.join(__dirname, 'splash.html');
}

// ─── Launch Backend ───────────────────────────────────────────────────────────
function launchBackend() {
  logger.info('Lanzando backend:', BACKEND_ENTRY);

  // Build env — load .env.electron for desktop mode
  const envFile = path.join(ROOT_DIR, 'backend', '.env.electron');
  const envVars  = { 
    ...process.env, 
    ELECTRON_ENV: 'true',
    ELECTRON_RUN_AS_NODE: '1' 
  };

  if (fs.existsSync(envFile)) {
    const lines = fs.readFileSync(envFile, 'utf8').split('\n');
    lines.forEach(line => {
      const [k, ...v] = line.split('=');
      if (k && v.length) {
        let val = v.join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        envVars[k.trim()] = val;
      }
    });
  }

  envVars.PORT = String(backendPort);

  const dataDir = path.join(app.getPath('userData'), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  envVars.DATA_DIR = dataDir;

  const databaseUrlPath = path.join(app.getPath('userData'), 'database-url.txt');
  try {
    const databaseUrl = fs.readFileSync(databaseUrlPath, 'utf8').trim();
    if (databaseUrl) envVars.DATABASE_URL = databaseUrl;
  } catch {}

  if (!IS_DEV) {
    const secretPath = path.join(app.getPath('userData'), 'jwt-secret');
    let jwtSecret = '';
    try {
      jwtSecret = fs.readFileSync(secretPath, 'utf8').trim();
    } catch {}
    if (!jwtSecret) {
      jwtSecret = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(secretPath, jwtSecret, { encoding: 'utf8', mode: 0o600 });
    }
    envVars.JWT_SECRET = jwtSecret;
  }

  // Resolve DATABASE_URL to an absolute path if it's a SQLite file
  if (envVars.DATABASE_URL?.startsWith('file:./')) {
    const dbPath = path.join(ROOT_DIR, 'backend', envVars.DATABASE_URL.replace('file:./', ''));
    envVars.DATABASE_URL = `file:${dbPath}`;
  }

  backendProc = spawn(NODE_EXEC, [BACKEND_ENTRY], {
    env: envVars,
    stdio: 'pipe',
    cwd: path.join(ROOT_DIR, 'backend'),
    windowsHide: true,
  });

  backendProc.once('error', (err) => {
    logger.critical('No se pudo lanzar el backend:', err);
    if (err.code === 'EADDRINUSE') {
      dialog.showErrorBox(
        'Puerto ocupado',
        `El puerto ${backendPort} fue ocupado antes de iniciar el backend. Configure otro puerto en:\n${path.join(app.getPath('userData'), 'backend-port.txt')} y reinicie.`
      );
    }
  });

  backendProc.stdout.on('data', d => {
    const msg = d.toString().trim();
    if (msg) logger.backend(msg);
  });

  backendProc.stderr.on('data', d => {
    const msg = d.toString().trim();
    if (msg) logger.backendErr(msg);
  });

  backendProc.on('exit', (code, sig) => {
    logger.info(`Backend exited (code=${code}, signal=${sig})`);
    
    // Si el backend muere repentinamente (código != 0) y no fue matado a propósito
    if (code !== 0 && code !== null) {
      logger.critical(`Backend crashed con código ${code}`);
      dialog.showErrorBox(
        'El servidor interno falló',
        `El servicio de base de datos o API se cerró inesperadamente (Código ${code}).\n\nRevisa los logs en:\n${logger.getLogDir()}\n\nPor favor, reinicia la aplicación o contacta al administrador.`
      );
      if (app.isReady()) app.quit();
    }
  });
}

// ─── Poll Backend Health ───────────────────────────────────────────────────────
function waitForBackend(timeoutMs = MAX_WAIT_MS) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const request = http.get(backendUrl('/api/health'), (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) return resolve();
          if (res.statusCode === 503) {
            const error = new Error('Base de datos no disponible');
            error.code = 'DATABASE_UNAVAILABLE';
            return reject(error);
          }
          retry();
        });
      }).on('error', retry);
      request.setTimeout(2000, () => request.destroy());
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) return reject(new Error('Backend timeout'));
      setTimeout(check, POLL_INTERVAL);
    };
    check();
  });
}

// ─── Splash Window ────────────────────────────────────────────────────────────
function createSplash() {
  splashWindow = new BrowserWindow({
    width:  460,
    height: 280,
    frame:   false,
    transparent: true,
    alwaysOnTop: true,
    resizable:   false,
    center:      true,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'splash-preload.js'),
    },
  });
  splashWindow.webContents.on('did-finish-load', () => {
    updateStartupProgress(startupProgress.percent, startupProgress.message);
  });
  splashWindow.loadFile(SPLASH_PATH);
}

// ─── Main Window ──────────────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width:    1280,
    height:   820,
    minWidth: 1024,
    minHeight: 680,
    show:     false,
    title:    'Gestor de Inventario POS',
    icon:     fs.existsSync(ICON_PATH) ? ICON_PATH : undefined,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Build minimal menu
  Menu.setApplicationMenu(buildMenu());

  mainWindow.loadURL(backendUrl());

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (process.platform === 'darwin') {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── Log Viewer Window ────────────────────────────────────────────────────────
function openLogViewer() {
  if (logViewerWindow && !logViewerWindow.isDestroyed()) {
    logViewerWindow.focus();
    return;
  }

  logViewerWindow = new BrowserWindow({
    width: 900,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    title: 'Visor de Logs — Gestor de Inventario POS',
    icon: fs.existsSync(ICON_PATH) ? ICON_PATH : undefined,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'logger', 'preload.js'),
    },
  });

  logViewerWindow.loadFile(path.join(__dirname, 'logger', 'log-viewer.html'));
  logViewerWindow.setMenuBarVisibility(false);

  logViewerWindow.on('closed', () => { logViewerWindow = null; });

  logger.info('Ventana de visor de logs abierta');
}

// ─── App Menu ─────────────────────────────────────────────────────────────────
function buildMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Archivo',
      submenu: [
        { label: 'Recargar', accelerator: 'F5', click: () => mainWindow?.reload() },
        { type: 'separator' },
        { label: 'Salir', accelerator: 'Alt+F4', click: () => app.quit() },
      ],
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'resetZoom', label: 'Zoom normal' },
        { role: 'zoomIn',  label: 'Ampliar', accelerator: 'CmdOrCtrl+=' },
        { role: 'zoomOut', label: 'Reducir' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa' },
      ],
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: '📋 Visor de Logs',
          accelerator: 'CmdOrCtrl+Shift+L',
          click: () => openLogViewer(),
        },
        {
          label: '📂 Abrir carpeta de Logs',
          click: () => shell.openPath(logger.getLogDir()),
        },
        { type: 'separator' },
        { label: 'DevTools', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() },
      ],
    },
    {
      label: 'Ayuda',
      submenu: [
        { label: 'Versión 1.0.0', enabled: false },
        { label: 'Abrir carpeta de datos', click: () => {
          const dataDir = path.join(ROOT_DIR, 'backend');
          shell.openPath(dataDir);
        }},
      ],
    },
  ]);
}

// ─── IPC Handlers para el Visor de Logs ───────────────────────────────────────
function registerLogIPC() {
  ipcMain.handle('logs:get', (_, category) => {
    return logger.getRecentLogs(category, 500);
  });

  ipcMain.handle('logs:openFolder', () => {
    shell.openPath(logger.getLogDir());
  });

  ipcMain.handle('logs:clear', (_, category) => {
    const date = new Date().toISOString().slice(0, 10);
    const filePath = path.join(logger.getLogDir(), `${category}-${date}.log`);
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '', 'utf8');
        logger.info(`Logs limpiados: ${category}-${date}.log`);
      }
    } catch (err) {
      logger.error('Error limpiando logs:', err);
    }
  });
}

// ─── Manejo Global de Errores Críticos ────────────────────────────────────────
function setupCrashHandlers() {
  process.on('uncaughtException', (error) => {
    logger.critical('Uncaught Exception:', error);
    dialog.showErrorBox(
      'Error Crítico del Sistema',
      `Ocurrió un error inesperado:\n\n${error.message}\n\nLos detalles se guardaron en:\n${logger.getLogDir()}`
    );
    if (app.isReady()) app.quit();
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.critical('Unhandled Rejection:', reason);
  });
}

async function stopEmbeddedPostgres() {
  if (!postgresStartedByApp || !postgresBinDir || !postgresDataDir) return;
  try {
    await runCommand(path.join(postgresBinDir, 'pg_ctl.exe'), ['-D', postgresDataDir, '-m', 'fast', '-w', 'stop']);
    postgresStartedByApp = false;
  } catch (error) {
    logger.error('No se pudo detener PostgreSQL embebido:', error);
  }
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Inicializar paths y logger
  initPaths();
  logger = require('./logger');
  logger.interceptConsole();

  // Activar manejadores de errores globales
  setupCrashHandlers();

  // Registrar handlers IPC para el visor de logs
  registerLogIPC();

  // Limpiar logs de más de 30 días
  logger.cleanOldLogs(30);

  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('Gestor de Inventario POS v1.0.0 — Inicio de sesión');
  logger.info(`Modo: ${IS_DEV ? 'Desarrollo' : 'Producción'}`);
  logger.info(`Plataforma: ${process.platform} ${process.arch}`);
  logger.info(`Electron: ${process.versions.electron}`);
  logger.info(`Node: ${process.versions.node}`);
  logger.info(`Carpeta de logs: ${logger.getLogDir()}`);
  logger.info('═══════════════════════════════════════════════════════════');

  createSplash();

  let startupPhase = 'selección de puertos';
  try {
    updateStartupProgress(5, 'Buscando un puerto disponible...');
    await selectBackendPort();
    logger.info(`Puerto del backend seleccionado: ${backendPort}`);
    startupPhase = 'inicialización de la base de datos';
    const embeddedDatabaseUrl = await ensureWindowsSqlite();
    if (embeddedDatabaseUrl) logger.info(`SQLite listo en ${embeddedDatabaseUrl}`);
    startupPhase = 'arranque del backend';
    updateStartupProgress(91, 'Iniciando el servidor del sistema...');
    launchBackend();
    updateStartupProgress(95, 'Esperando respuesta del servidor...');
    await waitForBackend(embeddedDatabaseUrl && sqliteFirstRun ? 120000 : MAX_WAIT_MS);
    startupPhase = 'creación de ventana';
    logger.info('Backend listo — creando ventana principal');
    updateStartupProgress(100, 'Sistema listo');
    createMainWindow();
  } catch (err) {
    updateStartupProgress(100, 'No se pudo completar el arranque');
    logger.critical('Backend no respondió a tiempo:', err);
    const detail = err.code === 'DATABASE_UNAVAILABLE'
      ? 'La base de datos no responde. Verifique el archivo SQLite y la configuración DATABASE_URL.'
      : `Fase: ${startupPhase}\n${err.message}`;
    dialog.showErrorBox(
      'Error al iniciar',
      `El servidor interno no pudo iniciar correctamente.\n\nDetalles técnicos:\n${detail}\n\nLogs en: ${logger.getLogDir()}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  else mainWindow?.show();
});

app.on('before-quit', () => {
  // Terminar el proceso backend y su árbol de hijos antes de cerrar.
  // En Windows, SIGTERM no es confiable; usar taskkill para garantizar
  // que el query engine de Prisma libere el archivo .db (evita EBUSY).
  if (backendProc && !backendProc.killed) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(backendProc.pid), '/T', '/F'], {
        windowsHide: true,
      });
    } else {
      try { backendProc.kill('SIGTERM'); } catch { /* noop */ }
    }
    backendProc = null;
  }
});

app.on('will-quit', () => {
  logger.info('Aplicación cerrándose — matando backend');
  if (backendProc) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(backendProc.pid), '/T', '/F'], {
        windowsHide: true,
      });
    } else {
      try { backendProc.kill('SIGTERM'); } catch { /* noop */ }
    }
    backendProc = null;
  }
  void stopEmbeddedPostgres();
});

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('app:path',    () => ROOT_DIR);
