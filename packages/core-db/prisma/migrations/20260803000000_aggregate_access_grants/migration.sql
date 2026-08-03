-- CreateEnum
CREATE TYPE "AccessTarget" AS ENUM ('scholar', 'listing', 'media', 'topic', 'translation', 'user');

-- CreateEnum
CREATE TYPE "AccessCapability" AS ENUM ('write', 'translate', 'publish', 'delete', 'manage');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "accessVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserAccessGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "target" "AccessTarget" NOT NULL,
    "capability" "AccessCapability" NOT NULL,
    "scholarId" TEXT,
    "locale" "Locale",
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,

    CONSTRAINT "UserAccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAccessGrant_userId_idx" ON "UserAccessGrant"("userId");
CREATE INDEX "UserAccessGrant_scholarId_idx" ON "UserAccessGrant"("scholarId");

-- AddForeignKey
ALTER TABLE "UserAccessGrant" ADD CONSTRAINT "UserAccessGrant_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAccessGrant" ADD CONSTRAINT "UserAccessGrant_scholarId_fkey"
  FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
