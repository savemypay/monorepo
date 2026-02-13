"use client";

import { ReactNode } from "react";

// Define the shape of a column
export interface Column<T> {
  header: string;
  accessorKey?: keyof T; // Key to access data directly (e.g., 'title')
  render?: (item: T) => ReactNode; // Custom render function for complex cells (e.g., Progress bar)
  className?: string; // For styling specific columns (e.g., text-right)
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
}

export default function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  isLoading 
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
      <div className="w-full p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
        No data found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Responsive Wrapper for Mobile Scrolling */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px] md:min-w-0">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                    {/* Prefer custom render, fallback to direct access */}
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