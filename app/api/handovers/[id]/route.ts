import { authorizeApi, validId } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function PATCH(request: Request, context: RouteContext<"/api/handovers/[id]">) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("ADMIN");
  if (response) return response;
  const { id } = await context.params;
  if (!validId(id)) return apiError("Penyerahan tidak ditemukan.", 404);
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Status penyerahan tidak valid.", 400);
  }
  const status = typeof input.status === "string" ? input.status : "";
  if (!["Menunggu", "Siap diserahkan", "Diserahkan"].includes(status)) {
    return apiError("Status penyerahan tidak valid.", 400);
  }
  const updated = await getPrismaClient().penyerahan.update({
    where: { id_penyerahan: id },
    data: { status_penyerahan: status, id_admin: user.personId, tanggal_penyerahan: new Date() },
    select: { id_penyerahan: true, status_penyerahan: true },
  });
  return Response.json({ id: updated.id_penyerahan, status: updated.status_penyerahan });
}
