import { AccountCreationForm } from "@/app/components/account-creation-form";
import { PageTitle } from "@/app/components/ui";
import { WorkspaceShell, adminLinks } from "@/app/components/workspace-shell";

export default function AdminAccountsPage() {
  return (
    <WorkspaceShell active="/admin/akun" links={adminLinks} role="ADMIN">
      <PageTitle title="Buat Akun Karyawan Produksi" description="Akses ini hanya tersedia untuk Admin." />
      <AccountCreationForm role="KARYAWAN_PRODUKSI" />
    </WorkspaceShell>
  );
}
