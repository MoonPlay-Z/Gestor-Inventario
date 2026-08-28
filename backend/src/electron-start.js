// Backend entry point optimized for Electron packaging
// This module is spawned by electron/main.js as a child process.
// It reads DATABASE_URL from env (set by Electron's main process).

require('dotenv').config();

// Override with Electron-specific env if present
if (process.env.ELECTRON_ENV === 'true') {
  const path = require('path');
  const fs   = require('fs');
  const envPath = path.join(process.resourcesPath || __dirname, '..', '.env.electron');
  if (fs.existsSync(envPath)) {
    // Electron inyecta DATABASE_URL y PORT según la instancia real; no sobrescribirlos.
    require('dotenv').config({ path: envPath });
  }
}

// Start the Express app
require('./app');
