import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

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
  title: "SMP Admin Dashboard",
  description: "Operations console for SaveMyPay deals, vendors, customers, payments, and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sofiaPro.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
