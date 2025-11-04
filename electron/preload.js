const { contextBridge, ipcRenderer } = require('electron');

console.log('[Preload] Loaded');

contextBridge.exposeInMainWorld('tenant', {
  validate: (subdomain) => ipcRenderer.invoke('tenant:validate', subdomain),
});
