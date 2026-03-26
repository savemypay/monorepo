import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
  type PersistStorage,
  type StateStorage,
} from 'zustand/middleware';

export interface User {
  id: number;
  email: string | null;
  phone_number: string;
  is_active: boolean;
  name?: string | null;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

type PersistedAuthState = Pick<
  AuthState,
  "accessToken" | "refreshToken" | "user" | "isAuthenticated"
>;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const rawStorage = createJSONStorage<PersistedAuthState>(() =>
  typeof window !== "undefined" ? window.localStorage : noopStorage
);

const authStorage: PersistStorage<PersistedAuthState> = {
  getItem: (name) => rawStorage?.getItem(name) ?? null,
  setItem: (name, value) => {
    const persistedState = value.state as Partial<PersistedAuthState> | undefined;
    if (!persistedState?.accessToken) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(name);
      }
      return;
    }
    rawStorage?.setItem(name, value);
  },
  removeItem: (name) => {
    if (rawStorage) {
      rawStorage.removeItem(name);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(name);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      setAuth: (accessToken, refreshToken, user) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          hasHydrated: true,
        });
        if (typeof window !== "undefined") {
          window.localStorage.removeItem('auth-storage');
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: authStorage,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
