import { randomBytes } from "node:crypto";
<<<<<<< HEAD
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

function field(value: unknown, maximum: number) {
  return typeof value === "string" && value.trim().length <= maximum
    ? value.trim()
    : null;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Pendaftaran demo hanya tersedia di lingkungan development." },
      { status: 403 },
    );
  }
=======
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

  const values = body as Record<string, unknown>;
  const name = field(values.name, 50);
  const gender = field(values.gender, 10);
  const phone = field(values.phone, 16);
  const email = field(values.email, 40);
  const street = field(values.street, 50);
  const number = field(values.number, 4);
  const city = field(values.city, 15);

  if (
    !name ||
    !gender ||
    !["Laki-laki", "Perempuan"].includes(gender) ||
    !phone ||
    !email ||
    !email.includes("@") ||
    !street ||
    !number ||
    !city
  ) {
    return NextResponse.json(
      { error: "Lengkapi semua data profil dengan format yang benar." },
      { status: 400 },
    );
  }

  try {
    const id = `PLG${randomBytes(3).toString("hex").toUpperCase()}`;
    await getPrismaClient().pelanggan.create({
      data: {
        id_pelanggan: id,
        nama_pelanggan: name,
        jenis_kelamin: gender,
        no_telepon: phone,
        email,
        nama_jalan: street,
        nomor: number,
        kota: city,
      },
    });

    await createSession({ role: "customer", id, name });
    return NextResponse.json({ role: "customer" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/register failed:", error);
    return NextResponse.json(
      { error: "Gagal membuat profil customer. Pastikan email belum digunakan." },
      { status: 500 },
    );
=======
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
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
  }
}
