import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { excludedCatalogProductIds } from "../lib/demo-catalog";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

function daysAgo(days: number) {
  const date = new Date(today);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

async function seed() {
  await prisma.owner.upsert({
    where: { id_owner: "OWNDEMO1" },
    update: {},
    create: {
      id_owner: "OWNDEMO1",
      nama_owner: "Fauziah Abita",
      jenis_kelamin: "Perempuan",
      no_telepon: "08111222001",
      email: "owner.demo@abita.test",
      tanggal_bergabung: daysAgo(900),
    },
  });

  await prisma.admin.upsert({
    where: { id_admin: "ADMDEMO1" },
    update: {},
    create: {
      id_admin: "ADMDEMO1",
      id_owner: "OWNDEMO1",
      nama_admin: "Admin Dapur",
      jenis_kelamin: "Perempuan",
      no_telepon: "08114444001",
      email: "admin.demo@abita.test",
      tanggal_bergabung: daysAgo(700),
    },
  });

  await prisma.karyawan.upsert({
    where: { id_karyawan: "KRYDEMO1" },
    update: {},
    create: {
      id_karyawan: "KRYDEMO1",
      nama_karyawan: "Budi Produksi",
      jenis_kelamin: "Laki-laki",
      no_telepon: "08215556001",
      email: "produksi.demo@abita.test",
      tanggal_bergabung: daysAgo(600),
    },
  });

  const customers = [
    {
      id_pelanggan: "PLGDEMO1",
      nama_pelanggan: "Rizky Ramadhan",
      no_telepon: "081234560001",
      email: "rizky.demo@abita.test",
      nama_jalan: "Jl. Khatib Sulaiman",
      nomor: "12",
    },
    {
      id_pelanggan: "PLGDEMO2",
      nama_pelanggan: "Siti Rahma",
      no_telepon: "081234560002",
      email: "siti.demo@abita.test",
      nama_jalan: "Jl. Ahmad Dahlan",
      nomor: "45",
    },
    {
      id_pelanggan: "PLGDEMO3",
      nama_pelanggan: "Mawar Sejahtera",
      no_telepon: "081234560003",
      email: "mawar.demo@abita.test",
      nama_jalan: "Jl. Sudirman",
      nomor: "10",
    },
  ];

  for (const customer of customers) {
    await prisma.pelanggan.upsert({
      where: { id_pelanggan: customer.id_pelanggan },
      update: {},
      create: {
        ...customer,
        jenis_kelamin: "Perempuan",
        kota: "Padang",
      },
    });
  }

  const products = [
    ["PR01", "Brownies Kukus", "Kue Basah", "pcs", 20],
    ["PR02", "Bolu Gulung", "Kue Basah", "roll", 10],
    ["PR03", "Risoles Ragout", "Makanan", "pcs", 50],
    ["PR04", "Pastel Isi", "Makanan", "pcs", 30],
    ["PR05", "Lapis Surabaya", "Kue Basah", "loyang", 5],
  ] as const;

  for (const [id_produk, nama_produk, kategori_produk, satuan_produk, stok_minimum] of products) {
    await prisma.produk.upsert({
      where: { id_produk },
      update: {},
      create: {
        id_produk,
        nama_produk,
        kategori_produk,
        satuan_produk,
        stok_minimum,
      },
    });
  }

  for (const id_produk of excludedCatalogProductIds) {
    const historicalOrderLines = await prisma.detail_pesanan.count({
      where: { id_produk },
    });

    if (historicalOrderLines === 0) {
      await prisma.produk.deleteMany({ where: { id_produk } });
    } else {
      console.warn(
        `Retaining retired product ${id_produk} because it has order history; it is excluded from the catalog.`,
      );
    }
  }

  const orders = [
    {
      id: "DORD001",
      customer: "PLGDEMO3",
      days: 0,
      status: "Baru",
      delivery: "Ambil",
      payment: "Transfer",
      paymentStatus: "Menunggu",
      productionStatus: "Baru",
      items: [
        { product: "PR01", quantity: 1, price: 35_000, stock: 277 },
        { product: "PR03", quantity: 10, price: 5_000, stock: 450 },
      ],
    },
    {
      id: "DORD002",
      customer: "PLGDEMO2",
      days: 1,
      status: "Produksi",
      delivery: "Diantar",
      payment: "Transfer",
      paymentStatus: "Lunas",
      productionStatus: "Proses",
      items: [
        { product: "PR02", quantity: 2, price: 45_000, stock: 117 },
        { product: "PR03", quantity: 5, price: 5_000, stock: 440 },
      ],
    },
    {
      id: "DORD003",
      customer: "PLGDEMO1",
      days: 2,
      status: "Selesai",
      delivery: "Ambil",
      payment: "Tunai",
      paymentStatus: "Lunas",
      productionStatus: "Selesai",
      items: [
        { product: "PR01", quantity: 2, price: 35_000, stock: 276 },
        { product: "PR04", quantity: 3, price: 6_000, stock: 300 },
      ],
    },
    {
      id: "DORD004",
      customer: "PLGDEMO2",
      days: 8,
      status: "Selesai",
      delivery: "Ambil",
      payment: "Tunai",
      paymentStatus: "Lunas",
      productionStatus: "Selesai",
      items: [
        { product: "PR05", quantity: 1, price: 72_000, stock: 40 },
        { product: "PR03", quantity: 12, price: 5_000, stock: 435 },
      ],
    },
  ] as const;

  for (const order of orders) {
    const date = daysAgo(order.days);
    await prisma.pesanan.upsert({
      where: { no_pesanan: order.id },
      update: {},
      create: {
        no_pesanan: order.id,
        id_admin: "ADMDEMO1",
        id_pelanggan: order.customer,
        tanggal_pesanan: date,
        status_pesanan: order.status,
      },
    });

    for (const item of order.items) {
      await prisma.detail_pesanan.upsert({
        where: {
          no_pesanan_id_produk: {
            no_pesanan: order.id,
            id_produk: item.product,
          },
        },
        update: {},
        create: {
          no_pesanan: order.id,
          id_produk: item.product,
          jumlah: item.quantity,
          harga_satuan: item.price,
          stok_produk_sebelum: item.stock,
          stok_produk_sesudah: item.stock - item.quantity,
        },
      });
    }

    await prisma.pembayaran.upsert({
      where: { id_pembayaran: `DBYR${order.id.slice(-3)}` },
      update: {},
      create: {
        id_pembayaran: `DBYR${order.id.slice(-3)}`,
        id_admin: "ADMDEMO1",
        no_pesanan: order.id,
        metode_pembayaran: order.payment,
        jumlah_bayar: order.items.reduce(
          (total, item) => total + item.quantity * item.price,
          0,
        ),
        tanggal_bayar: date,
        status_pembayaran: order.paymentStatus,
      },
    });

    await prisma.penyerahan.upsert({
      where: { id_penyerahan: `DSRH${order.id.slice(-3)}` },
      update: {},
      create: {
        id_penyerahan: `DSRH${order.id.slice(-3)}`,
        id_admin: "ADMDEMO1",
        no_pesanan: order.id,
        metode_penyerahan: order.delivery,
        status_penyerahan: order.status === "Selesai" ? "Diambil" : "Menunggu",
        tanggal_penyerahan: date,
      },
    });

    await prisma.produksi.upsert({
      where: { id_produksi: `DPRD${order.id.slice(-3)}` },
      update: {},
      create: {
        id_produksi: `DPRD${order.id.slice(-3)}`,
        no_pesanan: order.id,
        id_karyawan: "KRYDEMO1",
        status_produksi: order.productionStatus,
        tanggal_mulai_produksi: date,
        tanggal_selesai_produksi: date,
      },
    });
  }

  await prisma.ulasan.upsert({
    where: { id_ulasan: "DULS001" },
    update: {},
    create: {
      id_ulasan: "DULS001",
      no_pesanan: "DORD003",
      rating: 5,
      isi_ulasan: "Browniesnya lembut dan rasanya enak. Pasti pesan lagi!",
      tanggal_ulasan: daysAgo(1),
    },
  });

  await prisma.ulasan.upsert({
    where: { id_ulasan: "DULS002" },
    update: {},
    create: {
      id_ulasan: "DULS002",
      no_pesanan: "DORD004",
      rating: 4,
      isi_ulasan: "Lapis Surabayanya enak, pelayanan juga cepat.",
      tanggal_ulasan: daysAgo(7),
    },
  });
}

seed()
  .then(() => console.log("Dapur Abita demo data is ready."))
  .catch((error: unknown) => {
    console.error("Failed to seed Dapur Abita demo data:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
