-- CreateEnum
CREATE TYPE "Status" AS ENUM ('draft', 'review', 'published', 'archived');

-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('admin', 'listener');

-- CreateEnum
CREATE TYPE "ScholarRole" AS ENUM ('scholar', 'scholar_editor');

-- CreateTable
CREATE TABLE "IngestionBatch" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "emailNormalized" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "name" TEXT,
    "preferredLanguage" TEXT,
    "passwordHash" TEXT,
    "passwordUpdatedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "erasureRequestedAt" TIMESTAMP(3),
    "erasedAt" TIMESTAMP(3),
    "isBanned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGlobalRole" (
    "userId" TEXT NOT NULL,
    "role" "GlobalRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGlobalRole_pkey" PRIMARY KEY ("userId","role")
);

-- CreateTable
CREATE TABLE "UserScholarRole" (
    "userId" TEXT NOT NULL,
    "scholarId" TEXT NOT NULL,
    "role" "ScholarRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,

    CONSTRAINT "UserScholarRole_pkey" PRIMARY KEY ("userId","scholarId","role")
);

-- CreateTable
CREATE TABLE "Scholar" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "country" TEXT,
    "mainLanguage" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "ingestionBatchId" TEXT,

    CONSTRAINT "Scholar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "scholarId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "language" TEXT,
    "status" "Status" NOT NULL DEFAULT 'draft',
    "orderIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deleteAfterAt" TIMESTAMP(3),
    "ingestionBatchId" TEXT,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "scholarId" TEXT NOT NULL,
    "collectionId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT,
    "language" TEXT,
    "status" "Status" NOT NULL DEFAULT 'draft',
    "orderIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deleteAfterAt" TIMESTAMP(3),
    "ingestionBatchId" TEXT,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lecture" (
    "id" TEXT NOT NULL,
    "scholarId" TEXT NOT NULL,
    "seriesId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "status" "Status" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "orderIndex" INTEGER,
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deleteAfterAt" TIMESTAMP(3),
    "ingestionBatchId" TEXT,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioAsset" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "format" TEXT,
    "bitrateKbps" INTEGER,
    "sizeBytes" BIGINT,
    "durationSeconds" INTEGER,
    "source" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ingestionBatchId" TEXT,

    CONSTRAINT "AudioAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureTopic" (
    "lectureId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LectureTopic_pkey" PRIMARY KEY ("lectureId","topicId")
);

-- CreateTable
CREATE TABLE "SeriesTopic" (
    "seriesId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeriesTopic_pkey" PRIMARY KEY ("seriesId","topicId")
);

-- CreateTable
CREATE TABLE "CollectionTopic" (
    "collectionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionTopic_pkey" PRIMARY KEY ("collectionId","topicId")
);

-- CreateTable
CREATE TABLE "UserLectureProgress" (
    "userId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLectureProgress_pkey" PRIMARY KEY ("userId","lectureId")
);

-- CreateTable
CREATE TABLE "FavoriteLecture" (
    "userId" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteLecture_pkey" PRIMARY KEY ("userId","lectureId")
);

-- CreateIndex
CREATE INDEX "IngestionBatch_tag_idx" ON "IngestionBatch"("tag");

-- CreateIndex
CREATE INDEX "IngestionBatch_environment_idx" ON "IngestionBatch"("environment");

-- CreateIndex
CREATE UNIQUE INDEX "IngestionBatch_tag_environment_key" ON "IngestionBatch"("tag", "environment");

-- CreateIndex
CREATE INDEX "idx_user_emailnorm" ON "User"("emailNormalized");

-- CreateIndex
CREATE INDEX "idx_user_deactivated" ON "User"("deactivatedAt");

-- CreateIndex
CREATE INDEX "idx_user_erasure_requested" ON "User"("erasureRequestedAt");

-- CreateIndex
CREATE INDEX "idx_user_last_login" ON "User"("lastLoginAt");

-- CreateIndex
CREATE INDEX "idx_globalrole_role_user" ON "UserGlobalRole"("role", "userId");

-- CreateIndex
CREATE INDEX "idx_user_scholar_role_scholar_role" ON "UserScholarRole"("scholarId", "role");

-- CreateIndex
CREATE INDEX "idx_user_scholar_role_user" ON "UserScholarRole"("userId");

-- CreateIndex
CREATE INDEX "idx_scholar_active" ON "Scholar"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "uq_scholar_slug" ON "Scholar"("slug");

-- CreateIndex
CREATE INDEX "idx_collection_scholar_status" ON "Collection"("scholarId", "status");

