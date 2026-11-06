import { apiError, assertSameOrigin, createSession, verifyPassword } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Data masuk tidak valid.", 400);
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("username" in body) ||
    !("password" in body) ||
    typeof body.username !== "string" ||
    typeof body.password !== "string"
  ) {
    return apiError("Username dan password wajib diisi.", 400);
  }
  if (body.username.length > 50 || body.password.length > 128) {
    return apiError("Username atau password tidak valid.", 400);
  }

  const account = await getPrismaClient().account.findUnique({
    where: { username: body.username.trim().toLowerCase() },
    select: { id_account: true, password_hash: true, role: true },
  });
  if (!account || !(await verifyPassword(body.password, account.password_hash))) {
    return apiError("Username atau password salah.", 401);
  }

  await createSession(account.id_account);
  return Response.json(
    { role: account.role },
    { headers: { "Cache-Control": "no-store" } },
  );
}
