<<<<<<< HEAD
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { demoAccounts, isAppRole } from "@/lib/demo-auth";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Demo accounts are disabled in production." },
      { status: 403 },
    );
  }
=======
import { apiError, assertSameOrigin, createSession, verifyPassword } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff

  let body: unknown;
  try {
    body = await request.json();
  } catch {
<<<<<<< HEAD
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const { username, password, role } = body as Record<string, unknown>;
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !isAppRole(role)
  ) {
    return NextResponse.json(
      { error: "Username, password, dan peran wajib diisi." },
      { status: 400 },
    );
  }

  const account = demoAccounts.find(
    (candidate) =>
      candidate.role === role &&
      candidate.username === username.trim().toLowerCase() &&
      candidate.password === password,
  );

  if (!account) {
    return NextResponse.json(
      { error: "Username, password, atau peran tidak sesuai." },
      { status: 401 },
    );
  }

  try {
    const prisma = getPrismaClient();
    const profileExists =
      role === "customer"
        ? await prisma.pelanggan.findUnique({
            where: { id_pelanggan: account.id },
            select: { id_pelanggan: true },
          })
        : role === "admin"
          ? await prisma.admin.findUnique({
              where: { id_admin: account.id },
              select: { id_admin: true },
            })
          : role === "production"
            ? await prisma.karyawan.findUnique({
                where: { id_karyawan: account.id },
                select: { id_karyawan: true },
              })
            : await prisma.owner.findUnique({
                where: { id_owner: account.id },
                select: { id_owner: true },
              });

    if (!profileExists) {
      return NextResponse.json(
        { error: "Data demo belum tersedia. Jalankan npm run db:seed." },
        { status: 503 },
      );
    }

    await createSession({
      role: account.role,
      id: account.id,
      name: account.name,
    });

    return NextResponse.json({ role: account.role });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json(
      { error: "Gagal memproses login. Periksa koneksi database." },
      { status: 500 },
    );
  }
=======
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
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
}
