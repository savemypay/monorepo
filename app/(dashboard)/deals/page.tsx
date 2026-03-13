import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { deals, formatCurrency } from "@/lib/admin/mock-data";

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deal Governance"
        title="Deals"
        description="Review deal quality, monitor performance, and move campaigns through their approval lifecycle."
        action={
          <Link href="/deals/new" className="rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white">
            New Deal
          </Link>
        }
      />

      <div className="admin-panel p-5">
        <div className="flex flex-wrap gap-3">
          {["All", "Pending Review", "Live", "Needs Changes", "Closed", "Paused"].map((filter) => (
            <span key={filter} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              {filter}
            </span>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="table-grid">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Interest</th>
                <th>Paid</th>
                <th>Revenue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id}>
                  <td>
                    <p className="font-bold text-slate-900">{deal.title}</p>
                    <p className="text-sm text-muted">
                      {deal.id} · {deal.category}
                    </p>
                  </td>
                  <td>
                    <p className="font-semibold text-slate-800">{deal.vendor}</p>
                    <p className="text-sm text-muted">Created {deal.createdAt}</p>
                  </td>
                  <td>
                    <StatusBadge status={deal.status} />
                  </td>
                  <td>{deal.interested}</td>
                  <td>{deal.paid}</td>
                  <td>{formatCurrency(deal.revenue)}</td>
                  <td>
                    <Link href={`/deals/${deal.id}`} className="text-sm font-bold text-brand">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
