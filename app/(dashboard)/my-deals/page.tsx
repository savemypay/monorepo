"use client";

import { useState, useEffect } from 'react';
import { Plus, Clock, ChevronRight } from 'lucide-react'; // Added ChevronRight
import Link from 'next/link';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Deal, getMaxDiscount, getTimeLeft } from '@/lib/dealHelpers';
import { useVendorStore } from '@/lib/store/authStore';
import { getVendorDeals } from '@/lib/api/deals';

// Helper to colorize status badges
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'expired': return 'bg-red-100 text-red-800 border-red-200';
    case 'filled': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'canceled': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

export default function MyPoolsPage() {
  const [filter, setFilter] = useState('All');
   
  const vendorId = useVendorStore(state=>state.vendor?.id)

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    if (!vendorId) return;
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const status = filter === 'All' ? undefined : filter.toLowerCase();
        const json = await getVendorDeals(vendorId, status);
        if (json.success) setDeals(json.data);
      } catch (error) {
        console.error("Failed to fetch deals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [vendorId, filter]);

  // 2. Desktop Columns
  const columns: Column<Deal>[] = [
    {
      header: "Deal Name",
      render: (deal) => (
        <div>
          <p className="font-medium text-gray-900">{deal.title}</p>
          <p className="text-xs text-gray-400">{deal.product_name}</p>
        </div>
      )
    },
    {
      header: "Progress",
      render: (deal) => {
        const percentage = Math.min((deal.slots_sold / deal.total_qty) * 100, 100);
        return (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-gray-700">{deal.slots_sold}/{deal.total_qty}</span>
              <span className="text-gray-400">({percentage.toFixed(0)}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: "Max Discount",
      render: (deal) => (
        <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">
          Up to {getMaxDiscount(deal.tiers)} OFF
        </span>
      )
    },
    {
      header: "Time Left",
      render: (deal) => (
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
          <Clock size={14} className="text-gray-400" /> 
          {getTimeLeft(deal.valid_to)}
        </div>
      )
    },
    {
      header: "Status",
      render: (deal) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(deal.status)} uppercase tracking-wide`}>
          {deal.status}
        </span>
      )
    },
    {
      header: "Action",
      className: "text-right",
      render: (deal) => (
        <Link 
          href={`/my-deals/${deal.id}`} 
          className="text-[#1CA7A6] hover:text-[#168F8E] font-medium text-sm hover:underline"
        >
          Manage
        </Link>
      )
    }
  ];

  // 3. Mobile Card Renderer
  const renderMobileDealCard = (deal: Deal) => {
    const percentage = Math.min((deal.slots_sold / deal.total_qty) * 100, 100);
    
    return (
      <Link href={`/my-deals/${deal.id}`} className="block w-full">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm active:scale-[0.98] transition-transform overflow-hidden max-w-full">
          
          {/* Top Row: Status + Time */}
          <div className="flex justify-between items-start mb-3">
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(deal.status)}`}>
              {deal.status}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400">
               <Clock size={12} /> {getTimeLeft(deal.valid_to)}
            </div>
          </div>

          {/* Title Area */}
          <div className="mb-4 min-w-0">
             <h3 className="font-bold text-gray-900 text-lg leading-tight break-words">{deal.title}</h3>
             <p className="text-sm text-gray-500 mt-0.5 break-words">{deal.product_name}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5 text-gray-600 font-medium">
               <span>Progress</span>
               <span>{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="mt-1 text-xs text-gray-400 text-right">
               {deal.slots_sold} of {deal.total_qty} sold
            </div>
          </div>

          {/* Footer: Discount + Action */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
             <span className="text-green-700 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">
                Max {getMaxDiscount(deal.tiers)} OFF
             </span>
             <div className="flex items-center text-[#1CA7A6] text-sm font-semibold">
                Manage <ChevronRight size={16} />
             </div>
          </div>

        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#163B63]">My Deals</h1>
          <p className="text-[#7A8CA3] text-base">Manage your active and past group offers.</p>
        </div>
        <Link
          href="/my-deals/new"
          className="bg-[#1CA7A6] hover:bg-[#168F8E] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all w-full md:w-auto justify-center"
        >
          <Plus size={18} />
          <span className="md:hidden">New Deal</span>
          <span className="hidden md:inline">Create New Deal</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
          {['All', 'Draft', 'Active', 'Filled', 'Expired', 'Canceled'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                filter === f ? 'bg-[#E7F6F6] text-[#1CA7A6]' : 'text-[#1E2F46] hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
      </div>

      {/* Table with Mobile Card Support */}
      <DataTable 
        columns={columns} 
        data={deals} 
        isLoading={loading}
        renderMobileCard={renderMobileDealCard} // Pass the card renderer here
      />

    </div>
  );
}
