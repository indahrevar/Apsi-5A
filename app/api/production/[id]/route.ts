import { authorizeApi, validId } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function PATCH(request: Request, context: RouteContext<"/api/production/[id]">) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("KARYAWAN_PRODUKSI");
  if (response) return response;
  const { id } = await context.params;
  if (!validId(id)) return apiError("Produksi tidak ditemukan.", 404);
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Status produksi tidak valid.", 400);
  }
  const status = typeof input.status === "string" ? input.status : "";
  if (!["Diterima", "Sedang dibuat", "Selesai"].includes(status)) {
    return apiError("Status produksi tidak valid.", 400);
  }
  const prisma = getPrismaClient();
  const production = await prisma.produksi.findUnique({ where: { id_produksi: id } });
  if (!production || production.id_karyawan !== user.personId) {
    return apiError("Produksi tidak ditemukan.", 404);
  }
  await prisma.$transaction([
    prisma.produksi.update({
      where: { id_produksi: id },
      data: {
        status_produksi: status,
        ...(status === "Selesai" ? { tanggal_selesai_produksi: new Date() } : { tanggal_selesai_produksi: null }),
      },
    }),
    prisma.pesanan.update({
      where: { no_pesanan: production.no_pesanan },
      data: { status_pesanan: status === "Selesai" ? "Selesai" : "Diproses" },
    }),
  ]);
  return Response.json({ id, status });
}
