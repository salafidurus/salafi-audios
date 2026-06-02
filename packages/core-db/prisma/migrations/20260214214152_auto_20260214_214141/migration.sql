-- CreateEnum
CREATE TYPE "AnalyticsContentKind" AS ENUM ('lecture', 'series', 'collection');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('view', 'play', 'complete', 'save', 'share');

-- CreateEnum
CREATE TYPE "AnalyticsSource" AS ENUM ('web', 'mobile', 'api');

-- CreateTable
CREATE TABLE "RecommendationHero" (
    "id" TEXT NOT NULL,
    "entityKind" "AnalyticsContentKind" NOT NULL,
    "entityId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationHero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "contentKind" "AnalyticsContentKind" NOT NULL,
    "contentId" TEXT NOT NULL,
    "eventType" "AnalyticsEventType" NOT NULL,
    "weight" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "AnalyticsSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_recommendationhero_active_order" ON "RecommendationHero"("isActive", "orderIndex");

-- CreateIndex
CREATE INDEX "idx_recommendationhero_entity" ON "RecommendationHero"("entityKind", "entityId");

-- CreateIndex
CREATE INDEX "idx_analytics_content_time" ON "AnalyticsEvent"("contentKind", "contentId", "occurredAt");

-- CreateIndex
CREATE INDEX "idx_analytics_event_time" ON "AnalyticsEvent"("eventType", "occurredAt");
