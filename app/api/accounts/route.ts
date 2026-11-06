import { randomBytes } from "node:crypto";
import { authorizeApi } from "@/lib/api-auth";
import { apiError, assertSameOrigin, hashPassword } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { user, response } = await authorizeApi("ADMIN", "OWNER");
  if (response) return response;
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Data akun tidak valid.", 400);
  }
  const targetRole = user.role === "OWNER" ? "ADMIN" : "KARYAWAN_PRODUKSI";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const gender = typeof input.gender === "string" ? input.gender : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const username = typeof input.username === "string" ? input.username.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (
    name.length < 2 || name.length > 50 ||
    !["Laki-laki", "Perempuan"].includes(gender) ||
    !phone || phone.length > 16 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 40 ||
    !/^[a-z0-9._-]{3,50}$/.test(username) ||
    !/^(?=.*[A-Za-z])(?=.*\d).{8,128}$/.test(password)
  ) return apiError("Periksa kembali data akun dan password (minimal 8 karakter, huruf dan angka).", 400);

  const prisma = getPrismaClient();
  const id = `${targetRole === "ADMIN" ? "ADM" : "KRY"}${randomBytes(3).toString("hex").toUpperCase()}`;
  const passwordHash = await hashPassword(password);
  try {
    const account = await prisma.$transaction(async (transaction) => {
      if (targetRole === "ADMIN") {
        await transaction.admin.create({
          data: {
            id_admin: id,
            id_owner: user.personId,
            nama_admin: name,
            jenis_kelamin: gender,
            no_telepon: phone,
            email,
            tanggal_bergabung: new Date(),
          },
        });
        return transaction.account.create({
          data: { username, password_hash: passwordHash, role: targetRole, id_admin: id },
          select: { username: true, role: true },
        });
      }
      await transaction.karyawan.create({
        data: {
          id_karyawan: id,
          nama_karyawan: name,
          jenis_kelamin: gender,
          no_telepon: phone,
          email,
          tanggal_bergabung: new Date(),
        },
      });
      return transaction.account.create({
        data: { username, password_hash: passwordHash, role: targetRole, id_karyawan: id },
        select: { username: true, role: true },
      });
    });
    return Response.json(account, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return apiError("Username atau identitas akun tersebut sudah digunakan.", 409);
    }
    console.error("POST /api/accounts failed:", error);
    return apiError("Akun tidak dapat dibuat.", 500);
  }
}
