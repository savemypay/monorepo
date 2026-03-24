import { PageHeader } from "@/components/admin/PageHeader";

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payment Review"
        title={`Payment ${id}`}
        description="Payment drill-down is reserved here while the main payments table stays live on the paid-users API."
      />

      <div className="admin-panel p-6">
        <p className="text-sm leading-6 text-slate-700">
          The payments list is live and API-backed. This detail route is intentionally lightweight until a dedicated
          payment-by-id backend endpoint is available.
        </p>
      </div>
    </div>
  );
}
