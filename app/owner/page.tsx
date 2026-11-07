<<<<<<< HEAD
import RolePage from "@/app/role-page";

export default function OwnerPage() {
  return (
    <RolePage
      role="owner"
      view="dashboard"
      validViews={["dashboard", "stock", "reports", "reviews"]}
    />
=======
import { WorkspaceShell, ownerLinks } from "@/app/components/workspace-shell";
import { OwnerDashboardClient } from "@/app/components/owner-dashboard-client";

export default function OwnerDashboardPage() {
  return (
    <WorkspaceShell active="/owner" links={ownerLinks} role="OWNER">
      <OwnerDashboardClient />
    </WorkspaceShell>
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
  );
}
