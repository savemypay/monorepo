import type { AdminRole } from "@/lib/admin/types";

export const ADMIN_COOKIE = "admin_authenticated";
export const ADMIN_PROFILE_STORAGE_KEY = "smp-admin-profile";
export const ADMIN_SESSION_STORAGE_KEY = "smp-admin-session";
export const ADMIN_PROFILE_UPDATED_EVENT = "admin-profile-updated";

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

const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  name: "Admin User",
  email: "",
  role: "Admin",
};

export function normalizeAdminRole(role: string | null | undefined): AdminRole {
  const normalized = (role || "").trim().toLowerCase();

  if (normalized === "super_admin" || normalized === "super admin") return "Super Admin";
  if (normalized === "operations_admin" || normalized === "operations admin") return "Operations Admin";
  if (normalized === "finance_admin" || normalized === "finance admin") return "Finance Admin";
  if (normalized === "support_admin" || normalized === "support admin") return "Support Admin";
  if (normalized === "growth_admin" || normalized === "growth admin") return "Growth Admin";
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
    role: normalizeAdminRole(input.role),
  };
}

export function readStoredAdminProfile(): AdminProfile {
  if (typeof window === "undefined") {
    return DEFAULT_ADMIN_PROFILE;
  }

  const raw = window.localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY);
  if (!raw) {
    return DEFAULT_ADMIN_PROFILE;
  }

  try {
    return JSON.parse(raw) as AdminProfile;
  } catch {
    return DEFAULT_ADMIN_PROFILE;
  }
}

export function readStoredAdminSession(): AdminSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export function persistAdminAuth(profile: AdminProfile, session: AdminSession) {
  window.localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(ADMIN_PROFILE_UPDATED_EVENT));
}

export function clearAdminAuth() {
  window.localStorage.removeItem(ADMIN_PROFILE_STORAGE_KEY);
  window.localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event(ADMIN_PROFILE_UPDATED_EVENT));
}
