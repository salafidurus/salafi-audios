CREATE TABLE "ScholarFollow" (
    "userId" TEXT NOT NULL,
    "scholarId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScholarFollow_pkey" PRIMARY KEY ("userId", "scholarId")
);
CREATE INDEX "idx_scholar_follow_user_updatedat" ON "ScholarFollow"("userId", "updatedAt");
CREATE INDEX "idx_scholar_follow_scholar" ON "ScholarFollow"("scholarId");
ALTER TABLE "ScholarFollow" ADD CONSTRAINT "ScholarFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScholarFollow" ADD CONSTRAINT "ScholarFollow_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
