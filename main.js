try {
  const { app, BrowserWindow, Menu } = require('electron');
  const path = require('path');

  // Fix for trace/breakpoint trap on Linux
  if (process.platform === 'linux') {
    app.commandLine.appendSwitch('--no-sandbox');
    app.commandLine.appendSwitch('--disable-seccomp-filter-sandbox');
  }

  let mainWindow = null;

  function createWindow() {
    const isDev = process.env.NODE_ENV === 'development';

    mainWindow = new BrowserWindow({
      width: 1600,
      height: 900,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(path.join(__dirname, 'dist/renderer/index.html'));
    }

    // Disable Ctrl+R refresh
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.key.toLowerCase() === 'r') {
        event.preventDefault();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    // Create custom menu without reload options
    const template = [
      {
        label: 'File',
        submenu: [
          { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectall' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'togglefullscreen' },
          { role: 'toggledevtools' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    
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