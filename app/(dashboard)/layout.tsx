// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import VendorSidebar from "@/components/VendorSidebar";
// import VendorNavbar from "@/components/VendorNavbar"; // Import the new component
// import { useVendorStore } from '@/lib/store/authStore';

// export default function VendorLayout({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
  
//   // 1. We check 'isAuthenticated' for route protection.
//   // We don't need 'accessToken' here because we aren't making API calls in this file.
//   const { isAuthenticated } = useVendorStore();
  
//   const [isHydrated, setIsHydrated] = useState(false);

//   useEffect(() => {
//     // Manually handle rehydration to ensure consistent state
//     const rehydrate = async () => {
//       await useVendorStore.persist.rehydrate();
//       setIsHydrated(true);
//     };
//     rehydrate();
//   }, []);

//   // 2. Guard: Redirect if not authenticated
//   useEffect(() => {
//     if (isHydrated && !isAuthenticated) {
//       router.replace('/login');
//     }
//   }, [isHydrated, isAuthenticated, router]);

//   // 3. Loading State (Prevent Flash of Unstyled Content)
//   if (!isHydrated || !isAuthenticated) {
//     return (
//       <div className="h-screen w-full flex items-center justify-center bg-gray-50">
//         <div className="flex flex-col items-center gap-3">
//           <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-gray-500 text-sm font-medium animate-pulse">Loading Dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   // 4. Render Dashboard Layout
//   return (
//     <div className="flex min-h-screen bg-gray-50 font-sans text-slate-800">
      
//       {/* Sidebar (Fixed Left) */}
//       <VendorSidebar />

//       {/* Main Content Area */}
//       <main className="flex-1 md:ml-64 transition-all duration-300 flex flex-col min-h-screen">
        
//         {/* Navbar (Sticky Top) */}
//         <VendorNavbar />

//         {/* Page Content (Scrollable) */}
//         <div className="flex-1 p-8 overflow-y-auto">
//             {children}
//         </div>
        
//       </main>
//     </div>
//   );
// }


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

  // --- NEW: Mobile Sidebar State ---
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
    return <div>Loading...</div>; // (Your existing loader)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* 1. Pass State to Sidebar */}
      <VendorSidebar 
        isOpen={isSidebarOpen} 
        closeMobileMenu={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300 flex flex-col min-h-screen">
        
        {/* 2. Pass Toggle Function to Navbar */}
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