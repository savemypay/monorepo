import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://savemypay.xyz";
const SITE_NAME = "SaveMyPay";
const DEFAULT_OG_IMAGE = "/assets/og_image.png";
const DEFAULT_SEO_KEYWORDS = [
  "SaveMyPay",
  "group buying platform",
  "bulk buying deals",
  "collective purchasing",
  "customer savings marketplace",
  "vendor network platform",
  "automotive group deals",
  "insurance group plans",
  "travel group discounts",
  "healthcare bulk deals",
  "ecommerce bulk orders",
  "property group investments",
  "token advance payments",
  "verified vendor deals",
  "India group buying",
];

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, "");

export function getSiteUrl() {
  return siteUrl;
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${siteUrl}${normalizedPath}`;
}

type SeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  robots?: Metadata["robots"];
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
};

function dedupeKeywords(keywords: string[]) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const keyword of keywords) {
    const trimmed = keyword.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}

export function buildMetadata(input: SeoInput): Metadata {
  const image = input.image ?? {
    url: DEFAULT_OG_IMAGE,
    width: 1160,
    height: 652,
    alt: `${SITE_NAME} preview image`,
  };

  const absolutePageUrl = toAbsoluteUrl(input.path);
  const absoluteImageUrl = toAbsoluteUrl(image.url);
  const keywords = dedupeKeywords([...(input.keywords ?? []), ...DEFAULT_SEO_KEYWORDS]);

  return {
    title: input.title,
    description: input.description,
    keywords,
    robots: input.robots,
    alternates: {
      canonical: absolutePageUrl,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: absolutePageUrl,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: absoluteImageUrl,
          width: image.width,
          height: image.height,
          alt: image.alt ?? input.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [absoluteImageUrl],
    },
  };
}
