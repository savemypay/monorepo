"use client";

import { useAdminAuthStore } from "@/lib/admin/auth-store";

export default function ProfileForm() {
  const profile = useAdminAuthStore((state) => state.profile);

  return (
    <div className="admin-panel p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Name</p>
          <p className="mt-2 text-lg font-extrabold text-slate-700">{profile.name || "Admin User"}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Email</p>
          <p className="mt-2 text-lg font-extrabold text-slate-700">{profile.email || "Not available"}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Role</p>
          <p className="mt-2 text-lg font-extrabold text-slate-700">{profile.role}</p>
        </div>
      </div>
    </div>
  );
}
