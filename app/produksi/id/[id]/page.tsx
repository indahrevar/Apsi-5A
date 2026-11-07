import { Suspense } from "react";
import { WorkspaceShell, productionLinks } from "@/app/components/workspace-shell";
import { ProductionDetailClient } from "@/app/components/production-detail-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductionDetailPage({ params }: PageProps) {
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

async function ProductionDetail({ params }: PageProps) {
  const { id } = await params;
  return <ProductionDetailClient orderId={id} />;
}