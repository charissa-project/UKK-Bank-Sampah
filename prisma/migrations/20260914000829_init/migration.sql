/*
  Warnings:

  - You are about to drop the `tests` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'NASABAH');

-- CreateEnum
CREATE TYPE "JenisSampah" AS ENUM ('PLASTIK', 'KERTAS', 'LOGAM', 'KACA');

-- CreateEnum
CREATE TYPE "StatusSetor" AS ENUM ('MENUNGGU_KONFIRMASI', 'DIVERIFIKASI', 'DITOLAK', 'SELESAI');

-- CreateEnum
CREATE TYPE "StatusPenukaran" AS ENUM ('DIPROSES', 'SELESAI');

-- DropTable
DROP TABLE "tests";

-- CreateTable
CREATE TABLE "app_makers" (
    "id" UUID NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "namaSiswa" VARCHAR(100) NOT NULL,
    "kelas" VARCHAR(50) NOT NULL,
    "namaApp" VARCHAR(100) NOT NULL,
    "appKey" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_makers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "appMakerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nasabah" (
    "id" UUID NOT NULL,
    "namaNasabah" VARCHAR(100) NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" VARCHAR(20) NOT NULL,
    "saldoPoin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "foto" VARCHAR(255),
    "tanggalLahir" TIMESTAMP(3),
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nasabah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_bank" (
    "id" UUID NOT NULL,
    "namaUnit" VARCHAR(100) NOT NULL,
    "namaPengelola" VARCHAR(100) NOT NULL,
    "telp" VARCHAR(20) NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_sampah" (
    "id" UUID NOT NULL,
    "namaKategori" VARCHAR(100) NOT NULL,
    "hargaPerKg" DOUBLE PRECISION NOT NULL,
    "poinPerKg" DOUBLE PRECISION NOT NULL,
    "jenis" "JenisSampah" NOT NULL,
    "foto" VARCHAR(255),
    "appMakerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setor_sampah" (
    "id" UUID NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "catatan" TEXT NOT NULL,
    "status" "StatusSetor" NOT NULL DEFAULT 'MENUNGGU_KONFIRMASI',
    "catatanAdmin" TEXT,
    "nasabahId" UUID NOT NULL,
    "adminBankId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setor_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_setor" (
    "id" UUID NOT NULL,
    "idSetor" UUID NOT NULL,
    "idKategoriSampah" UUID NOT NULL,
    "beratKg" DOUBLE PRECISION NOT NULL,
    "subtotalPoin" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "detail_setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hadiah" (
    "id" UUID NOT NULL,
    "namaHadiah" VARCHAR(100) NOT NULL,
    "poinDibutuhkan" DOUBLE PRECISION NOT NULL,
    "stok" INTEGER NOT NULL,
    "foto" VARCHAR(255),
    "appMakerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hadiah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penukaran_poin" (
    "id" UUID NOT NULL,
    "kodePenukaran" VARCHAR(50) NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nasabahId" UUID NOT NULL,
    "idSetor" UUID,
    "hadiahId" UUID NOT NULL,
    "poinTerpakai" DOUBLE PRECISION NOT NULL,
    "status" "StatusPenukaran" NOT NULL DEFAULT 'DIPROSES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penukaran_poin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_makers_email_key" ON "app_makers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "app_makers_appKey_key" ON "app_makers"("appKey");

-- CreateIndex
CREATE INDEX "users_appMakerId_idx" ON "users"("appMakerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_appMakerId_key" ON "users"("username", "appMakerId");

-- CreateIndex
CREATE UNIQUE INDEX "nasabah_userId_key" ON "nasabah"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_bank_userId_key" ON "admin_bank"("userId");

-- CreateIndex
CREATE INDEX "kategori_sampah_appMakerId_idx" ON "kategori_sampah"("appMakerId");

-- CreateIndex
CREATE INDEX "setor_sampah_nasabahId_idx" ON "setor_sampah"("nasabahId");

-- CreateIndex
CREATE INDEX "setor_sampah_adminBankId_idx" ON "setor_sampah"("adminBankId");

-- CreateIndex
CREATE INDEX "detail_setor_idSetor_idx" ON "detail_setor"("idSetor");

-- CreateIndex
CREATE INDEX "detail_setor_idKategoriSampah_idx" ON "detail_setor"("idKategoriSampah");

-- CreateIndex
CREATE INDEX "hadiah_appMakerId_idx" ON "hadiah"("appMakerId");

-- CreateIndex
CREATE UNIQUE INDEX "penukaran_poin_kodePenukaran_key" ON "penukaran_poin"("kodePenukaran");

-- CreateIndex
CREATE INDEX "penukaran_poin_nasabahId_idx" ON "penukaran_poin"("nasabahId");

-- CreateIndex
CREATE INDEX "penukaran_poin_hadiahId_idx" ON "penukaran_poin"("hadiahId");

-- CreateIndex
CREATE INDEX "penukaran_poin_idSetor_idx" ON "penukaran_poin"("idSetor");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_appMakerId_fkey" FOREIGN KEY ("appMakerId") REFERENCES "app_makers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nasabah" ADD CONSTRAINT "nasabah_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_bank" ADD CONSTRAINT "admin_bank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kategori_sampah" ADD CONSTRAINT "kategori_sampah_appMakerId_fkey" FOREIGN KEY ("appMakerId") REFERENCES "app_makers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_nasabahId_fkey" FOREIGN KEY ("nasabahId") REFERENCES "nasabah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_adminBankId_fkey" FOREIGN KEY ("adminBankId") REFERENCES "admin_bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_idSetor_fkey" FOREIGN KEY ("idSetor") REFERENCES "setor_sampah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_idKategoriSampah_fkey" FOREIGN KEY ("idKategoriSampah") REFERENCES "kategori_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hadiah" ADD CONSTRAINT "hadiah_appMakerId_fkey" FOREIGN KEY ("appMakerId") REFERENCES "app_makers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_nasabahId_fkey" FOREIGN KEY ("nasabahId") REFERENCES "nasabah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_idSetor_fkey" FOREIGN KEY ("idSetor") REFERENCES "setor_sampah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_hadiahId_fkey" FOREIGN KEY ("hadiahId") REFERENCES "hadiah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
