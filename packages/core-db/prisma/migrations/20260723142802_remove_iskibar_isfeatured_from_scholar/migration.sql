/*
  Warnings:

  - You are about to drop the column `isFeatured` on the `Scholar` table. All the data in the column will be lost.
  - You are about to drop the column `isKibar` on the `Scholar` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Scholar" DROP COLUMN "isFeatured",
DROP COLUMN "isKibar";
