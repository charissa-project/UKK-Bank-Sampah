/*
  Warnings:

  - A unique constraint covering the columns `[kodeSetor]` on the table `setor_sampah` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kodeSetor` to the `setor_sampah` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "setor_sampah" ADD COLUMN     "kodeSetor" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "setor_sampah_kodeSetor_key" ON "setor_sampah"("kodeSetor");
