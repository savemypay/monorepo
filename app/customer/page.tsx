"use client";

import DealCard from '@/components/DealCard';
import {Sparkles } from 'lucide-react';

const activeDeals = [
  { id: 1, title: "2024 Tesla Model Y", image: "/assets/Tesla-Model-Y-1-1160x652.webp", discount: "15%", price: "$42,000", joined: 5, target: 10, endsIn: "2 days" },
  { id: 2, title: "Max Life Insurance Plan", image: "/assets/62e72fdd87d62a03400072a7_Max_Life_Insurance_logo.svg.webp", discount: "20%", price: "$999", joined: 10, target: 50, endsIn: "5 hours" },
  { id: 3, title: "Luxury Maldives Trip", image:  "/assets/images.jpeg", discount: "30%", price: "$2,500", joined: 2, target: 5, endsIn: "1 week" },
  { id: 4, title: "iPhone 15 Pro Max", image:"/assets/galaxy-s24-ultra-highlights-kv.jpg", discount: "10%", price: "$1,100", joined: 12, target: 20, endsIn: "3 days" },
];

export default function CustomerPublicDeals() {
  return (
    <div className="space-y-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
              <Sparkles size={16} />
            </span>
            <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Live Offers</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Active Pools</h1>
          <p className="text-gray-500 max-w-md">Join forces with other buyers. The more people join, the better deals everyone unlocks.</p>
        </div>
      </div>

      {/* Categories Tabs */}
      <div>
        <h1 className='font-bold mb-2 text-xl'>Top Categories</h1>
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
          {['All Deals', 'Automotive', 'Electronics', 'Real Estate', 'Travel', 'Fashion'].map((cat, i) => (
            <button 
              key={cat}
              className={`px-6 py-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 border ${
                i === 0 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 md:gap-8 bg-[#f5f5f5]">
        {activeDeals.map((deal) => (
          <DealCard key={deal.id} {...deal} />
        ))}
      </div>
    </div>
  );
}