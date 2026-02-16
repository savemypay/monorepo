"use client";

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { X, Plus, Trash2, Upload, Image as ImageIcon, Calendar, Layers, Loader2, AlertCircle } from 'lucide-react';
import { useVendorStore } from '@/lib/store/authStore';
import { createDeal } from '@/lib/api/deals';
import Image from 'next/image';

// --- Interfaces ---
interface CreatePoolModalProps {
  onClose: () => void;
}

interface DiscountTier {
  quantity: string;
  discount: string;
}

interface FormState {
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
}

interface FormErrors {
  title?: string;
  productName?: string;
  originalPrice?: string;
  minBuyers?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  images?: string;
  tiers?: string;
  tokenAmount?: string;
}

export default function CreatePoolModal({ onClose }: CreatePoolModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: '',
    productName: '',
    originalPrice: '',
    category: 'Automotive',
    minBuyers: '',
    description: '',
    terms: '',
    startDate: '',
    endDate: '',
    tokenAmount: ''
  });

  const [tiers, setTiers] = useState<DiscountTier[]>([{ quantity: '', discount: '' }]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const vendorId = useVendorStore(state => state.vendor?.id);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!form.title.trim()) newErrors.title = "Offer Title is required";
    if (!form.productName.trim()) newErrors.productName = "Product Name is required";
    if (!form.description.trim()) newErrors.description = "Description is required";

    const price = Number(form.originalPrice);
    const token = Number(form.tokenAmount);

    if (!form.originalPrice || price <= 0) {
      newErrors.originalPrice = "Price must be greater than 0";
    }

    if (!form.tokenAmount || token <= 0) {
      newErrors.tokenAmount = "Token amount is required";
    } else if (token > price) {
      // Requirement 1: Token amount cannot exceed original price
      newErrors.tokenAmount = "Token amount cannot be greater than original price";
    }

    if (!form.minBuyers || Number(form.minBuyers) <= 0) {
      newErrors.minBuyers = "Min Buyers must be at least 1";
    }

    if (!form.startDate) newErrors.startDate = "Start Date is required";
    if (!form.endDate) newErrors.endDate = "End Date is required";

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (start < now) newErrors.startDate = "Start Date cannot be in the past";
      if (end <= start) newErrors.endDate = "End Date must be after Start Date";
    }

    if (images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    // Requirement 3 & 5: Tier Math Validation
    const totalTierQty = tiers.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    const requiredQty = Number(form.minBuyers);

    const invalidTierField = tiers.find(t => !t.quantity || Number(t.quantity) <= 0 || !t.discount || Number(t.discount) <= 0);

    if (invalidTierField) {
      newErrors.tiers = "All discount tiers must have valid values";
    } else if (totalTierQty !== requiredQty) {
      newErrors.tiers = `The sum of tier quantities (${totalTierQty}) must equal Total Qty (${requiredQty})`;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) isValid = false;
    return isValid;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Requirement 2: Reset tiers when minBuyers changes
    if (name === 'minBuyers') {
      setTiers([{ quantity: value, discount: '' }]);
    }

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const addTier = () => {
    const totalTierQty = tiers.reduce((sum, t) => sum + Number(t.quantity || 0), 0);
    const requiredQty = Number(form.minBuyers);

    // Requirement 4: Show error if no "space" left to add a tier
    if (totalTierQty >= requiredQty) {
      setErrors(prev => ({ ...prev, tiers: "Reduce existing tier quantities before adding a new one." }));
      return;
    }
    setTiers([...tiers, { quantity: '', discount: '' }]);
  };

  const removeTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index));

  const updateTier = (index: number, field: keyof DiscountTier, value: string) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
    if (errors.tiers) setErrors(prev => ({ ...prev, tiers: undefined }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newFiles.map(file => URL.createObjectURL(file))]);
      if (errors.images) setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setGlobalError(null);

    if (!validateForm()) {
      const firstError = document.querySelector('.border-red-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsLoading(true);

    try {
      if (!vendorId) {
        throw new Error("Vendor not found. Please login again.");
      }

      const imageStrings = await Promise.all(images.map(file => fileToBase64(file)));

      const formattedTiers = tiers.map((tier, index) => ({
        seq: index + 1,
        qty: Number(tier.quantity),
        discount_pct: Number(tier.discount),
        label: `Tier ${index + 1}`
      }));

      const payload = {
        title: form.title,
        product_name: form.productName,
        category: form.category,
        original_price: Number(form.originalPrice),
        total_qty: Number(form.minBuyers),
        tiers: formattedTiers,
        images: imageStrings,
        description: form.description,
        terms: form.terms,
        valid_from: new Date(form.startDate).toISOString(),
        valid_to: new Date(form.endDate).toISOString(),
        vendor_id: vendorId,
        token_amount: Number(form.tokenAmount)
      };

      await createDeal(payload);
      onClose();

    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (hasError: boolean) =>
    `w-full border rounded-xl px-4 py-2.5 outline-none transition-all ${
      hasError
        ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-red-200'
        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
    }`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
          <div>
            <h3 className="font-bold text-xl text-gray-900">Create Group Deal</h3>
            <p className="text-sm text-gray-500 mt-0.5">Define your bulk offer parameters</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {globalError && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} /> {globalError}
            </div>
          )}

          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
              <Layers size={16} className="text-blue-600" /> Basic Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer Title <span className="text-red-500">*</span></label>
                <input name="title" value={form.title} onChange={handleInputChange} type="text" className={getInputClass(!!errors.title)} placeholder="e.g. Bulk purchase offer" />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                <input name="productName" value={form.productName} onChange={handleInputChange} type="text" className={getInputClass(!!errors.productName)} placeholder="e.g. 2024 Tesla Model Y" />
                {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select name="category" value={form.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-blue-500 transition-all">
                  <option>Automotive</option>
                  <option>Real Estate</option>
                  <option>Electronics</option>
                  <option>Insurance</option>
                  <option>Travel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input min={0} name="originalPrice" value={form.originalPrice} onChange={handleInputChange} type="number" className={`${getInputClass(!!errors.originalPrice)} pl-8`} placeholder="50000" />
                </div>
                {errors.originalPrice && <p className="text-xs text-red-500 mt-1">{errors.originalPrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Token Amount <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input min={0} name="tokenAmount" value={form.tokenAmount} onChange={handleInputChange} type="number" className={`${getInputClass(!!errors.tokenAmount)} pl-8`} placeholder="5000" />
                </div>
                {errors.tokenAmount && <p className="text-xs text-red-500 mt-1">{errors.tokenAmount}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Total Qty (Min Buyers) <span className="text-red-500">*</span></label>
                <input min={0} name="minBuyers" value={form.minBuyers} onChange={handleInputChange} type="number" className={getInputClass(!!errors.minBuyers)} placeholder="10" />
                {errors.minBuyers && <p className="text-xs text-red-500 mt-1">{errors.minBuyers}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                <Layers size={16} className="text-blue-600" /> Discount Tiers
              </h4>
              <button onClick={addTier} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                <Plus size={14} /> Add Tier
              </button>
            </div>
            {errors.tiers && <div className="bg-red-50 text-red-600 text-xs p-2 rounded mb-2 border border-red-100">{errors.tiers}</div>}
            <div className={`bg-blue-50/50 rounded-xl border overflow-hidden ${errors.tiers ? 'border-red-300' : 'border-blue-100'}`}>
               <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-blue-100/50 text-xs font-bold text-blue-800 uppercase">
                 <div className="col-span-1 text-center">#</div>
                 <div className="col-span-5">Target Qty</div>
                 <div className="col-span-5">Discount %</div>
                 <div className="col-span-1"></div>
               </div>
               <div className="divide-y divide-blue-100">
                 {tiers.map((tier, index) => (
                   <div key={index} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-white transition-colors">
                     <div className="col-span-1 text-center text-gray-500 text-sm">{index + 1}</div>
                     <div className="col-span-5">
                       <input min={0} type="number" value={tier.quantity} onChange={(e) => updateTier(index, 'quantity', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" placeholder="Qty" />
                     </div>
                     <div className="col-span-5">
                       <input min={0} type="number" value={tier.discount} onChange={(e) => updateTier(index, 'discount', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" placeholder="%" />
                     </div>
                     <div className="col-span-1 flex justify-center">
                       {tiers.length > 1 && <button onClick={() => removeTier(index)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
              <Calendar size={16} className="text-blue-600" /> Timeline <span className="text-red-500">*</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                <input name="startDate" value={form.startDate} onChange={handleInputChange} type="datetime-local" className={getInputClass(!!errors.startDate)} />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                <input name="endDate" value={form.endDate} onChange={handleInputChange} type="datetime-local" className={getInputClass(!!errors.endDate)} />
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-4">
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea name="description" value={form.description} onChange={handleInputChange} rows={3} className={`${getInputClass(!!errors.description)} resize-none`} />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Terms & Conditions</label>
                  <textarea name="terms" value={form.terms} onChange={handleInputChange} rows={2} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 resize-none" />
               </div>
             </div>
          </section>

          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
              <ImageIcon size={16} className="text-blue-600" /> Gallery <span className="text-red-500">*</span>
            </h4>
            <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}>
               <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
               <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${errors.images ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                 <Upload size={24} />
               </div>
               <p className={`text-sm font-medium ${errors.images ? 'text-red-600' : 'text-gray-900'}`}>{errors.images ? errors.images : 'Click to upload images'}</p>
            </div>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {previews.map((src, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                    <Image src={src} alt="Preview" fill className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); removeImage(index); }} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? 'Creating...' : 'Submit Deal'}
          </button>
        </div>
      </div>
    </div>
  );
}
