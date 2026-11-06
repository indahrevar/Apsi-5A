import { randomBytes } from "node:crypto";
import { apiError, assertSameOrigin, createSession, hashPassword } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

type Registration = {
  name: string;
  gender: string;
  phone: string;
  email: string;
  street: string;
  streetNumber: string;
  city: string;
  username: string;
  password: string;
};

function isRegistration(value: unknown): value is Registration {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return [
    "name",
    "gender",
    "phone",
    "email",
    "street",
    "streetNumber",
    "city",
    "username",
    "password",
  ].every((key) => typeof input[key] === "string");
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Data masuk tidak valid.", 400);
  }
  if (!isRegistration(body)) return apiError("Data pendaftaran belum lengkap.", 400);

  const input = {
    ...body,
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    username: body.username.trim().toLowerCase(),
  };
  if (
    input.name.length < 2 ||
    input.name.length > 50 ||
    input.username.length < 3 ||
    input.username.length > 50 ||
    input.email.length > 40 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
    input.phone.length > 16 ||
    input.street.length > 50 ||
    input.streetNumber.length > 4 ||
    input.city.length > 15 ||
    !["Laki-laki", "Perempuan"].includes(input.gender) ||
    !/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/.test(input.password)
  ) {
    return apiError("Data pendaftaran tidak valid. Password minimal 8 karakter dan memuat huruf serta angka.", 400);
  }

  const personId = `PLG${randomBytes(3).toString("hex").toUpperCase()}`;
  const passwordHash = await hashPassword(input.password);
  try {
    const account = await getPrismaClient().$transaction(async (transaction) => {
      await transaction.pelanggan.create({
        data: {
          id_pelanggan: personId,
          nama_pelanggan: input.name,
          jenis_kelamin: input.gender,
          no_telepon: input.phone,
          email: input.email,
          nama_jalan: input.street,
          nomor: input.streetNumber,
          kota: input.city,
        },
      });
      return transaction.account.create({
        data: {
          username: input.username,
          password_hash: passwordHash,
          role: "CUSTOMER",
          id_pelanggan: personId,
        },
        select: { id_account: true },
      });
    });
    await createSession(account.id_account);
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return apiError("Username tersebut sudah digunakan.", 409);
    }
    console.error("POST /api/auth/register failed:", error);
    return apiError("Pendaftaran gagal. Coba lagi.", 500);
  }
}
