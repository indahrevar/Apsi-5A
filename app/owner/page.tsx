import { WorkspaceShell, ownerLinks } from "@/app/components/workspace-shell";
import { OwnerDashboardClient } from "@/app/components/owner-dashboard-client";

export default function OwnerDashboardPage() {
  return (
    <WorkspaceShell active="/owner" links={ownerLinks} role="OWNER">
      <OwnerDashboardClient />
    </WorkspaceShell>
  );
}
