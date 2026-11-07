import { Suspense } from "react";
import RolePage from "@/app/role-page";

export default function CustomerSectionPage(
  props: PageProps<"/customer/[view]">,
) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fafafa] p-8" />}>
      <CustomerSection params={props.params} />
    </Suspense>
  );
}

async function CustomerSection({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  return (
    <RolePage
      role="customer"
      view={view}
      validViews={["menu", "checkout", "orders", "reviews"]}
    />
  );
}
