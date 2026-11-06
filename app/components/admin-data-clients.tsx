"use client";

import { useEffect, useState } from "react";
import { formatRupiah, type MenuProduct } from "@/app/lib/demo-data";
import { StatusPill } from "@/app/components/ui";

type Order = {
  id: string;
  customer: string;
  items: string;
  total: number;
  paymentId: string | null;
  method: string;
  paymentStatus: string;
  orderStatus: string;
  status: string;
  delivery: string;
  productionId: string | null;
};

async function requestJson(url: string, method = "GET", body?: unknown) {
  const response = await fetch(url, {
    method,
    ...(body === undefined ? {} : {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    cache: "no-store",
  });
  const result = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(result?.error ?? "Permintaan tidak berhasil.");
  return result;
}

export function InventoryTable() {
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<MenuProduct>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProducts() {
    setProducts(await requestJson("/api/products"));
  }
  useEffect(() => {
    void requestJson("/api/products")
      .then(setProducts)
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : "Menu tidak dapat dimuat."),
      );
  }, []);

  const visibleProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase()),
  );
  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    try {
      await requestJson("/api/products", "POST", {
        name: form.get("name"),
        category: form.get("category"),
        unit: form.get("unit"),
        price: Number(form.get("price")),
        stock: Number(form.get("stock")),
        minimum: Number(form.get("minimum")),
      });
      event.currentTarget.reset();
      setShowForm(false);
      setSuccess("Menu berhasil ditambahkan.");
      await loadProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Menu tidak dapat disimpan.");
    }
  }

  async function updateProduct(product: MenuProduct) {
    setError("");
    setSuccess("");
    try {
      await requestJson(`/api/products/${product.id}`, "PATCH", edit);
      setEditId(null);
      setSuccess("Perubahan menu berhasil disimpan.");
      await loadProducts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Menu tidak dapat diubah.");
    }
  }

  async function deleteProduct(product: MenuProduct) {
    if (!window.confirm(`Hapus menu “${product.name}”?`)) return;
    setError("");
    try {
      await requestJson(`/api/products/${product.id}`, "DELETE");
      setSuccess("Menu berhasil dihapus.");
      await loadProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Menu tidak dapat dihapus.");
    }
  }

  async function adjustStock(product: MenuProduct, delta: number) {
    setError("");
    try {
      await requestJson(`/api/products/${product.id}`, "PATCH", { stock: Math.max(0, product.stock + delta) });
      await loadProducts();
    } catch (stockError) {
      setError(stockError instanceof Error ? stockError.message : "Stok tidak dapat diubah.");
    }
  }

  return (
    <>
      <div className="toolbar">
        <label className="sr-only" htmlFor="inventory-search">Cari menu</label>
        <input className="text-input" id="inventory-search" onChange={(event) => setQuery(event.target.value)} placeholder="Cari menu" type="search" value={query} />
        <button className="button button--primary" onClick={() => setShowForm((open) => !open)} type="button">{showForm ? "Tutup" : "Tambah Menu"}</button>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {success ? <p className="form-success" role="status">{success}</p> : null}
      {showForm ? (
        <form className="inline-form panel" onSubmit={createProduct}>
          <div className="form-field"><label className="field-label" htmlFor="product-name">Nama menu</label><input className="text-input" id="product-name" maxLength={30} name="name" required /></div>
          <div className="form-field"><label className="field-label" htmlFor="product-category">Kategori</label><input className="text-input" id="product-category" maxLength={30} name="category" required /></div>
          <div className="form-field"><label className="field-label" htmlFor="product-unit">Satuan</label><input className="text-input" id="product-unit" maxLength={20} name="unit" required /></div>
          <div className="form-field"><label className="field-label" htmlFor="product-price">Harga</label><input className="text-input" id="product-price" min="0" name="price" required type="number" /></div>
          <div className="form-field"><label className="field-label" htmlFor="product-stock">Stok</label><input className="text-input" id="product-stock" min="0" name="stock" required type="number" /></div>
          <div className="form-field"><label className="field-label" htmlFor="product-minimum">Stok minimum</label><input className="text-input" id="product-minimum" min="0" name="minimum" required type="number" /></div>
          <button className="button button--primary" type="submit">Simpan Menu</button>
        </form>
      ) : null}
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Nama Menu</th><th>Kategori</th><th>Satuan</th><th>Harga</th><th>Stok</th><th>Min.</th><th>Aksi</th></tr></thead>
          <tbody>
            {visibleProducts.map((product) => {
              const isEditing = editId === product.id;
              return (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{isEditing ? <input aria-label="Nama menu" className="text-input" maxLength={30} onChange={(event) => setEdit({ ...edit, name: event.target.value })} value={edit.name ?? product.name} /> : product.name}</td>
                  <td>{isEditing ? <input aria-label="Kategori" className="text-input" maxLength={30} onChange={(event) => setEdit({ ...edit, category: event.target.value })} value={edit.category ?? product.category} /> : product.category}</td>
                  <td>{isEditing ? <input aria-label="Satuan" className="text-input" maxLength={20} onChange={(event) => setEdit({ ...edit, unit: event.target.value })} value={edit.unit ?? product.unit} /> : product.unit}</td>
                  <td>{isEditing ? <input aria-label="Harga" className="text-input" min="0" onChange={(event) => setEdit({ ...edit, price: Number(event.target.value) })} type="number" value={edit.price ?? product.price} /> : formatRupiah(product.price)}</td>
                  <td>{isEditing ? <input aria-label="Stok" className="text-input" min="0" onChange={(event) => setEdit({ ...edit, stock: Number(event.target.value) })} type="number" value={edit.stock ?? product.stock} /> : <StatusPill>{product.stock <= product.minimum ? `Menipis · ${product.stock}` : product.stock}</StatusPill>}</td>
                  <td>{isEditing ? <input aria-label="Stok minimum" className="text-input" min="0" onChange={(event) => setEdit({ ...edit, minimum: Number(event.target.value) })} type="number" value={edit.minimum ?? product.minimum} /> : product.minimum}</td>
                  <td>
                    <div className="button-row">
                      {isEditing ? (
                        <>
                          <button className="button button--primary button--small" onClick={() => void updateProduct(product)} type="button">Simpan</button>
                          <button className="button button--outline button--small" onClick={() => setEditId(null)} type="button">Batal</button>
                        </>
                      ) : (
                        <>
                          <button aria-label={`Kurangi stok ${product.name}`} className="button button--outline button--small" onClick={() => void adjustStock(product, -1)} type="button">−</button>
                          <button aria-label={`Tambah stok ${product.name}`} className="button button--outline button--small" onClick={() => void adjustStock(product, 1)} type="button">+</button>
                          <button className="button button--outline button--small" onClick={() => { setEditId(product.id); setEdit({}); }} type="button">Ubah</button>
                          <button className="button button--outline button--small" onClick={() => void deleteProduct(product)} type="button">Hapus</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!visibleProducts.length ? <tr><td colSpan={8}>Belum ada menu.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function OrderPaymentsTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("Semua");

  async function loadOrders() {
    setOrders(await requestJson("/api/orders"));
  }
  useEffect(() => {
    void requestJson("/api/orders")
      .then(setOrders)
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : "Pesanan tidak dapat dimuat."),
      );
  }, []);

  async function updatePayment(order: Order, status: string) {
    setError("");
    try {
      if (!order.paymentId) throw new Error("Pesanan ini belum memiliki data pembayaran.");
      await requestJson(`/api/payments/${order.paymentId}`, "PATCH", { status });
      await loadOrders();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Pembayaran tidak dapat diubah.");
    }
  }

  async function createPayment(order: Order) {
    setError("");
    try {
      await requestJson("/api/payments", "POST", {
        orderId: order.id,
        method: "Transfer",
        amount: order.total,
      });
      await loadOrders();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Pembayaran tidak dapat dibuat.");
    }
  }

  async function deletePayment(order: Order) {
    if (!order.paymentId || !window.confirm(`Hapus pembayaran ${order.paymentId}?`)) return;
    setError("");
    try {
      await requestJson(`/api/payments/${order.paymentId}`, "DELETE");
      await loadOrders();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Pembayaran tidak dapat dihapus.");
    }
  }

  async function forwardToProduction(order: Order) {
    setError("");
    try {
      await requestJson(`/api/orders/${order.id}`, "PATCH", { forwardToProduction: true });
      await loadOrders();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Pesanan tidak dapat diteruskan.");
    }
  }

  async function updateOrderStatus(order: Order, status: string) {
    setError("");
    try {
      await requestJson(`/api/orders/${order.id}`, "PATCH", { status });
      await loadOrders();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Status pesanan tidak dapat diubah.");
    }
  }

  const filtered = orders.filter((order) => {
    if (period === "Menunggu pembayaran") return ["Menunggu", "Belum dibayar"].includes(order.paymentStatus);
    if (period === "Dikonfirmasi") return ["Dikonfirmasi", "Lunas", "Berhasil"].includes(order.paymentStatus);
    return true;
  });

  return (
    <>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div aria-label="Filter pembayaran" className="filter-list toolbar">
        {["Semua", "Menunggu pembayaran", "Dikonfirmasi"].map((item) => (
          <button aria-pressed={period === item} className={`button button--filter${period === item ? " is-selected" : ""}`} key={item} onClick={() => setPeriod(item)} type="button">{item}</button>
        ))}
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>No. Pesanan</th><th>Pelanggan</th><th>Item</th><th>Total</th><th>Metode</th><th>Status bayar</th><th>Status pesanan</th><th>Aksi</th></tr></thead>
          <tbody>
            {filtered.map((order) => {
              const paid = ["Dikonfirmasi", "Lunas", "Berhasil"].includes(order.paymentStatus);
              return (
                <tr key={order.id}>
                  <td>{order.id}</td><td>{order.customer}</td><td>{order.items}</td><td>{formatRupiah(order.total)}</td><td>{order.method}</td>
                  <td><StatusPill>{order.paymentStatus}</StatusPill></td>
                  <td>
                    <select aria-label={`Status pesanan ${order.id}`} className="text-input" onChange={(event) => void updateOrderStatus(order, event.target.value)} value={order.orderStatus}>
                      {["Diterima", "Diproses", "Selesai", "Dibatalkan"].map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="button-row">
                      {!paid && order.paymentId ? <button className="button button--primary button--small" onClick={() => void updatePayment(order, "Dikonfirmasi")} type="button">Konfirmasi bayar</button> : null}
                      {!order.paymentId ? <button className="button button--outline button--small" onClick={() => void createPayment(order)} type="button">Buat pembayaran</button> : null}
                      {paid && !order.productionId ? <button className="button button--outline button--small" onClick={() => void forwardToProduction(order)} type="button">Teruskan ke Produksi</button> : null}
                      {order.paymentId ? <button className="button button--outline button--small" onClick={() => void updatePayment(order, "Ditolak")} type="button">Tolak bayar</button> : null}
                      {order.paymentId && !paid ? <button className="button button--outline button--small" onClick={() => void deletePayment(order)} type="button">Hapus pembayaran</button> : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filtered.length ? <tr><td colSpan={8}>Belum ada pesanan.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function HandoverTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [handovers, setHandovers] = useState<Array<{ id: string; orderId: string; status: string }>>([]);
  const [error, setError] = useState("");

  async function load() {
    const [orderResult, handoverResult] = await Promise.all([
      requestJson("/api/orders"),
      requestJson("/api/handovers"),
    ]);
    setOrders(orderResult);
    setHandovers(handoverResult);
  }
  useEffect(() => {
    void Promise.all([requestJson("/api/orders"), requestJson("/api/handovers")])
      .then(([orderResult, handoverResult]) => {
        setOrders(orderResult);
        setHandovers(handoverResult);
      })
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : "Penyerahan tidak dapat dimuat."),
      );
  }, []);

  async function createHandover(orderId: string) {
    setError("");
    try {
      await requestJson("/api/handovers", "POST", { orderId });
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Penyerahan tidak dapat dibuat.");
    }
  }

  async function updateHandover(id: string, status: string) {
    setError("");
    try {
      await requestJson(`/api/handovers/${id}`, "PATCH", { status });
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Status penyerahan tidak dapat diubah.");
    }
  }

  return (
    <>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>No. Pesanan</th><th>Pelanggan</th><th>Metode</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {orders.map((order) => {
              const record = handovers.find((handover) => handover.orderId === order.id);
              return (
                <tr key={order.id}>
                  <td>{order.id}</td><td>{order.customer}</td><td>{order.delivery}</td>
                  <td><StatusPill>{record?.status ?? "Belum disiapkan"}</StatusPill></td>
                  <td>
                    {!record && order.orderStatus === "Selesai" ? (
                      <button className="button button--outline button--small" onClick={() => void createHandover(order.id)} type="button">Buat Penyerahan</button>
                    ) : !record ? (
                      <span className="table-muted">Menunggu produksi selesai</span>
                    ) : record.status !== "Diserahkan" ? (
                      <button className="button button--primary button--small" onClick={() => void updateHandover(record.id, "Diserahkan")} type="button">Tandai Diserahkan</button>
                    ) : <StatusPill>Sudah diserahkan</StatusPill>}
                  </td>
                </tr>
              );
            })}
            {!orders.length ? <tr><td colSpan={5}>Belum ada pesanan.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
