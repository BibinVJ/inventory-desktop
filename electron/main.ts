import { app, BrowserWindow, session } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';

let mainWindow: any;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data: http://localhost:5173; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:5173"
          ]
        }
      });
    });

    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details: any, callback: (arg0: { responseHeaders: { [x: string]: any; 'Content-Security-Policy'?: string[] | undefined; }; }) => void) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ['default-src \'self\' http://localhost:5173; script-src \'self\' http://localhost:5173 \'unsafe-inline\'; style-src \'self\' http://localhost:5173 \'unsafe-inline\';']
        }
      });
    }
  );
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