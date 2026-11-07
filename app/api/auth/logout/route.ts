<<<<<<< HEAD
import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
=======
import { assertSameOrigin, destroySession } from "@/lib/auth";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  await destroySession();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
}
