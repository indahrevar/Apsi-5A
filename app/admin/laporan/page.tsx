import { OwnerReportsClient } from "@/app/components/owner-reports-client";
import { PageTitle } from "@/app/components/ui";
import { WorkspaceShell, adminLinks } from "@/app/components/workspace-shell";

export default function AdminReportsPage() {
  return (
    <WorkspaceShell active="/admin/laporan" links={adminLinks} role="ADMIN">
      <PageTitle title="Laporan" description="Buat, lihat, dan cetak laporan operasional." />
      <OwnerReportsClient />
    </WorkspaceShell>
  );
}
