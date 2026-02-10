import { 
    Users, 
    DollarSign, 
    ShoppingBag, 
    CheckCircle,
    ArrowUpRight 
  } from 'lucide-react';
  
  export default function VendorOverview() {
    // Mock Data (In a real app, fetch this from your DB)
    const stats = [
      { title: 'Active Pools', value: '3', icon: ShoppingBag, change: '+1 this week', color: 'text-blue-600', bg: 'bg-blue-50' },
      { title: 'Total Leads', value: '142', icon: Users, change: '+12% vs last month', color: 'text-purple-600', bg: 'bg-purple-50' },
      { title: 'Revenue Potential', value: '$45,000', icon: DollarSign, change: 'Pending Closure', color: 'text-green-600', bg: 'bg-green-50' },
      { title: 'Pool Success Rate', value: '85%', icon: CheckCircle, change: 'High Performance', color: 'text-orange-600', bg: 'bg-orange-50' },
    ];
  
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">Welcome back, Tata Motors Dealership</p>
        </div>
  
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-600 rounded-full">
                    {stat.change}
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
               {/* Add more items... */}
            </div>
          </div>
          
          <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
             <div>
                <h3 className="text-xl font-bold">Boost Your Sales</h3>
                <p className="text-blue-100 text-sm mt-2">Create a new group deal today and reach 100+ customers instantly.</p>
             </div>
             <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm self-start mt-4 flex items-center gap-2 hover:bg-blue-50 transition-colors">
                Create New Deal <ArrowUpRight size={16} />
             </button>
          </div>
        </div>
      </div>
    );
  }