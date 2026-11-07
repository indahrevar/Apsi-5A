import { getPrismaClient } from "@/lib/prisma";
import {
  demoPriceByProduct,
  demoStockByProduct,
  excludedCatalogProductIds,
} from "@/lib/demo-catalog";
import type { AppRole } from "@/lib/demo-auth";

export type CatalogItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number | null;
  stock: number;
  minimum: number;
};

export type WorkspaceOrder = {
  id: string;
  customerId: string;
  customer: string;
  date: string;
  status: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    stockAfter: number;
  }>;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  fulfillmentMethod: string;
  fulfillmentStatus: string;
  productionStatus: string;
};

export type WorkspaceReview = {
  id: string;
  orderId: string;
  customer: string;
  rating: number;
  message: string;
  date: string;
};

export type WorkspaceData = {
  catalog: CatalogItem[];
  orders: WorkspaceOrder[];
  reviews: WorkspaceReview[];
};

export async function getWorkspaceData(
  role: AppRole,
  userId: string,
): Promise<WorkspaceData> {
  const prisma = getPrismaClient();
  const orderWhere = role === "customer" ? { id_pelanggan: userId } : {};

  const [products, orders, historicalLines] = await Promise.all([
    prisma.produk.findMany({
      where: { id_produk: { notIn: [...excludedCatalogProductIds] } },
      orderBy: { nama_produk: "asc" },
    }),
    prisma.pesanan.findMany({
      where: orderWhere,
      include: {
        pelanggan: {
          select: { id_pelanggan: true, nama_pelanggan: true },
        },
        detail_pesanan: {
          include: { produk: { select: { nama_produk: true } } },
        },
        pembayaran: {
          orderBy: { tanggal_bayar: "desc" },
          take: 1,
        },
        produksi: {
          orderBy: { tanggal_mulai_produksi: "desc" },
          take: 1,
        },
        penyerahan: {
          orderBy: { tanggal_penyerahan: "desc" },
          take: 1,
        },
        ulasan: {
          orderBy: { tanggal_ulasan: "desc" },
          take: 1,
        },
      },
      orderBy: [{ tanggal_pesanan: "desc" }, { no_pesanan: "desc" }],
      take: 100,
    }),
    prisma.detail_pesanan.findMany({
      where: { pesanan: { status_pesanan: { not: "Batal" } } },
      include: { pesanan: { select: { tanggal_pesanan: true } } },
      orderBy: { pesanan: { tanggal_pesanan: "desc" } },
      take: 1000,
    }),
  ]);

  const historicalPrice = new Map<string, number>();
  const soldQuantity = new Map<string, number>();
  for (const line of historicalLines) {
    if (!historicalPrice.has(line.id_produk)) {
      historicalPrice.set(
        line.id_produk,
        Number(line.harga_satuan.toString()),
      );
    }

    soldQuantity.set(
      line.id_produk,
      (soldQuantity.get(line.id_produk) ?? 0) + line.jumlah,
    );
  }

  const catalog: CatalogItem[] = products.map((product) => {
    const initialStock =
      demoStockByProduct.get(product.id_produk) ?? product.stok_minimum + 20;

    return {
      id: product.id_produk,
      name: product.nama_produk,
      category: product.kategori_produk,
      unit: product.satuan_produk,
      price:
        demoPriceByProduct.get(product.id_produk) ??
        historicalPrice.get(product.id_produk) ??
        null,
      stock: Math.max(0, initialStock - (soldQuantity.get(product.id_produk) ?? 0)),
      minimum: product.stok_minimum,
    };
  });

  const mappedOrders: WorkspaceOrder[] = orders.map((order) => {
    const items = order.detail_pesanan.map((line) => ({
      id: line.id_produk,
      name: line.produk.nama_produk,
      quantity: line.jumlah,
      price: Number(line.harga_satuan.toString()),
      stockAfter: line.stok_produk_sesudah,
    }));

    return {
      id: order.no_pesanan,
      customerId: order.pelanggan.id_pelanggan,
      customer: order.pelanggan.nama_pelanggan,
      date: order.tanggal_pesanan.toISOString(),
      status: order.status_pesanan,
      items,
      total: items.reduce((total, item) => total + item.quantity * item.price, 0),
      paymentMethod: order.pembayaran[0]?.metode_pembayaran ?? "—",
      paymentStatus: order.pembayaran[0]?.status_pembayaran ?? "—",
      fulfillmentMethod: order.penyerahan[0]?.metode_penyerahan ?? "—",
      fulfillmentStatus: order.penyerahan[0]?.status_penyerahan ?? "—",
      productionStatus: order.produksi[0]?.status_produksi ?? "—",
    };
  });

  const reviews: WorkspaceReview[] = orders.flatMap((order) =>
    order.ulasan.map((review) => ({
      id: review.id_ulasan,
      orderId: order.no_pesanan,
      customer: order.pelanggan.nama_pelanggan,
      rating: review.rating,
      message: review.isi_ulasan,
      date: review.tanggal_ulasan.toISOString(),
    })),
  );

  return { catalog, orders: mappedOrders, reviews };
}
