-- CreateTable
CREATE TABLE "admin" (
    "id_admin" VARCHAR(10) NOT NULL,
    "id_owner" VARCHAR(10) NOT NULL,
    "nama_admin" VARCHAR(50) NOT NULL,
    "jenis_kelamin" VARCHAR(10) NOT NULL,
    "no_telepon" VARCHAR(16) NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "tanggal_bergabung" DATE NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "detail_pesanan" (
    "no_pesanan" VARCHAR(10) NOT NULL,
    "id_produk" VARCHAR(10) NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga_satuan" DECIMAL(19,2) NOT NULL,
    "stok_produk_sebelum" INTEGER NOT NULL,
    "stok_produk_sesudah" INTEGER NOT NULL,

    CONSTRAINT "detail_pesanan_pkey" PRIMARY KEY ("no_pesanan","id_produk")
);

-- CreateTable
CREATE TABLE "karyawan" (
    "id_karyawan" VARCHAR(10) NOT NULL,
    "nama_karyawan" VARCHAR(50) NOT NULL,
    "jenis_kelamin" VARCHAR(10) NOT NULL,
    "no_telepon" VARCHAR(16) NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "tanggal_bergabung" DATE NOT NULL,

    CONSTRAINT "karyawan_pkey" PRIMARY KEY ("id_karyawan")
);

-- CreateTable
CREATE TABLE "owner" (
    "id_owner" VARCHAR(10) NOT NULL,
    "nama_owner" VARCHAR(50) NOT NULL,
    "jenis_kelamin" VARCHAR(10) NOT NULL,
    "no_telepon" VARCHAR(16) NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "tanggal_bergabung" DATE NOT NULL,

    CONSTRAINT "owner_pkey" PRIMARY KEY ("id_owner")
);

-- CreateTable
CREATE TABLE "pelanggan" (
    "id_pelanggan" VARCHAR(10) NOT NULL,
    "nama_pelanggan" VARCHAR(50) NOT NULL,
    "jenis_kelamin" VARCHAR(10) NOT NULL,
    "no_telepon" VARCHAR(16) NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "nama_jalan" VARCHAR(50) NOT NULL,
    "nomor" VARCHAR(4) NOT NULL,
    "kota" VARCHAR(15) NOT NULL,

    CONSTRAINT "pelanggan_pkey" PRIMARY KEY ("id_pelanggan")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id_pembayaran" VARCHAR(10) NOT NULL,
    "id_admin" VARCHAR(10) NOT NULL,
    "no_pesanan" VARCHAR(10) NOT NULL,
    "metode_pembayaran" VARCHAR(10) NOT NULL,
    "jumlah_bayar" DECIMAL(19,2) NOT NULL,
    "tanggal_bayar" DATE NOT NULL,
    "status_pembayaran" VARCHAR(10) NOT NULL,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id_pembayaran")
);

-- CreateTable
CREATE TABLE "penyerahan" (
    "id_penyerahan" VARCHAR(10) NOT NULL,
    "id_admin" VARCHAR(10) NOT NULL,
    "no_pesanan" VARCHAR(10) NOT NULL,
    "metode_penyerahan" VARCHAR(10) NOT NULL,
    "status_penyerahan" VARCHAR(10) NOT NULL,
    "tanggal_penyerahan" DATE NOT NULL,

    CONSTRAINT "penyerahan_pkey" PRIMARY KEY ("id_penyerahan")
);

-- CreateTable
CREATE TABLE "pesanan" (
    "no_pesanan" VARCHAR(10) NOT NULL,
    "id_admin" VARCHAR(10) NOT NULL,
    "id_pelanggan" VARCHAR(10) NOT NULL,
    "tanggal_pesanan" DATE NOT NULL,
    "status_pesanan" VARCHAR(10) NOT NULL,

    CONSTRAINT "pesanan_pkey" PRIMARY KEY ("no_pesanan")
);

-- CreateTable
CREATE TABLE "produk" (
    "id_produk" VARCHAR(10) NOT NULL,
    "nama_produk" VARCHAR(30) NOT NULL,
    "kategori_produk" VARCHAR(10) NOT NULL,
    "satuan_produk" VARCHAR(10) NOT NULL,
    "stok_minimum" INTEGER NOT NULL,

    CONSTRAINT "produk_pkey" PRIMARY KEY ("id_produk")
);

-- CreateTable
CREATE TABLE "produksi" (
    "id_produksi" VARCHAR(10) NOT NULL,
    "no_pesanan" VARCHAR(10) NOT NULL,
    "id_karyawan" VARCHAR(10) NOT NULL,
    "status_produksi" VARCHAR(10) NOT NULL,
    "tanggal_mulai_produksi" DATE NOT NULL,
    "tanggal_selesai_produksi" DATE NOT NULL,

    CONSTRAINT "produksi_pkey" PRIMARY KEY ("id_produksi")
);

-- CreateTable
CREATE TABLE "ulasan" (
    "id_ulasan" VARCHAR(10) NOT NULL,
    "no_pesanan" VARCHAR(10) NOT NULL,
    "rating" INTEGER NOT NULL,
    "isi_ulasan" VARCHAR(255) NOT NULL,
    "tanggal_ulasan" DATE NOT NULL,

    CONSTRAINT "ulasan_pkey" PRIMARY KEY ("id_ulasan")
);

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "owner"("id_owner") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pesanan" ADD CONSTRAINT "detail_pesanan_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pesanan" ADD CONSTRAINT "detail_pesanan_no_pesanan_fkey" FOREIGN KEY ("no_pesanan") REFERENCES "pesanan"("no_pesanan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin"("id_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_no_pesanan_fkey" FOREIGN KEY ("no_pesanan") REFERENCES "pesanan"("no_pesanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penyerahan" ADD CONSTRAINT "penyerahan_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin"("id_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penyerahan" ADD CONSTRAINT "penyerahan_no_pesanan_fkey" FOREIGN KEY ("no_pesanan") REFERENCES "pesanan"("no_pesanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin"("id_admin") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggan"("id_pelanggan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produksi" ADD CONSTRAINT "produksi_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "karyawan"("id_karyawan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produksi" ADD CONSTRAINT "produksi_no_pesanan_fkey" FOREIGN KEY ("no_pesanan") REFERENCES "pesanan"("no_pesanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ulasan" ADD CONSTRAINT "ulasan_no_pesanan_fkey" FOREIGN KEY ("no_pesanan") REFERENCES "pesanan"("no_pesanan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve the data validation rules from the supplied database.sql.
ALTER TABLE "detail_pesanan" ADD CONSTRAINT "detail_pesanan_jumlah_check" CHECK ("jumlah" > 0);
ALTER TABLE "detail_pesanan" ADD CONSTRAINT "detail_pesanan_harga_satuan_check" CHECK ("harga_satuan" >= 0);
ALTER TABLE "ulasan" ADD CONSTRAINT "ulasan_rating_check" CHECK ("rating" BETWEEN 1 AND 5);
