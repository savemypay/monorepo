export type CustomerAccountSectionSlug =
  | "profile-settings"
  | "my-orders"
  | "my-earnings"
  | "payments"
  | "payment-history"
  | "missing-cashback"
  | "refer-earn"
  | "my-referrals"
  | "help"
  | "review-us"
  | "privacy-policy";

export type CustomerAccountIconKey =
  | "settings"
  | "orders"
  | "earnings"
  | "payments"
  | "history"
  | "ticket"
  | "gift"
  | "users"
  | "help"
  | "star"
  | "shield";

export type CustomerAccountItem = {
  slug: CustomerAccountSectionSlug;
  label: string;
  icon: CustomerAccountIconKey;
};

export type CustomerAccountSection = {
  title: string;
  items: CustomerAccountItem[];
};

export const CUSTOMER_ACCOUNT_SECTIONS: CustomerAccountSection[] = [
  {
    title: "Account",
    items: [
      { slug: "profile-settings", label: "Profile Settings", icon: "settings" },
      { slug: "my-orders", label: "My Orders", icon: "orders" },
    ],
  },
  {
    title: "Cashback & Rewards",
    items: [
      { slug: "my-earnings", label: "My Earnings", icon: "earnings" },
      // { slug: "payments", label: "Payments", icon: "payments" },
      { slug: "payment-history", label: "Payment History", icon: "history" },
      // { slug: "missing-cashback", label: "Missing Cashback", icon: "ticket" },
    ],
  },
  {
    title: "Referrals",
    items: [
      { slug: "refer-earn", label: "Refer & Earn", icon: "gift" },
      { slug: "my-referrals", label: "My Referrals", icon: "users" },
    ],
  },
  {
    title: "Support & Feedback",
    items: [
      { slug: "help", label: "Help", icon: "help" },
      // { slug: "review-us", label: "Review Us", icon: "star" },
      { slug: "privacy-policy", label: "Privacy Policy", icon: "shield" },
    ],
  },
];

export const CUSTOMER_ACCOUNT_ITEMS = CUSTOMER_ACCOUNT_SECTIONS.flatMap((section) => section.items);

export const CUSTOMER_ACCOUNT_SLUGS = CUSTOMER_ACCOUNT_ITEMS.map((item) => item.slug);

export function customerAccountHref(slug: CustomerAccountSectionSlug) {
  return `/customer/${slug}`;
}

export function isCustomerAccountSlug(value: string): value is CustomerAccountSectionSlug {
  return CUSTOMER_ACCOUNT_SLUGS.includes(value as CustomerAccountSectionSlug);
}

export const CUSTOMER_ACCOUNT_META: Record<CustomerAccountSectionSlug, { title: string; description: string }> = {
  "profile-settings": {
    title: "Profile Settings | SaveMyPay",
    description: "Update your account profile details, contact information, and notification preferences.",
  },
  "my-orders": {
    title: "My Orders | SaveMyPay",
    description: "Track all your purchased deals, payment status, and order references in one place.",
  },
  "my-earnings": {
    title: "My Earnings | SaveMyPay",
    description: "Review cashback, rewards, and earnings insights from your SaveMyPay activity.",
  },
  payments: {
    title: "Payments | SaveMyPay",
    description: "View token payment records and transaction values for your active and completed deal purchases.",
  },
  "payment-history": {
    title: "Payment History | SaveMyPay",
    description: "See a complete payment history with statuses, timestamps, and transaction references.",
  },
  "missing-cashback": {
    title: "Missing Cashback | SaveMyPay",
    description: "Raise and monitor missing cashback requests linked to your eligible purchases.",
  },
  "refer-earn": {
    title: "Refer & Earn | SaveMyPay",
    description: "Share your referral code, invite friends, and track referral rewards in your account dashboard.",
  },
  "my-referrals": {
    title: "My Referrals | SaveMyPay",
    description: "Manage your referral list and monitor referral reward progress in one view.",
  },
  help: {
    title: "Help | SaveMyPay",
    description: "Find support resources and answers to common questions about your SaveMyPay account.",
  },
  "review-us": {
    title: "Review Us | SaveMyPay",
    description: "Share your SaveMyPay experience and product feedback to help us improve.",
  },
  "privacy-policy": {
    title: "Privacy Policy | SaveMyPay",
    description: "Read how SaveMyPay collects, uses, and protects your account and transaction data.",
  },
};
