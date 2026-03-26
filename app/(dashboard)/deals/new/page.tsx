"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { createAdWithImages, getAdminUsers, getCategories } from "@/lib/admin/api";
import { useAdminAuthStore } from "@/lib/admin/auth-store";
import type { AdminUserItem, CategoryItem } from "@/lib/admin/types";

type DiscountTier = {
  id: string;
  quantity: string;
  discount: string;
};

type FormState = {
  vendorId: string;
  title: string;
  productName: string;
  originalPrice: string;
  category: string;
  minBuyers: string;
  description: string;
  terms: string;
  startDate: string;
  endDate: string;
  tokenAmount: string;
};

type FormErrors = Partial<Record<keyof FormState | "images" | "tiers", string>>;

const INITIAL_FORM: FormState = {
  vendorId: "",
  title: "",
  productName: "",
  originalPrice: "",
  category: "",
  minBuyers: "",
  description: "",
  terms: "",
  startDate: "",
  endDate: "",
  tokenAmount: "",
};


function createTier(id: string, quantity = "", discount = ""): DiscountTier {
  return { id, quantity, discount };
}

export default function NewDealPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextTierIdRef = useRef(2);
  const accessToken = useAdminAuthStore((state) => state.session?.accessToken ?? null);
  const hydrated = useAdminAuthStore((state) => state.hydrated);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [tiers, setTiers] = useState<DiscountTier[]>([createTier("1")]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [vendors, setVendors] = useState<AdminUserItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const totalTierQuantity = useMemo(
    () => tiers.reduce((sum, tier) => sum + Number(tier.quantity || 0), 0),
    [tiers]
  );

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    let isCancelled = false;

    const loadFormOptions = async () => {
      setLoadingVendors(true);
      try {
        const [summary, categoryItems] = await Promise.all([
          getAdminUsers({
            accessToken,
            role: "vendor",
            page: 1,
            limit: 100,
          }),
          getCategories(accessToken),
        ]);

        if (!isCancelled) {
          setVendors(summary.vendors ?? []);
          setCategories(categoryItems);
          setForm((current) => ({
            ...current,
            category: current.category || categoryItems[0]?.name || "",
          }));
        }
      } catch (error) {
        if (!isCancelled) {
          setGlobalError(error instanceof Error ? error.message : "Failed to load form options.");
        }
      } finally {
        if (!isCancelled) {
          setLoadingVendors(false);
        }
      }
    };

    void loadFormOptions();

    return () => {
      isCancelled = true;
    };
  }, [accessToken, hydrated]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const sanitizeNumeric = (value: string) => value.replace(/\D+/g, "");

  const getInputClass = (hasError: boolean) =>
    `w-full rounded-2xl border px-4 py-3 outline-none transition ${
      hasError
        ? "border-rose-300 bg-rose-50 text-rose-900 placeholder:text-rose-300"
        : "border-line bg-white focus:border-brand"
    }`;

  const buildVendorLabel = (vendor: AdminUserItem) => {
    const parts = [vendor.name, vendor.email, vendor.phone_number].filter(Boolean);
    return parts.length ? parts.join(" • ") : `Vendor #${vendor.id}`;
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const numericFields: Array<keyof FormState> = ["originalPrice", "tokenAmount", "minBuyers"];
    const nextValue = numericFields.includes(name as keyof FormState) ? sanitizeNumeric(value) : value;

    setForm((current) => ({ ...current, [name]: nextValue }));
    setMessage(null);
    setGlobalError(null);

    if (name === "minBuyers") {
      setTiers([createTier("1", nextValue, "")]);
      nextTierIdRef.current = 2;
    }

    if (errors[name as keyof FormErrors]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  };

  const addTier = () => {
    const requiredQty = Number(form.minBuyers);
    if (requiredQty > 0 && totalTierQuantity >= requiredQty) {
      setErrors((current) => ({
        ...current,
        tiers: "Reduce existing tier quantities before adding a new tier.",
      }));
      return;
    }

    const nextId = String(nextTierIdRef.current++);
    setTiers((current) => [...current, createTier(nextId)]);
  };

  const removeTier = (index: number) => {
    setTiers((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateTier = (index: number, field: keyof Omit<DiscountTier, "id">, value: string) => {
    const normalizedValue = sanitizeNumeric(value);
    setTiers((current) =>
      current.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, [field]: normalizedValue } : tier
      )
    );

    if (errors.tiers) {
      setErrors((current) => ({ ...current, tiers: undefined }));
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) {
      return;
    }

    const newFiles = Array.from(fileList);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setImages((current) => [...current, ...newFiles]);
    setPreviews((current) => [...current, ...newPreviews]);

    if (errors.images) {
      setErrors((current) => ({ ...current, images: undefined }));
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setPreviews((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const originalPrice = Number(form.originalPrice);
    const tokenAmount = Number(form.tokenAmount);
    const minBuyers = Number(form.minBuyers);

    if (!form.vendorId) nextErrors.vendorId = "Vendor selection is required";
    if (!form.title.trim()) nextErrors.title = "Offer title is required";
    if (!form.productName.trim()) nextErrors.productName = "Product name is required";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    if (!form.originalPrice || originalPrice <= 0) nextErrors.originalPrice = "Original price must be greater than 0";
    if (!form.tokenAmount || tokenAmount <= 0) nextErrors.tokenAmount = "Token amount is required";
    if (tokenAmount > originalPrice) nextErrors.tokenAmount = "Token amount cannot exceed original price";
    if (!form.minBuyers || minBuyers <= 0) nextErrors.minBuyers = "Total Qty must be at least 1";
    if (!form.startDate) nextErrors.startDate = "Start date is required";
    if (!form.endDate) nextErrors.endDate = "End date is required";
    if (images.length === 0) nextErrors.images = "At least one image is required";

    const invalidTier = tiers.find(
      (tier) => !tier.quantity || Number(tier.quantity) <= 0 || !tier.discount || Number(tier.discount) <= 0
    );

    if (invalidTier) {
      nextErrors.tiers = "All discount tiers must have valid quantity and discount values";
    } else if (tiers.length && totalTierQuantity !== minBuyers) {
      nextErrors.tiers = `Tier quantities total ${totalTierQuantity}, but Total Qty is ${minBuyers}`;
    }

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end <= start) {
        nextErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setGlobalError(null);

    if (!accessToken) {
      setGlobalError("Admin session missing. Please login again.");
      return;
    }

    if (!validate()) {
      setMessage("Resolve the highlighted validation errors before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      await createAdWithImages({
        accessToken,
        title: form.title.trim(),
        product_name: form.productName.trim(),
        category: form.category,
        original_price: Number(form.originalPrice),
        total_qty: Number(form.minBuyers),
        tiers: tiers.map((tier, index) => ({
          seq: index + 1,
          qty: Number(tier.quantity),
          discount_pct: Number(tier.discount),
          label: `Tier ${index + 1}`,
        })),
        images,
        description: form.description.trim(),
        terms: form.terms.trim(),
        valid_from: new Date(form.startDate).toISOString(),
        valid_to: new Date(form.endDate).toISOString(),
        vendor_id: Number(form.vendorId),
        token_amount: Number(form.tokenAmount),
      });

      router.push("/deals?created=draft");
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "Failed to create deal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deal Creation"
        title="Create Deal"
        description="This admin form now uses the same multipart deal-creation flow as the vendor portal, with vendor selection added for admin-created deals."
      />

      <form className="admin-panel p-6" onSubmit={handleSubmit}>
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-lg font-bold text-brand">Basic Details</h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Vendor</label>
                <select
                  name="vendorId"
                  value={form.vendorId}
                  onChange={handleInputChange}
                  className={getInputClass(!!errors.vendorId)}
                  disabled={loadingVendors}
                >
                  <option value="">{loadingVendors ? "Loading vendors..." : "Select a vendor"}</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {buildVendorLabel(vendor)}
                    </option>
                  ))}
                </select>
                {errors.vendorId ? <p className="mt-1 text-xs text-rose-600">{errors.vendorId}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category</label>
                <select name="category" value={form.category} onChange={handleInputChange} className={getInputClass(false)} disabled={loadingVendors || categories.length === 0}>
                  {categories.map((option) => (
                    <option key={option.id} value={option.name}>{option.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Offer Title</label>
                <input name="title" value={form.title} onChange={handleInputChange} className={getInputClass(!!errors.title)} placeholder="Bulk purchase offer" />
                {errors.title ? <p className="mt-1 text-xs text-rose-600">{errors.title}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Product Name</label>
                <input name="productName" value={form.productName} onChange={handleInputChange} className={getInputClass(!!errors.productName)} placeholder="2024 Tesla Model Y" />
                {errors.productName ? <p className="mt-1 text-xs text-rose-600">{errors.productName}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Original Price</label>
                <input name="originalPrice" value={form.originalPrice} onChange={handleInputChange} className={getInputClass(!!errors.originalPrice)} inputMode="numeric" placeholder="50000" />
                {errors.originalPrice ? <p className="mt-1 text-xs text-rose-600">{errors.originalPrice}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Token Amount</label>
                <input name="tokenAmount" value={form.tokenAmount} onChange={handleInputChange} className={getInputClass(!!errors.tokenAmount)} inputMode="numeric" placeholder="5000" />
                {errors.tokenAmount ? <p className="mt-1 text-xs text-rose-600">{errors.tokenAmount}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Total Qty (Min Buyers)</label>
                <input name="minBuyers" value={form.minBuyers} onChange={handleInputChange} className={getInputClass(!!errors.minBuyers)} inputMode="numeric" placeholder="10" />
                {errors.minBuyers ? <p className="mt-1 text-xs text-rose-600">{errors.minBuyers}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-lg font-bold text-brand">Discount Tiers</h2>
                <p className="mt-1 text-sm text-muted">Same tier structure as the vendor portal.</p>
              </div>
              <button type="button" onClick={addTier} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-800">
                Add Tier
              </button>
            </div>

            {errors.tiers ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errors.tiers}</div> : null}

            <div className="overflow-hidden rounded-3xl border border-line">
              <div className="grid grid-cols-12 gap-2 bg-blue-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Target Qty</div>
                <div className="col-span-5">Discount %</div>
                <div className="col-span-1" />
              </div>
              <div className="divide-y divide-[var(--line)] bg-white">
                {tiers.map((tier, index) => (
                  <div key={tier.id} className="grid grid-cols-12 gap-2 px-4 py-3">
                    <div className="col-span-1 flex items-center justify-center text-sm font-semibold text-slate-500">{index + 1}</div>
                    <div className="col-span-5">
                      <input
                        value={tier.quantity}
                        onChange={(event) => updateTier(index, "quantity", event.target.value)}
                        className={getInputClass(false)}
                        inputMode="numeric"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        value={tier.discount}
                        onChange={(event) => updateTier(index, "discount", event.target.value)}
                        className={getInputClass(false)}
                        inputMode="numeric"
                        placeholder="%"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {tiers.length > 1 ? (
                        <button type="button" onClick={() => removeTier(index)} className="text-sm font-bold text-rose-600">
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-lg font-bold text-brand">Timeline</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Date</label>
                <input name="startDate" value={form.startDate} onChange={handleInputChange} type="date" className={getInputClass(!!errors.startDate)} />
                {errors.startDate ? <p className="mt-1 text-xs text-rose-600">{errors.startDate}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">End Date</label>
                <input name="endDate" value={form.endDate} onChange={handleInputChange} type="date" className={getInputClass(!!errors.endDate)} />
                {errors.endDate ? <p className="mt-1 text-xs text-rose-600">{errors.endDate}</p> : null}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-lg font-bold text-brand">Description & Terms</h2>
            </div>
            <div className="grid gap-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
                <textarea name="description" value={form.description} onChange={handleInputChange} rows={4} className={`${getInputClass(!!errors.description)} resize-none`} />
                {errors.description ? <p className="mt-1 text-xs text-rose-600">{errors.description}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Terms & Conditions</label>
                <textarea name="terms" value={form.terms} onChange={handleInputChange} rows={3} className={`${getInputClass(false)} resize-none`} />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-line bg-white p-6">
            <h4 className="flex items-center gap-2 border-b border-line pb-2 text-sm font-bold uppercase tracking-wide text-slate-900">
              <ImageIcon size={16} className="text-brand" /> Gallery
            </h4>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                errors.images ? "border-rose-300 bg-rose-50" : "border-line hover:bg-slate-50"
              }`}
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${errors.images ? "bg-rose-100 text-rose-500" : "bg-brand-soft text-brand"}`}>
                <Upload size={24} />
              </div>
              <p className={`text-sm font-medium ${errors.images ? "text-rose-600" : "text-slate-900"}`}>
                {errors.images ? errors.images : "Click to upload images"}
              </p>
            </div>
            {previews.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((preview, index) => (
                  <div key={preview} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-line">
                    <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {message ? <div className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand">{message}</div> : null}
          {globalError ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{globalError}</div> : null}

          <div className="flex flex-wrap items-center justify-end gap-3 border-line pt-5">
            <button type="button" onClick={() => router.push("/deals")} className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={submitting || loadingVendors} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-white disabled:opacity-70">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? "Creating..." : "Submit Deal"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
