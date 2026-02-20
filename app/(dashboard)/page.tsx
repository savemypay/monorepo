"use client"

import CreatePoolModal from '@/components/CreatePoolModal';
import { 
    Users, 
    IndianRupeeIcon, 
    ShoppingBag, 
    ArrowUpRight, 
  } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardSummary, type DashboardSummary } from '@/lib/api/dashboard';
import { useVendorStore } from '@/lib/store/authStore';
  
export default function VendorOverview() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const vendorId = useVendorStore((state) => state.vendor?.id);

  useEffect(() => {
    if (!vendorId) {
      setSummaryLoading(false);
      setSummaryError("Vendor information not found.");
      return;
    }

    const fetchDashboardSummary = async () => {
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        const response = await getDashboardSummary(vendorId);
        if (response.success) {
          setSummary(response.data?.[0] ?? { active_ads: 0, total_leads: 0, total_revenue: 0 });
        }
      } catch (err: unknown) {
        setSummaryError(err instanceof Error ? err.message : "Failed to fetch dashboard summary");
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchDashboardSummary();
  }, [vendorId]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const stats = [
    { title: 'Active Ads', value: summaryLoading ? '...' : String(summary?.active_ads ?? 0), icon: ShoppingBag, label: 'Current total', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Leads', value: summaryLoading ? '...' : String(summary?.total_leads ?? 0), icon: Users, label: 'Current total', color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Total Revenue', value: summaryLoading ? '...' : formatCurrency(summary?.total_revenue ?? 0), icon: IndianRupeeIcon, label: 'Current total', color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Welcome back, Tata Motors Dealership</p>
      </div>

      {summaryError && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {summaryError}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-600 rounded-full">
                  {stat.label}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions / Recent Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Recent Notifications</h3>
          <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-1"><Users size={16} className="text-blue-600" /></div>
                <div>
                    <p className="text-sm font-medium text-gray-800">New Lead Joined Model X Batch</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
          </div>
        </div>
        
        <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">Boost Your Sales</h3>
              <p className="text-blue-100 text-sm mt-2">Create a new group deal today and reach 100+ customers instantly.</p>
            </div>
            <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm self-start mt-4 flex items-center gap-2 hover:bg-blue-50 transition-colors">
              Create New Deal <ArrowUpRight size={16} />
            </button>
        </div>
      </div>
      {isModalOpen && <CreatePoolModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
