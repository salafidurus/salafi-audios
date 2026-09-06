-- AlterTable
ALTER TABLE "Scholar" ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "idx_scholar_title_order" ON "Scholar"("title", "orderIndex");

-- CreateIndex
CREATE INDEX "idx_topic_order" ON "Topic"("orderIndex");
