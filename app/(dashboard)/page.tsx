"use client"

import { 
    Users, 
    IndianRupeeIcon, 
    ShoppingBag, 
    ArrowUpRight, 
  } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardSummary, type DashboardSummary } from '@/lib/api/dashboard';
import { useVendorStore } from '@/lib/store/authStore';
import { getLeads, type Lead } from '@/lib/api/leads';
  
export default function VendorOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentLeadsLoading, setRecentLeadsLoading] = useState(true);
  const [recentLeadsError, setRecentLeadsError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchRecentLeads = async () => {
      try {
        setRecentLeadsLoading(true);
        setRecentLeadsError(null);
        const response = await getLeads();
        if (response.success) {
          const sorted = [...response.data].sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          setRecentLeads(sorted.slice(0, 2));
        }
      } catch (err: unknown) {
        setRecentLeadsError(err instanceof Error ? err.message : "Failed to fetch recent leads");
      } finally {
        setRecentLeadsLoading(false);
      }
    };

    fetchRecentLeads();
  }, []);

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
        <h1 className="text-2xl font-bold text-[#163B63]">Dashboard Overview</h1>
        <p className="text-[#7A8CA3] text-base">Welcome back, Tata Motors Dealership</p>
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
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                <p className="text-base text-[#163B63] font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-[#122E4E]">{stat.value}</h3>
              </div>
              </div>
              
            </div>
          );
        })}
      </div>

      {/* Quick Actions / Recent Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-[#1E2F46]">Recent Notifications</h3>
            <Link href="/leads" className="text-sm font-medium text-[#1CA7A6] hover:underline">
              View Leads
            </Link>
          </div>
          {recentLeadsError && (
            <div className="p-3 rounded-lg border border-red-100 bg-red-50 text-red-700 text-sm mb-3">
              {recentLeadsError}
            </div>
          )}
          <div className="space-y-3">
            {recentLeadsLoading ? (
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">Loading latest leads...</div>
            ) : recentLeads.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">No recent leads yet.</div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.payment_id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-1"><Users size={16} className="text-blue-600" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {lead.user_name ? `${lead.user_name} joined` : "New lead joined"} {lead.ad?.title ? `(${lead.ad.title})` : "a deal"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-[#1CA7A6] p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">Boost Your Sales</h3>
              <p className="text-blue-100 text-sm mt-2">Create a new group deal today and reach 100+ customers instantly.</p>
            </div>
            <Link
              href="/my-deals/new"
              className="bg-white text-[#1CA7A6] px-4 py-2 rounded-lg font-bold text-sm self-start mt-4 flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              Create New Deal <ArrowUpRight size={16} />
            </Link>
        </div>
      </div>
    </div>
  );
}
