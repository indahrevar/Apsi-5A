import { AccountCreationForm } from "@/app/components/account-creation-form";
import { PageTitle } from "@/app/components/ui";
import { WorkspaceShell, ownerLinks } from "@/app/components/workspace-shell";

export default function OwnerAccountsPage() {
  return (
    <WorkspaceShell active="/owner/akun" links={ownerLinks} role="OWNER">
      <PageTitle title="Buat Akun Admin" description="Akses ini hanya tersedia untuk Owner." />
      <AccountCreationForm role="ADMIN" />
    </WorkspaceShell>
  );
}
