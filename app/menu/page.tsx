import { CustomerShell } from "@/app/components/customer-shell";
import { MenuClient } from "@/app/components/menu-client";
import { PageTitle } from "@/app/components/ui";

export default function MenuPage() {
  return (
    <CustomerShell active="/menu">
      <PageTitle title="Pilih Menu" description="Brownies dan kue dari dapur kami." />
      <MenuClient />
    </CustomerShell>
  );
}
