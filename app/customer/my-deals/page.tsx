"use client";

import { useAuthStore } from '@/lib/store/authStore'; // Updated Import
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function MyDealsPage() {
  // Use Store hook
  const { user, openLoginModal } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-gray-100 p-6 rounded-full">
          <ShoppingBag size={48} className="text-gray-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Please Login</h2>
          <p className="text-gray-500 max-w-xs mx-auto">
            You need to be logged in to view your orders and track pool progress.
          </p>
        </div>
        <button 
          onClick={openLoginModal} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
        >
          Login Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-bold text-gray-900">My Deals History</h1>
      </div>
      
      {/* Empty State / Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 py-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
           <ShoppingBag size={48} className="text-gray-300" />
           <div>
             <p className="text-gray-900 font-medium">No active deals found.</p>
             <p className="text-gray-500 text-sm mb-4">Join a pool to start saving.</p>
             <Link href="/customer" className="inline-block text-blue-600 font-bold hover:underline">
               Browse Active Pools
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}