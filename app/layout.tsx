import localFont from "next/font/local";
import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, getSiteUrl } from "@/lib/seo";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const sofiaPro = localFont({
  src: [
    { path: "./fonts/sofia-pro/Sofia Pro Regular Az.otf", weight: "400", style: "normal" },
    { path: "./fonts/sofia-pro/Sofia Pro Medium Az.otf", weight: "500", style: "normal" },
    { path: "./fonts/sofia-pro/Sofia Pro Semi Bold Az.otf", weight: "700", style: "normal" },
    { path: "./fonts/sofia-pro/Sofia Pro Regular Italic Az.otf", weight: "400", style: "italic" },
  ],
  display: "swap",
  fallback: ["Inter", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...buildMetadata({
    title: "SaveMyPay | Group Buying Deals & Bulk Savings",
    description:
      "SaveMyPay helps buyers unlock better prices through trusted group deals across automotive, travel, electronics, and more.",
    path: "/",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const siteUrl = getSiteUrl();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sofiaPro.className} antialiased`}>
        <script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SaveMyPay",
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              sameAs: ["https://x.com/Savemypay_xyz"],
            }),
          }}
        />
        <script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SaveMyPay",
              url: siteUrl,
            }),
          }}
        />
        <main className="relative z-0 h-full w-full">{children}</main>
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={gaMeasurementId} />
        </Suspense>
      </body>
    </html>
  );
}
