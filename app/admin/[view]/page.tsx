import { Suspense } from "react";
import RolePage from "@/app/role-page";

const validViews = [
  "dashboard",
  "menu",
  "orders",
  "fulfillment",
  "sales",
  "reviews",
];

export default function AdminSectionPage(props: PageProps<"/admin/[view]">) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fafafa] p-8" />}>
      <AdminSection params={props.params} />
    </Suspense>
  );
}

async function AdminSection({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  return <RolePage role="admin" view={view} validViews={validViews} />;
}
