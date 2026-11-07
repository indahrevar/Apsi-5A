import "server-only";

import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

const scrypt = promisify(scryptCallback);
const sessionCookieName = "dapur_abita_session";
const sessionDurationMs = 1000 * 60 * 60 * 8;

// Menggunakan tipe union string untuk menghindari error missing member enum
export type AccountRole = "ADMIN" | "CUSTOMER" | "KARYAWAN_PRODUKSI" | "OWNER";

export type AuthUser = {
  id: string;
  username: string;
  role: AccountRole;
  personId: string;
  name: string;
};

export async function hashPassword(password: string) {
  if (password.length < 8 || password.length > 128) {
    throw new Error("Password must be between 8 and 128 characters.");
  }
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, saltHex, hashHex] = encoded.split("$");
  if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scrypt(password, Buffer.from(saltHex, "hex"), expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(accountId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  const prisma = getPrismaClient();
  // Pastikan prisma generate sudah dijalankan agar auth_session dikenali
  await (prisma as any).auth_session.create({
    data: {
      token_hash: hashSessionToken(token),
      id_account: accountId,
      expires_at: expiresAt,
    },
  });
  (await cookies()).set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (token) {
    await (getPrismaClient() as any).auth_session.deleteMany({
      where: { token_hash: hashSessionToken(token) },
    });
  }
  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return null;

  await connection();
  const session = await (getPrismaClient() as any).auth_session.findFirst({
    where: { token_hash: hashSessionToken(token), expires_at: { gt: new Date() } },
    select: {
      account: {
        select: {
          id_account: true,
          username: true,
          role: true,
          id_admin: true,
          id_pelanggan: true,
          id_karyawan: true,
          id_owner: true,
          admin: { select: { nama_admin: true } },
          pelanggan: { select: { nama_pelanggan: true } },
          karyawan: { select: { nama_karyawan: true } },
          owner: { select: { nama_owner: true } },
        },
      },
    },
  });

  if (!session) return null;
  const account = session.account;
  const personId =
    account.id_admin ??
    account.id_pelanggan ??
    account.id_karyawan ??
    account.id_owner;
  const name =
    account.admin?.nama_admin ??
    account.pelanggan?.nama_pelanggan ??
    account.karyawan?.nama_karyawan ??
    account.owner?.nama_owner;
  if (!personId || !name) return null;

  return {
    id: account.id_account,
    username: account.username,
    role: account.role as AccountRole,
    personId,
    name,
  };
}

export async function requireRole(...roles: AccountRole[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0].trim() ??
    request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ??
    requestUrl.protocol.slice(0, -1);
  if (!origin || !host) {
    return Response.json({ error: "Permintaan lintas asal tidak diizinkan." }, { status: 403 });
  }
  try {
    if (new URL(origin).origin !== new URL(`${protocol}://${host}`).origin) {
      return Response.json({ error: "Permintaan lintas asal tidak diizinkan." }, { status: 403 });
    }
  } catch {
    return Response.json({ error: "Permintaan lintas asal tidak diizinkan." }, { status: 403 });
  }
  return null;
}

export function apiError(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export const authCookieName = sessionCookieName;