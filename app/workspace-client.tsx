"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type { AppRole } from "@/lib/demo-auth";
import type {
  CatalogItem,
  WorkspaceData,
  WorkspaceOrder,
  WorkspaceReview,
} from "@/lib/workspace-data";

type Props = {
  role: Exclude<AppRole, "customer"> | "customer";
  userName: string;
  view: string;
};

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const paths: Record<AppRole, string> = {
  customer: "/customer",
  admin: "/admin",
  production: "/produksi",
  owner: "/owner",
};

const navItems: Record<AppRole, Array<{ view: string; label: string }>> = {
  customer: [
    { view: "menu", label: "Menu & Pesan" },
    { view: "checkout", label: "Pembayaran" },
    { view: "orders", label: "Pesanan Saya" },
    { view: "reviews", label: "Kritik & Saran" },
  ],
  admin: [
    { view: "dashboard", label: "Dashboard" },
    { view: "menu", label: "Kelola Menu & Stok" },
    { view: "orders", label: "Pesanan & Pembayaran" },
    { view: "fulfillment", label: "Laporan Penyerahan" },
    { view: "sales", label: "Data Transaksi & Penjualan" },
    { view: "reviews", label: "Ulasan Pelanggan" },
  ],
  production: [{ view: "orders", label: "Daftar Pesanan" }],
  owner: [
    { view: "dashboard", label: "Dashboard" },
    { view: "stock", label: "Kelola Stok" },
    { view: "reports", label: "Laporan" },
    { view: "reviews", label: "Ulasan Pelanggan" },
  ],
};

const roleTitles: Record<AppRole, string> = {
  customer: "Dapur Abita",
  admin: "Admin",
  production: "Karyawan Produksi",
  owner: "Owner",
};

const emptyData: WorkspaceData = { catalog: [], orders: [], reviews: [] };

function isWorkspaceData(value: unknown): value is WorkspaceData {
  return (
    !!value &&
    typeof value === "object" &&
    "catalog" in value &&
    Array.isArray(value.catalog) &&
    "orders" in value &&
    Array.isArray(value.orders) &&
    "reviews" in value &&
    Array.isArray(value.reviews)
  );
}

function money(amount: number) {
  return currency.format(amount);
}

function date(value: string) {
  return dateFormat.format(new Date(value));
}

function statusStyle(status: string) {
  if (["Selesai", "Lunas", "Diambil", "Dikirim"].includes(status)) {
    return "border-[#b8cdbb] bg-[#f1f7f1] text-[#3e6645]";
  }
  if (["Baru", "Menunggu"].includes(status)) {
    return "border-[#ddd0b6] bg-[#fffaf0] text-[#7b5b21]";
  }
  return "border-[#d5d5d5] bg-[#f7f7f7] text-[#555]";
}

function Badge({ children }: { children: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] ${statusStyle(children)}`}
    >
      {children}
    </span>
  );
}

function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[25px] font-bold tracking-tight text-[#303030]">
          {title}
        </h1>
        <div className="mt-2 h-1 w-40 rounded-full bg-[#dedede]" />
        {subtitle ? (
          <p className="mt-2 text-sm text-[#747474]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function Metric({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <article className="rounded-md border border-[#d6d6d6] bg-white p-4">
      <p className="text-xs text-[#777]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#303030]">{value}</p>
      {suffix ? <p className="mt-1 text-xs text-[#555]">{suffix}</p> : null}
    </article>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-md border border-[#d6d6d6] bg-white ${className}`}
    >
      <h2 className="border-b border-[#e5e5e5] px-4 py-3 text-sm font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <p className="px-5 py-10 text-center text-sm text-[#777]">{children}</p>
  );
}

