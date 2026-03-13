"use client";

import { useState } from "react";
import {
  ADMIN_PROFILE_UPDATED_EVENT,
  ADMIN_PROFILE_STORAGE_KEY,
  readStoredAdminProfile,
  type AdminProfile,
} from "@/lib/admin/auth";

export default function ProfileForm() {
  const [profile, setProfile] = useState<AdminProfile>(() => readStoredAdminProfile());
  const [message, setMessage] = useState("Update your admin identity and preferences.");

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.localStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event(ADMIN_PROFILE_UPDATED_EVENT));
    setMessage("Profile updated locally. Wire this form to admin profile APIs next.");
  };

  return (
    <div className="admin-panel p-6">
      <form className="grid gap-5 lg:grid-cols-2" onSubmit={handleSave}>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Name</span>
          <input
            value={profile.name}
            onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
            className="mt-2 h-12 w-full rounded-2xl border border-line bg-white px-4"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Email</span>
          <input
            value={profile.email}
            onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
            className="mt-2 h-12 w-full rounded-2xl border border-line bg-white px-4"
          />
        </label>
        <label className="block lg:col-span-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Role</span>
          <input value={profile.role} disabled className="mt-2 h-12 w-full rounded-2xl border border-line bg-panel-strong px-4 text-slate-600" />
        </label>
        <div className="lg:col-span-2 flex items-center gap-3">
          <button type="submit" className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white">
            Save Profile
          </button>
          <span className="text-sm font-medium text-muted">{message}</span>
        </div>
      </form>
    </div>
  );
}
