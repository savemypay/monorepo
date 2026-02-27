import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryDetailPage from "@/components/Home2/CategoryDetailPage";
import { CATEGORY_PAGE_SLUGS, getCategoryPage } from "@/lib/category-pages";
import { buildMetadata } from "@/lib/seo";

type CategoryPageParams = {
  slug: string;
};

export function generateStaticParams() {
  return CATEGORY_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CategoryPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getCategoryPage(slug);

  if (!page) {
    return buildMetadata({
      title: "Category Not Found | SaveMyPay",
      description: "The requested SaveMyPay category page does not exist.",
      path: `/category/${slug}`,
    });
  }

  return buildMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<CategoryPageParams>;
}) {
  const { slug } = await params;
  const page = getCategoryPage(slug);

  if (!page) {
    notFound();
  }

  return <CategoryDetailPage page={page} />;
}
