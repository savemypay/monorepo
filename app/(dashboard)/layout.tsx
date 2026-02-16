'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VendorSidebar from "@/components/VendorSidebar";
import VendorNavbar from "@/components/VendorNavbar"; 
import { useVendorStore } from '@/lib/store/authStore';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useVendorStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const rehydrate = async () => {
      await useVendorStore.persist.rehydrate();
      setIsHydrated(true);
    };
    rehydrate();
  }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* Sidebar */}
      <VendorSidebar 
        isOpen={isSidebarOpen} 
        closeMobileMenu={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <VendorNavbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
        </div>
        
      </main>
    </div>
  );
}