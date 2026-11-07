import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { excludedCatalogProductIds } from "@/lib/demo-catalog";
import { getWorkspaceData } from "@/lib/workspace-data";

type JsonRecord = Record<string, unknown>;

async function readBody(request: Request): Promise<JsonRecord | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as JsonRecord)
      : null;
  } catch {
    return null;
  }
}

function newId(prefix: string) {
  return `${prefix}${randomBytes(4).toString("hex").slice(0, 7).toUpperCase()}`;
}

function text(value: unknown, maximum: number) {
  return typeof value === "string" && value.trim().length <= maximum
    ? value.trim()
    : null;
}

function integer(value: unknown, minimum: number, maximum: number) {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= minimum &&
    value <= maximum
    ? value
    : null;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return jsonError("Sesi telah berakhir. Silakan masuk kembali.", 401);
  }

  try {
    const data = await getWorkspaceData(session.role, session.id);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /api/workspace failed:", error);
    return jsonError("Gagal memuat data aplikasi dari database.", 500);
  }
}

export async function POST(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return jsonError("Sesi telah berakhir. Silakan masuk kembali.", 401);
  }

  const body = await readBody(request);
  if (!body || typeof body.action !== "string") {
    return jsonError("Permintaan tidak valid.");
  }

  const prisma = getPrismaClient();

  try {
    switch (body.action) {
      case "checkout": {
        if (session.role !== "CUSTOMER") {
          return jsonError("Checkout hanya tersedia untuk customer.", 403);
        }

        if (
          !Array.isArray(body.items) ||
          body.items.length === 0 ||
          body.items.length > 20 ||
          !["Ambil", "Diantar"].includes(String(body.delivery)) ||
          !["Tunai", "Transfer"].includes(String(body.paymentMethod))
        ) {
          return jsonError("Periksa kembali keranjang dan pilihan pembayaran.");
        }

        const quantities = new Map<string, number>();
        for (const rawItem of body.items) {
          if (!rawItem || typeof rawItem !== "object") {
            return jsonError("Item keranjang tidak valid.");
          }

          const item = rawItem as JsonRecord;
          const productId = text(item.productId, 10);
          const quantity = integer(item.quantity, 1, 50);
          if (!productId || !quantity) {
            return jsonError("Jumlah item harus antara 1 dan 50.");
          }

          quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
        }

        const workspace = await getWorkspaceData("ADMIN", session.id);
        const catalog = new Map(workspace.catalog.map((item) => [item.id, item]));
        const items = [...quantities.entries()].map(([productId, quantity]) => {
          const product = catalog.get(productId);
          if (!product || !product.price || product.stock < quantity) {
            return null;
          }

          return { product, quantity, price: product.price };
        });

        if (items.some((item) => item === null)) {
          return jsonError(
            "Menu tidak tersedia, belum memiliki harga, atau stok demo tidak mencukupi.",
            409,
          );
        }

        const validItems = items.filter(
          (item): item is NonNullable<typeof item> => item !== null,
        );
        const products = await prisma.produk.findMany({
          where: { id_produk: { in: validItems.map((item) => item.product.id) } },
          select: { id_produk: true },
        });
        if (products.length !== validItems.length) {
          return jsonError("Ada menu yang tidak lagi tersedia.", 409);
        }

        const date = new Date();
        const plannedEnd = new Date(date);
        plannedEnd.setUTCDate(plannedEnd.getUTCDate() + 1);
        const orderId = newId("ORD");
        const paymentId = newId("PAY");
        const fulfillmentId = newId("FUL");
        const productionId = newId("PRD");
        const total = validItems.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0,
        );

        await prisma.$transaction(async (transaction) => {
          await transaction.pesanan.create({
            data: {
              no_pesanan: orderId,
              id_admin: "ADMDEMO1",
              id_pelanggan: session.id,
              tanggal_pesanan: date,
              status_pesanan: "Baru",
            },
          });

          for (const item of validItems) {
            await transaction.detail_pesanan.create({
              data: {
                no_pesanan: orderId,
                id_produk: item.product.id,
                jumlah: item.quantity,
                harga_satuan: item.price,
                stok_produk_sebelum: item.product.stock,
                stok_produk_sesudah: item.product.stock - item.quantity,
              },
            });
          }

          await transaction.pembayaran.create({
            data: {
              id_pembayaran: paymentId,
              id_admin: "ADMDEMO1",
              no_pesanan: orderId,
              metode_pembayaran: String(body.paymentMethod),
              jumlah_bayar: total,
              tanggal_bayar: date,
              status_pembayaran: "Menunggu",
            },
          });

          await transaction.penyerahan.create({
            data: {
              id_penyerahan: fulfillmentId,
              id_admin: "ADMDEMO1",
              no_pesanan: orderId,
              metode_penyerahan: String(body.delivery),
              status_penyerahan: "Menunggu",
              tanggal_penyerahan: plannedEnd,
            },
          });

          await transaction.produksi.create({
            data: {
              id_produksi: productionId,
              no_pesanan: orderId,
              id_karyawan: "KRYDEMO1",
              status_produksi: "Baru",
              tanggal_mulai_produksi: date,
              tanggal_selesai_produksi: plannedEnd,
            },
          });
        });

        return NextResponse.json({ orderId }, { status: 201 });
      }

      case "update-production": {
        if (session.role !== "KARYAWAN_PRODUKSI") {
          return jsonError("Aksi ini hanya tersedia untuk bagian produksi.", 403);
        }

        const orderId = text(body.orderId, 10);
        const status = text(body.status, 10);
        if (!orderId || !status || !["Proses", "Selesai"].includes(status)) {
          return jsonError("Status produksi tidak valid.");
        }

        const production = await prisma.produksi.findFirst({
          where: {
            no_pesanan: orderId,
            id_karyawan: session.id,
          },
          select: { id_produksi: true },
        });
        if (!production) {
          return jsonError("Pesanan tidak ditemukan untuk akun produksi ini.", 404);
        }

        const date = new Date();
        await prisma.$transaction([
          prisma.produksi.updateMany({
            where: { no_pesanan: orderId, id_karyawan: session.id },
            data: {
              status_produksi: status,
              ...(status === "Selesai"
                ? { tanggal_selesai_produksi: date }
                : {}),
            },
          }),
          prisma.pesanan.update({
            where: { no_pesanan: orderId },
            data: { status_pesanan: status === "Selesai" ? "Selesai" : "Produksi" },
          }),
        ]);
        return NextResponse.json({ success: true });
      }

      case "update-order": {
        if (session.role !== "ADMIN") {
          return jsonError("Aksi ini hanya tersedia untuk admin.", 403);
        }

        const orderId = text(body.orderId, 10);
        const status = text(body.status, 10);
        if (!orderId || !status || !["Baru", "Produksi", "Selesai", "Batal"].includes(status)) {
          return jsonError("Status pesanan tidak valid.");
        }

        await prisma.pesanan.update({
          where: { no_pesanan: orderId },
          data: { status_pesanan: status },
        });
        return NextResponse.json({ success: true });
      }

      case "confirm-payment": {
        if (session.role !== "ADMIN") {
          return jsonError("Aksi ini hanya tersedia untuk admin.", 403);
        }

        const orderId = text(body.orderId, 10);
        if (!orderId) {
          return jsonError("Nomor pesanan tidak valid.");
        }

        const result = await prisma.pembayaran.updateMany({
          where: { no_pesanan: orderId, status_pembayaran: "Menunggu" },
          data: {
            status_pembayaran: "Lunas",
            tanggal_bayar: new Date(),
          },
        });
        if (result.count === 0) {
          return jsonError("Pembayaran menunggu tidak ditemukan.", 404);
        }
        return NextResponse.json({ success: true });
      }

      case "update-fulfillment": {
        if (session.role !== "ADMIN") {
          return jsonError("Aksi ini hanya tersedia untuk admin.", 403);
        }

        const orderId = text(body.orderId, 10);
        const status = text(body.status, 10);
        if (!orderId || !status || !["Menunggu", "Diambil", "Dikirim"].includes(status)) {
          return jsonError("Status penyerahan tidak valid.");
        }

        const result = await prisma.penyerahan.updateMany({
          where: { no_pesanan: orderId },
          data: { status_penyerahan: status, tanggal_penyerahan: new Date() },
        });
        if (result.count === 0) {
          return jsonError("Data penyerahan tidak ditemukan.", 404);
        }
        return NextResponse.json({ success: true });
      }

      case "review": {
        if (session.role !== "CUSTOMER") {
          return jsonError("Ulasan hanya dapat dikirim oleh customer.", 403);
        }

        const orderId = text(body.orderId, 10);
        const rating = integer(body.rating, 1, 5);
        const message = text(body.message, 255);
        if (!orderId || !rating || !message) {
          return jsonError("Pilih rating dan isi kritik atau saran.");
        }

        const order = await prisma.pesanan.findFirst({
          where: {
            no_pesanan: orderId,
            id_pelanggan: session.id,
            status_pesanan: "Selesai",
          },
          select: { no_pesanan: true, ulasan: { select: { id_ulasan: true } } },
        });
        if (!order) {
          return jsonError("Ulasan hanya dapat diberikan untuk pesanan selesai.", 404);
        }
        if (order.ulasan.length > 0) {
          return jsonError("Pesanan ini sudah memiliki ulasan.", 409);
        }

        await prisma.ulasan.create({
          data: {
            id_ulasan: newId("REV"),
            no_pesanan: orderId,
            rating,
            isi_ulasan: message,
            tanggal_ulasan: new Date(),
          },
        });
        return NextResponse.json({ success: true }, { status: 201 });
      }

      case "create-menu": {
        if (session.role !== "ADMIN") {
          return jsonError("Pengelolaan menu hanya tersedia untuk admin.", 403);
        }

        const id = text(body.id, 10)?.toUpperCase();
        const name = text(body.name, 30);
        const category = text(body.category, 10);
        const unit = text(body.unit, 10);
        const minimum = integer(body.minimum, 0, 9999);
        if (
          !id ||
          !/^[A-Z0-9-]+$/.test(id) ||
          excludedCatalogProductIds.includes(id) ||
          !name ||
          !category ||
          !unit ||
          minimum === null
        ) {
          return jsonError("Lengkapi ID, nama, kategori, satuan, dan stok minimum.");
        }

        await prisma.produk.create({
          data: {
            id_produk: id,
            nama_produk: name,
            kategori_produk: category,
            satuan_produk: unit,
            stok_minimum: minimum,
          },
        });
        return NextResponse.json({ success: true }, { status: 201 });
      }

      case "update-menu": {
        if (session.role !== "ADMIN") {
          return jsonError("Pengelolaan menu hanya tersedia untuk admin.", 403);
        }

        const id = text(body.id, 10);
        const name = text(body.name, 30);
        const category = text(body.category, 10);
        const unit = text(body.unit, 10);
        const minimum = integer(body.minimum, 0, 9999);
        if (!id || !name || !category || !unit || minimum === null) {
          return jsonError("Lengkapi nama, kategori, satuan, dan stok minimum.");
        }
        if (excludedCatalogProductIds.includes(id)) {
          return jsonError("Produk ini sudah tidak tersedia di katalog.");
        }

        await prisma.produk.update({
          where: { id_produk: id },
          data: {
            nama_produk: name,
            kategori_produk: category,
            satuan_produk: unit,
            stok_minimum: minimum,
          },
        });
        return NextResponse.json({ success: true });
      }

      case "delete-menu": {
        if (session.role !== "ADMIN") {
          return jsonError("Pengelolaan menu hanya tersedia untuk admin.", 403);
        }

        const id = text(body.id, 10);
        if (!id) {
          return jsonError("ID menu tidak valid.");
        }

        const orderLineCount = await prisma.detail_pesanan.count({
          where: { id_produk: id },
        });
        if (orderLineCount > 0) {
          return jsonError(
            "Menu yang sudah tercatat pada pesanan tidak dapat dihapus.",
            409,
          );
        }
        await prisma.produk.delete({ where: { id_produk: id } });
        return NextResponse.json({ success: true });
      }

      default:
        return jsonError("Aksi tidak dikenali.");
    }
  } catch (error) {
    console.error(`POST /api/workspace (${String(body.action)}) failed:`, error);
    return jsonError("Perubahan gagal disimpan. Periksa data dan koneksi database.", 500);
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return jsonError("Sesi telah berakhir. Silakan masuk kembali.", 401);
  }
  if (session.role !== "ADMIN") {
    return jsonError("Pengelolaan menu hanya tersedia untuk admin.", 403);
  }

  const body = await readBody(request);
  if (!body) {
    return jsonError("Permintaan tidak valid.");
  }

  const id = text(body.id, 10);
  const name = text(body.name, 30);
  const category = text(body.category, 10);
  const unit = text(body.unit, 10);
  const minimum = integer(body.minimum, 0, 9999);
  if (!id || !name || !category || !unit || minimum === null) {
    return jsonError("Lengkapi nama, kategori, satuan, dan stok minimum.");
  }

  try {
    await getPrismaClient().produk.update({
      where: { id_produk: id },
      data: {
        nama_produk: name,
        kategori_produk: category,
        satuan_produk: unit,
        stok_minimum: minimum,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/workspace failed:", error);
    return jsonError(
      "Perubahan menu gagal disimpan. Periksa data dan koneksi database.",
      500,
    );
  }
}