-- CreateIndex
CREATE INDEX "idx_collection_scholar_order" ON "Collection"("scholarId", "orderIndex");

-- CreateIndex
CREATE INDEX "idx_collection_deleted" ON "Collection"("deletedAt");

-- CreateIndex
CREATE INDEX "idx_collection_deleteafter" ON "Collection"("deleteAfterAt");

-- CreateIndex
CREATE UNIQUE INDEX "uq_collection_scholar_slug" ON "Collection"("scholarId", "slug");

-- CreateIndex
CREATE INDEX "idx_series_collection_order" ON "Series"("collectionId", "orderIndex");

-- CreateIndex
CREATE INDEX "idx_series_scholar_status" ON "Series"("scholarId", "status");

-- CreateIndex
CREATE INDEX "idx_series_deleted" ON "Series"("deletedAt");

-- CreateIndex
CREATE INDEX "idx_series_deleteafter" ON "Series"("deleteAfterAt");

-- CreateIndex
CREATE UNIQUE INDEX "uq_series_scholar_slug" ON "Series"("scholarId", "slug");

-- CreateIndex
CREATE INDEX "idx_lecture_series_order" ON "Lecture"("seriesId", "orderIndex");

-- CreateIndex
CREATE INDEX "idx_lecture_scholar_status" ON "Lecture"("scholarId", "status");

-- CreateIndex
CREATE INDEX "idx_lecture_publishedat" ON "Lecture"("publishedAt");

-- CreateIndex
CREATE INDEX "idx_lecture_deleted" ON "Lecture"("deletedAt");

-- CreateIndex
CREATE INDEX "idx_lecture_deleteafter" ON "Lecture"("deleteAfterAt");

-- CreateIndex
CREATE UNIQUE INDEX "uq_lecture_scholar_slug" ON "Lecture"("scholarId", "slug");

-- CreateIndex
CREATE INDEX "idx_audioasset_lecture" ON "AudioAsset"("lectureId");

-- CreateIndex
CREATE INDEX "idx_topic_parent" ON "Topic"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "uq_topic_slug" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "idx_lecturetopic_topic_lecture" ON "LectureTopic"("topicId", "lectureId");

-- CreateIndex
CREATE INDEX "idx_seriestopic_topic_series" ON "SeriesTopic"("topicId", "seriesId");

-- CreateIndex
CREATE INDEX "idx_collectiontopic_topic_collection" ON "CollectionTopic"("topicId", "collectionId");

-- CreateIndex
CREATE INDEX "idx_progress_user_updatedat" ON "UserLectureProgress"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "idx_progress_lecture" ON "UserLectureProgress"("lectureId");

-- CreateIndex
CREATE INDEX "idx_fav_user_createdat" ON "FavoriteLecture"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_fav_lecture" ON "FavoriteLecture"("lectureId");

-- AddForeignKey
ALTER TABLE "UserGlobalRole" ADD CONSTRAINT "UserGlobalRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScholarRole" ADD CONSTRAINT "UserScholarRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScholarRole" ADD CONSTRAINT "UserScholarRole_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScholarRole" ADD CONSTRAINT "UserScholarRole_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholar" ADD CONSTRAINT "Scholar_ingestionBatchId_fkey" FOREIGN KEY ("ingestionBatchId") REFERENCES "IngestionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_ingestionBatchId_fkey" FOREIGN KEY ("ingestionBatchId") REFERENCES "IngestionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_ingestionBatchId_fkey" FOREIGN KEY ("ingestionBatchId") REFERENCES "IngestionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_ingestionBatchId_fkey" FOREIGN KEY ("ingestionBatchId") REFERENCES "IngestionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioAsset" ADD CONSTRAINT "AudioAsset_ingestionBatchId_fkey" FOREIGN KEY ("ingestionBatchId") REFERENCES "IngestionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioAsset" ADD CONSTRAINT "AudioAsset_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureTopic" ADD CONSTRAINT "LectureTopic_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureTopic" ADD CONSTRAINT "LectureTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesTopic" ADD CONSTRAINT "SeriesTopic_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesTopic" ADD CONSTRAINT "SeriesTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTopic" ADD CONSTRAINT "CollectionTopic_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTopic" ADD CONSTRAINT "CollectionTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLectureProgress" ADD CONSTRAINT "UserLectureProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLectureProgress" ADD CONSTRAINT "UserLectureProgress_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteLecture" ADD CONSTRAINT "FavoriteLecture_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteLecture" ADD CONSTRAINT "FavoriteLecture_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
