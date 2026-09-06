/*
  Warnings:

  - You are about to drop the column `socialFacebook` on the `Scholar` table. All the data in the column will be lost.
  - You are about to drop the column `socialInstagram` on the `Scholar` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ScholarTitle" AS ENUM ('allamah', 'sheikh', 'ustadh', 'akh');

-- AlterTable
ALTER TABLE "Scholar" DROP COLUMN "socialFacebook",
DROP COLUMN "socialInstagram",
ADD COLUMN     "title" "ScholarTitle";
