import { PageHeader } from "@/components/admin/PageHeader";
import { auditLogs } from "@/lib/admin/mock-data";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Audit Logs"
        description="Track every high-sensitivity admin action across deals, finance actions, and partner/customer controls."
      />

      <div className="admin-panel overflow-x-auto p-5">
        <table className="table-grid">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Summary</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((record) => (
              <tr key={record.id}>
                <td>{record.actor}</td>
                <td>{record.action}</td>
                <td>{record.entity}</td>
                <td>{record.summary}</td>
                <td>{record.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
