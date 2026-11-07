-- CreateEnum
CREATE TYPE "account_role" AS ENUM ('ADMIN', 'CUSTOMER', 'KARYAWAN_PRODUKSI', 'OWNER');

-- DropForeignKey
ALTER TABLE "pembayaran" DROP CONSTRAINT "pembayaran_id_admin_fkey";

-- DropForeignKey
ALTER TABLE "pesanan" DROP CONSTRAINT "pesanan_id_admin_fkey";

-- AlterTable
ALTER TABLE "pembayaran" ALTER COLUMN "id_admin" DROP NOT NULL;

-- AlterTable
ALTER TABLE "pesanan" ALTER COLUMN "id_admin" DROP NOT NULL;

-- AlterTable
ALTER TABLE "produk" ADD COLUMN     "gambar_url" VARCHAR(255),
ADD COLUMN     "harga" DECIMAL(19,2) NOT NULL DEFAULT 0,
ADD COLUMN     "stok" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "kategori_produk" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "satuan_produk" SET DATA TYPE VARCHAR(20);

-- CreateTable
CREATE TABLE "account" (
    "id_account" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "account_role" NOT NULL,
    "id_admin" VARCHAR(10),
    "id_pelanggan" VARCHAR(10),
    "id_karyawan" VARCHAR(10),
    "id_owner" VARCHAR(10),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id_account")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "id_session" TEXT NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "id_account" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id_session")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_username_key" ON "account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "account_id_admin_key" ON "account"("id_admin");

-- CreateIndex
CREATE UNIQUE INDEX "account_id_pelanggan_key" ON "account"("id_pelanggan");

-- CreateIndex
CREATE UNIQUE INDEX "account_id_karyawan_key" ON "account"("id_karyawan");

-- CreateIndex
CREATE UNIQUE INDEX "account_id_owner_key" ON "account"("id_owner");

-- CreateIndex
CREATE UNIQUE INDEX "auth_session_token_hash_key" ON "auth_session"("token_hash");

-- CreateIndex
CREATE INDEX "auth_session_id_account_idx" ON "auth_session"("id_account");

-- CreateIndex
CREATE INDEX "auth_session_expires_at_idx" ON "auth_session"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "ulasan_no_pesanan_key" ON "ulasan"("no_pesanan");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin"("id_admin") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggan"("id_pelanggan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_id_karyawan_fkey" FOREIGN KEY ("id_karyawan") REFERENCES "karyawan"("id_karyawan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "owner"("id_owner") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_id_account_fkey" FOREIGN KEY ("id_account") REFERENCES "account"("id_account") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin"("id_admin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pesanan" ADD CONSTRAINT "pesanan_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin"("id_admin") ON DELETE SET NULL ON UPDATE CASCADE;
