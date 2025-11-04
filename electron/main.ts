import { app, BrowserWindow, Menu, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import { fileURLToPath } from "url";
import 'dotenv/config';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === "development";

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('[Electron] Preload path:', preloadPath);

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
      // Disable CORS in dev to allow local renderer to call API directly
      webSecurity: !isDev ? true : false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "renderer/index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  // Disable Ctrl+R reload
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Custom menu (no reload options)
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [{ role: "quit" }],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [{ role: "togglefullscreen" }, { role: "toggleDevTools" }],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // IPC: validate tenant without CORS
  ipcMain.handle('tenant:validate', async (_event, subdomain: string) => {
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000/api';
    console.log('[IPC] tenant:validate ->', { subdomain, baseURL });
    const candidates = [baseURL, baseURL.endsWith('/') ? baseURL : baseURL + '/'];
    try {
      for (const url of candidates) {
        try {
          const res = await axios.get(url, {
            headers: {
              'x-tenant': subdomain,
              'Accept': 'application/json',
            },
            validateStatus: () => true,
          });
          console.log('[IPC] tenant:validate response:', { url, status: res.status, statusText: res.statusText });
          if (res.status >= 200 && res.status < 300) {
            return { ok: true, status: res.status };
          }
          // If 404 on first candidate, try next
          if (res.status !== 404) {
            return { ok: false, status: res.status };
          }
        } catch (inner) {
          console.error('[IPC] tenant:validate inner error for url', url, inner?.message);
        }
      }
      return { ok: false, status: 404 };
    } catch (err: any) {
      console.error('[IPC] tenant:validate error:', err?.message);
      return { ok: false, error: err?.message ?? 'Request failed' };
    }
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
