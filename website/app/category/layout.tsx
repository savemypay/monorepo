import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import CategoryNavbar from "@/components/Home/CategoryNavbar";
import Footer from "@/components/Home/Footer";

export const metadata: Metadata = buildMetadata({
  title: "Category Guides | SaveMyPay",
  description:
    "Explore SaveMyPay category pages to understand how group buying works across insurance, property, automotive, travel, healthcare, and e-commerce deals.",
  path: "/category",
});

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f4f6]">
      <CategoryNavbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
