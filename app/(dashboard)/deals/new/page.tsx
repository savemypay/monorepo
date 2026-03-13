"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { PageHeader } from "@/components/admin/PageHeader";

type DiscountTier = {
  quantity: string;
  discount: string;
};

type FormState = {
  vendor: string;
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
  vendor: "",
  title: "",
  productName: "",
  originalPrice: "",
  category: "Automotive",
  minBuyers: "",
  description: "",
  terms: "",
  startDate: "",
  endDate: "",
  tokenAmount: "",
};

const CATEGORY_OPTIONS = ["Automotive", "Real Estate", "Electronics", "Insurance", "Travel"];

export default function NewDealPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [tiers, setTiers] = useState<DiscountTier[]>([{ quantity: "", discount: "" }]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("This form now matches the vendor portal field structure. Submit wiring can be added next.");

  const totalTierQuantity = useMemo(
    () => tiers.reduce((sum, tier) => sum + Number(tier.quantity || 0), 0),
    [tiers]
  );

  const sanitizeNumeric = (value: string) => value.replace(/\D+/g, "");

  const getInputClass = (hasError: boolean) =>
    `w-full rounded-2xl border px-4 py-3 outline-none transition ${
      hasError
        ? "border-rose-300 bg-rose-50 text-rose-900 placeholder:text-rose-300"
        : "border-line bg-white focus:border-brand"
    }`;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const numericFields: Array<keyof FormState> = ["originalPrice", "tokenAmount", "minBuyers"];
    const nextValue = numericFields.includes(name as keyof FormState) ? sanitizeNumeric(value) : value;

    setForm((current) => ({ ...current, [name]: nextValue }));

    if (name === "minBuyers") {
      setTiers([{ quantity: nextValue, discount: "" }]);
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

    setTiers((current) => [...current, { quantity: "", discount: "" }]);
  };

  const removeTier = (index: number) => {
    setTiers((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateTier = (index: number, field: keyof DiscountTier, value: string) => {
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
    if (!fileList) return;

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

    if (!form.vendor.trim()) nextErrors.vendor = "Vendor selection is required";
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      setMessage("Resolve the highlighted validation errors before submitting.");
      return;
    }

    setMessage("Deal structure validated. The next step is wiring this admin form to the create-deal API.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deal Creation"
        title="Create Deal"
        description="This admin form now mirrors the vendor portal deal structure, with an added vendor selector for admin-created or admin-assisted deals."
      />

      <form className="admin-panel p-6" onSubmit={handleSubmit}>
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-lg font-bold text-brand">Basic Details</h2>
              <p className="mt-1 text-sm text-muted">Match vendor deal creation fields and capture ownership up front.</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Vendor</label>
                <input name="vendor" value={form.vendor} onChange={handleInputChange} className={getInputClass(!!errors.vendor)} placeholder="Select or enter vendor name" />
                {errors.vendor ? <p className="mt-1 text-xs text-rose-600">{errors.vendor}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category</label>
                <select name="category" value={form.category} onChange={handleInputChange} className={getInputClass(false)}>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option}>{option}</option>
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
              <div className="grid grid-cols-12 gap-2 bg-panel-strong px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Target Qty</div>
                <div className="col-span-5">Discount %</div>
                <div className="col-span-1" />
              </div>
              <div className="divide-y divide-[var(--line)] bg-white">
                {tiers.map((tier, index) => (
                  <div key={`${index}-${tier.quantity}-${tier.discount}`} className="grid grid-cols-12 gap-2 px-4 py-3">
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
                <textarea name="description" value={form.description} onChange={handleInputChange} rows={4} className={getInputClass(!!errors.description)} />
                {errors.description ? <p className="mt-1 text-xs text-rose-600">{errors.description}</p> : null}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Terms & Conditions</label>
                <textarea name="terms" value={form.terms} onChange={handleInputChange} rows={3} className={getInputClass(false)} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-lg font-bold text-brand">Gallery</h2>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-3xl border-2 border-dashed px-6 py-10 text-center transition ${
                errors.images ? "border-rose-300 bg-rose-50" : "border-line bg-panel-strong hover:bg-white"
              }`}
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              <p className="text-sm font-semibold text-slate-800">{errors.images ? errors.images : "Click to upload product images"}</p>
            </div>

            {previews.length ? (
              <div className="flex flex-wrap gap-3">
                {previews.map((preview, index) => (
                  <div key={preview} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-line">
                    <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-x-2 bottom-2 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <div className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand">{message}</div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
            <button type="button" className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-slate-800">
              Cancel
            </button>
            <button type="submit" className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white">
              Submit Deal
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
