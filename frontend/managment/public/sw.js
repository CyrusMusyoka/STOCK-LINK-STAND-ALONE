self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("static-cache-v1").then((cache) => {
        return cache.addAll([
          "/",
          "/index.html",
          "/manifest.json",
          "/icons/icon-192x192.png",
          "/icons/icon-512x512.png"
          // add other static assets here
        ]);
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  });
  
  self.addEventListener("push", (event) => {
    const data = event.data.json();
    const title = data.title || "New Notification";
    const options = {
      body: data.body,
      icon: data.icon || "/icons/icon-192x192.png",
      badge: data.badge || "/icons/icon-192x192.png",
      data: data.redirectUrl || "/"
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data));
  });
  


  // sw.js
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Cache analytics data
registerRoute(
  ({url}) => url.pathname.startsWith('/api/analytics'),
  new StaleWhileRevalidate({
    cacheName: 'analytics-data',
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]})
    ]
  })
);