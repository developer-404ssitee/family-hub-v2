importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD3mp17z0dJmIDSel3frb0XQy1ZYsfgHas",
  authDomain: "family-hub-fe791.firebaseapp.com",
  projectId: "family-hub-fe791",
  storageBucket: "family-hub-fe791.firebasestorage.app",
  messagingSenderId: "170038431227",
  appId: "1:170038431227:web:57154a80268c0284a10f5e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Family Hub';
  const body = payload.notification?.body || 'Yangi xabar';
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data,
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
