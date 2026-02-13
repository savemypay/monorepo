'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  User, 
  ChevronDown, 
  Bell, 
  Store 
} from 'lucide-react';
import { useVendorStore } from '@/lib/store/authStore';

import { Menu } from 'lucide-react'; // Import Menu Icon

interface NavbarProps {
  onMenuClick: () => void;
}

export default function VendorNavbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { vendor, logout } = useVendorStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(); // 1. Clear Zustand state & localStorage
    router.replace('/login'); // 2. Redirect
  };

  // Safe fallbacks if data is missing
  const ownerName = vendor?.owner_name || "Vendor";
  const businessName = vendor?.business_name || "My Business";
  const initials = ownerName.slice(0, 2).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 h-16 px-8 flex items-center justify-between shadow-sm">
      
      {/* Left: Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800">Overview</h2>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Notification Bell */}
        <button className="relative text-gray-500 hover:text-gray-700 transition p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
          {/* Red Dot */}
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-lg transition-all focus:outline-none border border-transparent hover:border-gray-200"
          >
            {/* Avatar */}
            <div className="h-9 w-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm border border-blue-200 shadow-sm">
              {initials}
            </div>
            
            {/* Text Info (Hidden on small mobile) */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-none">{ownerName}</p>
              <p className="text-xs text-gray-500 mt-1">{businessName}</p>
            </div>

            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              
              <div className="px-4 py-3 border-b border-gray-100 mb-2 bg-gray-50/50">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Welcome</p>
                <p className="font-medium text-gray-900 truncate text-sm mt-1">{vendor?.phone_number || vendor?.email}</p>
              </div>

              <div className="px-1 space-y-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
                  <User size={16} /> My Profile
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">
                  <Store size={16} /> Business Details
                </button>
              </div>

              <div className="mt-2 border-t border-gray-100 pt-2 px-1">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition font-medium"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}