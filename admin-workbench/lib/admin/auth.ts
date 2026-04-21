import type { AdminRole } from "@/lib/admin/types";

export type AdminProfile = {
  name: string;
  email: string;
  role: AdminRole;
};

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  role: string;
  userId: string;
  username: string;
  email: string;
};

export const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  name: "Admin User",
  email: "",
  role: "Admin",
};

export function normalizeAdminRole(): AdminRole {
  return "Admin";
}

export function buildAdminProfile(input: {
  email?: string;
  username?: string;
  role?: string;
}): AdminProfile {
  const identifier = input.email || input.username || "";

  return {
    name: input.username || "Admin User",
    email: input.email || identifier,
    role: normalizeAdminRole(),
  };
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(padded);
  }

  return Buffer.from(padded, "base64").toString("utf-8");
}

export function getAdminTokenExpiryMs(accessToken: string) {
  try {
    const [, payload] = accessToken.split(".");
    if (!payload) {
      return null;
    }

    const parsed = JSON.parse(decodeBase64Url(payload)) as { exp?: number };
    return typeof parsed.exp === "number" ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isAdminSessionExpired(session: AdminSession | null) {
  if (!session?.accessToken) {
    return true;
  }

  const expiryMs = getAdminTokenExpiryMs(session.accessToken);
  if (!expiryMs) {
    return false;
  }

  return Date.now() >= expiryMs;
}
