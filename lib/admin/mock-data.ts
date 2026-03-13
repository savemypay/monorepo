import type {
  AnalyticsPoint,
  AuditRecord,
  CustomerRecord,
  DashboardMetric,
  DealRecord,
  PaymentRecord,
  TrendRange,
  VendorRecord,
} from "@/lib/admin/types";

export const overviewMetrics: DashboardMetric[] = [
  { label: "Live Deals", value: "42", change: "+6 vs last week", tone: "positive" },
  { label: "Pending Approval", value: "11", change: "3 beyond SLA", tone: "warning" },
  { label: "Collections Today", value: "Rs 3.8L", change: "+12.4% vs yesterday", tone: "positive" },
  { label: "Active Vendors", value: "27", change: "4 high-performing this week", tone: "positive" },
  { label: "New Customers", value: "186", change: "+9.1% WoW", tone: "positive" },
  { label: "Failed Payments", value: "18", change: "Needs finance review", tone: "warning" },
];

export const approvalQueue = [
  {
    title: "Bulk Office Chair Program",
    vendor: "WorkNest Furnishings",
    age: "19 hours waiting",
    note: "High-value B2B inventory with missing warranty terms.",
  },
  {
    title: "Festival Grocery Combo",
    vendor: "Metro Fresh Wholesale",
    age: "7 hours waiting",
    note: "Strong demand forecast. Tier pricing looks healthy.",
  },
  {
    title: "Smart TV Weekend Drop",
    vendor: "PixelCart Electronics",
    age: "31 hours waiting",
    note: "Image set incomplete and payout assumptions need review.",
  },
];

export const deals: DealRecord[] = [
  {
    id: "DL-2401",
    title: "iPhone 15 Corporate Bulk Pool",
    vendor: "Nova Mobiles",
    category: "Electronics",
    status: "Pending Review",
    interested: 186,
    paid: 41,
    revenue: 615000,
    createdAt: "2026-03-09",
    validTo: "2026-03-20",
  },
  {
    id: "DL-2398",
    title: "Premium Grocery Basket",
    vendor: "Metro Fresh Wholesale",
    category: "Groceries",
    status: "Live",
    interested: 532,
    paid: 214,
    revenue: 428000,
    createdAt: "2026-03-03",
    validTo: "2026-03-16",
  },
  {
    id: "DL-2393",
    title: "Air Conditioner Summer Launch",
    vendor: "CoolHub Appliances",
    category: "Home Appliances",
    status: "Needs Changes",
    interested: 89,
    paid: 0,
    revenue: 0,
    createdAt: "2026-03-08",
    validTo: "2026-03-24",
  },
  {
    id: "DL-2382",
    title: "SUV Service Package",
    vendor: "DriveSure Auto",
    category: "Automotive",
    status: "Closed",
    interested: 241,
    paid: 109,
    revenue: 305000,
    createdAt: "2026-02-18",
    validTo: "2026-03-01",
  },
  {
    id: "DL-2375",
    title: "Wedding Gold Savings Pool",
    vendor: "Mahalaxmi Jewels",
    category: "Jewellery",
    status: "Paused",
    interested: 144,
    paid: 19,
    revenue: 87000,
    createdAt: "2026-03-01",
    validTo: "2026-03-25",
  },
  {
    id: "DL-2369",
    title: "Dell Latitude Startup Deal",
    vendor: "ByteSquare Tech",
    category: "Electronics",
    status: "Approved",
    interested: 73,
    paid: 0,
    revenue: 0,
    createdAt: "2026-03-10",
    validTo: "2026-03-29",
  },
];

