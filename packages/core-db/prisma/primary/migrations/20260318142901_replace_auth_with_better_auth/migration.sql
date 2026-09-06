-- DropForeignKey
ALTER TABLE "OAuthAccount" DROP CONSTRAINT "OAuthAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserGlobalRole" DROP CONSTRAINT "UserGlobalRole_userId_fkey";

-- DropIndex
DROP INDEX "idx_session_expires";

-- DropIndex
DROP INDEX "idx_session_user";

-- DropIndex
DROP INDEX "idx_session_user_revoked";

-- DropIndex
DROP INDEX "idx_user_deactivated";

-- DropIndex
DROP INDEX "idx_user_emailnorm";

-- DropIndex
DROP INDEX "idx_user_erasure_requested";

-- DropIndex
DROP INDEX "idx_user_last_login";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "platform",
DROP COLUMN "revokedAt",
DROP COLUMN "tokenHash",
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deactivatedAt",
DROP COLUMN "emailNormalized",
DROP COLUMN "emailVerifiedAt",
DROP COLUMN "erasedAt",
DROP COLUMN "erasureRequestedAt",
DROP COLUMN "isBanned",
DROP COLUMN "lastLoginAt",
DROP COLUMN "passwordHash",
DROP COLUMN "passwordUpdatedAt",
ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- DropTable
DROP TABLE "OAuthAccount";

-- DropTable
DROP TABLE "UserGlobalRole";

-- DropEnum
DROP TYPE "GlobalRole";

-- DropEnum
DROP TYPE "OAuthProvider";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
