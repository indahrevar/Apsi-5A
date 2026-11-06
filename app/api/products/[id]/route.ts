import { authorizeApi, validId } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function PATCH(request: Request, context: RouteContext<"/api/products/[id]">) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { response } = await authorizeApi("ADMIN");
  if (response) return response;
  const { id } = await context.params;
  if (!validId(id)) return apiError("Menu tidak ditemukan.", 404);
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Data menu tidak valid.", 400);
  }
  const data: {
    nama_produk?: string;
    kategori_produk?: string;
    satuan_produk?: string;
    harga?: number;
    stok?: number;
    stok_minimum?: number;
  } = {};
  if ("name" in input) {
    if (typeof input.name !== "string" || input.name.trim().length < 2 || input.name.trim().length > 30) return apiError("Nama menu harus berisi 2-30 karakter.", 400);
    data.nama_produk = input.name.trim();
  }
  if ("category" in input) {
    if (typeof input.category !== "string" || !input.category.trim() || input.category.trim().length > 30) return apiError("Kategori menu tidak valid.", 400);
    data.kategori_produk = input.category.trim();
  }
  if ("unit" in input) {
    if (typeof input.unit !== "string" || !input.unit.trim() || input.unit.trim().length > 20) return apiError("Satuan menu tidak valid.", 400);
    data.satuan_produk = input.unit.trim();
  }
  if ("price" in input) {
    if (!Number.isFinite(Number(input.price)) || Number(input.price) < 0) return apiError("Harga tidak valid.", 400);
    data.harga = Number(input.price);
  }
  if ("stock" in input) {
    if (!Number.isInteger(Number(input.stock)) || Number(input.stock) < 0) return apiError("Stok tidak valid.", 400);
    data.stok = Number(input.stock);
  }
  if ("minimum" in input) {
    if (!Number.isInteger(Number(input.minimum)) || Number(input.minimum) < 0) return apiError("Stok minimum tidak valid.", 400);
    data.stok_minimum = Number(input.minimum);
  }
  if (!Object.keys(data).length) return apiError("Tidak ada perubahan menu yang valid.", 400);
  const product = await getPrismaClient().produk.update({
    where: { id_produk: id },
    data,
  });
  return Response.json({
    id: product.id_produk,
    name: product.nama_produk,
    category: product.kategori_produk,
    unit: product.satuan_produk,
    price: Number(product.harga.toString()),
    stock: product.stok,
    minimum: product.stok_minimum,
    image: product.gambar_url ?? "/figma/menu-brownies.png",
  });
}

export async function DELETE(request: Request, context: RouteContext<"/api/products/[id]">) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { response } = await authorizeApi("ADMIN");
  if (response) return response;
  const { id } = await context.params;
  if (!validId(id)) return apiError("Menu tidak ditemukan.", 404);
  try {
    await getPrismaClient().produk.delete({ where: { id_produk: id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2003") {
      return apiError("Menu tidak dapat dihapus karena sudah tercatat pada pesanan.", 409);
    }
    throw error;
  }
}
