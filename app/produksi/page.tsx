import { WorkspaceShell, productionLinks } from "@/app/components/workspace-shell";
import { PageTitle } from "@/app/components/ui";
import { ProductionOrdersList } from "@/app/components/production-orders-list";

export default function ProductionOrdersPage() {
  return (
    <WorkspaceShell
      active="/produksi"
      links={productionLinks}
      role="KARYAWAN PRODUKSI"
    >
      <PageTitle
        title="Daftar Pesanan"
        description="Pesanan yang perlu disiapkan oleh tim produksi."
      />
      <ProductionOrdersList />
    </WorkspaceShell>
  );
}