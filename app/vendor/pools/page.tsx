"use client"; // Client component needed for state (Modal)

import { useState } from 'react';
import { Plus, Clock, Search } from 'lucide-react';
import CreatePoolModal from '@/components/CreatePoolModal';
import Link from 'next/link';

export default function MyPoolsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  const activePools = [
    { id: 1, name: '2024 SUV Model X Batch', target: 10, current: 7, discount: '15%', endsIn: '2 Days', status: 'Active' },
    { id: 2, name: 'Premium Insurance Group', target: 50, current: 42, discount: '20%', endsIn: '5 Hours', status: 'Closing Soon' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">My Deals & Pools</h1>
           <p className="text-sm text-gray-500">Manage your active and past group offers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus size={18} />
          Create New Pool
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
          {['All', 'Active', 'Completed', 'Expired'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
      </div>

      {/* Pools Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Deal Name</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Time Left</th>
              <th className="px-6 py-4">Status</th>
              <th className='px-6 py-4'>View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {activePools.map((pool) => (
              <tr key={pool.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{pool.name}</td>
                <td className="px-6 py-4">
                  <div className="w-full max-w-xs">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{pool.current} Sold</span>
                      <span className="text-gray-400">Target: {pool.target}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(pool.current / pool.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-green-600 font-medium">{pool.discount} OFF</td>
                <td className="px-6 py-4 flex items-center gap-2 text-gray-500">
                  <Clock size={14} /> {pool.endsIn}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    pool.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {pool.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-800">
                <Link href={`/vendor/pools/${pool.id}`} className="text-blue-600 hover:underline">
                    View Details
                </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Render Modal */}
      {isModalOpen && <CreatePoolModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}