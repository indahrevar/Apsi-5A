import { authorizeApi } from "@/lib/api-auth";
import { apiError } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: Request) {
  const { response } = await authorizeApi("ADMIN", "OWNER");
  if (response) return response;
  const params = new URL(request.url).searchParams;
  const from = params.get("from");
  const to = params.get("to");
  const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;
  const toDate = to ? new Date(`${to}T23:59:59.999Z`) : undefined;
  if ((from && Number.isNaN(fromDate?.getTime())) || (to && Number.isNaN(toDate?.getTime()))) {
    return apiError("Periode laporan tidak valid.", 400);
  }
  if (fromDate && toDate && fromDate > toDate) return apiError("Tanggal awal harus sebelum tanggal akhir.", 400);
  const prisma = getPrismaClient();
  const where = {
    ...(fromDate || toDate ? {
      tanggal_pesanan: {
        ...(fromDate ? { gte: fromDate } : {}),
        ...(toDate ? { lte: toDate } : {}),
      },
    } : {}),
  };
  const orders = await prisma.pesanan.findMany({
    where,
    include: {
      detail_pesanan: { select: { jumlah: true, harga_satuan: true } },
      produksi: { orderBy: { tanggal_selesai_produksi: "desc" }, take: 1 },
      penyerahan: { orderBy: { tanggal_penyerahan: "desc" }, take: 1 },
      pembayaran: { select: { jumlah_bayar: true, status_pembayaran: true } },
    },
    orderBy: { tanggal_pesanan: "asc" },
  });
  const byDate = new Map<string, { orders: number; completed: number; handedOver: number; revenue: number }>();
  let completed = 0;
  let handedOver = 0;
  let revenue = 0;
  for (const order of orders) {
    const date = order.tanggal_pesanan.toISOString().slice(0, 10);
    const row = byDate.get(date) ?? { orders: 0, completed: 0, handedOver: 0, revenue: 0 };
    const isCompleted = order.status_pesanan === "Selesai";
    const isHandedOver = order.penyerahan[0]?.status_penyerahan === "Diserahkan";
    const orderRevenue = order.pembayaran
      .filter((payment) => ["Lunas", "Berhasil", "Dikonfirmasi"].includes(payment.status_pembayaran))
      .reduce((sum, payment) => sum + Number(payment.jumlah_bayar.toString()), 0);
    row.orders += 1;
    row.completed += Number(isCompleted);
    row.handedOver += Number(isHandedOver);
    row.revenue += orderRevenue;
    completed += Number(isCompleted);
    handedOver += Number(isHandedOver);
    revenue += orderRevenue;
    byDate.set(date, row);
  }
  const productionDurations = orders.flatMap((order) => {
    const production = order.produksi[0];
    if (!production?.tanggal_selesai_produksi) return [];
    return [(production.tanggal_selesai_produksi.getTime() - production.tanggal_mulai_produksi.getTime()) / 86_400_000];
  });
  return Response.json({
    summary: {
      orders: orders.length,
      completed,
      handedOver,
      revenue,
      averageProductionDays: productionDurations.length
        ? productionDurations.reduce((sum, days) => sum + days, 0) / productionDurations.length
        : 0,
    },
    daily: [...byDate.entries()].map(([date, data]) => ({ date, ...data })),
  }, { headers: { "Cache-Control": "no-store" } });
}
