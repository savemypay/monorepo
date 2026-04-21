"use client";

import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  // NEW: Function to render a card item on mobile
  renderMobileCard?: (item: T) => ReactNode; 
}

export default function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  isLoading,
  renderMobileCard
}: DataTableProps<T>) {
  
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-white rounded-xl border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-12 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
        No records found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* 1. MOBILE VIEW (Cards) - Visible only on small screens */}
      {renderMobileCard && (
        <div className="md:hidden space-y-4">
          {data.map((row) => (
            <div key={row.id}>
              {renderMobileCard(row)}
            </div>
          ))}
        </div>
      )}

      {/* 2. DESKTOP VIEW (Table) - Hidden on mobile if cards are provided */}
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${renderMobileCard ? 'hidden md:block' : 'overflow-x-auto'}`}>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 text-[#163B63] ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.render 
                      ? col.render(row) 
                      : (row[col.accessorKey as keyof T] as ReactNode)
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}