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
      <HandoverTable />
    </WorkspaceShell>
  );
}
