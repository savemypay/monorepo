/* eslint-disable no-undef */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

(function initializeFirebaseMessagingServiceWorker() {
  const params = new URL(self.location.href).searchParams;
  const firebaseConfig = {
    apiKey: params.get("apiKey") || undefined,
    authDomain: params.get("authDomain") || undefined,
    projectId: params.get("projectId") || undefined,
    storageBucket: params.get("storageBucket") || undefined,
    messagingSenderId: params.get("messagingSenderId") || undefined,
    appId: params.get("appId") || undefined,
    measurementId: params.get("measurementId") || undefined,
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.messagingSenderId || !firebaseConfig.projectId || !firebaseConfig.appId) {
    return;
  }

  importScripts("https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js");

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || "SaveMyPay";
    const options = {
      body: payload?.notification?.body || "You have a new notification.",
      icon: "/assets/Logo-icon.png",
      data: {
        url: payload?.fcmOptions?.link || payload?.data?.link || payload?.data?.url || "/customer",
      },
    };

    self.registration.showNotification(title, options);
  });
})();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/customer";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }

      return undefined;
    })
  );
});