export const vendors: VendorRecord[] = [
  {
    id: "VN-104",
    businessName: "Nova Mobiles",
    ownerName: "Rakesh Menon",
    category: "Electronics",
    status: "Active",
    activeDeals: 6,
    revenue: 1650000,
    complaints: 2,
  },
  {
    id: "VN-088",
    businessName: "Metro Fresh Wholesale",
    ownerName: "Anita Joseph",
    category: "Groceries",
    status: "Active",
    activeDeals: 4,
    revenue: 940000,
    complaints: 1,
  },
  {
    id: "VN-117",
    businessName: "CoolHub Appliances",
    ownerName: "Dhanush Rao",
    category: "Home Appliances",
    status: "Under Review",
    activeDeals: 2,
    revenue: 312000,
    complaints: 5,
  },
  {
    id: "VN-073",
    businessName: "Mahalaxmi Jewels",
    ownerName: "Karthik Balan",
    category: "Jewellery",
    status: "Suspended",
    activeDeals: 0,
    revenue: 510000,
    complaints: 8,
  },
];

export const customers: CustomerRecord[] = [
  {
    id: "CU-5601",
    name: "Pavithra Nair",
    email: "pavithra.nair@example.com",
    phone: "+91 98765 12340",
    orders: 9,
    spend: 68400,
    rewards: 2380,
    status: "Healthy",
  },
  {
    id: "CU-5488",
    name: "Akhil Dev",
    email: "akhil.dev@example.com",
    phone: "+91 98220 44771",
    orders: 3,
    spend: 18800,
    rewards: 640,
    status: "Healthy",
  },
  {
    id: "CU-5479",
    name: "Megha Raj",
    email: "megha.raj@example.com",
    phone: "+91 98950 21188",
    orders: 12,
    spend: 101500,
    rewards: 3860,
    status: "Flagged",
  },
  {
    id: "CU-5411",
    name: "Sathish Kumar",
    email: "sathish.kumar@example.com",
    phone: "+91 99610 00431",
    orders: 5,
    spend: 27100,
    rewards: 910,
    status: "Healthy",
  },
];

export const payments: PaymentRecord[] = [
  {
    id: "PY-94012",
    dealId: "DL-2398",
    customer: "Pavithra Nair",
    vendor: "Metro Fresh Wholesale",
    amount: 12999,
    status: "Success",
    createdAt: "2026-03-10 09:22",
  },
  {
    id: "PY-94003",
    dealId: "DL-2401",
    customer: "Megha Raj",
    vendor: "Nova Mobiles",
    amount: 4999,
    status: "Pending",
    createdAt: "2026-03-10 08:48",
  },
  {
    id: "PY-93978",
    dealId: "DL-2375",
    customer: "Akhil Dev",
    vendor: "Mahalaxmi Jewels",
    amount: 2500,
    status: "Refunded",
    createdAt: "2026-03-09 19:16",
  },
  {
    id: "PY-93944",
    dealId: "DL-2393",
    customer: "Sathish Kumar",
    vendor: "CoolHub Appliances",
    amount: 3999,
    status: "Failed",
    createdAt: "2026-03-09 14:02",
  },
];

export const auditLogs: AuditRecord[] = [
  {
    id: "AU-3012",
    actor: "Siva Narayan",
    action: "Approved deal",
    entity: "DL-2369",
    summary: "Approved Dell Latitude Startup Deal for scheduling.",
    createdAt: "2026-03-10 10:14",
  },
  {
    id: "AU-3008",
    actor: "Finance Admin",
    action: "Marked refund complete",
    entity: "PY-93978",
    summary: "Refunded customer after paused jewellery campaign.",
    createdAt: "2026-03-10 08:35",
  },
  {
    id: "AU-2999",
    actor: "Operations Admin",
    action: "Requested changes",
    entity: "DL-2393",
    summary: "Missing warranty copy and stock proof.",
    createdAt: "2026-03-09 18:21",
  },
];

export const funnelPoints: AnalyticsPoint[] = [
  { label: "Views", value: 12400 },
  { label: "Interest", value: 3210 },
  { label: "Started Payment", value: 1498 },
  { label: "Successful Payment", value: 1104 },
];

