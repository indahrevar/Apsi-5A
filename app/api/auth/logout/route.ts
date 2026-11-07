import { assertSameOrigin, destroySession } from "@/lib/auth";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  await destroySession();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}