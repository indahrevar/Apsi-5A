import { authorizeApi } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  const { user, response } = await authorizeApi("ADMIN", "KARYAWAN_PRODUKSI");
  if (response) return response;
  const production = await getPrismaClient().produksi.findMany({
    where: user.role === "KARYAWAN_PRODUKSI" ? { id_karyawan: user.personId } : undefined,
    include: {
      pesanan: {
        include: {
          pelanggan: { select: { nama_pelanggan: true } },
          detail_pesanan: {
            include: { produk: { select: { nama_produk: true, satuan_produk: true } } },
          },
          pembayaran: { orderBy: { tanggal_bayar: "desc" }, take: 1 },
          penyerahan: { orderBy: { tanggal_penyerahan: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { tanggal_mulai_produksi: "desc" },
  });
  return Response.json(production.map((row) => ({
    id: row.id_produksi,
    orderId: row.no_pesanan,
    customer: row.pesanan.pelanggan.nama_pelanggan,
    items: row.pesanan.detail_pesanan.map((line) => `${line.jumlah}x ${line.produk.nama_produk}`).join(", "),
    lines: row.pesanan.detail_pesanan.map((line) => ({
      product: line.produk.nama_produk,
      quantity: line.jumlah,
      unit: line.produk.satuan_produk,
      price: Number(line.harga_satuan.toString()),
    })),
    paymentStatus: row.pesanan.pembayaran[0]?.status_pembayaran ?? "Menunggu",
    delivery: row.pesanan.metode_penyerahan,
    note: row.pesanan.catatan_pesanan,
    orderStatus: row.pesanan.status_pesanan,
    status: row.status_produksi,
    date: row.pesanan.tanggal_pesanan.toISOString(),
    workerId: row.id_karyawan,
  })), { headers: { "Cache-Control": "no-store" } });
}
