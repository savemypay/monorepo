"use client";

import CreateDealForm from "@/components/CreateDealForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewDealPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <Link href="/my-deals" className="inline-flex items-center text-sm text-gray-500 hover:text-[#1CA7A6]">
          <ArrowLeft size={16} className="mr-2" /> Back to My Deals
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Deal</h1>
          <p className="text-sm text-gray-500">Set up a new group deal with pricing, tiers, and timeline.</p>
        </div>
      </div>
      <CreateDealForm />
    </div>
  );
}
