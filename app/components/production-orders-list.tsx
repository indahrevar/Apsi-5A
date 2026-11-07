"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatCard, StatusPill } from "@/app/components/ui";

type ProductionOrder = {
  id: string;
  orderId: string;
  customer: string;
  items: string;
  delivery: string;
  status: string;
  date: string;
};

const filters = ["Semua", "Diterima", "Sedang dibuat", "Selesai"] as const;

export function ProductionOrdersList() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("Semua");
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/production", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Produksi tidak dapat dimuat.");
        setOrders(result);
      })
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : "Produksi tidak dapat dimuat."),
      );
  }, []);

  const visibleOrders = useMemo(
    () => orders.filter((order) => filter === "Semua" || order.status === filter),
    [filter, orders],
  );
  const count = (status: string) => orders.filter((order) => order.status === status).length;

  return (
    <>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="production-summary">
        <StatCard label="Baru" value={String(count("Diterima"))} note="Pesanan" />
        <StatCard label="Sedang dibuat" value={String(count("Sedang dibuat"))} note="Pesanan" />
        <StatCard label="Selesai" value={String(count("Selesai"))} note="Pesanan" />
      </div>
      <div aria-label="Status produksi" className="filter-list toolbar">
        {filters.map((item) => (
          <button
            aria-pressed={filter === item}
            className={`button button--filter${filter === item ? " is-selected" : ""}`}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr><th>No. Pesanan</th><th>Tanggal</th><th>Pelanggan</th><th>Item</th><th>Penyerahan</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderId}</td>
                <td>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(order.date))}</td>
                <td>{order.customer}</td>
                <td>{order.items}</td>
                <td>{order.delivery}</td>
                <td><StatusPill>{order.status}</StatusPill></td>
                <td><Link className="button button--outline button--small" href={`/produksi/${order.orderId}`}>Detail</Link></td>
              </tr>
            ))}
            {!visibleOrders.length ? <tr><td colSpan={7}>Tidak ada pesanan produksi pada status ini.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
