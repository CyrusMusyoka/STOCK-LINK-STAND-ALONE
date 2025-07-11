const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');
const { fork, spawn } = require('child_process');
const fetch = require('node-fetch');
const detectPort = require('detect-port').default;

const BACKEND_PORT = 5000;
const FRONTEND_PORT = 3000;
const BACKEND_HEALTH_URL = `http://127.0.0.1:${BACKEND_PORT}/health`;
const BACKEND_READY_TIMEOUT = 30000;
const BACKEND_READY_INTERVAL = 1000;

let mainWindow;
let backendProcess = null;

// wait for backend to be ready
async function waitForBackend(url, timeout, interval) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (err) {
      if (isDev) console.log(`⏳ Waiting for backend... (${err.message})`);
    }
    await new Promise(res => setTimeout(res, interval));
  }
  return false;
}

// check if port is free
async function isPortAvailable(port) {
  return (await detectPort(port)) === port;
}

// Start backend as child process
function startBackend() {
  const backendPath = isDev
    ? path.join(__dirname, 'scripts', 'backend', 'index.js')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'scripts', 'backend', 'index.js');

  console.log('📦 isDev:', isDev);
  console.log('📁 Expected backend path:', backendPath);
  console.log('📁 Does backend exist?', fs.existsSync(backendPath));

  if (!fs.existsSync(backendPath)) {
    console.error(`❌ Backend path not found: ${backendPath}`);
    return false;
  }

  try {
    console.log(`🚀 Starting backend from: ${backendPath}`);
    backendProcess = fork(backendPath, [], {
      cwd: path.dirname(backendPath),
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        PORT: BACKEND_PORT.toString(),
        ELECTRON_RUN_AS_NODE: '1'
      },
      stdio: 'pipe'
    });

    backendProcess.stdout.on('data', data => console.log(`[BACKEND]: ${data}`));
    backendProcess.stderr.on('data', data => console.error(`[BACKEND ERROR]: ${data}`));

    backendProcess.on('error', err => console.error('❌ Backend process error:', err));
    backendProcess.on('exit', (code, signal) => {
      console.log(`⚠️ Backend process exited with code ${code}, signal ${signal}`);
    });

    return true;
  } catch (err) {
    console.error('⚠️ Fork failed, falling back to spawn:', err);

    const alt = spawn('node', [backendPath], {
      cwd: path.dirname(backendPath),
      env: process.env,
      stdio: 'pipe'
    });

    alt.stdout.on('data', d => console.log('[ALT BACKEND]:', d.toString()));
    alt.stderr.on('data', e => console.error('[ALT BACKEND ERROR]:', e.toString()));

    return true;
  }
}

// Create main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
  });

  const frontendURL = isDev
    ? `http://localhost:${FRONTEND_PORT}`
    : `file://${path.join(__dirname, 'frontend-dist/index.html')}`;

  mainWindow.loadURL(frontendURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Install DevTools in development
async function installExtensions() {
  if (!isDev) return;
  try {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];
    await installer.default(
      extensions.map(name => installer[name]),
      forceDownload
    );
  } catch (err) {
    console.error('DevTools installation failed:', err);
  }
}

// Electron ready
app.whenReady().then(async () => {
  await installExtensions();

  const portFree = await isPortAvailable(BACKEND_PORT);

  if (portFree) {
    const started = startBackend();
    if (started) {
      const ready = await waitForBackend(
        BACKEND_HEALTH_URL,
        BACKEND_READY_TIMEOUT,
        BACKEND_READY_INTERVAL
      );
      if (ready) console.log('✅ Backend is ready');
      else console.warn('⚠️ Backend may not be fully ready');
    }
  } else {
    console.warn(`⚠️ Port ${BACKEND_PORT} already in use - using existing backend`);
  }

  createMainWindow();
});

// Handle window closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      console.log('🛑 Stopping backend process...');
      backendProcess.kill();
    }
    app.quit();
  }
});

// Graceful shutdown on Ctrl+C or terminal close
process.on('SIGINT', () => {
  if (backendProcess) {
    console.log('🛑 SIGINT received - stopping backend...');
    backendProcess.kill();
  }
  app.quit();
});

// Handle IPC for backend status
ipcMain.handle('get-backend-status', async () => {
  try {
    const res = await fetch(BACKEND_HEALTH_URL);
    return res.ok;
  } catch {
    return false;
  }
});
