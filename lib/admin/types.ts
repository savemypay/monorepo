import type { LucideIcon } from "lucide-react";

export type AdminRole =
  | "Admin"
  | "Super Admin"
  | "Operations Admin"
  | "Finance Admin"
  | "Support Admin"
  | "Growth Admin";

export type NavItem = {
  label: string;
  href: string;
  group: "Workspace" | "Account";
  icon: LucideIcon;
};

export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
  tone: "neutral" | "positive" | "warning";
};

export type DealStatus =
  | "Pending Review"
  | "Needs Changes"
  | "Approved"
  | "Live"
  | "Paused"
  | "Closed"
  | "Rejected";

export type DealRecord = {
  id: string;
  title: string;
  vendor: string;
  category: string;
  status: DealStatus;
  interested: number;
  paid: number;
  revenue: number;
  createdAt: string;
  validTo: string;
};

export type VendorRecord = {
  id: string;
  businessName: string;
  ownerName: string;
  category: string;
  status: "Active" | "Under Review" | "Suspended";
  activeDeals: number;
  revenue: number;
  complaints: number;
};

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spend: number;
  rewards: number;
  status: "Healthy" | "Flagged";
};

export type PaymentRecord = {
  id: string;
  dealId: string;
  customer: string;
  vendor: string;
  amount: number;
  status: "Success" | "Pending" | "Failed" | "Refunded";
  createdAt: string;
};

export type AuditRecord = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  summary: string;
  createdAt: string;
};

export type AnalyticsPoint = {
  label: string;
  value: number;
};

export type TrendRange = "last_week" | "one_month" | "three_months" | "last_year";
