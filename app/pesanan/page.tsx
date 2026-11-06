import { CustomerShell } from "@/app/components/customer-shell";
import { CustomerOrdersTable } from "@/app/components/customer-orders-table";
import { PageTitle } from "@/app/components/ui";

export default function CustomerOrdersPage() {
  return (
    <CustomerShell active="/pesanan">
      <PageTitle title="Pesanan Saya" />
      <CustomerOrdersTable />
    </CustomerShell>
  );
}
