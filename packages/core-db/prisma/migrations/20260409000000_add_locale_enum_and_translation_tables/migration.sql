-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'ar');

-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('draft', 'published');

-- AlterTable: migrate existing String? language columns to Locale?
-- First nullify invalid values, then alter column type
UPDATE "Scholar" SET "mainLanguage" = NULL WHERE "mainLanguage" NOT IN ('en', 'ar');
UPDATE "Collection" SET "language" = NULL WHERE "language" NOT IN ('en', 'ar');
UPDATE "Series" SET "language" = NULL WHERE "language" NOT IN ('en', 'ar');
UPDATE "Lecture" SET "language" = NULL WHERE "language" NOT IN ('en', 'ar');
UPDATE "LivestreamChannel" SET "language" = NULL WHERE "language" NOT IN ('en', 'ar');
UPDATE "User" SET "preferredLanguage" = NULL WHERE "preferredLanguage" NOT IN ('en', 'ar');

ALTER TABLE "Scholar" ALTER COLUMN "mainLanguage" TYPE "Locale" USING "mainLanguage"::"Locale";
ALTER TABLE "Collection" ALTER COLUMN "language" TYPE "Locale" USING "language"::"Locale";
ALTER TABLE "Series" ALTER COLUMN "language" TYPE "Locale" USING "language"::"Locale";
ALTER TABLE "Lecture" ALTER COLUMN "language" TYPE "Locale" USING "language"::"Locale";
ALTER TABLE "LivestreamChannel" ALTER COLUMN "language" TYPE "Locale" USING "language"::"Locale";
ALTER TABLE "User" ALTER COLUMN "preferredLanguage" TYPE "Locale" USING "preferredLanguage"::"Locale";

-- CreateTable
CREATE TABLE "ScholarTranslation" (
    "id" TEXT NOT NULL,
    "scholarId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "status" "TranslationStatus" NOT NULL DEFAULT 'draft',
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScholarTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureTranslation" (
    "id" TEXT NOT NULL,
    "lectureId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "status" "TranslationStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LectureTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriesTranslation" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "status" "TranslationStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeriesTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectionTranslation" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "status" "TranslationStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicTranslation" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "status" "TranslationStatus" NOT NULL DEFAULT 'draft',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScholarTranslation_scholarId_idx" ON "ScholarTranslation"("scholarId");
CREATE UNIQUE INDEX "ScholarTranslation_scholarId_locale_key" ON "ScholarTranslation"("scholarId", "locale");

-- CreateIndex
CREATE INDEX "LectureTranslation_lectureId_idx" ON "LectureTranslation"("lectureId");
CREATE UNIQUE INDEX "LectureTranslation_lectureId_locale_key" ON "LectureTranslation"("lectureId", "locale");

-- CreateIndex
CREATE INDEX "SeriesTranslation_seriesId_idx" ON "SeriesTranslation"("seriesId");
CREATE UNIQUE INDEX "SeriesTranslation_seriesId_locale_key" ON "SeriesTranslation"("seriesId", "locale");

-- CreateIndex
CREATE INDEX "CollectionTranslation_collectionId_idx" ON "CollectionTranslation"("collectionId");
CREATE UNIQUE INDEX "CollectionTranslation_collectionId_locale_key" ON "CollectionTranslation"("collectionId", "locale");

-- CreateIndex
CREATE INDEX "TopicTranslation_topicId_idx" ON "TopicTranslation"("topicId");
CREATE UNIQUE INDEX "TopicTranslation_topicId_locale_key" ON "TopicTranslation"("topicId", "locale");

-- AddForeignKey
ALTER TABLE "ScholarTranslation" ADD CONSTRAINT "ScholarTranslation_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureTranslation" ADD CONSTRAINT "LectureTranslation_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesTranslation" ADD CONSTRAINT "SeriesTranslation_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionTranslation" ADD CONSTRAINT "CollectionTranslation_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTranslation" ADD CONSTRAINT "TopicTranslation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
