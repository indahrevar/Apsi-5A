import { randomBytes } from "node:crypto";
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
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
  }
}
