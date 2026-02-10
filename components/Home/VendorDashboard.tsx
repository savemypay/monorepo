"use client"

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  X,
  Search
} from 'lucide-react';

const VendorDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock Data for the UI
  const stats = [
    { title: 'Active Pools', value: '3', icon: <ShoppingBag className="w-6 h-6 text-blue-600" />, change: '+1 this week' },
    { title: 'Total Leads', value: '142', icon: <Users className="w-6 h-6 text-purple-600" />, change: '+12% vs last month' },
    { title: 'Revenue Potential', value: '$45,000', icon: <DollarSign className="w-6 h-6 text-green-600" />, change: 'Pending Closure' },
    { title: 'Pool Success Rate', value: '85%', icon: <CheckCircle className="w-6 h-6 text-orange-600" />, change: 'High Performance' },
  ];

  const activePools = [
    { id: 1, name: '2024 SUV Model X Batch', target: 10, current: 7, discount: '15%', endsIn: '2 Days', status: 'Active' },
    { id: 2, name: 'Premium Insurance Group', target: 50, current: 42, discount: '20%', endsIn: '5 Hours', status: 'Closing Soon' },
    { id: 3, name: 'Luxury Apartment Pre-Book', target: 5, current: 1, discount: '8%', endsIn: '10 Days', status: 'New' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-blue-700">Save<span className="text-slate-800">My</span>Pay</h1>
          <p className="text-xs text-gray-400 mt-1">Vendor Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<ShoppingBag size={20}/>} label="My Pools" active={activeTab === 'pools'} onClick={() => setActiveTab('pools')} />
          <NavItem icon={<Users size={20}/>} label="Leads & Customers" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
          <NavItem icon={<DollarSign size={20}/>} label="Earnings" active={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')} />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 text-sm">Need Help?</h4>
            <p className="text-xs text-blue-600 mt-1">Contact platform support for deal disputes.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Dashboard Overview</h2>
            <p className="text-sm text-gray-500">Welcome back, Tata Motors Dealership</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus size={18} />
            Create New Pool
          </button>
        </header>

        <div className="p-8 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Active Pools Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Live Deals</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search pools..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Deal Name</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Discount</th>
                    <th className="px-6 py-4">Time Left</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
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
                        <Clock size={14} />
                        {pool.endsIn}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pool.status === 'Active' ? 'bg-green-50 text-green-700' :
                          pool.status === 'Closing Soon' ? 'bg-orange-50 text-orange-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {pool.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100 text-center">
              <button className="text-sm text-gray-500 hover:text-blue-600 font-medium">View All History</button>
            </div>
          </div>

        </div>
      </main>

      {/* Create Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Create New Bulk Deal</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. 2024 Model Y" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Quantity</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pool Duration (Days)</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="7" />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-blue-900">Your Discount Offer</label>
                  <span className="text-xs text-blue-600 font-medium">Platform Fee: 5%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" className="w-full border border-blue-200 rounded-lg px-4 py-2" placeholder="20" />
                  <span className="font-bold text-gray-600">%</span>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  * Customer will see a <span className="font-bold">15% discount</span>.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg">Cancel</button>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm">Launch Pool</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for Sidebar Items
const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default VendorDashboard;