"use client";

import { useAuth } from '@/app/context/AuthContext';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function MyDealsPage() {
  const { user, openLoginModal } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-gray-100 p-4 rounded-full"><ShoppingBag size={32} className="text-gray-400" /></div>
        <h2 className="text-xl font-bold">Please Login</h2>
        <p className="text-gray-500">You need to be logged in to view your orders.</p>
        <button onClick={openLoginModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">Login Now</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Deals History</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        <p>No active deals found. <Link href="/customer" className="text-blue-600 font-bold hover:underline">Browse Pools</Link></p>
      </div>
    </div>
  );
}