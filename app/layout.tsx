import localFont from "next/font/local";
import "./globals.css";
import type { Metadata } from "next";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.ttf",
  display: "swap",
  variable: "--font-satoshi",
});
const satoshi_italic = localFont({
  src: "./fonts/Satoshi-VariableItalic.ttf",
  display: "swap",
  variable: "--font-satoshi-i",
});

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
        className={`${satoshi.variable} ${satoshi_italic.variable} antialiased`}
      >
        <main className="relative z-0 h-full w-full">{children}</main>
      </body>
    </html>
  );
}
