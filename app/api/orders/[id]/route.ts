import { randomBytes } from "node:crypto";
import { authorizeApi, validId } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function PATCH(request: Request, context: RouteContext<"/api/orders/[id]">) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("CUSTOMER", "ADMIN", "KARYAWAN_PRODUKSI");
  if (response) return response;
  const { id } = await context.params;
  if (!validId(id)) return apiError("Pesanan tidak ditemukan.", 404);
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Data perubahan tidak valid.", 400);
  }
  const prisma = getPrismaClient();
  const order = await prisma.pesanan.findUnique({
    where: { no_pesanan: id },
    include: { pembayaran: true, produksi: true, penyerahan: true },
  });
  if (!order) return apiError("Pesanan tidak ditemukan.", 404);

  if (user.role === "CUSTOMER") {
    if (order.id_pelanggan !== user.personId) return apiError("Pesanan tidak ditemukan.", 404);
    if (order.produksi.length || order.status_pesanan !== "Diterima") {
      return apiError("Pesanan tidak dapat diubah setelah mulai diproses.", 409);
    }
    if (!["Ambil di Tempat", "Diantar"].includes(String(input.deliveryMethod))) {
      return apiError("Metode penyerahan tidak valid.", 400);
    }
    if (order.penyerahan.length) {
      return apiError("Metode penyerahan tidak dapat diubah setelah disiapkan Admin.", 409);
    }
    if (input.deliveryMethod === "Diantar" &&
        (typeof input.address !== "string" || !input.address.trim() || input.address.trim().length > 150)) {
      return apiError("Alamat pengantaran wajib diisi (maksimal 150 karakter).", 400);
    }
    const updated = await prisma.pesanan.update({
      where: { no_pesanan: id },
      data: {
        metode_penyerahan: input.deliveryMethod === "Diantar" ? "Diantar" : "Ambil",
        alamat_penyerahan: input.deliveryMethod === "Diantar" ? String(input.address).trim() : null,
      },
      select: { no_pesanan: true, metode_penyerahan: true },
    });
    return Response.json({ id: updated.no_pesanan, delivery: updated.metode_penyerahan });
  }

  if (user.role === "KARYAWAN_PRODUKSI" &&
      !order.produksi.some((production) => production.id_karyawan === user.personId)) {
    return apiError("Pesanan tidak ditemukan.", 404);
  }

  if (input.forwardToProduction === true) {
    if (user.role !== "ADMIN") return apiError("Hanya Admin yang dapat meneruskan pesanan.", 403);
    if (!order.pembayaran.some((payment) => ["Lunas", "Berhasil", "Dikonfirmasi"].includes(payment.status_pembayaran))) {
      return apiError("Konfirmasi pembayaran sebelum meneruskan pesanan.", 409);
    }
    if (order.produksi.length) return apiError("Pesanan sudah diteruskan ke produksi.", 409);
    const employee = await prisma.karyawan.findFirst({ select: { id_karyawan: true } });
    if (!employee) return apiError("Belum ada karyawan produksi.", 409);
    await prisma.$transaction(async (transaction) => {
      await transaction.produksi.create({
        data: {
          id_produksi: `PRD${randomBytes(3).toString("hex").toUpperCase()}`,
          no_pesanan: id,
          id_karyawan: employee.id_karyawan,
          status_produksi: "Diterima",
          tanggal_mulai_produksi: new Date(),
          tanggal_selesai_produksi: new Date(),
        },
      });
      await transaction.pesanan.update({
        where: { no_pesanan: id },
        data: { status_pesanan: "Diproses", id_admin: user.personId },
      });
    });
    return Response.json({ ok: true });
  }

  const nextStatus = typeof input.status === "string" ? input.status : "";
  if (!["Diterima", "Diproses", "Selesai", "Dibatalkan"].includes(nextStatus)) {
    return apiError("Status pesanan tidak valid.", 400);
  }
  await prisma.pesanan.update({
    where: { no_pesanan: id },
    data: { status_pesanan: nextStatus, ...(user.role === "ADMIN" ? { id_admin: user.personId } : {}) },
  });
  return Response.json({ ok: true, status: nextStatus });
}

export async function DELETE(request: Request, context: RouteContext<"/api/orders/[id]">) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("CUSTOMER");
  if (response) return response;
  const { id } = await context.params;
  if (!validId(id)) return apiError("Pesanan tidak ditemukan.", 404);
  const prisma = getPrismaClient();
  const order = await prisma.pesanan.findUnique({
    where: { no_pesanan: id },
    include: { detail_pesanan: true, pembayaran: true, produksi: true, penyerahan: true },
  });
  if (!order || order.id_pelanggan !== user.personId) return apiError("Pesanan tidak ditemukan.", 404);
  if (order.status_pesanan !== "Diterima" || order.produksi.length || order.penyerahan.length ||
      order.pembayaran.some((payment) => ["Lunas", "Berhasil", "Dikonfirmasi"].includes(payment.status_pembayaran))) {
    return apiError("Pesanan yang sudah dikonfirmasi atau diproses tidak dapat dihapus.", 409);
  }
  await prisma.$transaction(async (transaction) => {
    for (const line of order.detail_pesanan) {
      await transaction.produk.update({
        where: { id_produk: line.id_produk },
        data: { stok: { increment: line.jumlah } },
      });
    }
    await transaction.pembayaran.deleteMany({ where: { no_pesanan: id } });
    await transaction.pesanan.delete({ where: { no_pesanan: id } });
  });
  return new Response(null, { status: 204 });
}
