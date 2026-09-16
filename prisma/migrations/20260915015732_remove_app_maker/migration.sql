/*
  Warnings:

  - You are about to drop the column `appMakerId` on the `hadiah` table. All the data in the column will be lost.
  - You are about to drop the column `appMakerId` on the `kategori_sampah` table. All the data in the column will be lost.
  - You are about to drop the column `appMakerId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `app_makers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "hadiah" DROP CONSTRAINT "hadiah_appMakerId_fkey";

-- DropForeignKey
ALTER TABLE "kategori_sampah" DROP CONSTRAINT "kategori_sampah_appMakerId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_appMakerId_fkey";

-- DropIndex
DROP INDEX "hadiah_appMakerId_idx";

-- DropIndex
DROP INDEX "kategori_sampah_appMakerId_idx";

-- DropIndex
DROP INDEX "users_appMakerId_idx";

-- DropIndex
DROP INDEX "users_username_appMakerId_key";

-- AlterTable
ALTER TABLE "hadiah" DROP COLUMN "appMakerId";

-- AlterTable
ALTER TABLE "kategori_sampah" DROP COLUMN "appMakerId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "appMakerId";

-- DropTable
DROP TABLE "app_makers";

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
