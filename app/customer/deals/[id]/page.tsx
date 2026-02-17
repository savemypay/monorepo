import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import DealDetailsPageClient from "./DealDetailsPageClient";

type DealPageParams = {
  id: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<DealPageParams>;
}): Promise<Metadata> {
  const { id } = await params;

  return buildMetadata({
    title: `Deal #${id} | SaveMyPay`,
    description:
      "View deal terms, live participation progress, token amount, and timeline before you join this SaveMyPay pool.",
    path: `/customer/deals/${id}`,
  });
}

export default async function DealDetailsPage({
  params,
}: {
  params: Promise<DealPageParams>;
}) {
  const { id } = await params;
  return <DealDetailsPageClient id={id} />;
}
