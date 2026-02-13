import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Define User Interface based on API response
export interface User {
  id: number;
  email: string | null;
  phone_number: string;
  is_active: boolean;
  name:string;
}

export interface AuthData {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthState {
  // Data
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // UI State
  isLoginModalOpen: boolean;

  // Actions
  setAuth: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial State
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoginModalOpen: false,

      // Actions
      setAuth: (accessToken, refreshToken, user) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoginModalOpen: false, // Auto-close modal on success
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('auth-storage');
      },

      openLoginModal: () => set({ isLoginModalOpen: true }),
      closeLoginModal: () => set({ isLoginModalOpen: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist auth data, not the modal open state
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken, 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);