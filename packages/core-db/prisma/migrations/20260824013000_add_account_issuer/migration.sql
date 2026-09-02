-- Better Auth 1.7 keys OAuth accounts by issuer and accountId.
ALTER TABLE "Account" ADD COLUMN "issuer" TEXT NOT NULL DEFAULT '';

CREATE UNIQUE INDEX "Account_issuer_accountId_key" ON "Account"("issuer", "accountId");
