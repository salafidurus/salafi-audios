-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('scheduled', 'live', 'ended');

-- AlterTable: Add isFeatured to Scholar
ALTER TABLE "Scholar" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LivestreamChannel" (
    "id" TEXT NOT NULL,
    "scholarId" TEXT,
    "telegramId" TEXT NOT NULL,
    "telegramSlug" TEXT,
    "displayName" TEXT NOT NULL,
    "language" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LivestreamChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'scheduled',
    "title" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "telegramMsgId" TEXT,
    "viewerCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LivestreamChannel_telegramId_key" ON "LivestreamChannel"("telegramId");
CREATE INDEX "LivestreamChannel_isActive_idx" ON "LivestreamChannel"("isActive");
CREATE INDEX "LivestreamChannel_scholarId_idx" ON "LivestreamChannel"("scholarId");
CREATE INDEX "LiveSession_channelId_status_idx" ON "LiveSession"("channelId", "status");
CREATE INDEX "LiveSession_status_scheduledAt_idx" ON "LiveSession"("status", "scheduledAt");
CREATE INDEX "LiveSession_status_startedAt_idx" ON "LiveSession"("status", "startedAt");

-- AddForeignKey
ALTER TABLE "LivestreamChannel" ADD CONSTRAINT "LivestreamChannel_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "LivestreamChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
