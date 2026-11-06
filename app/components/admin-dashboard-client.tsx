"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageTitle, Panel, StatCard, StatusPill } from "@/app/components/ui";
import { formatRupiah, type MenuProduct } from "@/app/lib/demo-data";

type Order = {
  id: string;
  customer: string;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  date: string;
};
type Handover = { orderId: string; status: string };

export function AdminDashboardClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      fetch("/api/orders", { cache: "no-store" }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Pesanan tidak dapat dimuat.");
        setOrders(result);
      }),
      fetch("/api/products", { cache: "no-store" }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Stok tidak dapat dimuat.");
        setProducts(result);
      }),
      fetch("/api/handovers", { cache: "no-store" }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Penyerahan tidak dapat dimuat.");
        setHandovers(result);
      }),
    ]).catch((loadError: unknown) =>
      setError(loadError instanceof Error ? loadError.message : "Ringkasan tidak dapat dimuat."),
    );
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((order) => order.date.slice(0, 10) === today).length;
  const awaitingPayment = orders.filter((order) => ["Menunggu", "Belum dibayar"].includes(order.paymentStatus)).length;
  const lowStock = products.filter((product) => product.stock <= product.minimum).length;
  const readyToHandOver = handovers.filter((item) => item.status === "Siap diserahkan").length;

  return (
    <>
      <PageTitle title="Dashboard Admin" />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="stat-grid">
        <StatCard label="Pesanan hari ini" value={String(todayOrders)} note="Pesanan" />
        <StatCard label="Menunggu konfirmasi bayar" value={String(awaitingPayment)} note="Pesanan" />
        <StatCard label="Stok mendekati minimum" value={String(lowStock)} note="Produk" />
        <StatCard label="Siap diserahkan" value={String(readyToHandOver)} note="Pesanan" />
      </div>
      <div className="section-grid">
        <Panel title="Pesanan Terbaru">
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>No. Pesanan</th><th>Pemesan</th><th>Total</th><th>Pembayaran</th><th>Aksi</th></tr></thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td><td>{order.customer}</td><td>{formatRupiah(order.total)}</td><td><StatusPill>{order.paymentStatus}</StatusPill></td>
                    <td><Link className="button button--outline button--small" href="/admin/pesanan">Detail</Link></td>
                  </tr>
                ))}
                {!orders.length ? <tr><td colSpan={5}>Belum ada pesanan.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Peringatan Stok">
          {products.filter((product) => product.stock <= product.minimum).slice(0, 5).map((product) => (
            <div className="stock-bar" key={product.id}><span>{product.name}</span><strong>{product.stock} {product.unit}</strong></div>
          ))}
          {!lowStock ? <p>Tidak ada menu di bawah batas stok minimum.</p> : null}
          <Link className="button button--outline button--wide" href="/admin/menu">Kelola Stok</Link>
        </Panel>
      </div>
    </>
  );
}
