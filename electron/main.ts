const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1700,
    height: 900,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open DevTools only in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Suppress harmless console warnings
  mainWindow.webContents.on('console-message', (event: any, level: any, message: string) => {
    if (message.includes('Autofill') || message.includes('GetVSyncParametersIfAvailable')) {
      event.preventDefault();
    }
  });
}

function setupAutoUpdate() {
  const { autoUpdater } = require('electron-updater');
  autoUpdater.autoDownload = true;
  autoUpdater.on("update-downloaded", () => {
    autoUpdater.quitAndInstall();
  });
  // only check in production
  if (!app.isPackaged) return;
  setTimeout(() => autoUpdater.checkForUpdates(), 5000);
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

  ipcMain.handle('auth:login', (_event: any, identifier: string, password: string) => login(identifier, password));
  ipcMain.handle('auth:logout', () => logout());
  ipcMain.handle('auth:storeToken', (_event: any, token: string) => storeToken(token));
  ipcMain.handle('auth:getToken', () => getToken());

  ipcMain.handle('api:getCustomers', () => getCustomers());
  ipcMain.handle('api:getItems', () => getItems());
  ipcMain.handle('api:getItem', (_event: any, id: string) => getItem(id));
  ipcMain.handle('api:getNextInvoiceNumber', () => getNextInvoiceNumber());
  ipcMain.handle('api:addSale', (_event: any, sale: any) => addSale(sale));
  ipcMain.handle('api:getSales', () => getSales());

  createWindow();

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  setupAutoUpdate();
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
  session.defaultSession.webRequest.onHeadersReceived((details: any, callback: any) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' file:; script-src 'self' 'unsafe-eval' file:; connect-src *; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:;",
        ],
      },
    });
  });
});
