const { contextBridge } = require('electron');

const { login, logout, storeToken, getToken } = require('./ipcHandlers/auth');
const { getCustomers } = require('./ipcHandlers/customers');
const { getItems, getItem } = require('./ipcHandlers/items');
const { getNextInvoiceNumber, addSale, getSales } = require('./ipcHandlers/sales');

contextBridge.exposeInMainWorld('auth', {
  login,
  logout,
  storeToken,
  getToken,
});

contextBridge.exposeInMainWorld('api', {
  getCustomers,
  getItems,
  getItem,
  getNextInvoiceNumber,
  addSale,
  getSales,
});
