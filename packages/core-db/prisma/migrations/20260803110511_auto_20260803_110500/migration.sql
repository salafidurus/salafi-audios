/*
  Warnings:

  - You are about to drop the `UserPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserScholarRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserTranslatorRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_grantedBy_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserScholarRole" DROP CONSTRAINT "UserScholarRole_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "UserScholarRole" DROP CONSTRAINT "UserScholarRole_scholarId_fkey";

-- DropForeignKey
ALTER TABLE "UserScholarRole" DROP CONSTRAINT "UserScholarRole_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserTranslatorRole" DROP CONSTRAINT "UserTranslatorRole_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "UserTranslatorRole" DROP CONSTRAINT "UserTranslatorRole_scholarId_fkey";

-- DropForeignKey
ALTER TABLE "UserTranslatorRole" DROP CONSTRAINT "UserTranslatorRole_userId_fkey";

-- DropTable
DROP TABLE "UserPermission";

-- DropTable
DROP TABLE "UserScholarRole";

-- DropTable
DROP TABLE "UserTranslatorRole";

-- DropEnum
DROP TYPE "Permission";

-- DropEnum
DROP TYPE "ScholarPermissionType";
