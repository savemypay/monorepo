import { CheckCircle } from 'lucide-react';

export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Financial Overview</h1>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Revenue Generated</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">₹450,000</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Platform Fees Paid (5%)</p>
          <h3 className="text-3xl font-bold text-red-600 mt-2">-₹22,500</h3>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
          <p className="text-green-700 text-xs uppercase font-bold tracking-wider">Net Profit</p>
          <h3 className="text-3xl font-bold text-green-800 mt-2">₹427,500</h3>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Recent Settlements</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Payout for Deal #882{i}</p>
                  <p className="text-xs text-gray-500">Oct {20 + i}, 2024</p>
                </div>
              </div>
              <span className="font-mono font-bold text-gray-700">+₹12,450.00</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}