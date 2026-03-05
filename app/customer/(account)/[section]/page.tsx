import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccountSectionPageClient from "@/components/customer/AccountSectionPageClient";
import {
  CUSTOMER_ACCOUNT_META,
  CUSTOMER_ACCOUNT_SLUGS,
  isCustomerAccountSlug,
  type CustomerAccountSectionSlug,
} from "@/lib/customer-account";
import { buildMetadata } from "@/lib/seo";

type PageParams = {
  section: string;
};

export function generateStaticParams() {
  return CUSTOMER_ACCOUNT_SLUGS.map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { section } = await params;

  if (!isCustomerAccountSlug(section)) {
    return buildMetadata({
      title: "Account Page Not Found | SaveMyPay",
      description: "The requested account page does not exist.",
      path: `/customer/${section}`,
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  const meta = CUSTOMER_ACCOUNT_META[section as CustomerAccountSectionSlug];

  return buildMetadata({
    title: meta.title,
    description: meta.description,
    path: `/customer/${section}`,
    robots: {
      index: false,
      follow: false,
    },
  });
}

export default async function CustomerAccountSectionPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { section } = await params;

  if (!isCustomerAccountSlug(section)) {
    notFound();
  }

  return <AccountSectionPageClient section={section} />;
}
