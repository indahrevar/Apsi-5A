<<<<<<< HEAD
import RolePage from "@/app/role-page";

export default function AdminPage() {
  return (
    <RolePage
      role="admin"
      view="dashboard"
      validViews={[
        "dashboard",
        "menu",
        "orders",
        "fulfillment",
        "sales",
        "reviews",
      ]}
    />
=======
import { WorkspaceShell, adminLinks } from "@/app/components/workspace-shell";
import { AdminDashboardClient } from "@/app/components/admin-dashboard-client";

export default function AdminDashboardPage() {
  return (
    <WorkspaceShell active="/admin" links={adminLinks} role="ADMIN">
      <AdminDashboardClient />
    </WorkspaceShell>
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
  );
}
