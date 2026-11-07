import { randomBytes } from "node:crypto";
import { authorizeApi, validId } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  const { user, response } = await authorizeApi("ADMIN", "OWNER", "CUSTOMER");
  if (response) return response;
  const records = await getPrismaClient().penyerahan.findMany({
    where: user.role === "CUSTOMER" ? { pesanan: { id_pelanggan: user.personId } } : undefined,
    include: {
      pesanan: { include: { pelanggan: { select: { id_pelanggan: true, nama_pelanggan: true } } } },
    },
    orderBy: { tanggal_penyerahan: "desc" },
  });
  return Response.json(records.map((record) => ({
    id: record.id_penyerahan,
    orderId: record.no_pesanan,
    customerId: record.pesanan.pelanggan.id_pelanggan,
    customer: record.pesanan.pelanggan.nama_pelanggan,
    method: record.metode_penyerahan,
    status: record.status_penyerahan,
    date: record.tanggal_penyerahan.toISOString(),
  })), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("ADMIN");
  if (response) return response;
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Nomor pesanan tidak valid.", 400);
  }
  const orderId = typeof input.orderId === "string" ? input.orderId : "";
  if (!validId(orderId)) return apiError("Pesanan tidak ditemukan.", 404);
  const prisma = getPrismaClient();
  const order = await prisma.pesanan.findUnique({
    where: { no_pesanan: orderId },
    include: { produksi: { select: { status_produksi: true } } },
  });
  if (!order) return apiError("Pesanan tidak ditemukan.", 404);
  if (order.status_pesanan !== "Selesai" ||
      !order.produksi.some((production) => production.status_produksi === "Selesai")) {
    return apiError("Penyerahan hanya dapat dibuat setelah produksi selesai.", 409);
  }
  if (await prisma.penyerahan.findFirst({ where: { no_pesanan: orderId } })) {
    return apiError("Penyerahan untuk pesanan ini sudah dibuat.", 409);
  }
  const record = await prisma.penyerahan.create({
    data: {
      id_penyerahan: `SRH${randomBytes(3).toString("hex").toUpperCase()}`,
      id_admin: user.personId,
      no_pesanan: orderId,
      metode_penyerahan: order.metode_penyerahan,
      status_penyerahan: "Menunggu",
      tanggal_penyerahan: new Date(),
    },
  });
  return Response.json({ id: record.id_penyerahan, status: record.status_penyerahan }, { status: 201 });
}
