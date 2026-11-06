import { authorizeApi } from "@/lib/api-auth";
import { apiError, assertSameOrigin } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { randomBytes } from "node:crypto";

function productDto(product: {
  id_produk: string;
  nama_produk: string;
  kategori_produk: string;
  satuan_produk: string;
  harga: { toString(): string };
  stok: number;
  stok_minimum: number;
  gambar_url: string | null;
}) {
  return {
    id: product.id_produk,
    name: product.nama_produk,
    category: product.kategori_produk,
    unit: product.satuan_produk,
    price: Number(product.harga.toString()),
    stock: product.stok,
    minimum: product.stok_minimum,
    image: product.gambar_url ?? "/figma/menu-brownies.png",
  };
}

export async function GET() {
  const { response } = await authorizeApi("CUSTOMER", "ADMIN", "OWNER");
  if (response) return response;
  const products = await getPrismaClient().produk.findMany({
    orderBy: { nama_produk: "asc" },
  });
  return Response.json(products.map(productDto), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const { response } = await authorizeApi("ADMIN");
  if (response) return response;
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return apiError("Data menu tidak valid.", 400);
  }
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const unit = typeof input.unit === "string" ? input.unit.trim() : "";
  const price = Number(input.price);
  const stock = Number(input.stock);
  const minimum = Number(input.minimum);
  if (
    name.length < 2 || name.length > 30 || category.length < 1 || category.length > 30 ||
    unit.length < 1 || unit.length > 20 || !Number.isFinite(price) || price < 0 ||
    !Number.isInteger(stock) || stock < 0 || !Number.isInteger(minimum) || minimum < 0
  ) return apiError("Periksa kembali nama, kategori, satuan, harga, dan stok.", 400);

  const id = `PR${randomBytes(4).toString("hex").toUpperCase()}`;
  const product = await getPrismaClient().produk.create({
    data: {
      id_produk: id,
      nama_produk: name,
      kategori_produk: category,
      satuan_produk: unit,
      harga: price,
      stok: stock,
      stok_minimum: minimum,
      gambar_url: typeof input.image === "string" ? input.image.slice(0, 255) : null,
    },
  });
  return Response.json(productDto(product), { status: 201, headers: { "Cache-Control": "no-store" } });
}
