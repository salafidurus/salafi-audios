-- DropIndex
DROP INDEX "UserTranslatorRole_userId_locale_key";

-- AlterTable
ALTER TABLE "UserTranslatorRole" ADD COLUMN     "scholarId" TEXT;

-- CreateIndex
CREATE INDEX "UserTranslatorRole_scholarId_idx" ON "UserTranslatorRole"("scholarId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTranslatorRole_userId_scholarId_locale_key" ON "UserTranslatorRole"("userId", "scholarId", "locale");

-- AddForeignKey
ALTER TABLE "UserTranslatorRole" ADD CONSTRAINT "UserTranslatorRole_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

