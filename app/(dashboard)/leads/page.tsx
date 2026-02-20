"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Download, Check, Loader2, AlertCircle, Phone, Mail, User, CreditCard } from 'lucide-react';
import { getLeads, Lead } from '@/lib/api/leads';

function LeadsContent() {
  const searchParams = useSearchParams();
  const adIdFromUrl = searchParams.get('ad_id');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getLeads(adIdFromUrl || '');
        if (response.success) {
          setLeads(response.data);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [adIdFromUrl]);

  // Helpers
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded': return 'bg-green-100 text-green-700 border-green-200';
      case 'verified': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const filteredLeads = leads.filter((lead) => 
    String(lead.payment_id).includes(searchTerm) || 
    lead.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.order_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 md:border-none md:p-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Leads</h1>
          <p className="text-sm text-gray-500">
            {adIdFromUrl ? `Showing leads for Deal #${adIdFromUrl}` : "Manage and track all customer purchases."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Name or Order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
            />
          </div>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors">
            <Download size={16} /> <span className="hidden sm:inline">Export CSV</span><span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* View 1: Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No leads found.</td></tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.payment_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-blue-600">#{lead.order_id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{lead.user_name || "Guest User"}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex flex-col gap-0.5 text-xs">
                          {lead.user_email && <div className="flex items-center gap-1"><Mail size={10}/> {lead.user_email}</div>}
                          {lead.user_phone_number && <div className="flex items-center gap-1"><Phone size={10}/> {lead.user_phone_number}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border capitalize ${getStatusStyle(lead.status)}`}>
                          {lead.status.toLowerCase() === 'succeeded' && <Check size={12} strokeWidth={3} />}
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">₹{" "}{lead.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View 2: Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
           <div className="h-32 flex items-center justify-center bg-white rounded-xl border"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : filteredLeads.length === 0 ? (
           <div className="bg-white p-8 rounded-xl border text-center text-gray-500">No leads found.</div>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead.payment_id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-400 font-mono block mb-1">#{lead.order_id.substring(0, 8)}</span>
                  <h3 className="font-bold text-gray-900 text-lg">{lead.user_name || "Guest User"}</h3>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold border capitalize ${getStatusStyle(lead.status)}`}>
                  {lead.status}
                </span>
              </div>
              <div className="h-px bg-gray-100 w-full" />
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"><CreditCard size={14} /></div>
                  <span className="font-semibold text-gray-900 text-base">₹{" "}{lead.amount}</span>
                </div>
                {(lead.user_email || lead.user_phone_number) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><User size={14} /></div>
                    <div className="flex flex-col">
                       {lead.user_email && <span className="text-xs">{lead.user_email}</span>}
                       {lead.user_phone_number && <span className="text-xs">{lead.user_phone_number}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const LeadsPage = () => {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    }>
      <LeadsContent />
    </Suspense>
  );
};

export default LeadsPage;