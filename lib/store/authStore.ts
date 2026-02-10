// store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Define the User Type based on your API response
interface User {
  id: number;
  email: string | null;
  phone_number: string;
  is_active: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null; // Added User object

  // Actions
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial State
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,

      // Actions
      setAuth: (accessToken, refreshToken, user) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
        });
      },

      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // saves to localStorage
    }
  )
);