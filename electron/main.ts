const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set up IPC handlers
  const { login, logout, storeToken, getToken } = require('./ipcHandlers/auth');
  const { getCustomers } = require('./ipcHandlers/customers');
  const { getItems, getItem } = require('./ipcHandlers/items');
  const { getNextInvoiceNumber, addSale, getSales } = require('./ipcHandlers/sales');

  ipcMain.handle('auth:login', (event, email, password) => login(email, password));
  ipcMain.handle('auth:logout', () => logout());
  ipcMain.handle('auth:storeToken', (event, token) => storeToken(token));
  ipcMain.handle('auth:getToken', () => getToken());

  ipcMain.handle('api:getCustomers', () => getCustomers());
  ipcMain.handle('api:getItems', () => getItems());
  ipcMain.handle('api:getItem', (event, id) => getItem(id));
  ipcMain.handle('api:getNextInvoiceNumber', () => getNextInvoiceNumber());
  ipcMain.handle('api:addSale', (event, sale) => addSale(sale));
  ipcMain.handle('api:getSales', () => getSales());

  createWindow();

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval'; connect-src http://127.0.0.1:8000",
        ],
      },
    });
  });
});
