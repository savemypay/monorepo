// 1. Define API Types
export interface Tier {
    id: number;
    qty: number;
    discount_pct: number;
    label: string;
  }
  
  export interface Deal {
    id: number;
    title: string;
    product_name: string;
    category: string;
    slots_sold: number;
    total_qty: number;
    status: string; // 'draft', 'active', etc.
    valid_to: string; // ISO Date string
    tiers: Tier[];
    token_amount:number;
    original_price:number;
    description:string;
    terms:string;
    vendor_id:number;
    slots_remaining:number;
    valid_from:string;
  }
  
  // 2. Helper: Calculate Time Left
  export const getTimeLeft = (dateString: string): string => {
    const diff = new Date(dateString).getTime() - new Date().getTime();
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
    if (days > 0) return `${days} Days left`;
    return `${hours} Hours left`;
  };
  
  // 3. Helper: Get Max Discount
  export const getMaxDiscount = (tiers: Tier[]): string => {
    if (!tiers || tiers.length === 0) return '0%';
    const max = Math.max(...tiers.map(t => t.discount_pct));
    return `${max}%`;
  };