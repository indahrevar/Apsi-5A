import { authorizeApi, validId } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function PATCH(request: Request, context: RouteContext<"/api/payments/[id]">) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("ADMIN");
  if (response) return response;
  const { id } = await context.params;
  if (!validId(id)) return apiError("Pembayaran tidak ditemukan.", 404);
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Data pembayaran tidak valid.", 400);
  }
  const payment = await getPrismaClient().pembayaran.findUnique({ where: { id_pembayaran: id } });
  if (!payment) return apiError("Pembayaran tidak ditemukan.", 404);
  const data: {
    status_pembayaran?: string;
    metode_pembayaran?: string;
    jumlah_bayar?: number;
    id_admin: string;
  } = { id_admin: user.personId };
  if (typeof input.status === "string" && ["Menunggu", "Dikonfirmasi", "Lunas", "Ditolak"].includes(input.status)) {
    data.status_pembayaran = input.status;
  }
  if (typeof input.method === "string" && ["Transfer", "Tunai"].includes(input.method)) {
    data.metode_pembayaran = input.method;
  }
  if (input.amount !== undefined && Number.isFinite(Number(input.amount)) && Number(input.amount) >= 0) {
    data.jumlah_bayar = Number(input.amount);
  }
  if (Object.keys(data).length === 1) return apiError("Tidak ada perubahan pembayaran yang valid.", 400);
  const updated = await getPrismaClient().pembayaran.update({
    where: { id_pembayaran: id },
    data,
    select: { id_pembayaran: true, status_pembayaran: true },
  });
  return Response.json({ id: updated.id_pembayaran, status: updated.status_pembayaran });
}

export async function DELETE(request: Request, context: RouteContext<"/api/payments/[id]">) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { response } = await authorizeApi("ADMIN");
  if (response) return response;
  const { id } = await context.params;
  if (!validId(id)) return apiError("Pembayaran tidak ditemukan.", 404);
  const payment = await getPrismaClient().pembayaran.findUnique({ where: { id_pembayaran: id } });
  if (!payment) return apiError("Pembayaran tidak ditemukan.", 404);
  if (["Lunas", "Berhasil", "Dikonfirmasi"].includes(payment.status_pembayaran)) {
    return apiError("Pembayaran yang sudah dikonfirmasi tidak dapat dihapus.", 409);
  }
  await getPrismaClient().pembayaran.delete({ where: { id_pembayaran: id } });
  return new Response(null, { status: 204 });
}
