/*
  Warnings:

  - You are about to drop the column `ingestionBatchId` on the `AudioAsset` table. All the data in the column will be lost.
  - You are about to drop the column `ingestionBatchId` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `ingestionBatchId` on the `Scholar` table. All the data in the column will be lost.
  - You are about to drop the `IngestionBatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AudioAsset" DROP CONSTRAINT "AudioAsset_ingestionBatchId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_ingestionBatchId_fkey";

-- DropForeignKey
ALTER TABLE "Scholar" DROP CONSTRAINT "Scholar_ingestionBatchId_fkey";

-- AlterTable
ALTER TABLE "AudioAsset" DROP COLUMN "ingestionBatchId";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "ingestionBatchId";

-- AlterTable
ALTER TABLE "Scholar" DROP COLUMN "ingestionBatchId";

-- DropTable
DROP TABLE "IngestionBatch";
