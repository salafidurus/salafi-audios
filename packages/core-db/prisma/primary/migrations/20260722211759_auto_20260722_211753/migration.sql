-- AlterTable
ALTER TABLE "Scholar" ADD COLUMN     "socialFacebook" TEXT,
ADD COLUMN     "socialInstagram" TEXT;

-- CreateIndex
CREATE INDEX "Listing_scholarId_format_idx" ON "Listing"("scholarId", "format");
