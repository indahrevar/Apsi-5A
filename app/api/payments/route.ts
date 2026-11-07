import { randomBytes } from "node:crypto";
import { authorizeApi, validId } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  const { user, response } = await authorizeApi("CUSTOMER", "ADMIN", "OWNER");
  if (response) return response;
  const payments = await getPrismaClient().pembayaran.findMany({
    where: user.role === "CUSTOMER" ? { pesanan: { id_pelanggan: user.personId } } : undefined,
    include: {
      pesanan: {
        select: {
          no_pesanan: true,
          tanggal_pesanan: true,
          pelanggan: { select: { id_pelanggan: true, nama_pelanggan: true } },
        },
      },
    },
    orderBy: { tanggal_bayar: "desc" },
  });
  return Response.json(payments.map((payment) => ({
    id: payment.id_pembayaran,
    orderId: payment.no_pesanan,
    customerId: payment.pesanan.pelanggan.id_pelanggan,
    customer: payment.pesanan.pelanggan.nama_pelanggan,
    method: payment.metode_pembayaran,
    amount: Number(payment.jumlah_bayar.toString()),
    date: payment.tanggal_bayar.toISOString(),
    status: payment.status_pembayaran,
  })), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("ADMIN", "CUSTOMER");
  if (response) return response;
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Data pembayaran tidak valid.", 400);
  }
  const orderId = typeof input.orderId === "string" ? input.orderId : "";
  const method = typeof input.method === "string" ? input.method : "";
  const amount = Number(input.amount);
  if (!validId(orderId) || !["Transfer", "Tunai"].includes(method) ||
      !Number.isFinite(amount) || amount < 0) {
    return apiError("Periksa nomor pesanan, metode, dan jumlah pembayaran.", 400);
  }
  const prisma = getPrismaClient();
  const order = await prisma.pesanan.findUnique({ where: { no_pesanan: orderId } });
  if (!order) return apiError("Pesanan tidak ditemukan.", 404);
  if (user.role === "CUSTOMER" && order.id_pelanggan !== user.personId) {
    return apiError("Pesanan tidak ditemukan.", 404);
  }
  if (user.role === "CUSTOMER") {
    const [existing, details, confirmedPayments] = await Promise.all([
      prisma.pembayaran.findFirst({
        where: {
          no_pesanan: orderId,
          status_pembayaran: { notIn: ["Ditolak"] },
        },
      }),
      prisma.detail_pesanan.findMany({
        where: { no_pesanan: orderId },
        select: { jumlah: true, harga_satuan: true },
      }),
      prisma.pembayaran.findMany({
        where: { no_pesanan: orderId, status_pembayaran: { in: ["Dikonfirmasi", "Lunas", "Berhasil"] } },
        select: { jumlah_bayar: true },
      }),
    ]);
    if (existing) return apiError("Pesanan ini sudah memiliki pembayaran yang sedang diproses.", 409);
    const total = details.reduce((sum, line) => sum + line.jumlah * Number(line.harga_satuan.toString()), 0);
    const paid = confirmedPayments.reduce((sum, payment) => sum + Number(payment.jumlah_bayar.toString()), 0);
    if (amount !== total - paid || amount <= 0) {
      return apiError("Jumlah pembayaran harus sama dengan sisa tagihan.", 400);
    }
  }
  const payment = await prisma.pembayaran.create({
    data: {
      id_pembayaran: `BYR${randomBytes(3).toString("hex").toUpperCase()}`,
      id_admin: user.role === "ADMIN" ? user.personId : null,
      no_pesanan: orderId,
      metode_pembayaran: method,
      jumlah_bayar: amount,
      tanggal_bayar: new Date(),
      status_pembayaran: "Menunggu",
    },
  });
  return Response.json({ id: payment.id_pembayaran, status: payment.status_pembayaran }, { status: 201 });
}
