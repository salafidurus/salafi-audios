-- Stage 1 schema hygiene — pre-migration changes
-- Non-breaking: all existing data is preserved

-- CreateEnum (safely — in case a previous partial run already created it)
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'editor', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT IF EXISTS "Topic_parentId_fkey";

-- AlterTable: Scholar.updatedAt — backfill NULLs before making it non-nullable
UPDATE "Scholar" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;
ALTER TABLE "Scholar" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable: User.banned and User.role
-- Note: raw SQL cleanup of stale role values was executed before this migration.
ALTER TABLE "User"
  ALTER COLUMN "banned" SET NOT NULL,
  ALTER COLUMN "banned" SET DEFAULT false;

-- Migrate User.role from VARCHAR to UserRole enum
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role_new" "UserRole" NOT NULL DEFAULT 'user';
UPDATE "User" SET "role_new" = "role"::text::"UserRole";
ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" RENAME COLUMN "role_new" TO "role";

-- AddForeignKey: Topic self-relation now cascades on delete
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
