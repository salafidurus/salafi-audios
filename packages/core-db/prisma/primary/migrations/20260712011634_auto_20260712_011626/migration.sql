-- CreateEnum
CREATE TYPE "ScholarRole" AS ENUM ('scholar', 'scholar_editor');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "UserScholarRole" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "permissionType" DROP DEFAULT;

-- RenameForeignKey
ALTER TABLE "UserScholarRole" RENAME CONSTRAINT "UserScholarRole_createdByUserId_fkey" TO "UserScholarRole_createdBy_fkey";
