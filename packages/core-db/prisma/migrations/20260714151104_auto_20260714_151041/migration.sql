/*
  Warnings:

  - You are about to drop the column `parentId` on the `Topic` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_parentId_fkey";

-- DropIndex
DROP INDEX "idx_topic_parent";

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "parentId";

-- RenameForeignKey
ALTER TABLE "UserScholarRole" RENAME CONSTRAINT "UserScholarRole_createdByUser_fkey" TO "UserScholarRole_createdBy_fkey";
