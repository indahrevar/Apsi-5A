import { WorkspaceShell, ownerLinks } from "@/app/components/workspace-shell";
import { OwnerReviewsTable } from "@/app/components/owner-reviews-table";

export default function OwnerReviewsPage() {
  return (
    <WorkspaceShell active="/owner/ulasan" links={ownerLinks} role="OWNER">
      <OwnerReviewsTable />
    </WorkspaceShell>
  );
}
