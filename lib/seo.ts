import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://savemypay.com";
const SITE_NAME = "SaveMyPay";
const DEFAULT_OG_IMAGE = "/assets/Tesla-Model-Y-1-1160x652.webp";

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
  image?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  };
};

export function buildMetadata(input: SeoInput): Metadata {
  const image = input.image ?? {
    url: DEFAULT_OG_IMAGE,
    width: 1160,
    height: 652,
    alt: `${SITE_NAME} preview image`,
  };

  const absolutePageUrl = toAbsoluteUrl(input.path);
  const absoluteImageUrl = toAbsoluteUrl(image.url);

  return {
    title: input.title,
    description: input.description,
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
