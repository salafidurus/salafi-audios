-- AlterTable
ALTER TABLE "FavoriteListing" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "idx_fav_user_updatedat" ON "FavoriteListing"("userId", "updatedAt");
