import { PageHeader } from "@/components/admin/PageHeader";

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payment Review"
        title={`Payment ${id}`}
        description="Detailed payment drill-down can be expanded here once a payment-by-id endpoint is available."
      />

      <div className="admin-panel p-6">
        <p className="text-sm leading-6 text-slate-700">
          Comming Soon
        </p>
      </div>
    </div>
  );
}
