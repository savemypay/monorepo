"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  buildAdminProfile,
  DEFAULT_ADMIN_PROFILE,
  type AdminProfile,
  type AdminSession,
} from "@/lib/admin/auth";

type AdminAuthStore = {
  hydrated: boolean;
  profile: AdminProfile;
  session: AdminSession | null;
  setAuth: (profile: AdminProfile, session: AdminSession) => void;
  updateProfile: (profile: AdminProfile) => void;
  clearAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set) => ({
      hydrated: false,
      profile: DEFAULT_ADMIN_PROFILE,
      session: null,
      setAuth: (profile, session) =>
        set({
          hydrated: true,
          profile,
          session,
        }),
      updateProfile: (profile) => set({ profile }),
      clearAuth: () =>
        set({
          hydrated: true,
          profile: buildAdminProfile({}),
          session: null,
        }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "smp-admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export function logoutAdminSession(redirectPath?: string) {
  useAdminAuthStore.getState().clearAuth();

  if (typeof window === "undefined") {
    return;
  }

  const currentPath = redirectPath ?? `${window.location.pathname}${window.location.search}`;
  const query = currentPath && currentPath !== "/" ? `?redirect=${encodeURIComponent(currentPath)}` : "";
  window.location.replace(`/login${query}`);
}
