"use client";

import { useState } from 'react';
import { Search, Download, Check } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  car: string;
  status: 'Pending Visit' | 'Verified' | 'Purchased';
  phone: string;
}

export default function LeadsPage() {
  const [leads] = useState<Lead[]>([
    { id: 'TKN-8821', name: 'Rahul Sharma', car: 'Model X SUV', status: 'Pending Visit', phone: '+91 98765 43210' },
    { id: 'TKN-8822', name: 'Anita Desai', car: 'Model X SUV', status: 'Verified', phone: '+91 98765 12345' },
    { id: 'TKN-8823', name: 'Vikram Singh', car: 'Sedan Batch', status: 'Purchased', phone: '+91 98765 67890' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Leads</h1>
          <p className="text-sm text-gray-500">Verify customer tokens here.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Enter Token ID..." 
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <button className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-900">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Token ID</th>
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Deal Interest</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-medium text-blue-600">{lead.id}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{lead.name}</td>
                <td className="px-6 py-4 text-gray-600">{lead.car}</td>
                <td className="px-6 py-4 text-gray-500">{lead.phone}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1 ${
                    lead.status === 'Purchased' ? 'bg-green-100 text-green-700' :
                    lead.status === 'Verified' ? 'bg-blue-50 text-blue-700' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>
                    {lead.status === 'Purchased' && <Check size={12} />}
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {lead.status === 'Pending Visit' && (
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 px-3 py-1 rounded hover:bg-blue-50">
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}