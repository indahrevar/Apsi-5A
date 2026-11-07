import { CustomerShell } from "@/app/components/customer-shell";
import { PageTitle } from "@/app/components/ui";
import { PaymentClient } from "@/app/components/payment-client";

export default function PaymentPage() {
  return (
    <CustomerShell active="/pembayaran">
      <PageTitle title="Konfirmasi & Pembayaran" />
      <PaymentClient />
    </CustomerShell>
  );
}