function MenuTable({
  items,
  onEdit,
  onDelete,
  busy,
}: {
  items: CatalogItem[];
  onEdit: (item: CatalogItem) => void;
  onDelete: (item: CatalogItem) => void;
  busy: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[790px] border-collapse text-left text-sm">
        <thead className="bg-[#f3f3f3] text-xs text-[#555]">
          <tr>
            <th className="px-3 py-3 font-medium">ID</th>
            <th className="px-3 py-3 font-medium">Nama Menu</th>
            <th className="px-3 py-3 font-medium">Kategori</th>
            <th className="px-3 py-3 font-medium">Satuan</th>
            <th className="px-3 py-3 text-right font-medium">Harga</th>
            <th className="px-3 py-3 text-right font-medium">Stok*</th>
            <th className="px-3 py-3 text-right font-medium">Min.</th>
            <th className="px-3 py-3 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr className="border-t border-[#e9e9e9]" key={item.id}>
              <td className="px-3 py-3 text-xs">{item.id}</td>
              <td className="px-3 py-3 font-medium">{item.name}</td>
              <td className="px-3 py-3">{item.category}</td>
              <td className="px-3 py-3">{item.unit}</td>
              <td className="px-3 py-3 text-right font-medium">
                {item.price === null ? "Belum diatur" : money(item.price)}
              </td>
              <td className="px-3 py-3 text-right">{item.stock}</td>
              <td className="px-3 py-3 text-right">{item.minimum}</td>
              <td className="px-3 py-3">
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-[#aaa] px-3 py-1 text-xs hover:bg-[#f5f5f5] disabled:opacity-50"
                    disabled={busy}
                    onClick={() => onEdit(item)}
                    type="button"
                  >
                    Ubah
                  </button>
                  <button
                    className="rounded-full border border-[#d5baba] px-3 py-1 text-xs text-[#8b3333] hover:bg-[#fff5f5] disabled:opacity-50"
                    disabled={busy}
                    onClick={() => onDelete(item)}
                    type="button"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 ? (
            <tr>
              <td colSpan={8}>
                <EmptyState>Belum ada menu.</EmptyState>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <p className="border-t border-[#eee] px-4 py-2 text-[11px] text-[#777]">
        * Perkiraan stok demo dihitung dari transaksi; skema saat ini tidak
        menyimpan stok produk berjalan.
      </p>
    </div>
  );
}

function OrderTable({
  orders,
  role,
  busy,
  onAction,
  onReview,
}: {
  orders: WorkspaceOrder[];
  role: AppRole;
  busy: boolean;
  onAction: (action: string, values: Record<string, unknown>) => void;
  onReview?: (order: WorkspaceOrder) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left text-sm">
        <thead className="bg-[#f3f3f3] text-xs text-[#555]">
          <tr>
            <th className="px-3 py-3 font-medium">No. Pesanan</th>
            {role !== "customer" ? (
              <th className="px-3 py-3 font-medium">Pemesan</th>
            ) : null}
            <th className="px-3 py-3 font-medium">Tanggal</th>
            <th className="px-3 py-3 font-medium">Item</th>
            <th className="px-3 py-3 text-right font-medium">Total</th>
            <th className="px-3 py-3 font-medium">Pembayaran</th>
            <th className="px-3 py-3 font-medium">Status Pesanan</th>
            <th className="px-3 py-3 font-medium">Penyerahan</th>
            <th className="px-3 py-3 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const reviewable =
              role === "customer" &&
              order.status === "Selesai" &&
              onReview;

            return (
              <tr className="border-t border-[#e9e9e9] align-top" key={order.id}>
                <td className="px-3 py-3 font-medium">{order.id}</td>
                {role !== "customer" ? (
                  <td className="px-3 py-3">{order.customer}</td>
                ) : null}
                <td className="px-3 py-3">{date(order.date)}</td>
                <td className="px-3 py-3 text-xs leading-5">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.quantity}× {item.name}
                    </p>
                  ))}
                </td>
                <td className="px-3 py-3 text-right">{money(order.total)}</td>
                <td className="px-3 py-3">
                  <span>{order.paymentMethod}</span>
                  <div className="mt-1">
                    <Badge>{order.paymentStatus}</Badge>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge>{order.status}</Badge>
                </td>
                <td className="px-3 py-3">
                  <span>{order.fulfillmentMethod}</span>
                  <div className="mt-1">
                    <Badge>{order.fulfillmentStatus}</Badge>
                  </div>
                </td>
                <td className="px-3 py-3">
                  {role === "admin" ? (
                    <div className="flex min-w-32 flex-col items-start gap-2">
                      {order.paymentStatus === "Menunggu" ? (
                        <button
                          className="rounded-full bg-[#303030] px-3 py-1.5 text-xs text-white disabled:opacity-50"
                          disabled={busy}
                          onClick={() =>
                            onAction("confirm-payment", { orderId: order.id })
                          }
                          type="button"
                        >
                          Konfirmasi Bayar
                        </button>
                      ) : null}
                      <select
                        aria-label={`Status ${order.id}`}
                        className="rounded border border-[#ccc] bg-white px-2 py-1 text-xs"
                        disabled={busy}
                        onChange={(event) =>
                          onAction("update-order", {
                            orderId: order.id,
                            status: event.currentTarget.value,
                          })
                        }
                        value={order.status}
                      >
                        {["Baru", "Produksi", "Selesai", "Batal"].map(
                          (status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ),
                        )}
                      </select>
                      <select
                        aria-label={`Penyerahan ${order.id}`}
                        className="rounded border border-[#ccc] bg-white px-2 py-1 text-xs"
                        disabled={busy}
                        onChange={(event) =>
                          onAction("update-fulfillment", {
                            orderId: order.id,
                            status: event.currentTarget.value,
                          })
                        }
                        value={order.fulfillmentStatus}
                      >
                        {["Menunggu", "Diambil", "Dikirim"].map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  {reviewable ? (
                    <button
                      className="rounded-full border border-[#aaa] px-3 py-1.5 text-xs hover:bg-[#f5f5f5]"
                      onClick={() => onReview(order)}
                      type="button"
                    >
                      Beri Ulasan
                    </button>
                  ) : null}
                  {role === "production" ? (
                    <div className="flex min-w-24 flex-col items-start gap-2">
                      <Badge>{order.productionStatus}</Badge>
                      {order.status !== "Selesai" ? (
                        <button
                          className="rounded-full bg-[#303030] px-3 py-1.5 text-xs text-white disabled:opacity-50"
                          disabled={busy}
                          onClick={() =>
                            onAction("update-production", {
                              orderId: order.id,
                              status:
                                order.productionStatus === "Proses"
                                  ? "Selesai"
                                  : "Proses",
                            })
                          }
                          type="button"
                        >
                          {order.productionStatus === "Proses"
                            ? "Selesaikan"
                            : "Mulai Produksi"}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
          {orders.length === 0 ? (
            <tr>
              <td colSpan={role === "customer" ? 8 : 9}>
                <EmptyState>Belum ada pesanan.</EmptyState>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function MenuEditor({
  item,
  onSubmit,
  onClose,
  busy,
}: {
  item: CatalogItem | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  busy: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <form
        className="w-full max-w-lg rounded-lg border border-[#d5d5d5] bg-white p-6 shadow-xl"
        onSubmit={onSubmit}
      >
        <h2 className="text-lg font-semibold">
          {item ? "Ubah Menu" : "Tambah Menu"}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-[#666]">
            ID Menu
            <input
              className="mt-1.5 h-10 w-full rounded border border-[#ccc] px-3 text-sm text-[#303030]"
              defaultValue={item?.id}
              maxLength={10}
              name="id"
              pattern="[A-Za-z0-9-]+"
              readOnly={!!item}
              required
            />
          </label>
          <label className="text-xs text-[#666]">
            Nama Menu
            <input
              className="mt-1.5 h-10 w-full rounded border border-[#ccc] px-3 text-sm text-[#303030]"
              defaultValue={item?.name}
              maxLength={30}
              name="name"
              required
            />
          </label>
          <label className="text-xs text-[#666]">
            Kategori
            <input
              className="mt-1.5 h-10 w-full rounded border border-[#ccc] px-3 text-sm text-[#303030]"
              defaultValue={item?.category}
              maxLength={10}
              name="category"
              required
            />
          </label>
          <label className="text-xs text-[#666]">
            Satuan
            <input
              className="mt-1.5 h-10 w-full rounded border border-[#ccc] px-3 text-sm text-[#303030]"
              defaultValue={item?.unit}
              maxLength={10}
              name="unit"
              required
            />
          </label>
          <label className="text-xs text-[#666] sm:col-span-2">
            Stok Minimum
            <input
              className="mt-1.5 h-10 w-full rounded border border-[#ccc] px-3 text-sm text-[#303030]"
              defaultValue={item?.minimum ?? 5}
              max={9999}
              min={0}
              name="minimum"
              required
              type="number"
            />
          </label>
        </div>
        <p className="mt-4 rounded bg-[#f6f6f6] p-3 text-xs leading-5 text-[#6b6b6b]">
          Harga dan stok berjalan belum memiliki kolom pada skema database.
          Harga katalog untuk produk demo dikelola sebagai data contoh.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-full border border-[#aaa] px-4 py-2 text-sm"
            onClick={onClose}
            type="button"
          >
            Batal
          </button>
          <button
            className="rounded-full bg-[#303030] px-5 py-2 text-sm text-white disabled:opacity-50"
            disabled={busy}
            type="submit"
          >
            {busy ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function WorkspaceClient({ role, userName, view }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<WorkspaceData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const cartRef = useRef<Record<string, number>>({});
  const [cartReady, setCartReady] = useState(role !== "customer");
  const [category, setCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [reviewOrder, setReviewOrder] = useState<WorkspaceOrder | null>(null);
  const [productionFilter, setProductionFilter] = useState("Semua");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const cartStorageKey = `dapur-abita-cart:${userName}`;

  const updateCart = useCallback(
    (update: (current: Record<string, number>) => Record<string, number>) => {
      const next = update(cartRef.current);
      cartRef.current = next;
      setCart(next);

      try {
        sessionStorage.setItem(cartStorageKey, JSON.stringify(next));
      } catch (storageError) {
        setError(
          storageError instanceof Error
            ? `Keranjang tidak dapat disimpan: ${storageError.message}`
            : "Keranjang tidak dapat disimpan.",
        );
      }
    },
    [cartStorageKey],
  );

  useEffect(() => {
    if (role !== "customer") return;
    let active = true;

    async function restoreCart() {
      let restoredCart: Record<string, number> = {};
      let restoreError = "";

      try {
        const savedCart = sessionStorage.getItem(cartStorageKey);
        if (savedCart) {
          const parsed: unknown = JSON.parse(savedCart);
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("Format keranjang tidak valid.");
          }

          restoredCart = Object.fromEntries(
            Object.entries(parsed).filter(
              ([, quantity]) =>
                typeof quantity === "number" &&
                Number.isInteger(quantity) &&
                quantity > 0,
            ),
          );
        }
      } catch (error) {
        restoreError =
          error instanceof Error
            ? `Keranjang tersimpan tidak dapat dipulihkan: ${error.message}`
            : "Keranjang tersimpan tidak dapat dipulihkan.";
      }

      await Promise.resolve();
      if (!active) return;
      cartRef.current = restoredCart;
      setCart(restoredCart);
      if (restoreError) setError(restoreError);
      setCartReady(true);
    }

    void restoreCart();
    return () => {
      active = false;
    };
  }, [cartStorageKey, role]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/workspace", { cache: "no-store" });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Gagal memuat data.";
        throw new Error(message);
      }
      if (!isWorkspaceData(result)) {
        throw new Error("Respons data aplikasi tidak valid.");
      }
      setData(result);
      return true;
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat data aplikasi.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchInitialData() {
      try {
        const response = await fetch("/api/workspace", { cache: "no-store" });
        const result: unknown = await response.json();
        if (!response.ok) {
          const message =
            result &&
            typeof result === "object" &&
            "error" in result &&
            typeof result.error === "string"
              ? result.error
              : "Gagal memuat data.";
          throw new Error(message);
        }
        if (!isWorkspaceData(result)) {
          throw new Error("Respons data aplikasi tidak valid.");
        }
        if (active) setData(result);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Gagal memuat data aplikasi.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchInitialData();
    return () => {
      active = false;
    };
  }, []);

  const goTo = (nextView: string) => {
    const nextPath =
      nextView === (role === "customer" ? "menu" : "dashboard")
        ? paths[role]
        : `${paths[role]}/${nextView}`;
    if (pathname !== nextPath) router.push(nextPath);
  };

  const runAction = async (
    action: string,
    values: Record<string, unknown>,
    successMessage: string,
    method = "POST",
  ) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/workspace", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...values }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Perubahan gagal disimpan.";
        throw new Error(message);
      }
      const refreshed = await loadData();
      if (!refreshed) {
        throw new Error(
          "Perubahan tersimpan, tetapi data terbaru gagal dimuat. Muat ulang halaman untuk melihatnya.",
        );
      }
      setNotice(successMessage);
      return true;
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Perubahan gagal disimpan.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const item = data.catalog.find((product) => product.id === id);
          return item ? { item, quantity } : null;
        })
        .filter((entry): entry is { item: CatalogItem; quantity: number } =>
          Boolean(entry),
        ),
    [cart, data.catalog],
  );
  const cartQuantity = cartItems.reduce(
    (quantity, entry) => quantity + entry.quantity,
    0,
  );

  const total = cartItems.reduce(
    (sum, entry) =>
      sum + (entry.item.price ?? 0) * entry.quantity,
    0,
  );

  const orderCountToday = data.orders.filter(
    (order) => new Date(order.date).toDateString() === new Date().toDateString(),
  ).length;
  const pendingPayments = data.orders.filter(
    (order) => order.paymentStatus === "Menunggu",
  ).length;
  const lowStock = data.catalog.filter(
    (item) => item.stock <= item.minimum,
  );
  const readyOrders = data.orders.filter(
    (order) => order.status === "Selesai",
  ).length;
  const categories = [
    "Semua",
    ...new Set(data.catalog.map((item) => item.category)),
  ];
  const filteredCatalog = data.catalog.filter((item) => {
    const matchesCategory = category === "Semua" || item.category === category;
    const matchesSearch = `${item.name} ${item.category}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const reportOrders = data.orders.filter((order) => {
    const orderDate = order.date.slice(0, 10);
    return (!dateFrom || orderDate >= dateFrom) && (!dateTo || orderDate <= dateTo);
  });

  const submitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const success = await runAction(
      "checkout",
      {
        items: cartItems.map(({ item, quantity }) => ({
          productId: item.id,
          quantity,
        })),
        delivery: String(formData.get("delivery")),
        paymentMethod: String(formData.get("paymentMethod")),
      },
      "Pesanan berhasil dibuat. Silakan tunggu konfirmasi admin.",
    );
    if (success) {
      updateCart(() => ({}));
      goTo("orders");
    }
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewOrder) return;
    const formData = new FormData(event.currentTarget);
    const success = await runAction(
      "review",
      {
        orderId: reviewOrder.id,
        rating: Number(formData.get("rating")),
        message: String(formData.get("message") ?? "").trim(),
      },
      "Terima kasih, ulasan Anda berhasil dikirim.",
    );
    if (success) setReviewOrder(null);
  };

  const saveMenu = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      id: String(formData.get("id") ?? ""),
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? ""),
      unit: String(formData.get("unit") ?? ""),
      minimum: Number(formData.get("minimum")),
    };
    const success = await runAction(
      editingItem ? "update-menu" : "create-menu",
      values,
      editingItem ? "Menu berhasil diperbarui." : "Menu berhasil ditambahkan.",
      editingItem ? "PATCH" : "POST",
    );
    if (success) {
      setShowEditor(false);
      setEditingItem(null);
    }
  };

  const removeMenu = async (item: CatalogItem) => {
    if (!window.confirm(`Hapus menu ${item.name}?`)) return;
    await runAction("delete-menu", { id: item.id }, "Menu berhasil dihapus.");
  };

  const exportCsv = () => {
    const rows = [
      ["No. Pesanan", "Customer", "Tanggal", "Status", "Pembayaran", "Total"],
      ...reportOrders.map((order) => [
        order.id,
        order.customer,
        date(order.date),
        order.status,
        order.paymentStatus,
        String(order.total),
      ]),
    ];
    const content = rows
      .map((row) =>
        row.map((field) => `"${field.replaceAll('"', '""')}"`).join(","),
      )
      .join("\r\n");
    const link = document.createElement("a");
    const downloadUrl = URL.createObjectURL(
      new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8" }),
    );
    link.href = downloadUrl;
    link.download = "laporan-dapur-abita.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  };

  const periodFilter = (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-[11px] text-[#777]">
        Dari
        <input
          className="mt-1 block h-8 rounded border border-[#ccc] bg-white px-2 text-xs text-[#303030]"
          onChange={(event) => setDateFrom(event.currentTarget.value)}
          type="date"
          value={dateFrom}
        />
      </label>
      <label className="text-[11px] text-[#777]">
        Sampai
        <input
          className="mt-1 block h-8 rounded border border-[#ccc] bg-white px-2 text-xs text-[#303030]"
          onChange={(event) => setDateTo(event.currentTarget.value)}
          type="date"
          value={dateTo}
        />
      </label>
    </div>
  );

  return (
    <main
      data-bakery-theme="workspace"
      className="min-h-screen bg-gradient-to-br from-[#fffaf3] via-[#fffdf9] to-[#f8eadc] text-[#3d2a20]"
    >
      {role === "customer" ? (
        <header className="flex min-h-[60px] flex-wrap items-center justify-between gap-3 border-b border-[#dedede] bg-white px-5 sm:px-8">
          <Link className="font-semibold tracking-wide" href="/customer">
            DAPUR ABITA
          </Link>
          <nav aria-label="Navigasi customer" className="flex flex-wrap gap-1">
            {navItems.customer.map((item) => (
              <button
                className={`rounded px-3 py-2 text-xs ${
                  view === item.view
                    ? "font-semibold text-[#303030]"
                    : "text-[#777] hover:bg-[#f5f5f5]"
                }`}
                disabled={item.view === "checkout" && !cartReady}
                key={item.view}
                onClick={() => goTo(item.view)}
                type="button"
              >
                {item.label}
                {item.view === "checkout" && cartItems.length > 0
                  ? ` (${cartQuantity})`
                  : ""}
              </button>
            ))}
          </nav>
          <button
            className="rounded-full border border-[#aaa] px-4 py-1.5 text-xs hover:bg-[#f5f5f5]"
            disabled={busy}
            onClick={() => void signOut()}
            type="button"
          >
            Keluar
          </button>
        </header>
      ) : (
        <div className="flex min-h-screen">
          <aside className="hidden w-[240px] shrink-0 border-r border-[#dedede] bg-white px-3 py-5 sm:flex sm:flex-col">
            <Link href={paths[role]} className="px-3 text-base font-bold">
              DAPUR ABITA
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-[#777]">
                {roleTitles[role]}
              </span>
            </Link>
            <nav aria-label="Navigasi utama" className="mt-8 space-y-1">
              {navItems[role].map((item) => {
                const active =
                  (view === "dashboard" && item.view === "dashboard") ||
                  (view === "orders" && item.view === "orders") ||
                  view === item.view;
                return (
                  <button
                    className={`w-full rounded px-3 py-2.5 text-left text-xs ${
                      active
                        ? "bg-[#f0f0f0] font-semibold"
                        : "text-[#777] hover:bg-[#f7f7f7]"
                    }`}
                    key={item.view}
                    onClick={() => goTo(item.view)}
                    type="button"
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <button
              className="mt-auto self-start rounded-full border border-[#aaa] px-4 py-1.5 text-xs hover:bg-[#f5f5f5]"
              disabled={busy}
              onClick={() => void signOut()}
              type="button"
            >
              Keluar
            </button>
          </aside>
          <header className="fixed inset-x-0 top-0 z-10 flex min-h-14 items-center justify-between border-b border-[#dedede] bg-white px-4 sm:hidden">
            <Link href={paths[role]} className="font-semibold">
              DAPUR ABITA
            </Link>
            <select
              aria-label="Pilih halaman"
              className="rounded border border-[#ccc] bg-white px-2 py-2 text-xs"
              onChange={(event) => goTo(event.currentTarget.value)}
              value={view}
            >
              {navItems[role].map((item) => (
                <option key={item.view} value={item.view}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              className="text-xs"
              disabled={busy}
              onClick={() => void signOut()}
              type="button"
            >
              Keluar
            </button>
          </header>
          <div className="min-w-0 flex-1 pt-14 sm:pt-0">
            {WorkspaceContent()}
          </div>
        </div>
      )}

      {role === "customer" ? (
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-8">
          {WorkspaceContent()}
        </div>
      ) : null}

      {showEditor ? (
        <MenuEditor
          busy={busy}
          item={editingItem}
          onClose={() => {
            setShowEditor(false);
            setEditingItem(null);
          }}
          onSubmit={saveMenu}
        />
      ) : null}
      {reviewOrder ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4">
          <form
            className="w-full max-w-md rounded-lg border border-[#d5d5d5] bg-white p-6 shadow-xl"
            onSubmit={submitReview}
          >
            <h2 className="text-lg font-semibold">Kritik & Saran</h2>
            <p className="mt-1 text-xs text-[#777]">
              Pesanan {reviewOrder.id}
            </p>
            <label className="mt-5 block text-xs font-medium">
              Rating
              <select
                className="mt-1.5 h-10 w-full rounded border border-[#ccc] bg-white px-3 text-sm"
                defaultValue="5"
                name="rating"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} dari 5 bintang
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-xs font-medium">
              Ulasan
              <textarea
                className="mt-1.5 min-h-28 w-full rounded border border-[#ccc] p-3 text-sm"
                maxLength={255}
                name="message"
                placeholder="Ceritakan pengalaman Anda..."
                required
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-full border border-[#aaa] px-4 py-2 text-sm"
                onClick={() => setReviewOrder(null)}
                type="button"
              >
                Batal
              </button>
              <button
                className="rounded-full bg-[#303030] px-5 py-2 text-sm text-white disabled:opacity-50"
                disabled={busy}
                type="submit"
              >
                {busy ? "Mengirim..." : "Kirim"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {error ? (
        <div
          className="fixed bottom-4 right-4 z-50 max-w-md rounded border border-[#e4c2c2] bg-white px-4 py-3 text-sm text-[#8d3030] shadow-lg"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <span>{error}</span>
            <button
              aria-label="Tutup pesan"
              className="font-bold"
              onClick={() => setError("")}
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
      {notice ? (
        <div
          className="fixed bottom-4 right-4 z-40 max-w-md rounded border border-[#b8cdbb] bg-white px-4 py-3 text-sm text-[#3e6645] shadow-lg"
          role="status"
        >
          <div className="flex items-start gap-3">
            <span>{notice}</span>
            <button
              aria-label="Tutup pesan"
              className="font-bold"
              onClick={() => setNotice("")}
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

    </main>
  );

  function WorkspaceContent() {
    if (loading) {
      return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          <p className="text-sm text-[#777]">Memuat data...</p>
        </div>
      );
    }

    if (error && data.catalog.length === 0 && data.orders.length === 0) {
      return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          <section className="rounded-md border border-[#e4c2c2] bg-white p-5">
            <p className="text-sm text-[#8d3030]">{error}</p>
            <button
              className="mt-4 rounded-full bg-[#303030] px-4 py-2 text-xs text-white"
              onClick={() => void loadData()}
              type="button"
            >
              Coba lagi
            </button>
          </section>
        </div>
      );
    }

    if (role === "customer") {
      if (view === "orders") {
        return (
          <>
            <SectionTitle title="Pesanan Saya" subtitle="Pantau status pesanan Anda." />
            {notice ? (
              <p className="mb-4 rounded border border-[#b8cdbb] bg-[#f1f7f1] px-4 py-3 text-sm text-[#3e6645]">
                {notice}
              </p>
            ) : null}
            <Panel title="Riwayat Pesanan">
              <OrderTable
                onReview={setReviewOrder}
                orders={data.orders}
                role={role}
                busy={busy}
                onAction={(action, values) => {
                  void runAction(action, values, "Perubahan berhasil disimpan.");
                }}
              />
            </Panel>
          </>
        );
      }

      if (view === "reviews") {
        return (
          <>
            <SectionTitle
              title="Kritik & Saran"
              subtitle="Ulasan dapat diberikan untuk pesanan yang telah selesai."
            />
            <Panel title="Pesanan yang dapat diulas">
              <div className="divide-y divide-[#eee]">
                {data.orders
                  .filter((order) => order.status === "Selesai")
                  .map((order) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
                      key={order.id}
                    >
                      <div>
                        <p className="text-sm font-medium">{order.id}</p>
                        <p className="mt-1 text-xs text-[#777]">
                          {order.items.map((item) => item.name).join(", ")} ·{" "}
                          {date(order.date)}
                        </p>
                      </div>
                      {data.reviews.some((review) => review.orderId === order.id) ? (
                        <Badge>Sudah diulas</Badge>
                      ) : (
                        <button
                          className="rounded-full border border-[#aaa] px-4 py-2 text-xs hover:bg-[#f5f5f5]"
                          onClick={() => setReviewOrder(order)}
                          type="button"
                        >
                          Tulis Ulasan
                        </button>
                      )}
                    </div>
                  ))}
                {data.orders.every((order) => order.status !== "Selesai") ? (
                  <EmptyState>Pesanan selesai akan muncul di sini.</EmptyState>
                ) : null}
              </div>
            </Panel>
            {data.reviews.length > 0 ? (
              <Panel className="mt-5" title="Ulasan Terkirim">
                <ReviewList reviews={data.reviews} />
              </Panel>
            ) : null}
          </>
        );
      }

      if (view === "checkout") {
        return (
          <>
            <SectionTitle title="Pembayaran" subtitle="Periksa keranjang sebelum membuat pesanan." />
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <Panel title="Ringkasan Keranjang">
                {cartItems.length === 0 ? (
                  <div className="p-5">
                    <EmptyState>Keranjang masih kosong.</EmptyState>
                    <button
                      className="mx-auto block rounded-full bg-[#303030] px-5 py-2 text-xs text-white"
                      onClick={() => goTo("menu")}
                      type="button"
                    >
                      Pilih Menu
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#eee]">
                    <p className="px-4 py-3 text-xs text-[#777]">
                      {cartQuantity} item dalam pesanan
                    </p>
                    {cartItems.map(({ item, quantity }) => (
                      <div
                        className="flex items-center justify-between gap-3 px-4 py-3"
                        key={item.id}
                      >
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="mt-1 text-xs text-[#777]">
                            {money(item.price ?? 0)} / {item.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            aria-label={`Kurangi ${item.name}`}
                            className="size-8 rounded-full border border-[#ccc]"
                            onClick={() =>
                              updateCart((current) => {
                                const nextQuantity = (current[item.id] ?? 0) - 1;
                                const next = { ...current };
                                if (nextQuantity <= 0) delete next[item.id];
                                else next[item.id] = nextQuantity;
                                return next;
                              })
                            }
                            type="button"
                          >
                            −
                          </button>
                          <span className="min-w-5 text-center text-sm">
                            {quantity}
                          </span>
                          <button
                            aria-label={`Tambah ${item.name}`}
                            className="size-8 rounded-full border border-[#ccc]"
                            onClick={() =>
                              updateCart((current) => ({
                                ...current,
                                [item.id]: Math.min(
                                  item.stock,
                                  (current[item.id] ?? 0) + 1,
                                ),
                              }))
                            }
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between px-4 py-4 text-sm font-semibold">
                      <span>Total pembayaran</span>
                      <span>{money(total)}</span>
                    </div>
                  </div>
                )}
              </Panel>
              {cartItems.length > 0 ? (
                <form onSubmit={submitCheckout}>
                  <Panel title="Pengambilan & Pembayaran">
                    <div className="space-y-4 p-4">
                      <fieldset>
                        <legend className="text-xs font-medium">Penyerahan</legend>
                        <label className="mt-2 flex items-center gap-2 text-sm">
                          <input
                            defaultChecked
                            name="delivery"
                            required
                            type="radio"
                            value="Ambil"
                          />
                          Ambil di tempat
                        </label>
                        <label className="mt-2 flex items-center gap-2 text-sm">
                          <input name="delivery" type="radio" value="Diantar" />
                          Diantar ke alamat profil
                        </label>
                      </fieldset>
                      <fieldset>
                        <legend className="text-xs font-medium">
                          Metode pembayaran
                        </legend>
                        <label className="mt-2 flex items-center gap-2 text-sm">
                          <input
                            defaultChecked
                            name="paymentMethod"
                            type="radio"
                            value="Transfer"
                          />
                          Transfer manual
                        </label>
                        <label className="mt-2 flex items-center gap-2 text-sm">
                          <input
                            name="paymentMethod"
                            type="radio"
                            value="Tunai"
                          />
                          Tunai saat pengambilan
                        </label>
                      </fieldset>
                      <p className="rounded bg-[#f5f5f5] p-3 text-xs leading-5 text-[#666]">
                        Pembayaran dicatat sebagai menunggu konfirmasi admin.
                        Transfer belum diproses otomatis oleh payment gateway.
                      </p>
                      <button
                        className="h-10 w-full rounded-full bg-[#303030] text-sm text-white disabled:opacity-50"
                        disabled={busy}
                        type="submit"
                      >
                        {busy ? "Memproses..." : "Buat Pesanan"}
                      </button>
                    </div>
                  </Panel>
                </form>
              ) : null}
            </div>
          </>
        );
      }

      return (
        <>
          <SectionTitle
            title="Menu & Pesan"
            subtitle={`Selamat datang, ${userName}. Pilih menu favorit Anda.`}
            action={
              <button
                className="rounded-full bg-[#303030] px-5 py-2.5 text-xs text-white"
                disabled={!cartReady}
                onClick={() => goTo("checkout")}
                type="button"
              >
                Keranjang ({cartQuantity}) · {money(total)}
              </button>
            }
          />
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="menu-search">
              Cari menu
            </label>
            <input
              className="h-9 w-full max-w-xs rounded border border-[#ccc] bg-white px-3 text-sm"
              id="menu-search"
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Cari menu..."
              value={search}
            />
            {categories.map((item) => (
              <button
                className={`rounded-full border px-4 py-2 text-xs ${
                  category === item
                    ? "border-[#303030] bg-[#303030] text-white"
                    : "border-[#ccc] bg-white hover:bg-[#f3f3f3]"
                }`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCatalog.map((item) => (
              <article
                className="flex min-h-52 flex-col rounded-md border border-[#d6d6d6] bg-white p-5"
                key={item.id}
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#f0f0f0] text-sm font-semibold">
                  {item.name.slice(0, 1)}
                </div>
                <p className="text-xs text-[#777]">{item.category}</p>
                <h2 className="mt-1 font-semibold">{item.name}</h2>
                <p className="mt-1 text-xs text-[#777]">per {item.unit}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <div>
                    <p className="font-semibold">
                      {item.price === null
                        ? "Harga belum tersedia"
                        : money(item.price)}
                    </p>
                    <p className="mt-1 text-xs text-[#777]">
                      Stok {item.stock} {item.unit}
                    </p>
                  </div>
                  <button
                    className="rounded-full bg-[#303030] px-4 py-2 text-xs text-white disabled:cursor-not-allowed disabled:bg-[#aaa]"
                    disabled={
                      !cartReady || item.stock <= 0 || item.price === null
                    }
                    onClick={() =>
                      updateCart((current) => ({
                        ...current,
                        [item.id]: Math.min(
                          item.stock,
                          (current[item.id] ?? 0) + 1,
                        ),
                      }))
                    }
                    type="button"
                  >
                    {cart[item.id] ? `Tambah (${cart[item.id]})` : "Tambah"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      );
    }

    if (role === "production") {
      const newOrders = data.orders.filter((order) => order.status === "Baru").length;
      const activeOrders = data.orders.filter(
        (order) => order.productionStatus === "Proses",
      ).length;
      return (
        <>
          <SectionTitle
            title="Daftar Pesanan Produksi"
            subtitle={`Selamat bekerja, ${userName}. Perbarui status pesanan di sini.`}
          />
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <Metric label="Baru" value={newOrders} suffix="Pesanan" />
            <Metric label="Sedang dibuat" value={activeOrders} suffix="Pesanan" />
            <Metric label="Selesai" value={readyOrders} suffix="Pesanan" />
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {["Semua", "Baru", "Sedang dibuat", "Selesai"].map((status) => (
              <button
                className={`rounded-full border px-4 py-1.5 text-xs ${
                  productionFilter === status
                    ? "border-[#303030] bg-[#303030] text-white"
                    : "border-[#bbb] bg-white hover:bg-[#f1f1f1]"
                }`}
                key={status}
                onClick={() => setProductionFilter(status)}
                type="button"
              >
                {status}
              </button>
            ))}
          </div>
          <Panel title="Pesanan Produksi">
            <OrderTable
              orders={data.orders.filter((order) => {
                if (productionFilter === "Semua") return true;
                if (productionFilter === "Baru") return order.status === "Baru";
                if (productionFilter === "Selesai") return order.status === "Selesai";
                return order.productionStatus === "Proses";
              })}
              role={role}
              busy={busy}
              onAction={(action, values) => {
                void runAction(action, values, "Status produksi berhasil diperbarui.");
              }}
            />
          </Panel>
        </>
      );
    }

    if (role === "owner" && view === "stock") {
      return (
        <>
          <SectionTitle
            title="Kelola Stok"
            subtitle="Pantau perkiraan ketersediaan menu dan batas stok minimum."
          />
          <Panel title="Persediaan Menu">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead className="bg-[#f3f3f3] text-xs text-[#555]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Menu</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 text-right font-medium">Stok*</th>
                    <th className="px-4 py-3 text-right font-medium">Minimum</th>
                    <th className="px-4 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.catalog.map((item) => {
                    const isLow = item.stock <= item.minimum;
                    return (
                      <tr className="border-t border-[#e9e9e9]" key={item.id}>
                        <td className="px-4 py-3 font-medium">{item.name}</td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3 text-right">
                          {item.stock} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.minimum} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge>{isLow ? "Stok Rendah" : "Aman"}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {data.catalog.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState>Belum ada data stok.</EmptyState>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
              <p className="border-t border-[#eee] px-4 py-2 text-[11px] text-[#777]">
                * Stok merupakan perkiraan dari transaksi; skema database saat
                ini tidak menyimpan stok berjalan.
              </p>
            </div>
          </Panel>
        </>
      );
    }

    if (view === "menu") {
      return (
        <>
          <SectionTitle
            title="Kelola Menu & Stok"
            subtitle="Perbarui informasi menu dan batas stok minimum."
            action={
              <button
                className="rounded-full bg-[#303030] px-5 py-2.5 text-xs text-white"
                onClick={() => {
                  setEditingItem(null);
                  setShowEditor(true);
                }}
                type="button"
              >
                Tambah Menu
              </button>
            }
          />
          <Panel title="Daftar Menu">
            <MenuTable
              items={data.catalog}
              busy={busy}
              onDelete={(item) => void removeMenu(item)}
              onEdit={(item) => {
                setEditingItem(item);
                setShowEditor(true);
              }}
            />
          </Panel>
        </>
      );
    }

    if (view === "orders") {
      return (
        <>
          <SectionTitle title="Pesanan & Pembayaran" subtitle="Tinjau dan kelola pesanan customer." />
          <div className="mb-5 grid gap-3 md:grid-cols-4">
            <Metric label="Pesanan hari ini" value={orderCountToday} suffix="Pesanan" />
            <Metric label="Menunggu pembayaran" value={pendingPayments} suffix="Pesanan" />
            <Metric label="Stok mendekati minimum" value={lowStock.length} suffix="Produk" />
            <Metric label="Siap diserahkan" value={readyOrders} suffix="Pesanan" />
          </div>
          <Panel title="Semua Pesanan">
            <OrderTable
              orders={data.orders}
              role={role}
              busy={busy}
              onAction={(action, values) => {
                void runAction(action, values, "Data pesanan berhasil diperbarui.");
              }}
            />
          </Panel>
        </>
      );
    }

    if (view === "fulfillment") {
      return (
        <>
          <SectionTitle
            title="Laporan Penyerahan"
            subtitle="Rekap status penyerahan pesanan."
            action={
              <div className="flex flex-wrap items-end gap-3">
                {periodFilter}
                <button
                  className="rounded-full border border-[#aaa] bg-white px-4 py-2 text-xs hover:bg-[#f3f3f3]"
                  onClick={exportCsv}
                  type="button"
                >
                  Unduh CSV
                </button>
              </div>
            }
          />
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <Metric
              label="Menunggu diserahkan"
              value={
                reportOrders.filter(
                  (order) => order.fulfillmentStatus === "Menunggu",
                ).length
              }
              suffix="Pesanan"
            />
            <Metric
              label="Diambil"
              value={
                reportOrders.filter(
                  (order) => order.fulfillmentStatus === "Diambil",
                ).length
              }
              suffix="Pesanan"
            />
            <Metric
              label="Dikirim"
              value={
                reportOrders.filter(
                  (order) => order.fulfillmentStatus === "Dikirim",
                ).length
              }
              suffix="Pesanan"
            />
          </div>
          <Panel title="Riwayat Penyerahan">
            <OrderTable
              orders={reportOrders}
              role={role}
              busy={busy}
              onAction={(action, values) => {
                void runAction(action, values, "Status penyerahan diperbarui.");
              }}
            />
          </Panel>
        </>
      );
    }

    if (view === "sales" || view === "reports") {
      const revenue = reportOrders
        .filter((order) => order.paymentStatus === "Lunas")
        .reduce((sum, order) => sum + order.total, 0);
      const average = reportOrders.length
        ? Math.round(revenue / reportOrders.length)
        : 0;
      const title =
        role === "owner" ? "Laporan Owner" : "Data Transaksi & Penjualan";

      return (
        <>
          <SectionTitle
            title={title}
            subtitle="Ringkasan penjualan dan operasional Dapur Abita."
            action={
              <div className="flex flex-wrap items-end gap-3">
                {periodFilter}
                <button
                  className="rounded-full border border-[#aaa] bg-white px-4 py-2 text-xs hover:bg-[#f3f3f3]"
                  onClick={exportCsv}
                  type="button"
                >
                  Unduh CSV
                </button>
              </div>
            }
          />
          <div className="mb-5 grid gap-3 md:grid-cols-4">
            <Metric label="Total pesanan" value={reportOrders.length} suffix="Pesanan" />
            <Metric label="Pendapatan terkonfirmasi" value={money(revenue)} />
            <Metric label="Rata-rata pesanan" value={money(average)} />
            <Metric label="Total ulasan" value={data.reviews.length} suffix="Ulasan" />
          </div>
          <Panel title="Ringkasan Pesanan">
            <OrderTable
              orders={reportOrders}
              role={role}
              busy={busy}
              onAction={(action, values) => {
                void runAction(action, values, "Data pesanan diperbarui.");
              }}
            />
          </Panel>
          <Panel className="mt-5" title="Menu Mendekati Stok Minimum">
            {lowStock.length ? (
              <ul className="divide-y divide-[#eee]">
                {lowStock.map((item) => (
                  <li
                    className="flex justify-between px-4 py-3 text-sm"
                    key={item.id}
                  >
                    <span>{item.name}</span>
                    <span>
                      {item.stock} {item.unit} · Min. {item.minimum}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>Tidak ada menu yang mendekati stok minimum.</EmptyState>
            )}
          </Panel>
        </>
      );
    }

    if (view === "reviews") {
      return (
        <>
          <SectionTitle title="Ulasan Pelanggan" subtitle="Masukan pelanggan untuk Dapur Abita." />
          <Panel title={`${data.reviews.length} Ulasan`}>
            <ReviewList reviews={data.reviews} />
          </Panel>
        </>
      );
    }

    return (
      <>
        <SectionTitle
          title={role === "owner" ? "Dashboard Owner" : "Dashboard Admin"}
          subtitle={`Selamat datang, ${userName}. Berikut ringkasan operasional.`}
        />
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Pesanan hari ini" value={orderCountToday} suffix="Pesanan" />
          <Metric label="Menunggu konfirmasi bayar" value={pendingPayments} suffix="Menunggu" />
          <Metric label="Stok mendekati minimum" value={lowStock.length} suffix="Produk" />
          <Metric label="Siap diserahkan" value={readyOrders} suffix="Pesanan" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          <Panel title="Pesanan Terbaru">
            <OrderTable
              orders={data.orders.slice(0, 8)}
              role={role}
              busy={busy}
              onAction={(action, values) => {
                void runAction(action, values, "Perubahan berhasil disimpan.");
              }}
            />
          </Panel>
          <Panel title="Peringatan Stok">
            {lowStock.length ? (
              <div className="space-y-2 p-4">
                {lowStock.map((item) => (
                  <div className="rounded bg-[#f4f4f4] p-3" key={item.id}>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="mt-1 text-xs text-[#666]">
                      {item.stock} {item.unit} · Minimum {item.minimum}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>Stok semua menu aman.</EmptyState>
            )}
            <div className="border-t border-[#eee] p-4">
              <button
                className="w-full rounded-full border border-[#aaa] px-4 py-2 text-xs hover:bg-[#f5f5f5]"
                onClick={() => goTo("stock")}
                type="button"
              >
                Kelola Stok
              </button>
            </div>
          </Panel>
        </div>
      </>
    );
  }

  function ReviewList({ reviews }: { reviews: WorkspaceReview[] }) {
    if (reviews.length === 0) {
      return <EmptyState>Belum ada ulasan.</EmptyState>;
    }
    return (
      <div className="divide-y divide-[#eee]">
        {reviews.map((review) => (
          <article className="px-4 py-4" key={review.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{review.customer}</p>
              <p className="text-xs text-[#777]">
                {review.orderId} · {date(review.date)}
              </p>
            </div>
            <p className="mt-1 text-sm text-[#7b5b21]">
              {"★".repeat(review.rating)}
              <span className="text-[#ddd]">{"★".repeat(5 - review.rating)}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-[#555]">{review.message}</p>
          </article>
        ))}
      </div>
    );
  }
}
