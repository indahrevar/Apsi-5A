import { WorkspaceShell, adminLinks } from "@/app/components/workspace-shell";
import TransaksiClient from "@/app/components/transaksi-client";

export default function TransaksiPage() {
  return (
    <WorkspaceShell active="/transaksi" links={adminLinks} role="ADMIN">
      <TransaksiClient />
    </WorkspaceShell>
  );
}
