"use client";

import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import {
  registerNotificationPushToken,
  unregisterNotificationPushToken,
} from "@/lib/api/notifications";
import { getOrCreateInstallationId, getStoredInstallationId } from "@/lib/notifications/installation";

const PUSH_TOKEN_STORAGE_KEY = "notification-push-token";
const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim(),
};
const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();

export type BrowserNotificationPermission = NotificationPermission | "unsupported" | "unavailable";

function hasRequiredFirebaseConfig() {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.projectId &&
      FIREBASE_CONFIG.messagingSenderId &&
      FIREBASE_CONFIG.appId &&
      FIREBASE_VAPID_KEY
  );
}

function canUsePushNotifications() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

function getFirebaseAppInstance() {
  if (!hasRequiredFirebaseConfig()) {
    throw new Error("Firebase messaging is not configured.");
  }

  return getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
}

function buildServiceWorkerUrl() {
  const params = new URLSearchParams();
  Object.entries(FIREBASE_CONFIG).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return `/firebase-messaging-sw.js?${params.toString()}`;
}

async function registerMessagingServiceWorker() {
  return navigator.serviceWorker.register(buildServiceWorkerUrl(), {
    scope: "/",
  });
}

export function getBrowserNotificationPermission(): BrowserNotificationPermission {
  if (!hasRequiredFirebaseConfig()) return "unavailable";
  if (!canUsePushNotifications()) return "unsupported";
  return Notification.permission;
}

export async function requestBrowserNotificationPermission() {
  if (!hasRequiredFirebaseConfig()) {
    throw new Error("Firebase messaging is not configured.");
  }
  if (!canUsePushNotifications()) {
    throw new Error("This browser does not support web notifications.");
  }
  if (!(await isSupported())) {
    throw new Error("Firebase messaging is not supported in this browser.");
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  return permission;
}

export function getStoredPushToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
}

function setStoredPushToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
}

export function clearStoredPushToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
}

export async function registerBrowserPushToken(
  accessToken: string,
  { promptForPermission = false }: { promptForPermission?: boolean } = {}
) {
  if (!accessToken) {
    throw new Error("Access token is required to register browser notifications.");
  }
  if (!hasRequiredFirebaseConfig()) {
    throw new Error("Firebase messaging is not configured.");
  }
  if (!canUsePushNotifications()) {
    throw new Error("This browser does not support web notifications.");
  }
  if (!(await isSupported())) {
    throw new Error("Firebase messaging is not supported in this browser.");
  }

  let permission = Notification.permission;
  if (permission === "default" && promptForPermission) {
    permission = await Notification.requestPermission();
  }

  if (permission === "denied") {
    throw new Error("Browser notifications are blocked. Please enable them in browser settings.");
  }
  if (permission !== "granted") {
    throw new Error("Notification permission is required.");
  }

  const serviceWorkerRegistration = await registerMessagingServiceWorker();
  const messaging = getMessaging(getFirebaseAppInstance());
  const token = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });

  if (!token) {
    throw new Error("Unable to obtain Firebase push token.");
  }

  const installationId = getOrCreateInstallationId();
  const previousToken = getStoredPushToken();

  if (previousToken === token) {
    return { token, isNewToken: false };
  }

  await registerNotificationPushToken(
    {
      installation_id: installationId,
      token,
      provider: "firebase",
      channel: "push",
    },
    accessToken
  );

  setStoredPushToken(token);
  return { token, isNewToken: true };
}

export async function unregisterBrowserPushToken(accessToken: string, reason = "client_unregistered") {
  if (!accessToken) return false;

  const installationId = getStoredInstallationId();
  const token = getStoredPushToken();

  if (!installationId || !token) {
    return false;
  }

  try {
    await unregisterNotificationPushToken(
      {
        installation_id: installationId,
        token,
        reason,
      },
      accessToken
    );
  } finally {
    clearStoredPushToken();
  }

  return true;
}
