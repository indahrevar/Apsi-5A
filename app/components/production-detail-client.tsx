"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Panel, PageTitle, StatusPill } from "@/app/components/ui";
import { ProductionControls } from "@/app/components/production-controls";
import { formatRupiah } from "@/app/lib/demo-data";

type Production = {
  id: string;
  orderId: string;
  customer: string;
  items: string;
  lines: Array<{ product: string; quantity: number; unit: string; price: number }>;
  paymentStatus: string;
  delivery: string;
  status: string;
  date: string;
};

export function ProductionDetailClient({ orderId }: { orderId: string }) {
  const [production, setProduction] = useState<Production | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/production", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Detail produksi tidak dapat dimuat.");
        const item = result.find((row: Production) => row.orderId === orderId) ?? null;
        if (!item) throw new Error("Pesanan produksi tidak ditemukan.");
        setProduction(item);
      })
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : "Detail produksi tidak dapat dimuat."),
      );
  }, [orderId]);

  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!production) return <p className="panel">Memuat detail produksi…</p>;

  return (
    <>
      <PageTitle title="Detail Pesanan" action={<Link className="button button--outline" href="/produksi">Kembali</Link>} />
      <div className="production-detail-grid">
        <div className="stack">
          <Panel title="Informasi Pesanan">
            <dl className="detail-list">
              <div><dt>No. Pesanan</dt><dd>{production.orderId}</dd></div>
              <div><dt>Pemesan</dt><dd>{production.customer}</dd></div>
              <div><dt>Tanggal pesanan</dt><dd>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(production.date))}</dd></div>
              <div><dt>Metode penyerahan</dt><dd>{production.delivery}</dd></div>
              <div><dt>Status pembayaran</dt><dd><StatusPill>{production.paymentStatus}</StatusPill></dd></div>
            </dl>
          </Panel>
          <Panel title="Item yang diproduksi">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Menu</th><th>Jumlah</th><th>Satuan</th><th>Harga</th></tr></thead>
                <tbody>{production.lines.map((line) => (
                  <tr key={line.product}><td>{line.product}</td><td>{line.quantity}</td><td>{line.unit}</td><td>{formatRupiah(line.price)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </Panel>
        </div>
        <Panel title="Status Produksi">
          <ProductionControls id={production.id} initialStatus={production.status} />
        </Panel>
      </div>
    </>
  );
}
