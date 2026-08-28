const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getLogs: (category) => ipcRenderer.invoke('logs:get', category),
  openLogFolder: () => ipcRenderer.invoke('logs:openFolder'),
  clearLog: (category) => ipcRenderer.invoke('logs:clear', category),
});
