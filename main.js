const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Try different paths for packaged app
    let indexPath;
    const possiblePaths = [
      path.join(__dirname, 'dist', 'renderer', 'src', 'index.html'), // Development
      path.join(process.resourcesPath, 'app', 'dist', 'renderer', 'src', 'index.html'), // Packaged
      path.join(__dirname, 'dist', 'renderer', 'src', 'index.html') // Alternative
    ];
    
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        indexPath = testPath;
        break;
      }
    }
    
    if (indexPath) {
      mainWindow.loadFile(indexPath);
    } else {
      // Fallback: try test file or simple HTML
      const testPath = path.join(process.resourcesPath, 'app', 'test-index.html');
      if (fs.existsSync(testPath)) {
        mainWindow.loadFile(testPath);
      } else {
        mainWindow.loadURL('data:text/html,<h1>App loaded successfully!</h1><p>React app not found</p>');
      }
    }
  }
  
  // Only open dev tools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

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