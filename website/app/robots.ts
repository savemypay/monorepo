import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/faq", "/category/", "/customer", "/customer/deals/"],
        disallow: [
          "/customer/profile-settings",
          "/customer/my-orders",
          "/customer/my-deals",
          "/customer/my-earnings",
          "/customer/payments",
          "/customer/payment-history",
          "/customer/missing-cashback",
          "/customer/refer-earn",
          "/customer/my-referrals",
          "/customer/help",
          "/customer/review-us",
          "/customer/privacy-policy",
          "/customer/saved",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
