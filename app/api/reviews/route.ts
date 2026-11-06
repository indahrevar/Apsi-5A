import { randomBytes } from "node:crypto";
import { authorizeApi, validId } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  const { user, response } = await authorizeApi("CUSTOMER", "OWNER");
  if (response) return response;
  const reviews = await getPrismaClient().ulasan.findMany({
    where: user.role === "CUSTOMER" ? { pesanan: { id_pelanggan: user.personId } } : undefined,
    include: {
      pesanan: {
        select: {
          no_pesanan: true,
          pelanggan: { select: { id_pelanggan: true, nama_pelanggan: true } },
          detail_pesanan: { include: { produk: { select: { nama_produk: true } } } },
        },
      },
    },
    orderBy: { tanggal_ulasan: "desc" },
  });
  return Response.json(reviews.map((review) => ({
    id: review.id_ulasan,
    orderId: review.no_pesanan,
    customerId: review.pesanan.pelanggan.id_pelanggan,
    customer: review.pesanan.pelanggan.nama_pelanggan,
    product: review.pesanan.detail_pesanan.map((line) => line.produk.nama_produk).join(", "),
    rating: review.rating,
    content: review.isi_ulasan,
    date: review.tanggal_ulasan.toISOString(),
  })), { headers: { "Cache-Control": "no-store" } });
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
    return apiError("Ulasan tidak valid.", 400);
  }
  const orderId = typeof input.orderId === "string" ? input.orderId : "";
  const content = typeof input.content === "string" ? input.content.trim() : "";
  const rating = Number(input.rating);
  if (!validId(orderId) || !content || content.length > 255 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return apiError("Pesanan, ulasan, dan rating 1-5 wajib diisi.", 400);
  }
  const prisma = getPrismaClient();
  const order = await prisma.pesanan.findUnique({ where: { no_pesanan: orderId } });
  if (!order || order.id_pelanggan !== user.personId) return apiError("Pesanan tidak ditemukan.", 404);
  if (order.status_pesanan !== "Selesai") return apiError("Ulasan hanya dapat diberikan untuk pesanan selesai.", 409);
  try {
    const review = await prisma.ulasan.create({
      data: {
        id_ulasan: `UL${randomBytes(4).toString("hex").toUpperCase()}`,
        no_pesanan: orderId,
        rating,
        isi_ulasan: content,
        tanggal_ulasan: new Date(),
      },
      select: { id_ulasan: true },
    });
    return Response.json({ id: review.id_ulasan }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return apiError("Pesanan ini sudah memiliki ulasan.", 409);
    }
    throw error;
  }
}
