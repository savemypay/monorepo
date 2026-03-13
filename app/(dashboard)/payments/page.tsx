import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency, payments } from "@/lib/admin/mock-data";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance Operations"
        title="Payments"
        description="Track transaction health, reconciliation risk, refunds, and deal-linked revenue in one finance view."
      />

      <div className="admin-panel overflow-x-auto p-5">
        <table className="table-grid">
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Customer</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>
                  <p className="font-bold text-slate-900">{payment.id}</p>
                  <p className="text-sm text-muted">{payment.dealId}</p>
                </td>
                <td>{payment.customer}</td>
                <td>{payment.vendor}</td>
                <td>
                  <StatusBadge status={payment.status} />
                </td>
                <td>{formatCurrency(payment.amount)}</td>
                <td>{payment.createdAt}</td>
                <td>
                  <Link href={`/payments/${payment.id}`} className="text-sm font-bold text-brand">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
