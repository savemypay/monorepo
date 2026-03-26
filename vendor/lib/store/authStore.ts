import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface VendorProfile {
  id: number;
  phone_number: string;
  email: string | null;
  is_active: boolean;
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

export function clearVendorSession() {
  useVendorStore.setState({
    accessToken: null,
    refreshToken: null,
    vendor: null,
    isAuthenticated: false,
  });

  if (typeof window !== 'undefined') {
    localStorage.removeItem('vendor-storage');
  }

  if (typeof document !== 'undefined') {
    document.cookie = 'vendor_authenticated=; Path=/; Max-Age=0; SameSite=Lax';
  }
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
        clearVendorSession();
      },
    }),
    {
      name: 'vendor-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
