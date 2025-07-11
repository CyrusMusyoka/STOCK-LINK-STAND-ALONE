
  
if (window.location.protocol === 'file:') {
  window.electronAPI = {
    sendMessageToMain: () => console.log('Electron API not available'),
    getAppVersion: () => '1.0.0'
  };
}

// Service Worker Registration
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}
