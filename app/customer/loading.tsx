import { Sparkles } from "lucide-react";

function CardSkeleton({ keyId }: { keyId: number }) {
  return (
    <div
      key={keyId}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse"
    >
      <div className="h-40 w-full bg-slate-200" />
      <div className="p-5 space-y-4">
        <div className="h-5 w-3/4 bg-slate-200 rounded" />
        <div className="space-y-2">
          <div className="h-2 w-full bg-slate-200 rounded" />
          <div className="h-2 w-2/3 bg-slate-200 rounded" />
        </div>
        <div className="flex items-end justify-between pt-2">
          <div className="h-6 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-8 bg-slate-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
              <Sparkles size={16} />
            </span>
            <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">Live Offers</span>
          </div>
          <div className="h-8 w-64 bg-slate-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-80 max-w-full bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      <div>
        <div className="h-6 w-40 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="flex items-center gap-3 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 w-24 bg-slate-200 rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 md:gap-8 bg-[#f5f5f5]">
        {Array.from({ length: 8 }).map((_, index) => (
          <CardSkeleton key={index} keyId={index} />
        ))}
      </div>
    </div>
  );
}
