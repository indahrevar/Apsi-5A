import { WorkspaceShell, adminLinks } from "@/app/components/workspace-shell";
import { OrderPaymentsTable } from "@/app/components/admin-data-clients";
import { PageTitle } from "@/app/components/ui";

export default function AdminOrdersPage() {
  return (
    <WorkspaceShell active="/admin/pesanan" links={adminLinks} role="ADMIN">
      <PageTitle
        title="Pesanan & Pembayaran"
        description="Periksa bukti pembayaran dan perbarui status pesanan."
      />
      <OrderPaymentsTable />
    </WorkspaceShell>
  );
}
