"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getVendorProfile, updateVendorProfile, type VendorProfileDetails } from "@/lib/api/profile";

interface FormState {
  name: string;
  email: string;
  phone_number: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<VendorProfileDetails | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone_number: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getVendorProfile();
        const data = res.data?.[0] ?? null;
        setProfile(data);
        setForm({
          name: data?.name ?? "",
          email: data?.email ?? "",
          phone_number: data?.phone_number ?? "",
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSuccess(null);
    setError(null);

    if (!form.name && !form.email && !form.phone_number) {
      setError("Please provide at least one field to update.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name || profile?.name || "",
        email: form.email || profile?.email || "",
        phone_number: form.phone_number || profile?.phone_number || "",
      };

      const res = await updateVendorProfile(payload);
      const updated = res.data?.[0] ?? null;
      setProfile(updated);
      setForm({
        name: updated?.name ?? "",
        email: updated?.email ?? "",
        phone_number: updated?.phone_number ?? "",
      });
      setSuccess(res.message || "Profile updated successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#163B63]">My Profile</h1>
        <p className="text-base text-[#7A8CA3]">Update your contact details.</p>
      </div>
      

      {loading ? (
        <div className="h-40 flex items-center justify-center bg-white border border-gray-200 rounded-xl">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-100 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#168F8E] focus:ring-2 focus:ring-[#E7F6F6]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#168F8E] focus:ring-2 focus:ring-[#E7F6F6]"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#168F8E] focus:ring-2 focus:ring-[#E7F6F6]"
                placeholder="10-digit number"
              />
            </div>
          </div>

          <div className="flex justify-start">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#1CA7A6] hover:bg-[#168F8E] disabled:bg-[#E7F6F6] text-white font-medium rounded-xl shadow-lg shadow-[#E7F6F6] transition-all flex items-center gap-2"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
