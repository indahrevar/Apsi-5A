import { WorkspaceShell, adminLinks } from "@/app/components/workspace-shell";
import { AdminDashboardClient } from "@/app/components/admin-dashboard-client";

export default function AdminDashboardPage() {
  return (
    <WorkspaceShell active="/admin" links={adminLinks} role="ADMIN">
      <AdminDashboardClient />
    </WorkspaceShell>
  );
}