// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

let mainWindow;
let backendProcess;

// Configure CSP 
const configureCSP = (win) => {
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(`
      meta[http-equiv="Content-Security-Policy"] {
        content: "default-src 'self' 'unsafe-inline' data:; script-src 'self' 'unsafe-eval'; connect-src 'self' http://localhost:*";
      }
    `);
  });
};

const startBackend = () => {
  try {
    const backendPath = path.join(__dirname, '..', 'backend', 'index.js');
    backendProcess = spawn(process.execPath, [backendPath], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        NODE_ENV: isDev ? 'development' : 'production'
      }
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });
    
    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend error: ${data}`);
    });

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend:', err);
    });

    backendProcess.on('exit', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });

  } catch (err) {
    console.error('Error starting backend:', err);
  }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  configureCSP(mainWindow);

  const appURL = isDev
    ? 'http://localhost:3001'
    : `file://${path.join(__dirname, '../../frontend/management/dist/index.html')}`;

  mainWindow.loadURL(appURL)
    .catch(err => console.error('Failed to load URL:', err));

  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
};

// IPC Handlers
ipcMain.handle('get-app-path', () => {
  return isDev ? process.cwd() : process.resourcesPath;
});

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill('SIGTERM');
    }
    app.quit();
  }
});

// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  safeIpcInvoke: (channel, ...args) => {
    const validChannels = ['get-app-path']; 
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid IPC channel: ${channel}`);
  }
});