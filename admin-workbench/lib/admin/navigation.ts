import {
  LayoutDashboard,
  Store,
  Tags,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import type { NavItem } from "@/lib/admin/types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", group: "Workspace", icon: LayoutDashboard },
  { label: "Deals", href: "/deals", group: "Workspace", icon: Tags },
  { label: "Vendors", href: "/vendors", group: "Workspace", icon: Store },
  { label: "Customers", href: "/customers", group: "Workspace", icon: Users },
  { label: "Payments", href: "/payments", group: "Workspace", icon: WalletCards },
  // { label: "Analytics", href: "/analytics", group: "Workspace", icon: ChartColumnIncreasing },
  { label: "Profile", href: "/profile", group: "Account", icon: UserRound },
];
