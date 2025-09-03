const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow: any;

function createWindow() {
  const WINDOW_WIDTH = 1600;
  const WINDOW_HEIGHT = 900;

  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Enable hot reload for development
    mainWindow.webContents.on('did-frame-finish-load', () => {
      if (isDev) {
        mainWindow.webContents.once('devtools-opened', () => {
          mainWindow.focus();
        });
      }
    });
  } else {
    // In packaged app, files are in the root
    const indexPath = path.join(__dirname, 'renderer', 'src', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Open dev tools only when running npm start (not in packaged app)
  if (isDev || process.argv.includes('--dev-tools')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Suppress graphics warnings
  app.commandLine.appendSwitch('--disable-gpu-vsync');
  app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});