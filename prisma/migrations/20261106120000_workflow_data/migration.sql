-- AlterTable
ALTER TABLE "pembayaran" ALTER COLUMN "status_pembayaran" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "penyerahan" ALTER COLUMN "status_penyerahan" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "produksi" ALTER COLUMN "status_produksi" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "tanggal_selesai_produksi" DROP NOT NULL;

-- CreateTable
CREATE TABLE "kritik_saran" (
    "id_kritik_saran" VARCHAR(10) NOT NULL,
    "id_pelanggan" VARCHAR(10) NOT NULL,
    "isi" VARCHAR(500) NOT NULL,
    "tanggal" DATE NOT NULL,

    CONSTRAINT "kritik_saran_pkey" PRIMARY KEY ("id_kritik_saran")
);

-- CreateIndex
CREATE INDEX "kritik_saran_id_pelanggan_tanggal_idx" ON "kritik_saran"("id_pelanggan", "tanggal");

-- AddForeignKey
ALTER TABLE "kritik_saran" ADD CONSTRAINT "kritik_saran_id_pelanggan_fkey" FOREIGN KEY ("id_pelanggan") REFERENCES "pelanggan"("id_pelanggan") ON DELETE CASCADE ON UPDATE CASCADE;
