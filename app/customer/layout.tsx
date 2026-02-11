// "use client";

// import CustomerNavbar from "@/components/CustomerNavbar";
// import AuthModal from "@/components/AuthModal";
// import { AuthProvider } from "../context/AuthContext";

// export default function CustomerLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <AuthProvider>
//       <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 flex flex-col">
//         {/* Navbar */}
//         <CustomerNavbar />
        
//         {/* Main Content Area */}
//         <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
//           {children}
//         </main>
        
//         {/* Auth Modal (Global) */}
//         <AuthModal />
        
//         <footer className="border-t border-gray-200 bg-white mt-auto">
//           <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 text-center text-sm text-gray-500">
//             &copy; {new Date().getFullYear()} SaveMyPay. All rights reserved.
//           </div>
//         </footer>
//       </div>
//     </AuthProvider>
//   );
// }

"use client";

import CustomerNavbar from "@/components/CustomerNavbar";
import AuthModal from "@/components/AuthModal";
import { AuthProvider } from "@/app/context/AuthContext";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Main Wrapper */}
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
        
        {/* Navbar (Fixed or Sticky logic handled inside Navbar component) */}
        <CustomerNavbar />
        
        {/* Main Content Area - flex-1 pushes footer down */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
        
        {/* Auth Modal (Global Overlay) */}
        <AuthModal />
        
        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} SaveMyPay. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}