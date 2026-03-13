import { PageHeader } from "@/components/admin/PageHeader";

const admins = [
  { name: "Siva Narayan", role: "Super Admin", lastLogin: "2026-03-10 10:02", status: "Active" },
  { name: "Finance Lead", role: "Finance Admin", lastLogin: "2026-03-10 09:10", status: "Active" },
  { name: "Ops Queue Manager", role: "Operations Admin", lastLogin: "2026-03-09 18:44", status: "Active" },
];

export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access Control"
        title="Admins"
        description="Manage internal users, roles, and access posture. This scaffold is ready for invite and permission APIs later."
      />

      <div className="admin-panel overflow-x-auto p-5">
        <table className="table-grid">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.name}>
                <td>{admin.name}</td>
                <td>{admin.role}</td>
                <td>{admin.status}</td>
                <td>{admin.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
