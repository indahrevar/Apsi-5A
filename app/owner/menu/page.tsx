import { OwnerProductsTable } from "@/app/components/owner-products-table";
import { PageTitle } from "@/app/components/ui";
import { WorkspaceShell, ownerLinks } from "@/app/components/workspace-shell";

export default function OwnerMenuPage() {
  return (
    <WorkspaceShell active="/owner/menu" links={ownerLinks} role="OWNER">
      <PageTitle title="Menu dan Stok" description="Tampilan baca-saja sesuai hak akses Owner." />
      <OwnerProductsTable />
    </WorkspaceShell>
  );
}
