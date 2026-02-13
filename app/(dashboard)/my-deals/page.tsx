"use client";

import { useState, useEffect } from 'react';
import { Plus, Clock } from 'lucide-react';
import Link from 'next/link';
import CreatePoolModal from '@/components/CreatePoolModal';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Deal, getMaxDiscount, getTimeLeft } from '@/lib/dealHelpers';
import { useVendorStore } from '@/lib/store/authStore';

// Helper to colorize status badges
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-green-50 text-green-700 border-green-200';
    case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'expired': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-blue-50 text-blue-700 border-blue-200';
  }
};

export default function MyPoolsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');
   
  const vendorId = useVendorStore(state=>state.vendor?.id)
  const accessToken = useVendorStore(state=>state.accessToken)

  // Data State
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data on Mount
  useEffect(() => {
    if (!vendorId || !accessToken) return;
    const fetchDeals = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/ads?vendor_id=${vendorId}`,{
          headers: {
            "Content-Type": "application/json",
            'authorization': `Bearer ${accessToken}`,
            "ngrok-skip-browser-warning": "true"
          },
        });
      
        // Verify the status matches expectations
        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error:", res.status, errorText);
          return;
        }
      
        const json = await res.json();
        console.log("Parsed Data:", json); // <--- Look at this in the console
      
        if (json.success) {
          setDeals(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch deals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, [vendorId, accessToken]);

  // 2. Define Columns for the Reusable Table
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
              <span className="font-medium text-gray-700">{deal.slots_sold} / {deal.total_qty} Sold</span>
              <span className="text-gray-400">{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
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
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock size={14} className="text-gray-400" /> 
          {getTimeLeft(deal.valid_to)}
        </div>
      )
    },
    {
      header: "Status",
      render: (deal) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(deal.status)} uppercase tracking-wide`}>
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
          className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
        >
          Manage
        </Link>
      )
    }
  ];

  // 3. Filter Logic (Client-side filtering)
  const filteredDeals = filter === 'All' 
    ? deals 
    : deals.filter(d => d.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">My Deals</h1>
           <p className="text-sm text-gray-500">Manage your active and past group offers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={18} />
          Create New Deal
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
          {['All', 'Active', 'Draft', 'Expired'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
      </div>

      {/* The Reusable Table */}
      <DataTable 
        columns={columns} 
        data={filteredDeals} 
        isLoading={loading} 
      />

      {isModalOpen && <CreatePoolModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}