export const categoryPerformance: AnalyticsPoint[] = [
  { label: "Electronics", value: 38 },
  { label: "Groceries", value: 24 },
  { label: "Automotive", value: 17 },
  { label: "Jewellery", value: 12 },
];

export const weeklyRevenueTrend: AnalyticsPoint[] = [
  { label: "Mon", value: 220000 },
  { label: "Tue", value: 264000 },
  { label: "Wed", value: 248000 },
  { label: "Thu", value: 312000 },
  { label: "Fri", value: 356000 },
  { label: "Sat", value: 402000 },
  { label: "Sun", value: 378000 },
];

export const overviewTrendRangeOptions: Array<{ label: string; value: TrendRange }> = [
  { label: "Last Week", value: "last_week" },
  { label: "1 Month", value: "one_month" },
  { label: "3 Months", value: "three_months" },
  { label: "Last Year", value: "last_year" },
];

export const revenueTrendByRange: Record<TrendRange, AnalyticsPoint[]> = {
  last_week: weeklyRevenueTrend,
  one_month: [
    { label: "Week 1", value: 1280000 },
    { label: "Week 2", value: 1420000 },
    { label: "Week 3", value: 1510000 },
    { label: "Week 4", value: 1670000 },
  ],
  three_months: [
    { label: "Jan", value: 5120000 },
    { label: "Feb", value: 5480000 },
    { label: "Mar", value: 6110000 },
  ],
  last_year: [
    { label: "Apr", value: 3100000 },
    { label: "Jun", value: 3560000 },
    { label: "Aug", value: 4020000 },
    { label: "Oct", value: 4680000 },
    { label: "Dec", value: 5210000 },
    { label: "Feb", value: 5750000 },
  ],
};

export const customerTrendByRange: Record<TrendRange, AnalyticsPoint[]> = {
  last_week: [
    { label: "Mon", value: 94 },
    { label: "Tue", value: 108 },
    { label: "Wed", value: 116 },
    { label: "Thu", value: 132 },
    { label: "Fri", value: 144 },
    { label: "Sat", value: 171 },
    { label: "Sun", value: 159 },
  ],
  one_month: [
    { label: "Week 1", value: 488 },
    { label: "Week 2", value: 532 },
    { label: "Week 3", value: 574 },
    { label: "Week 4", value: 629 },
  ],
  three_months: [
    { label: "Jan", value: 1820 },
    { label: "Feb", value: 2110 },
    { label: "Mar", value: 2385 },
  ],
  last_year: [
    { label: "Apr", value: 980 },
    { label: "Jun", value: 1160 },
    { label: "Aug", value: 1340 },
    { label: "Oct", value: 1525 },
    { label: "Dec", value: 1780 },
    { label: "Feb", value: 2210 },
  ],
};

export const vendorTrendByRange: Record<TrendRange, AnalyticsPoint[]> = {
  last_week: [
    { label: "Mon", value: 18 },
    { label: "Tue", value: 19 },
    { label: "Wed", value: 21 },
    { label: "Thu", value: 23 },
    { label: "Fri", value: 24 },
    { label: "Sat", value: 27 },
    { label: "Sun", value: 27 },
  ],
  one_month: [
    { label: "Week 1", value: 22 },
    { label: "Week 2", value: 23 },
    { label: "Week 3", value: 25 },
    { label: "Week 4", value: 27 },
  ],
  three_months: [
    { label: "Jan", value: 19 },
    { label: "Feb", value: 23 },
    { label: "Mar", value: 27 },
  ],
  last_year: [
    { label: "Apr", value: 9 },
    { label: "Jun", value: 12 },
    { label: "Aug", value: 15 },
    { label: "Oct", value: 18 },
    { label: "Dec", value: 22 },
    { label: "Feb", value: 26 },
  ],
};

export const dealStatusDistribution: AnalyticsPoint[] = [
  { label: "Live", value: 42 },
  { label: "Pending", value: 11 },
  { label: "Approved", value: 8 },
  { label: "Paused", value: 4 },
  { label: "Closed", value: 19 },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
