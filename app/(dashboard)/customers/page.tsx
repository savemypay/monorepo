import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { customers, formatCurrency } from "@/lib/admin/mock-data";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer Oversight"
        title="Customers"
        description="Support customers, monitor order history, and flag suspicious or abusive marketplace behavior."
      />

      <div className="admin-panel overflow-x-auto p-5">
        <table className="table-grid">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Orders</th>
              <th>Spend</th>
              <th>Rewards</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <p className="font-bold text-slate-900">{customer.name}</p>
                  <p className="text-sm text-muted">
                    {customer.email} · {customer.phone}
                  </p>
                </td>
                <td>{customer.orders}</td>
                <td>{formatCurrency(customer.spend)}</td>
                <td>{formatCurrency(customer.rewards)}</td>
                <td>
                  <StatusBadge status={customer.status} />
                </td>
                <td>
                  <Link href={`/customers/${customer.id}`} className="text-sm font-bold text-brand">
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
