try {
  const { app, BrowserWindow } = require('electron');
  const path = require('path');

  let mainWindow = null;

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1600,
      height: 900,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(path.join(__dirname, 'dist/renderer/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
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

} catch (error) {
  console.error('Failed to load Electron:', error);
  process.exit(1);
}