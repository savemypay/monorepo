"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Search, Heart, ShoppingBag, LogOut, Menu, X, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useAuthStore } from "@/lib/store/authStore";

export default function CustomerNavbar() {
  const { user, openLoginModal, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const UserData = useAuthStore(state=>state.user)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to ensure we don't treat an empty object as a logged-in user
  const isLoggedIn = user && Object.keys(user).length > 0;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. Logo (Fixed Width) */}
          <Link href="/customer" className="flex-shrink-0 flex items-center gap-1.5 z-50">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
               <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Save<span className="text-blue-600">My</span>Pay
            </span>
          </Link>

          {/* 2. Search Bar (Flexible Width - Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <div className="relative flex justify-between items-center px-4 py-2 border border-gray-500 rounded-full">
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-2.5 outline-none text-gray-900 placeholder-gray-400 sm:text-sm transition-all"
                placeholder="Search deals..."
              />
              <div className="pl-4 pointer-events-none text-gray-400">
                <Search className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* 3. Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {isLoggedIn ? (
              /* LOGGED IN VIEW */
              <>
                <div className="flex items-center gap-2 mr-2">
                  <Link href="/saved" className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors relative">
                    <Heart size={22} />
                  </Link>
                  <Link href="/my-deals" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
                    <ShoppingBag size={22} />
                  </Link>
                </div>
                
                {/* Profile Dropdown */}
                <div className="relative ml-2" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-transparent hover:bg-gray-50 transition-all"
                  >
                    <div className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                      {user.name ? user.name[0].toUpperCase() : <User size={18} />}
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-5 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                      </div>
                      <div className="py-2">
                        <Link href="/my-deals" className="flex items-center gap-3 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <ShoppingBag size={18} /> My Orders
                        </Link>
                        <Link href="/saved" className="flex items-center gap-3 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Heart size={18} /> Saved Deals
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-2">
                        <button onClick={logout} className="flex w-full items-center gap-3 px-5 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* GUEST VIEW - LOGIN BUTTON */
              <button 
                onClick={() => openLoginModal()}
                className="bg-blue-400 text-blue-400 px-6 py-2.5 rounded-full font-medium text-sm hover:!bg-gray-800 transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                Login
              </button>
            )}
          </div>

          {/* 4. Mobile Menu Button (Visible only on mobile) */}
          <div className="flex items-center md:hidden gap-4">
             {!isLoggedIn && (
               <button 
                onClick={openLoginModal} 
                className="text-sm font-bold text-blue-700"
               >
                 Login
               </button>
            )}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-gray-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content...*/}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search deals..." 
                className="w-full bg-gray-50 pl-10 pr-4 py-3 rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
              />
            </div>
            
            {user ? (
              <div className="space-y-1 pt-2">
                 <div className="px-3 py-2 flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </div>
                 </div>
                 <Link 
                   href="/my-deals" 
                   onClick={() => setIsMenuOpen(false)}
                   className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
                 >
                   <ShoppingBag size={20} /> My Orders
                 </Link>
                 <Link 
                   href="/saved" 
                   onClick={() => setIsMenuOpen(false)}
                   className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 font-medium transition-colors"
                 >
                   <Heart size={20} /> Favorites
                 </Link>
                 <button 
                   onClick={() => {
                     logout();
                     setIsMenuOpen(false);
                   }} 
                   className="flex w-full items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors"
                 >
                   <LogOut size={20} /> Logout
                 </button>
              </div>
            ) : (
              <div className="pt-2 pb-2">
                <button 
                  onClick={() => {
                    openLoginModal();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
                >
                  Login / Signup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}