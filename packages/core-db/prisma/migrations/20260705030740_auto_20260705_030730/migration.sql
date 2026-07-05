/*
  Warnings:

  - You are about to drop the column `lectureId` on the `AudioAsset` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `RecommendationHero` table. All the data in the column will be lost.
  - You are about to drop the column `entityKind` on the `RecommendationHero` table. All the data in the column will be lost.
  - You are about to drop the `AnalyticsEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Collection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollectionTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CollectionTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FavoriteLecture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lecture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LectureTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LectureTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Series` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeriesTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeriesTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLectureProgress` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `listingId` to the `AudioAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingId` to the `RecommendationHero` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListingFormat" AS ENUM ('collection', 'series', 'single');

-- DropForeignKey
ALTER TABLE "AudioAsset" DROP CONSTRAINT "AudioAsset_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_ingestionBatchId_fkey";

-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_scholarId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionTopic" DROP CONSTRAINT "CollectionTopic_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionTopic" DROP CONSTRAINT "CollectionTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionTranslation" DROP CONSTRAINT "CollectionTranslation_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteLecture" DROP CONSTRAINT "FavoriteLecture_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteLecture" DROP CONSTRAINT "FavoriteLecture_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_ingestionBatchId_fkey";

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_scholarId_fkey";

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "LectureTopic" DROP CONSTRAINT "LectureTopic_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "LectureTopic" DROP CONSTRAINT "LectureTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "LectureTranslation" DROP CONSTRAINT "LectureTranslation_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "Series" DROP CONSTRAINT "Series_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "Series" DROP CONSTRAINT "Series_ingestionBatchId_fkey";

-- DropForeignKey
ALTER TABLE "Series" DROP CONSTRAINT "Series_scholarId_fkey";

-- DropForeignKey
ALTER TABLE "SeriesTopic" DROP CONSTRAINT "SeriesTopic_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "SeriesTopic" DROP CONSTRAINT "SeriesTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "SeriesTranslation" DROP CONSTRAINT "SeriesTranslation_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "UserLectureProgress" DROP CONSTRAINT "UserLectureProgress_lectureId_fkey";

-- DropForeignKey
ALTER TABLE "UserLectureProgress" DROP CONSTRAINT "UserLectureProgress_userId_fkey";

-- DropIndex
DROP INDEX "idx_audioasset_lecture";

-- DropIndex
DROP INDEX "idx_recommendationhero_entity";

-- AlterTable
ALTER TABLE "AudioAsset" DROP COLUMN "lectureId",
ADD COLUMN     "listingId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "RecommendationHero" DROP COLUMN "entityId",
DROP COLUMN "entityKind",
ADD COLUMN     "listingId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Scholar" ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "deletedBy" UUID,
ADD COLUMN     "updatedBy" UUID;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "AnalyticsEvent";

-- DropTable
DROP TABLE "Collection";

-- DropTable
DROP TABLE "CollectionTopic";

-- DropTable
DROP TABLE "CollectionTranslation";

-- DropTable
DROP TABLE "FavoriteLecture";

-- DropTable
DROP TABLE "Lecture";

-- DropTable
DROP TABLE "LectureTopic";

-- DropTable
DROP TABLE "LectureTranslation";

-- DropTable
DROP TABLE "Series";

-- DropTable
DROP TABLE "SeriesTopic";

-- DropTable
DROP TABLE "SeriesTranslation";

-- DropTable
DROP TABLE "UserLectureProgress";

-- DropEnum
DROP TYPE "AnalyticsContentKind";

-- DropEnum
DROP TYPE "AnalyticsEventType";

-- DropEnum
DROP TYPE "AnalyticsSource";

-- CreateTable
CREATE TABLE "Listing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scholarId" TEXT NOT NULL,
    "parentId" UUID,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "format" "ListingFormat" NOT NULL,
    "coverImageUrl" TEXT,
    "language" "Locale",
    "status" "Status" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "orderIndex" INTEGER,
    "durationSeconds" INTEGER,
    "publishedLectureCount" INTEGER,
    "publishedDurationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deleteAfterAt" TIMESTAMP(3),
    "createdBy" UUID,
    "updatedBy" UUID,
    "deletedBy" UUID,
    "ingestionBatchId" TEXT,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurationMetadata" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listingId" UUID NOT NULL,
    "override" BOOLEAN NOT NULL DEFAULT false,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "recurrence" "RecommendationRecurrence" NOT NULL DEFAULT 'none',

    CONSTRAINT "CurationMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingTopic" (
    "listingId" UUID NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingTopic_pkey" PRIMARY KEY ("listingId","topicId")
);

-- CreateTable
CREATE TABLE "UserListingProgress" (
    "userId" TEXT NOT NULL,
    "listingId" UUID NOT NULL,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserListingProgress_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateTable
CREATE TABLE "FavoriteListing" (
    "userId" TEXT NOT NULL,
    "listingId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteListing_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateTable
CREATE TABLE "ListingTranslation" (
    "id" TEXT NOT NULL,
    "listingId" UUID NOT NULL,
    "locale" "Locale" NOT NULL,
    "status" "TranslationStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE INDEX "Listing_title_idx" ON "Listing" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Listing_parentId_idx" ON "Listing"("parentId");

-- CreateIndex
CREATE INDEX "Listing_scholarId_status_idx" ON "Listing"("scholarId", "status");

-- CreateIndex
CREATE INDEX "Listing_publishedAt_idx" ON "Listing"("publishedAt");

-- CreateIndex
CREATE INDEX "Listing_deletedAt_idx" ON "Listing"("deletedAt");

-- CreateIndex
CREATE INDEX "Listing_deleteAfterAt_idx" ON "Listing"("deleteAfterAt");

-- CreateIndex
CREATE INDEX "Listing_orderIndex_idx" ON "Listing"("orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_id_scholarId_key" ON "Listing"("id", "scholarId");

-- CreateIndex
CREATE UNIQUE INDEX "CurationMetadata_listingId_key" ON "CurationMetadata"("listingId");

-- CreateIndex
CREATE INDEX "idx_listingtopic_topic_listing" ON "ListingTopic"("topicId", "listingId");

-- CreateIndex
CREATE INDEX "idx_progress_user_updatedat" ON "UserListingProgress"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "idx_progress_listing" ON "UserListingProgress"("listingId");

-- CreateIndex
CREATE INDEX "idx_fav_user_createdat" ON "FavoriteListing"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_fav_listing" ON "FavoriteListing"("listingId");

-- CreateIndex
CREATE INDEX "ListingTranslation_listingId_idx" ON "ListingTranslation"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingTranslation_listingId_locale_key" ON "ListingTranslation"("listingId", "locale");

-- CreateIndex
CREATE INDEX "idx_audioasset_listing" ON "AudioAsset"("listingId");

-- CreateIndex
CREATE INDEX "idx_recommendationhero_listing" ON "RecommendationHero"("listingId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ingestionBatchId_fkey" FOREIGN KEY ("ingestionBatchId") REFERENCES "IngestionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_parentId_scholarId_fkey" FOREIGN KEY ("parentId", "scholarId") REFERENCES "Listing"("id", "scholarId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurationMetadata" ADD CONSTRAINT "CurationMetadata_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationHero" ADD CONSTRAINT "RecommendationHero_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioAsset" ADD CONSTRAINT "AudioAsset_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingTopic" ADD CONSTRAINT "ListingTopic_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingTopic" ADD CONSTRAINT "ListingTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListingProgress" ADD CONSTRAINT "UserListingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListingProgress" ADD CONSTRAINT "UserListingProgress_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteListing" ADD CONSTRAINT "FavoriteListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteListing" ADD CONSTRAINT "FavoriteListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingTranslation" ADD CONSTRAINT "ListingTranslation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
