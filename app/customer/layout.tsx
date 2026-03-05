import CustomerNavbar from "@/components/CustomerNavbar";
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/seo";
import CustomerRouteGuard from "./CustomerRouteGuard";

export const metadata: Metadata = buildMetadata({
  title: "Customer Dashboard | SaveMyPay",
  description:
    "Manage your group deals, favorites, and purchase journey from the SaveMyPay customer dashboard.",
  path: "/customer",
  robots: {
    index: false,
    follow: false,
  },
});

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Suspense fallback={<div className="h-20 border-b border-gray-100 bg-white/80" />}>
        <CustomerNavbar />
      </Suspense>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <CustomerRouteGuard>{children}</CustomerRouteGuard>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} SaveMyPay. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
