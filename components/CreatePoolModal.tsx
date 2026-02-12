"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { X, Plus, Trash2, Upload, Image as ImageIcon, Calendar, DollarSign, Layers, Loader2, AlertCircle } from 'lucide-react';

const access_token =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwidmVuZG9yX2lkIjoiMyIsInVzZXJfaWQiOiIzIiwiZXhwIjoxNzcxMDc0MTgyLCJlbWFpbCI6InVzZXJ2dnZAZXhhbXBsZS5jb20iLCJwaG9uZV9udW1iZXIiOiJzdHJpbmciLCJyb2xlIjoidmVuZG9yIn0.utyFBy6eZb_FAQX_HzTalD3C83HrwdfCpapFv3Lg0_4"

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
  tokenAmount:string;
}

// Validation Error State Interface
interface FormErrors {
  title?: string;
  productName?: string;
  originalPrice?: string;
  minBuyers?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  images?: string;
  tiers?: string; // General error for tiers
  tokenAmount?:string;
}

export default function CreatePoolModal({ onClose }: CreatePoolModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State ---
  const [isLoading, setIsLoading] = useState(false);
  
  // Specific Field Errors
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Global Error (API failures)
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form Data
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
    tokenAmount:''
  });

  const [tiers, setTiers] = useState<DiscountTier[]>([{ quantity: '', discount: '' }]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // --- Helpers ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- Validation Logic ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 1. Required Text Fields
    if (!form.title.trim()) newErrors.title = "Offer Title is required";
    if (!form.productName.trim()) newErrors.productName = "Product Name is required";
    if (!form.description.trim()) newErrors.description = "Description is required";

    // 2. Numeric Validation
    if (!form.originalPrice || Number(form.originalPrice) <= 0) {
      newErrors.originalPrice = "Price must be greater than 0";
    }
    if (!form.tokenAmount || Number(form.tokenAmount) <= 0) {
      newErrors.tokenAmount = "Price must be greater than 0";
    }
    if (!form.minBuyers || Number(form.minBuyers) <= 0) {
      newErrors.minBuyers = "Min Buyers must be at least 1";
    }

    // 3. Date Validation
    if (!form.startDate) newErrors.startDate = "Start Date is required";
    if (!form.endDate) newErrors.endDate = "End Date is required";
    
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      const now = new Date();

      if (start < now) newErrors.startDate = "Start Date cannot be in the past";
      if (end <= start) newErrors.endDate = "End Date must be after Start Date";
    }

    // 4. Image Validation
    if (images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    // 5. Tier Validation
    const invalidTier = tiers.find(t => !t.quantity || Number(t.quantity) <= 0 || !t.discount || Number(t.discount) <= 0);
    if (invalidTier) {
      newErrors.tiers = "All discount tiers must have valid Quantity and Discount %";
    }

    setErrors(newErrors);
    
    // If we have keys in newErrors, form is invalid
    if (Object.keys(newErrors).length > 0) isValid = false;
    
    return isValid;
  };

  // --- Handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field as user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const addTier = () => setTiers([...tiers, { quantity: '', discount: '' }]);
  const removeTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index));

  const updateTier = (index: number, field: keyof DiscountTier, value: string) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
    // Clear tier error if it exists
    if (errors.tiers) setErrors(prev => ({ ...prev, tiers: undefined }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newFiles.map(file => URL.createObjectURL(file))]);
      // Clear image error
      if (errors.images) setErrors(prev => ({ ...prev, images: undefined }));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    setGlobalError(null);

    // 1. Run Validation
    if (!validateForm()) {
      // Scroll to top to see errors if needed
      const firstError = document.querySelector('.border-red-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsLoading(true);

    try {
      // 2. Prepare Data
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
        vendor_id: 1,
        token_amount:form.tokenAmount
      };

      console.log("Submitting:", payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/ads`, {
        method: 'POST',
        headers: 
          { 'Content-Type': 'application/json',
            'authorization': `BEARER ${access_token}`
          },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to create deal. Please try again.");
      }

      onClose();

    } catch (err: unknown) {
      console.error(err);
      setGlobalError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for Error Styling
  const getInputClass = (hasError: boolean) => 
    `w-full border rounded-xl px-4 py-2.5 outline-none transition-all ${
      hasError 
        ? 'border-red-500 bg-red-50 text-red-900 placeholder-red-300 focus:ring-red-200' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
    }`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
          <div>
            <h3 className="font-bold text-xl text-gray-900">Create Group Deal</h3>
            <p className="text-sm text-gray-500 mt-0.5">Define your bulk offer parameters</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Global API Error */}
          {globalError && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} /> {globalError}
            </div>
          )}

          {/* Section 1: Basic Details */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
              <Layers size={16} className="text-blue-600" /> Basic Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Offer Title <span className="text-red-500">*</span></label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleInputChange} 
                  type="text" 
                  className={getInputClass(!!errors.title)}
                  placeholder="e.g. Bulk purchase offer - Model Y" 
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                <input 
                  name="productName" 
                  value={form.productName} 
                  onChange={handleInputChange} 
                  type="text" 
                  className={getInputClass(!!errors.productName)}
                  placeholder="e.g. 2024 Tesla Model Y" 
                />
                {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-blue-500 transition-all"
                >
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    name="originalPrice" 
                    value={form.originalPrice} 
                    onChange={handleInputChange} 
                    type="number" 
                    className={`${getInputClass(!!errors.originalPrice)} pl-8`}
                    placeholder="50000" 
                  />
                </div>
                {errors.originalPrice && <p className="text-xs text-red-500 mt-1">{errors.originalPrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Token Amount<span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input 
                    name="originalPrice" 
                    value={form.tokenAmount} 
                    onChange={handleInputChange} 
                    type="number" 
                    className={`${getInputClass(!!errors.tokenAmount)} pl-8`}
                    placeholder="5000" 
                  />
                </div>
                {errors.tokenAmount && <p className="text-xs text-red-500 mt-1">{errors.tokenAmount}</p>}
              </div>
            </div>
          </section>

          {/* Section 2: Constraints */}
          <section className="space-y-4">
             <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
              <DollarSign size={16} className="text-blue-600" /> Deal Rules
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Total Qty (Min Buyers) <span className="text-red-500">*</span></label>
                <input 
                  name="minBuyers" 
                  value={form.minBuyers} 
                  onChange={handleInputChange} 
                  type="number" 
                  className={getInputClass(!!errors.minBuyers)} 
                  placeholder="10" 
                />
                {errors.minBuyers && <p className="text-xs text-red-500 mt-1">{errors.minBuyers}</p>}
              </div>
            </div>
          </section>

          {/* Section 3: Tiers */}
          <section className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                <Layers size={16} className="text-blue-600" /> Discount Tiers
              </h4>
              <button onClick={addTier} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                <Plus size={14} /> Add Tier
              </button>
            </div>

            {errors.tiers && (
              <div className="bg-red-50 text-red-600 text-xs p-2 rounded mb-2 border border-red-100">
                {errors.tiers}
              </div>
            )}

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
                       <input 
                        type="number" 
                        value={tier.quantity} 
                        onChange={(e) => updateTier(index, 'quantity', e.target.value)} 
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" 
                        placeholder="Qty" 
                       />
                     </div>
                     <div className="col-span-5">
                       <input 
                        type="number" 
                        value={tier.discount} 
                        onChange={(e) => updateTier(index, 'discount', e.target.value)} 
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" 
                        placeholder="%" 
                       />
                     </div>
                     <div className="col-span-1 flex justify-center">
                       {tiers.length > 1 && (
                         <button onClick={() => removeTier(index)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </section>

          {/* Section 4: Timeline */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
              <Calendar size={16} className="text-blue-600" /> Timeline <span className="text-red-500">*</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                <input 
                  name="startDate" 
                  value={form.startDate} 
                  onChange={handleInputChange} 
                  type="datetime-local" 
                  className={getInputClass(!!errors.startDate)} 
                />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                <input 
                  name="endDate" 
                  value={form.endDate} 
                  onChange={handleInputChange} 
                  type="datetime-local" 
                  className={getInputClass(!!errors.endDate)} 
                />
                {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </section>

          {/* Section 5: Text Areas */}
          <section className="space-y-4">
             <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleInputChange} 
                    rows={3} 
                    className={`${getInputClass(!!errors.description)} resize-none`} 
                  />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Terms & Conditions</label>
                  <textarea 
                    name="terms" 
                    value={form.terms} 
                    onChange={handleInputChange} 
                    rows={2} 
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 resize-none" 
                  />
               </div>
             </div>
          </section>

          {/* Section 6: Images */}
          <section className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
              <ImageIcon size={16} className="text-blue-600" /> Gallery <span className="text-red-500">*</span>
            </h4>
            
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${errors.images ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}
            >
               <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
               <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${errors.images ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                 <Upload size={24} />
               </div>
               <p className={`text-sm font-medium ${errors.images ? 'text-red-600' : 'text-gray-900'}`}>
                 {errors.images ? errors.images : 'Click to upload images'}
               </p>
            </div>

            {previews.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {previews.map((src, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); removeImage(index); }} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? 'Creating...' : 'Submit Deal'}
          </button>
        </div>

      </div>
    </div>
  );
}