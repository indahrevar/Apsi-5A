import { randomBytes } from "node:crypto";
import { authorizeApi } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

type OrderLineInput = { productId: string; quantity: number };

function isOrderLines(value: unknown): value is OrderLineInput[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 20 &&
    value.every((line) =>
      typeof line === "object" && line !== null &&
      "productId" in line && typeof line.productId === "string" &&
      "quantity" in line && Number.isInteger(line.quantity) &&
      Number(line.quantity) > 0 && Number(line.quantity) <= 100,
    );
}

function toOrderDto(order: {
  no_pesanan: string;
  tanggal_pesanan: Date;
  status_pesanan: string;
  metode_penyerahan: string;
  alamat_penyerahan: string | null;
  pelanggan: { id_pelanggan: string; nama_pelanggan: string };
  detail_pesanan: Array<{ jumlah: number; harga_satuan: { toString(): string }; produk: { id_produk: string; nama_produk: string; satuan_produk: string } }>;
  pembayaran: Array<{ id_pembayaran: string; metode_pembayaran: string; status_pembayaran: string; jumlah_bayar: { toString(): string } }>;
  produksi: Array<{ id_produksi: string; status_produksi: string }>;
  penyerahan: Array<{ metode_penyerahan: string; status_penyerahan: string }>;
}) {
  const total = order.detail_pesanan.reduce(
    (sum, line) => sum + line.jumlah * Number(line.harga_satuan.toString()),
    0,
  );
  const payment = order.pembayaran[0];
  const handover = order.penyerahan[0];
  return {
    id: order.no_pesanan,
    customerId: order.pelanggan.id_pelanggan,
    customer: order.pelanggan.nama_pelanggan,
    items: order.detail_pesanan.map((line) => `${line.jumlah}x ${line.produk.nama_produk}`).join(", "),
    lines: order.detail_pesanan.map((line) => ({
      productId: line.produk.id_produk,
      product: line.produk.nama_produk,
      quantity: line.jumlah,
      unit: line.produk.satuan_produk,
      unitPrice: Number(line.harga_satuan.toString()),
    })),
    total,
    method: payment?.metode_pembayaran ?? "—",
    paymentStatus: payment?.status_pembayaran ?? "Belum dibayar",
    paymentId: payment?.id_pembayaran ?? null,
    productionId: order.produksi[0]?.id_produksi ?? null,
    status: order.produksi[0]?.status_produksi ?? order.status_pesanan,
    orderStatus: order.status_pesanan,
    delivery: order.metode_penyerahan,
    deliveryAddress: order.alamat_penyerahan,
    handoverStatus: handover?.status_penyerahan ?? "Belum disiapkan",
    date: order.tanggal_pesanan.toISOString(),
  };
}

const orderInclude = {
  pelanggan: { select: { id_pelanggan: true, nama_pelanggan: true } },
  detail_pesanan: {
    include: {
      produk: { select: { id_produk: true, nama_produk: true, satuan_produk: true } },
    },
  },
  pembayaran: { orderBy: { tanggal_bayar: "desc" as const } },
  produksi: { orderBy: { tanggal_mulai_produksi: "desc" as const } },
  penyerahan: { orderBy: { tanggal_penyerahan: "desc" as const } },
};

export async function GET() {
  const { user, response } = await authorizeApi("CUSTOMER", "ADMIN");
  if (response) return response;
  const orders = await getPrismaClient().pesanan.findMany({
    where: user.role === "CUSTOMER" ? { id_pelanggan: user.personId } : undefined,
    include: orderInclude,
    orderBy: { tanggal_pesanan: "desc" },
  });
  return Response.json(orders.map(toOrderDto), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("CUSTOMER");
  if (response) return response;

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Data pesanan tidak valid.", 400);
  }
  if (!isOrderLines(input.items) ||
      !["Transfer", "Tunai"].includes(String(input.paymentMethod)) ||
      !["Ambil di Tempat", "Diantar"].includes(String(input.deliveryMethod)) ||
      (input.deliveryMethod === "Diantar" &&
        (typeof input.address !== "string" || !input.address.trim() || input.address.trim().length > 150))) {
    return apiError("Periksa kembali item, pembayaran, dan metode penyerahan.", 400);
  }

  const lines = input.items;
  try {
    const created = await getPrismaClient().$transaction(async (transaction) => {
      const uniqueItems = new Map<string, number>();
      for (const line of lines) {
        uniqueItems.set(line.productId, (uniqueItems.get(line.productId) ?? 0) + line.quantity);
      }
      const productIds = [...uniqueItems.keys()];
      const products = await transaction.produk.findMany({
        where: { id_produk: { in: productIds } },
      });
      if (products.length !== productIds.length) throw new Error("PRODUCT_NOT_FOUND");

      const orderId = `DA${randomBytes(4).toString("hex").toUpperCase()}`;
      const paymentId = `BYR${randomBytes(3).toString("hex").toUpperCase()}`;
      await transaction.pesanan.create({
        data: {
          no_pesanan: orderId,
          id_pelanggan: user.personId,
          tanggal_pesanan: new Date(),
          status_pesanan: "Diterima",
          metode_penyerahan: input.deliveryMethod === "Diantar" ? "Diantar" : "Ambil",
          alamat_penyerahan: input.deliveryMethod === "Diantar" ? String(input.address).trim() : null,
        },
      });

      let total = 0;
      for (const product of products) {
        const quantity = uniqueItems.get(product.id_produk)!;
        const stockUpdate = await transaction.produk.updateMany({
          where: { id_produk: product.id_produk, stok: { gte: quantity } },
          data: { stok: { decrement: quantity } },
        });
        if (stockUpdate.count !== 1) throw new Error("INSUFFICIENT_STOCK");
        const updatedProduct = await transaction.produk.findUniqueOrThrow({
          where: { id_produk: product.id_produk },
          select: { stok: true },
        });
        total += Number(product.harga.toString()) * quantity;
        await transaction.detail_pesanan.create({
          data: {
            no_pesanan: orderId,
            id_produk: product.id_produk,
            jumlah: quantity,
            harga_satuan: product.harga,
            stok_produk_sebelum: updatedProduct.stok + quantity,
            stok_produk_sesudah: updatedProduct.stok,
          },
        });
      }
      await transaction.pembayaran.create({
        data: {
          id_pembayaran: paymentId,
          no_pesanan: orderId,
          metode_pembayaran: input.paymentMethod === "Tunai" ? "Tunai" : "Transfer",
          jumlah_bayar: total,
          tanggal_bayar: new Date(),
          status_pembayaran: "Menunggu",
        },
      });
      return transaction.pesanan.findUniqueOrThrow({
        where: { no_pesanan: orderId },
        include: orderInclude,
      });
    });
    return Response.json(toOrderDto(created), { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return apiError("Salah satu menu tidak lagi tersedia.", 409);
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return apiError("Stok tidak mencukupi untuk salah satu menu.", 409);
    }
    console.error("POST /api/orders failed:", error);
    return apiError("Pesanan tidak dapat dibuat.", 500);
  }
}
