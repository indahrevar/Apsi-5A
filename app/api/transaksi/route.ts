import { connection, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  await connection();

  try {
    const prisma = getPrismaClient();
    const detailPesanan = await prisma.detail_pesanan.findMany({
      include: {
        produk: {
          select: {
            nama_produk: true,
          },
        },
        pesanan: {
          select: {
            tanggal_pesanan: true,
            produksi: {
              select: {
                karyawan: {
                  select: {
                    nama_karyawan: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { pesanan: { tanggal_pesanan: "desc" } },
        { no_pesanan: "asc" },
        { id_produk: "asc" },
      ],
    });

    const transactions = detailPesanan.map((detail) => {
      const hargaSatuan = Number(detail.harga_satuan.toString());
      const kasir = [
        ...new Set(
          detail.pesanan.produksi.map(
            (produksi) => produksi.karyawan.nama_karyawan,
          ),
        ),
      ].join(", ");

      return {
        id_transaksi: `${detail.no_pesanan}-${detail.id_produk}`,
        nama_barang: detail.produk.nama_produk,
        jumlah: detail.jumlah,
        harga_satuan: hargaSatuan,
        tanggal: detail.pesanan.tanggal_pesanan.toISOString(),
        kasir: kasir || "—",
      };
    });

    const totalNilaiTransaksi = transactions.reduce(
      (total, transaction) =>
        total + transaction.jumlah * transaction.harga_satuan,
      0,
    );

    return NextResponse.json({
      summary: {
        jumlahTransaksi: transactions.length,
        totalNilaiTransaksi,
      },
      transactions,
    });
  } catch (error) {
    console.error("GET /api/transaksi failed:", error);

    return NextResponse.json(
      { error: "Gagal memuat data transaksi." },
      { status: 500 },
    );
  }
}
