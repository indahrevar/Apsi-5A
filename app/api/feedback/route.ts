import { randomBytes } from "node:crypto";
import { authorizeApi } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("CUSTOMER");
  if (response) return response;
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Kritik dan saran tidak valid.", 400);
  }
  const content = typeof input.content === "string" ? input.content.trim() : "";
  if (!content || content.length > 500) return apiError("Isi kritik dan saran wajib diisi (maksimal 500 karakter).", 400);
  const record = await getPrismaClient().kritik_saran.create({
    data: {
      id_kritik_saran: `KS${randomBytes(4).toString("hex").toUpperCase()}`,
      id_pelanggan: user.personId,
      isi: content,
      tanggal: new Date(),
    },
    select: { id_kritik_saran: true },
  });
  return Response.json({ id: record.id_kritik_saran }, { status: 201 });
}
