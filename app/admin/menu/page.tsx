import { WorkspaceShell, adminLinks } from "@/app/components/workspace-shell";
import { InventoryTable } from "@/app/components/admin-data-clients";
import { PageTitle } from "@/app/components/ui";

export default function AdminMenuPage() {
  return (
    <WorkspaceShell active="/admin/menu" links={adminLinks} role="ADMIN">
      <PageTitle
        title="Kelola Menu & Stok"
        description="Atur harga, kategori, satuan, dan jumlah stok menu."
      />
      <InventoryTable />
    </WorkspaceShell>
  );
}
