import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Matches your API "vendor" object
export interface VendorProfile {
  id: number;
  phone_number: string;
  email: string | null;
  is_active: boolean;
  // These might be added after the registration step
  owner_name?: string; 
  business_name?: string; 
}

interface VendorState {
  accessToken: string | null;
  refreshToken: string | null;
  vendor: VendorProfile | null;
  isAuthenticated: boolean;

  setAuth: (access: string, refresh: string, vendor: VendorProfile) => void;
  logout: () => void;
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      vendor: null,
      isAuthenticated: false,

      setAuth: (accessToken, refreshToken, vendor) => {
        set({ accessToken, refreshToken, vendor, isAuthenticated: true });
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null, vendor: null, isAuthenticated: false });
        localStorage.removeItem('vendor-storage');
      },
    }),
    {
      name: 'vendor-storage', // Unique key for Vendor Portal
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // IMPORTANT: Prevents Next.js hydration mismatch
    }
  )
);