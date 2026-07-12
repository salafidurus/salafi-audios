-- Add new enums
CREATE TYPE "Permission" AS ENUM (
  'SCHOLARS_VIEW',
  'SCHOLARS_CREATE',
  'SCHOLARS_EDIT',
  'SCHOLARS_DELETE',
  'SCHOLARS_PUBLISH',
  'LISTINGS_VIEW',
  'LISTINGS_CREATE',
  'LISTINGS_EDIT',
  'LISTINGS_DELETE',
  'LISTINGS_PUBLISH',
  'TOPICS_VIEW',
  'TOPICS_CREATE',
  'TOPICS_EDIT',
  'TOPICS_DELETE',
  'TOPICS_PUBLISH',
  'TRANSLATIONS_VIEW',
  'TRANSLATIONS_CREATE',
  'TRANSLATIONS_EDIT',
  'TRANSLATIONS_DELETE',
  'TRANSLATIONS_PUBLISH',
  'MEDIA_UPLOAD',
  'MEDIA_DELETE',
  'USERS_VIEW',
  'USERS_EDIT',
  'USERS_DELETE',
  'USERS_GRANT_PERMISSIONS',
  'USERS_GRANT_ROLES',
  'LIVE_VIEW',
  'LIVE_CREATE',
  'LIVE_EDIT',
  'LIVE_DELETE',
  'LIVE_START',
  'LIVE_STOP'
);

CREATE TYPE "ScholarPermissionType" AS ENUM ('OWN_CONTENT', 'ASSIGNED_EDITOR');

-- Alter UserRole enum to add new roles and replace 'user' with 'listener'
-- Note: 'editor' already exists in the enum from migration 20260704210014
ALTER TYPE "UserRole" RENAME VALUE 'user' TO 'listener';
ALTER TYPE "UserRole" ADD VALUE 'scholar' AFTER 'listener';
ALTER TYPE "UserRole" ADD VALUE 'translator' AFTER 'scholar';

-- Create UserRoleAssignment table for multi-role support
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- Create UserPermission table (replacing AdminPermission)
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "Permission" NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grantedBy" TEXT,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- Migrate data from AdminPermission to UserPermission
-- First, we need to map old permission strings to new Permission enum values
-- This is a simple mapping - adjust as needed based on actual AdminPermission data
INSERT INTO "UserPermission" ("id", "userId", "permission", "grantedAt", "grantedBy")
SELECT
    gen_random_uuid()::text,
    "userId",
    CASE
        WHEN "permission" LIKE 'manage:scholars' THEN 'SCHOLARS_EDIT'::"Permission"
        WHEN "permission" LIKE 'manage:content' THEN 'LISTINGS_EDIT'::"Permission"
        WHEN "permission" LIKE 'manage:admin' THEN 'USERS_GRANT_ROLES'::"Permission"
        WHEN "permission" LIKE 'manage:translations' THEN 'TRANSLATIONS_PUBLISH'::"Permission"
        WHEN "permission" LIKE '%view%' THEN 'SCHOLARS_VIEW'::"Permission"
        ELSE 'SCHOLARS_VIEW'::"Permission"
    END,
    "grantedAt",
    "grantedById"
FROM "AdminPermission"
ON CONFLICT DO NOTHING;

-- Drop the old AdminPermission table
DROP TABLE "AdminPermission";

-- Update UserScholarRole table to use permissionType instead of role
-- CRITICAL: Must drop ScholarRole type dependencies BEFORE dropping the type itself

-- Drop old UserScholarRole constraints and indexes
ALTER TABLE "UserScholarRole" DROP CONSTRAINT "UserScholarRole_pkey";
DROP INDEX IF EXISTS "idx_user_scholar_role_scholar_role";
DROP INDEX IF EXISTS "idx_user_scholar_role_user";

-- Drop old foreign key constraints
ALTER TABLE "UserScholarRole" DROP CONSTRAINT IF EXISTS "UserScholarRole_userId_fkey";
ALTER TABLE "UserScholarRole" DROP CONSTRAINT IF EXISTS "UserScholarRole_scholarId_fkey";
ALTER TABLE "UserScholarRole" DROP CONSTRAINT IF EXISTS "UserScholarRole_createdByUser_fkey";

-- Add id and permissionType columns, update createdByUserId to createdBy, and DROP the role column
-- This MUST happen before dropping the ScholarRole type
-- Split into separate ALTER statements because PostgreSQL doesn't allow mixing RENAME with other operations
ALTER TABLE "UserScholarRole"
  ADD COLUMN "id" TEXT DEFAULT gen_random_uuid()::text,
  ADD COLUMN "permissionType" "ScholarPermissionType" NOT NULL DEFAULT 'OWN_CONTENT';

ALTER TABLE "UserScholarRole"
  RENAME COLUMN "createdByUserId" TO "createdBy";

ALTER TABLE "UserScholarRole"
  DROP COLUMN "role";

-- NOW we can safely drop the ScholarRole enum (no longer referenced by any column)
DROP TYPE IF EXISTS "ScholarRole";

-- Set the id column as primary key
ALTER TABLE "UserScholarRole"
  ADD CONSTRAINT "UserScholarRole_pkey" PRIMARY KEY ("id");

-- Add unique constraint
ALTER TABLE "UserScholarRole"
  ADD CONSTRAINT "UserScholarRole_userId_scholarId_permissionType_key" UNIQUE ("userId", "scholarId", "permissionType");

-- Recreate indexes
CREATE INDEX "idx_user_scholar_role_scholar_permission" ON "UserScholarRole"("scholarId", "permissionType");
CREATE INDEX "idx_user_scholar_role_user" ON "UserScholarRole"("userId");

-- Add new foreign key constraints with CASCADE
ALTER TABLE "UserScholarRole"
  ADD CONSTRAINT "UserScholarRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserScholarRole_scholarId_fkey" FOREIGN KEY ("scholarId") REFERENCES "Scholar"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserScholarRole_createdByUser_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create UserTranslatorRole table
CREATE TABLE "UserTranslatorRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "canPublish" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "UserTranslatorRole_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserTranslatorRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserTranslatorRole_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for UserTranslatorRole
CREATE UNIQUE INDEX "UserTranslatorRole_userId_locale_key" ON "UserTranslatorRole"("userId", "locale");
CREATE INDEX "UserTranslatorRole_userId_idx" ON "UserTranslatorRole"("userId");
CREATE INDEX "UserTranslatorRole_locale_idx" ON "UserTranslatorRole"("locale");

-- Create foreign key constraints for new tables
ALTER TABLE "UserRoleAssignment"
  ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserRoleAssignment_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserPermission"
  ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "UserPermission_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create unique constraints and indexes
CREATE UNIQUE INDEX "UserRoleAssignment_userId_role_key" ON "UserRoleAssignment"("userId", "role");
CREATE INDEX "UserRoleAssignment_userId_idx" ON "UserRoleAssignment"("userId");
CREATE INDEX "UserRoleAssignment_role_idx" ON "UserRoleAssignment"("role");

CREATE UNIQUE INDEX "UserPermission_userId_permission_key" ON "UserPermission"("userId", "permission");
CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");
CREATE INDEX "UserPermission_permission_idx" ON "UserPermission"("permission");

-- Migrate existing User.role to UserRoleAssignment
INSERT INTO "UserRoleAssignment" ("id", "userId", "role", "grantedAt")
SELECT gen_random_uuid()::text, "id", "role", CURRENT_TIMESTAMP
FROM "User"
WHERE "role" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Drop the User.role column
ALTER TABLE "User" DROP COLUMN "role";
