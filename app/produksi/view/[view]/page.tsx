import { Suspense } from "react";
import RolePage from "@/app/role-page";

type PageProps = {
  params: Promise<{ view: string }>;
};

export default function ProductionSectionPage(props: PageProps) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fafafa] p-8" />}>
      <ProductionSection params={props.params} />
    </Suspense>
  );
}

async function ProductionSection({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  return (
    <RolePage role="KARYAWAN_PRODUKSI" view={view} validViews={["orders"]} />
  );
}
