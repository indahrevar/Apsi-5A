import { Suspense } from "react";
import RolePage from "@/app/role-page";

export default function OwnerSectionPage(props: PageProps<"/owner/[view]">) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fafafa] p-8" />}>
      <OwnerSection params={props.params} />
    </Suspense>
  );
}

async function OwnerSection({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  return (
    <RolePage
      role="OWNER"
      view={view}
      validViews={["dashboard", "stock", "reports", "reviews"]}
    />
  );
}
