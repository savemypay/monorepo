"use client";

const INSTALLATION_ID_STORAGE_KEY = "notification-installation-id";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION?.trim();

export type NotificationInstallationPayload = {
  installation_id: string;
  platform: "web";
  app_version?: string;
  device_model?: string;
  locale?: string;
  timezone?: string;
};

function canUseBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getStoredInstallationId() {
  if (!canUseBrowserStorage()) return null;
  return window.localStorage.getItem(INSTALLATION_ID_STORAGE_KEY);
}

function generateInstallationId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateInstallationId() {
  const stored = getStoredInstallationId();
  if (stored) return stored;

  const installationId = generateInstallationId();
  if (canUseBrowserStorage()) {
    window.localStorage.setItem(INSTALLATION_ID_STORAGE_KEY, installationId);
  }

  return installationId;
}

export function createInstallationRegistrationPayload(
  installationId = getOrCreateInstallationId()
): NotificationInstallationPayload {
  const locale =
    typeof navigator !== "undefined" && typeof navigator.language === "string"
      ? navigator.language
      : undefined;
  const timezone =
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone || undefined : undefined;
  const deviceModel =
    typeof navigator !== "undefined" && typeof navigator.userAgent === "string"
      ? navigator.userAgent.slice(0, 200)
      : undefined;

  return {
    installation_id: installationId,
    platform: "web",
    app_version: APP_VERSION || undefined,
    device_model: deviceModel,
    locale,
    timezone,
  };
}
