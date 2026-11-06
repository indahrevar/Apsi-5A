import { WorkspaceShell, ownerLinks } from "@/app/components/workspace-shell";
import { PageTitle } from "@/app/components/ui";
import { OwnerReportsClient } from "@/app/components/owner-reports-client";

export default function OwnerReportsPage() {
  return (
    <WorkspaceShell active="/owner/laporan" links={ownerLinks} role="OWNER">
      <PageTitle title="Laporan" />
      <OwnerReportsClient />
    </WorkspaceShell>
  );
}
