import type { MetadataRoute } from "next";
import { CATEGORY_PAGE_SLUGS } from "@/lib/category-pages";
import { getSiteUrl } from "@/lib/seo";

function toAbsoluteUrl(path: string) {
  const siteUrl = getSiteUrl();
  if (path === "/") {
    return siteUrl;
  }
  return `${siteUrl}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const publicEntries: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toAbsoluteUrl("/faq"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: toAbsoluteUrl("/customer"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const categoryEntries: MetadataRoute.Sitemap = CATEGORY_PAGE_SLUGS.map((slug) => ({
    url: toAbsoluteUrl(`/category/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...publicEntries, ...categoryEntries];
}
