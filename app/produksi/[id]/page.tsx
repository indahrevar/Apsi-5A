import { Suspense } from "react";
import { WorkspaceShell, productionLinks } from "@/app/components/workspace-shell";
import { ProductionDetailClient } from "@/app/components/production-detail-client";

export default function ProductionDetailPage({
  params,
}: PageProps<"/produksi/[id]">) {
  return (
    <WorkspaceShell
      active="/produksi"
      links={productionLinks}
      role="KARYAWAN PRODUKSI"
    >
      <Suspense fallback={<p className="panel">Memuat detail pesanan…</p>}>
        <ProductionDetail params={params} />
      </Suspense>
    </WorkspaceShell>
  );
}

async function ProductionDetail({
  params,
}: Pick<PageProps<"/produksi/[id]">, "params">) {
  const { id } = await params;
  return <ProductionDetailClient orderId={id} />;
}
