const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('progress-bar');
  const statusText = document.getElementById('status-text');
  const percentText = document.getElementById('percent-text');

  ipcRenderer.on('startup:progress', (_event, progress) => {
    const percent = Math.max(0, Math.min(100, Number(progress?.percent) || 0));
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (statusText && progress?.message) statusText.textContent = progress.message;
    if (percentText) percentText.textContent = `${percent}%`;
  });
});