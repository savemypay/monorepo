"use client";

import DealCard from '@/components/DealCard';
import { Filter, Search } from 'lucide-react';

const activeDeals = [
  { id: 1, title: "2024 Tesla Model Y", image: "/assets/Tesla-Model-Y-1-1160x652.webp", discount: "15%", price: "$42,000", joined: 7, target: 10, endsIn: "2 days" },
  { id: 2, title: "Max life Insurance", image: "/assets/62e72fdd87d62a03400072a7_Max_Life_Insurance_logo.svg.webp", discount: "20%", price: "$999", joined: 45, target: 50, endsIn: "5 hours" },
  { id: 3, title: "Luxury Maldives Trip", image: "/assets/images.jpeg", discount: "30%", price: "$2,500", joined: 2, target: 5, endsIn: "1 week" },
];

export default function CustomerPublicDeals() {
  return (
    <div className="space-y-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explore Active Pools</h1>
          <p className="text-gray-500 text-sm">Join others to unlock exclusive bulk discounts.</p>
        </div>
        
        {/* <div className="flex gap-2 w-125 md:w-auto">
           <div className="relative flex-1 md:w-80">
             <Search className="absolute right-0 top-3 text-gray-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search cars,travel..." 
               className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
             />
           </div>
           <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
             <Filter size={20} />
           </button>
        </div> */}
      </div>

      {/* Categories Tabs*/}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All Deals', 'Automotive', 'Electronics', 'Real Estate', 'Travel'].map((cat, i) => (
          <button 
            key={cat}
            className={`px-5 py-2 whitespace-nowrap rounded-full text-sm font-medium transition-all ${
              i === 0 ? 'bg-blue-1 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeDeals.map((deal) => (
          <DealCard key={deal.id} {...deal} />
        ))}
      </div>
    </div>
  );
}