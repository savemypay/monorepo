import localFont from "next/font/local";
import "./globals.css";
import type { Metadata } from "next";
import { buildMetadata, getSiteUrl } from "@/lib/seo";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.ttf",
  display: "swap",
});
const satoshi_italic = localFont({
  src: "./fonts/Satoshi-VariableItalic.ttf",
  display: "swap",
  variable: "--font-satoshi-i",
});

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${satoshi.className} ${satoshi_italic.variable} antialiased`}
      >
            <main className="relative z-0 w-full ">
               <main className="h-full w-full">{children}</main>
            </main>
      </body>
    </html>
  );
}
