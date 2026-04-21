import localFont from "next/font/local";
import "./globals.css";
import type { Metadata } from "next";

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
  title: "Save My Pay",
  description: "Save my pay - Power in numbers and savings in bulk",
}; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sofiaPro.className} antialiased`}
      >
        <main className="relative z-0 h-full w-full">{children}</main>
      </body>
    </html>
  );
}
