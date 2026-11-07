import "dotenv/config";
import pg from "pg";

if (process.env.NODE_ENV === "production") {
  throw new Error("Demo data can only be loaded outside production.");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const databaseHost = new URL(connectionString).hostname;
if (!["localhost", "127.0.0.1", "::1"].includes(databaseHost)) {
  throw new Error("Demo data can only be loaded into a database hosted on this computer.");
}

const { Client } = pg;
const client = new Client({ connectionString });
const customers = [
  ["DPLG01", "Demo Andi Saputra", "Laki-laki", "081000000001", "demo01@example.com", "Jl. Veteran", "11", "Padang"],
  ["DPLG02", "Demo Maya Putri", "Perempuan", "081000000002", "demo02@example.com", "Jl. Gajah Mada", "24", "Padang"],
  ["DPLG03", "Demo Fajar Pratama", "Laki-laki", "081000000003", "demo03@example.com", "Jl. Sudirman", "35", "Padang"],
  ["DPLG04", "Demo Nisa Aulia", "Perempuan", "081000000004", "demo04@example.com", "Jl. Diponegoro", "42", "Padang"],
  ["DPLG05", "Demo Dimas Putra", "Laki-laki", "081000000005", "demo05@example.com", "Jl. Khatib Sulaiman", "18", "Padang"],
  ["DPLG06", "Demo Rani Amelia", "Perempuan", "081000000006", "demo06@example.com", "Jl. Ahmad Yani", "27", "Padang"],
  ["DPLG07", "Demo Reza Maulana", "Laki-laki", "081000000007", "demo07@example.com", "Jl. Belakang Olo", "31", "Padang"],
  ["DPLG08", "Demo Intan Permata", "Perempuan", "081000000008", "demo08@example.com", "Jl. Rasuna Said", "16", "Padang"],
  ["DPLG09", "Demo Yoga Prakoso", "Laki-laki", "081000000009", "demo09@example.com", "Jl. Sawahan", "53", "Padang"],
  ["DPLG10", "Demo Citra Lestari", "Perempuan", "081000000010", "demo10@example.com", "Jl. Ujung Gurun", "29", "Padang"],
  ["DPLG11", "Demo Arif Hidayat", "Laki-laki", "081000000011", "demo11@example.com", "Jl. Pemuda", "38", "Padang"],
  ["DPLG12", "Demo Putri Ananda", "Perempuan", "081000000012", "demo12@example.com", "Jl. Jati", "21", "Padang"],
];
const reviewText = [
  "Rasanya enak dan teksturnya lembut. Akan pesan lagi.",
  "Pesanan datang sesuai jadwal dan dikemas dengan rapi.",
  "Camilan favorit keluarga, rasanya selalu konsisten.",
  "Porsinya pas dan rasanya sepadan dengan harganya.",
  "Pelayanan ramah, semua pesanan lengkap.",
  "Kue masih segar saat diterima. Terima kasih!",
  "Variasi menunya menarik, ingin mencoba menu lainnya.",
  "Pesanan mudah dan proses konfirmasinya jelas.",
];
const feedbackText = [
  "Mohon tambahkan pilihan paket camilan untuk acara keluarga.",
  "Tampilan menu mudah digunakan, semoga pilihan pembayaran bertambah.",
  "Bolu gulungnya enak; akan lebih praktis jika tersedia ukuran kecil.",
  "Mohon sediakan informasi jam pengantaran saat akhir pekan.",
  "Saya suka pilihan menu tradisional yang tersedia.",
  "Kemasan aman dan cocok untuk dibawa sebagai oleh-oleh.",
];

function dayAtOffset(today, offset) {
  const date = new Date(today);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

function minDate(date, latest) {
  return date > latest ? latest : date;
}

async function insertMany(connection, table, columns, rows, conflictColumns) {
  if (!rows.length) return;
  const values = [];
  const placeholders = rows.map((row) => {
    const rowPlaceholders = row.map((value) => {
      values.push(value);
      return `$${values.length}`;
    });
    return `(${rowPlaceholders.join(", ")})`;
  });
  const conflict = conflictColumns ? ` ON CONFLICT (${conflictColumns}) DO NOTHING` : "";
  await connection.query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders.join(", ")}${conflict}`,
    values,
  );
}

try {
  await client.connect();
  await client.query("BEGIN");

  const { rows: admins } = await client.query("SELECT id_admin FROM admin ORDER BY id_admin LIMIT 1");
  const { rows: employees } = await client.query("SELECT id_karyawan FROM karyawan ORDER BY id_karyawan LIMIT 1");
  const { rows: products } = await client.query(
    "SELECT id_produk, harga::text AS harga, stok FROM produk WHERE id_produk IN ('PR01', 'PR02', 'PR03', 'PR04', 'PR05') ORDER BY id_produk",
  );
  if (!admins.length || !employees.length) {
    throw new Error("Run npm run db:seed first so the demo Admin and Production employee exist.");
  }
  if (products.length !== 5) {
    throw new Error("Run npm run db:seed first so all five demo products exist.");
  }

  await insertMany(
    client,
    "pelanggan",
    ["id_pelanggan", "nama_pelanggan", "jenis_kelamin", "no_telepon", "email", "nama_jalan", "nomor", "kota"],
    customers,
    "id_pelanggan",
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const adminId = admins[0].id_admin;
  const employeeId = employees[0].id_karyawan;
  const orders = [];
  const details = [];
  const payments = [];
  const productions = [];
  const handovers = [];
  const reviews = [];

  let orderNumber = 0;
  for (let dayIndex = 0; dayIndex < 90; dayIndex += 1) {
    const orderDate = dayAtOffset(today, dayIndex - 89);
    const ordersThatDay = 1 + ((dayIndex * 7 + 3) % 3);

    for (let dailyIndex = 0; dailyIndex < ordersThatDay; dailyIndex += 1) {
      orderNumber += 1;
      const suffix = String(orderNumber).padStart(6, "0");
      const orderId = `DMO${suffix}`;
      const customer = customers[(orderNumber * 7 + dayIndex) % customers.length];
      const state = orderNumber % 10;
      const orderStatus = state <= 5 ? "Selesai" : state <= 7 ? "Diproses" : state === 8 ? "Diterima" : "Dibatalkan";
      const paymentStatus = orderStatus === "Dibatalkan"
        ? "Ditolak"
        : orderStatus === "Diterima"
          ? (orderNumber % 2 ? "Menunggu" : "Lunas")
          : (orderNumber % 3 ? "Lunas" : "Dikonfirmasi");
      const deliveryMethod = orderNumber % 3 ? "Ambil" : "Diantar";
      const address = deliveryMethod === "Diantar"
        ? `${customer[5]} No. ${customer[6]}, ${customer[7]}`
        : null;

      const itemCount = 1 + (orderNumber % 3);
      let total = 0;
      for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
        const product = products[(orderNumber + itemIndex * 2) % products.length];
        const quantity = 1 + ((orderNumber + itemIndex) % 4);
        const unitPrice = Number(product.harga);
        total += unitPrice * quantity;
        details.push([
          orderId,
          product.id_produk,
          quantity,
          unitPrice,
          product.stok + quantity,
          product.stok,
        ]);
      }

      orders.push([
        orderId,
        paymentStatus === "Lunas" || paymentStatus === "Dikonfirmasi" ? adminId : null,
        customer[0],
        orderDate,
        orderStatus,
        deliveryMethod,
        address,
      ]);
      payments.push([
        `DMP${suffix}`,
        paymentStatus === "Lunas" || paymentStatus === "Dikonfirmasi" ? adminId : null,
        orderId,
        orderNumber % 2 ? "Transfer" : "Tunai",
        total,
        orderDate,
        paymentStatus,
      ]);

      if (orderStatus === "Selesai" || orderStatus === "Diproses") {
        const completed = orderStatus === "Selesai";
        const productionEnd = minDate(dayAtOffset(orderDate, 1 + (orderNumber % 2)), today);
        productions.push([
          `DPR${suffix}`,
          orderId,
          employeeId,
          completed ? "Selesai" : "Sedang dibuat",
          orderDate,
          completed ? productionEnd : null,
        ]);

        if (completed && orderNumber % 5 !== 0) {
          handovers.push([
            `DMH${suffix}`,
            adminId,
            orderId,
            deliveryMethod,
            orderNumber % 4 ? "Diserahkan" : "Siap diserahkan",
            minDate(dayAtOffset(orderDate, orderNumber % 2), today),
          ]);
        }

        if (completed && orderNumber % 3 !== 0) {
          reviews.push([
            `DMR${suffix}`,
            orderId,
            orderNumber % 7 === 0 ? 3 : orderNumber % 4 === 0 ? 4 : 5,
            reviewText[orderNumber % reviewText.length],
            minDate(dayAtOffset(orderDate, 1 + (orderNumber % 3)), today),
          ]);
        }
      }
    }
  }

  const feedback = Array.from({ length: 24 }, (_, index) => {
    const customer = customers[(index * 5 + 2) % customers.length];
    return [
      `DMF${String(index + 1).padStart(6, "0")}`,
      customer[0],
      feedbackText[index % feedbackText.length],
      dayAtOffset(today, -(index * 3) % 90),
    ];
  });

  await insertMany(
    client,
    "pesanan",
    ["no_pesanan", "id_admin", "id_pelanggan", "tanggal_pesanan", "status_pesanan", "metode_penyerahan", "alamat_penyerahan"],
    orders,
    "no_pesanan",
  );
  await insertMany(
    client,
    "detail_pesanan",
    ["no_pesanan", "id_produk", "jumlah", "harga_satuan", "stok_produk_sebelum", "stok_produk_sesudah"],
    details,
    "no_pesanan, id_produk",
  );
  await insertMany(
    client,
    "pembayaran",
    ["id_pembayaran", "id_admin", "no_pesanan", "metode_pembayaran", "jumlah_bayar", "tanggal_bayar", "status_pembayaran"],
    payments,
    "id_pembayaran",
  );
  await insertMany(
    client,
    "produksi",
    ["id_produksi", "no_pesanan", "id_karyawan", "status_produksi", "tanggal_mulai_produksi", "tanggal_selesai_produksi"],
    productions,
    "no_pesanan",
  );
  await insertMany(
    client,
    "penyerahan",
    ["id_penyerahan", "id_admin", "no_pesanan", "metode_penyerahan", "status_penyerahan", "tanggal_penyerahan"],
    handovers,
    "no_pesanan",
  );
  await insertMany(
    client,
    "ulasan",
    ["id_ulasan", "no_pesanan", "rating", "isi_ulasan", "tanggal_ulasan"],
    reviews,
    "no_pesanan",
  );
  await insertMany(
    client,
    "kritik_saran",
    ["id_kritik_saran", "id_pelanggan", "isi", "tanggal"],
    feedback,
    "id_kritik_saran",
  );

  await client.query("COMMIT");
  console.log(
    `Demo data ready: ${customers.length} customers, ${orders.length} orders, ${payments.length} payments, ` +
    `${productions.length} production records, ${handovers.length} handovers, ${reviews.length} reviews, and ${feedback.length} feedback entries.`,
  );
  console.log("The fixtures cover the 90 days ending today and do not change product stock or demo account passwords.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
