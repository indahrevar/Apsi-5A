import { connection, NextResponse } from "next/server";
<<<<<<< HEAD
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  await connection();

  try {
    const prisma = getPrismaClient();
    const detailPesanan = await prisma.detail_pesanan.findMany({
=======
import { authorizeApi } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: Request) {
  await connection();
  const { response } = await authorizeApi("ADMIN", "OWNER");
  if (response) return response;

  try {
    const params = new URL(request.url).searchParams;
    const from = params.get("from");
    const to = params.get("to");
    const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;
    const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;
    if ((from && Number.isNaN(fromDate?.getTime())) || (to && Number.isNaN(toDate?.getTime()))) {
      return NextResponse.json({ error: "Periode transaksi tidak valid." }, { status: 400 });
    }
    const prisma = getPrismaClient();
    const detailPesanan = await prisma.detail_pesanan.findMany({
      where: {
        pesanan: {
          ...(fromDate || toDate ? {
            tanggal_pesanan: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          } : {}),
          pembayaran: {
            some: { status_pembayaran: { in: ["Dikonfirmasi", "Lunas", "Berhasil"] } },
          },
        },
      },
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
      include: {
        produk: {
          select: {
            nama_produk: true,
          },
        },
        pesanan: {
          select: {
            tanggal_pesanan: true,
<<<<<<< HEAD
=======
            pembayaran: {
              select: {
                metode_pembayaran: true,
                jumlah_bayar: true,
                status_pembayaran: true,
              },
            },
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
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
<<<<<<< HEAD
=======
        metode_pembayaran:
          detail.pesanan.pembayaran[0]?.metode_pembayaran ?? "—",
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
        kasir: kasir || "—",
      };
    });

<<<<<<< HEAD
=======
    const processedOrders = new Set<string>();
    let totalTransfer = 0;
    let totalTunai = 0;

    for (const detail of detailPesanan) {
      if (processedOrders.has(detail.no_pesanan)) {
        continue;
      }

      processedOrders.add(detail.no_pesanan);
      for (const payment of detail.pesanan.pembayaran) {
      if (!["Dikonfirmasi", "Lunas", "Berhasil"].includes(payment.status_pembayaran)) {
        continue;
      }
      const amount = Number(payment.jumlah_bayar.toString());

        if (payment.metode_pembayaran.toLowerCase().includes("tunai")) {
          totalTunai += amount;
        } else if (payment.metode_pembayaran.toLowerCase().includes("transfer")) {
          totalTransfer += amount;
        }
      }
    }

>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
    const totalNilaiTransaksi = transactions.reduce(
      (total, transaction) =>
        total + transaction.jumlah * transaction.harga_satuan,
      0,
    );

    return NextResponse.json({
      summary: {
        jumlahTransaksi: transactions.length,
        totalNilaiTransaksi,
<<<<<<< HEAD
=======
        totalTransfer,
        totalTunai,
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
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
