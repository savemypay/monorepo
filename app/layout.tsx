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
  // fallback: ["Inter", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
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

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sofiaPro.className} antialiased`}
      >
            <main className="relative z-0 w-full ">
               <main className="h-full w-full">{children}</main>
            </main>
            <Suspense fallback={null}>
              <GoogleAnalytics measurementId={gaMeasurementId} />
            </Suspense>
      </body>
    </html>
  );
}
