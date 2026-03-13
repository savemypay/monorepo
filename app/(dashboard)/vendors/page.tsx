import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency, vendors } from "@/lib/admin/mock-data";

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vendor Operations"
        title="Vendors"
        description="Monitor onboarding quality, commercial performance, and risk signals across all partner accounts."
      />

      <div className="admin-panel overflow-x-auto p-5">
        <table className="table-grid">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Category</th>
              <th>Status</th>
              <th>Active Deals</th>
              <th>Revenue</th>
              <th>Complaints</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td>
                  <p className="font-bold text-slate-900">{vendor.businessName}</p>
                  <p className="text-sm text-muted">
                    {vendor.id} · {vendor.ownerName}
                  </p>
                </td>
                <td>{vendor.category}</td>
                <td>
                  <StatusBadge status={vendor.status} />
                </td>
                <td>{vendor.activeDeals}</td>
                <td>{formatCurrency(vendor.revenue)}</td>
                <td>{vendor.complaints}</td>
                <td>
                  <Link href={`/vendors/${vendor.id}`} className="text-sm font-bold text-brand">
                    Open
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
