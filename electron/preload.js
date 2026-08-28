/**
 * Electron Preload Script
 * Exposes a safe bridge (contextBridge) between the renderer (React app)
 * and the Electron main process via IPC.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app:version'),
  getAppPath: () => ipcRenderer.invoke('app:path'),
  isElectron: true,
});
