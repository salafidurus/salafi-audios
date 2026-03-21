-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('google', 'apple');

-- DropIndex
DROP INDEX "idx_collection_description_trgm";

-- DropIndex
DROP INDEX "idx_collection_title_trgm";

-- DropIndex
DROP INDEX "idx_lecture_description_trgm";

-- DropIndex
DROP INDEX "idx_lecture_title_trgm";

-- DropIndex
DROP INDEX "idx_series_description_trgm";

-- DropIndex
DROP INDEX "idx_series_title_trgm";

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_oauth_user" ON "OAuthAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "uq_oauth_provider_account" ON "OAuthAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "idx_session_user" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "idx_session_expires" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "idx_session_user_revoked" ON "Session"("userId", "revokedAt");

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
