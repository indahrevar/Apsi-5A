import { WorkspaceShell, adminLinks } from "@/app/components/workspace-shell";
import { HandoverTable } from "@/app/components/admin-data-clients";
import { PageTitle } from "@/app/components/ui";

export default function HandoverPage() {
  return (
    <WorkspaceShell active="/admin/penyerahan" links={adminLinks} role="ADMIN">
      <PageTitle
        title="Laporan Penyerahan"
        description="Pantau pesanan yang siap diambil atau diantar."
      />
      <div className="toolbar">
        <label className="field-label" htmlFor="handover-period">
          Periode
        </label>
        <select className="text-input period-select" id="handover-period">
          <option>Semua periode</option>
          <option>November 2026</option>
          <option>Oktober 2026</option>
        </select>
      </div>
      <HandoverTable />
    </WorkspaceShell>
  );
}
