import { Suspense } from "react";
import RolePage from "@/app/role-page";

type PageProps = {
  params: Promise<{ view: string }>;
};

export default async function ProductionViewPage({ params }: PageProps) {
  const { view } = await params;

  return (
    <Suspense fallback={<p className="panel">Memuat...</p>}>
      <RolePage
        role="KARYAWAN_PRODUKSI"
        view={view}
        validViews={["orders", "history"]}
      />
    </Suspense>
  );
}