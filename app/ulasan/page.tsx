import { CustomerShell } from "@/app/components/customer-shell";
import { ReviewForm } from "@/app/components/review-form";
import { PageTitle } from "@/app/components/ui";

export default function ReviewsPage() {
  return (
    <CustomerShell active="/ulasan">
      <PageTitle title="Kritik & Saran" />
      <ReviewForm />
    </CustomerShell>
  );
}
