// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');


let mainWindow;
let backendProcess;

const startBackend = () => {
  const backendPath = path.join(__dirname, 'inventory', 'backend', 'index.js');
  
  backendProcess = spawn('node', [backendPath]);

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend error: ${data}`);
  });
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,  
      contextIsolation: true,  
      preload: path.join(__dirname, 'preload.js')  
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');  // React development server
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html')); 
  }
};

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
