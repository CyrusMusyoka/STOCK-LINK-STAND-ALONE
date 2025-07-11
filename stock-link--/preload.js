// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessageToMain: (message) => ipcRenderer.send('message-from-renderer', message),

  getAppVersion: () => ipcRenderer.invoke('get-app-version'),


  getBackendStatus: () => ipcRenderer.invoke('get-backend-status')
});
