"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/app/lib/demo-data";
import { StatusPill } from "@/app/components/ui";

type Order = {
  id: string;
  items: string;
  total: number;
  method: string;
  paymentStatus: string;
  status: string;
  orderStatus: string;
  delivery: string;
  deliveryAddress: string | null;
  note: string | null;
  handoverStatus: string;
  date: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export function CustomerOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [deliverySelections, setDeliverySelections] = useState<Record<string, string>>({});
  const [addressInputs, setAddressInputs] = useState<Record<string, string>>({});
  const [deliverySuccess, setDeliverySuccess] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  async function fetchOrders() {
    const [orderResponse, reviewResponse] = await Promise.all([
      fetch("/api/orders", { cache: "no-store" }),
      fetch("/api/reviews", { cache: "no-store" }),
    ]);
    const orderResult = await orderResponse.json();
    const reviewResult = await reviewResponse.json();
    if (!orderResponse.ok) throw new Error(orderResult.error ?? "Pesanan tidak dapat dimuat.");
    if (!reviewResponse.ok) throw new Error(reviewResult.error ?? "Ulasan tidak dapat dimuat.");
    return {
      orders: orderResult as Order[],
      reviewed: reviewResult.map((review: { orderId: string }) => review.orderId) as string[],
    };
  }

  useEffect(() => {
    let active = true;
    void fetchOrders()
      .then((result) => {
        if (!active) return;
        setOrders(result.orders);
        setReviewed(result.reviewed);
      })
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : "Pesanan tidak dapat dimuat."),
      );
    return () => { active = false; };
  }, []);

  async function changeDelivery(order: Order) {
    setError("");
    const method = deliverySelections[order.id] ?? (order.delivery === "Ambil" ? "Ambil di Tempat" : order.delivery);
    const response = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deliveryMethod: method,
        address: addressInputs[order.id] ?? order.deliveryAddress ?? "",
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Pesanan tidak dapat diubah.");
      return;
    }
    const refreshed = await fetchOrders();
    setOrders(refreshed.orders);
    setReviewed(refreshed.reviewed);
    setDeliverySuccess((current) => ({
      ...current,
      [order.id]: `Metode penyerahan berhasil diperbarui: ${method}.`,
    }));
  }

  async function cancelOrder(orderId: string) {
    if (!window.confirm("Hapus pesanan ini? Stok akan dikembalikan.")) return;
    setError("");
    const response = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error ?? "Pesanan tidak dapat dihapus.");
      return;
    }
    const refreshed = await fetchOrders();
    setOrders(refreshed.orders);
    setReviewed(refreshed.reviewed);
  }

  if (error && !orders.length) return <p className="form-error" role="alert">{error}</p>;
  if (!orders.length) return <p className="empty-state">Belum ada pesanan untuk akun ini.</p>;

  return (
    <>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="table-scroll">
        <table className="data-table orders-table">
          <thead>
            <tr>
              <th>No. Pesanan</th>
              <th>Tanggal</th>
              <th>Item</th>
              <th>Total</th>
              <th>Pembayaran</th>
              <th>Status Pesanan</th>
              <th>Penyerahan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const canChange = order.orderStatus === "Diterima";
              return (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>
                    {order.items}
                    {order.note ? <small>Catatan: {order.note}</small> : null}
                  </td>
                  <td>{formatRupiah(order.total)}</td>
                  <td><StatusPill>{order.paymentStatus}</StatusPill></td>
                  <td><StatusPill>{order.status}</StatusPill></td>
                  <td>
                    {canChange ? (
                      <div className="stack">
                        <select
                          aria-label={`Metode penyerahan ${order.id}`}
                          className="text-input"
                          onChange={(event) => {
                            setDeliverySelections((current) => ({ ...current, [order.id]: event.target.value }));
                            setDeliverySuccess((current) => ({ ...current, [order.id]: "" }));
                          }}
                          value={deliverySelections[order.id] ?? (order.delivery === "Ambil" ? "Ambil di Tempat" : order.delivery)}
                        >
                          <option>Ambil di Tempat</option>
                          <option>Diantar</option>
                        </select>
                        {(deliverySelections[order.id] ?? order.delivery) === "Diantar" ? (
                          <input
                            aria-label={`Alamat pengantaran ${order.id}`}
                            className="text-input"
                            maxLength={150}
                            onChange={(event) => {
                              setAddressInputs((current) => ({ ...current, [order.id]: event.target.value }));
                              setDeliverySuccess((current) => ({ ...current, [order.id]: "" }));
                            }}
                            placeholder="Alamat pengantaran"
                            value={addressInputs[order.id] ?? order.deliveryAddress ?? ""}
                          />
                        ) : null}
                        <button className="button button--outline button--small" onClick={() => void changeDelivery(order)} type="button">Simpan</button>
                        {deliverySuccess[order.id] ? (
                          <p aria-live="polite" className="form-success" role="status">{deliverySuccess[order.id]}</p>
                        ) : null}
                      </div>
                    ) : `${order.delivery}${order.handoverStatus === "Diserahkan" ? " · Diserahkan" : ""}`}
                    {!canChange && order.deliveryAddress ? <small>{order.deliveryAddress}</small> : null}
                  </td>
                  <td>
                    <div className="button-row">
                      {order.orderStatus === "Selesai" && !reviewed.includes(order.id) ? (
                        <Link className="button button--outline button--small" href={`/ulasan?order=${order.id}`}>
                          Beri Ulasan
                        </Link>
                      ) : null}
                      {canChange && !["Dikonfirmasi", "Lunas", "Berhasil"].includes(order.paymentStatus) ? (
                        <button className="button button--outline button--small" onClick={() => void cancelOrder(order.id)} type="button">
                          Hapus
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
