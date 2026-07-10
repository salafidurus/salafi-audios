/*
  Warnings:

  - Made the column `country` on table `Scholar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mainLanguage` on table `Scholar` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Scholar" ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "country" SET DEFAULT 'Saudi Arabia',
ALTER COLUMN "mainLanguage" SET NOT NULL,
ALTER COLUMN "mainLanguage" SET DEFAULT 'ar';
