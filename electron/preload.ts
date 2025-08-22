const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
  login: (email, password) => ipcRenderer.invoke('auth:login', email, password),
  logout: () => ipcRenderer.invoke('auth:logout'),
  storeToken: (token) => ipcRenderer.invoke('auth:storeToken', token),
  getToken: () => ipcRenderer.invoke('auth:getToken'),
});

contextBridge.exposeInMainWorld('api', {
  getCustomers: () => ipcRenderer.invoke('api:getCustomers'),
  getItems: () => ipcRenderer.invoke('api:getItems'),
  getItem: (id) => ipcRenderer.invoke('api:getItem', id),
  getNextInvoiceNumber: () => ipcRenderer.invoke('api:getNextInvoiceNumber'),
  addSale: (sale) => ipcRenderer.invoke('api:addSale', sale),
  getSales: () => ipcRenderer.invoke('api:getSales'),
});
