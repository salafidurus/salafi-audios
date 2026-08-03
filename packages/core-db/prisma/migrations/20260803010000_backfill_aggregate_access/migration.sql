-- Backfill the aggregate access model before legacy permission/link tables are retired.
-- Read access is intentionally not migrated: listeners already have read access.

INSERT INTO "UserAccessGrant" ("id", "userId", "target", "capability", "scholarId", "locale", "grantedAt", "grantedBy")
SELECT DISTINCT
  'legacy-' || md5(random()::text || clock_timestamp()::text || up."id"),
  up."userId",
  CASE
    WHEN up."permission" LIKE 'SCHOLARS_%' THEN 'scholar'::"AccessTarget"
    WHEN up."permission" LIKE 'LISTINGS_%' THEN 'listing'::"AccessTarget"
    WHEN up."permission" LIKE 'TOPICS_%' THEN 'topic'::"AccessTarget"
    WHEN up."permission" LIKE 'TRANSLATIONS_%' THEN 'translation'::"AccessTarget"
    WHEN up."permission" LIKE 'MEDIA_%' THEN 'media'::"AccessTarget"
    ELSE 'user'::"AccessTarget"
  END,
  CASE
    WHEN up."permission" LIKE '%_CREATE' OR up."permission" LIKE '%_EDIT' OR up."permission" = 'MEDIA_UPLOAD' THEN 'write'::"AccessCapability"
    WHEN up."permission" LIKE '%_PUBLISH' THEN 'publish'::"AccessCapability"
    WHEN up."permission" LIKE '%_DELETE' THEN 'delete'::"AccessCapability"
    ELSE 'manage'::"AccessCapability"
  END,
  NULL,
  NULL,
  up."grantedAt",
  up."grantedBy"
FROM "UserPermission" up
WHERE up."permission" NOT LIKE 'TRANSLATIONS_%'
  AND up."permission" NOT IN ('SCHOLARS_VIEW', 'LISTINGS_VIEW', 'TOPICS_VIEW');

INSERT INTO "UserAccessGrant" ("id", "userId", "target", "capability", "scholarId", "locale", "grantedAt", "grantedBy")
SELECT DISTINCT
  'legacy-scholar-' || md5(random()::text || clock_timestamp()::text || usr."id" || capability),
  usr."userId",
  target::"AccessTarget",
  capability::"AccessCapability",
  usr."scholarId",
  NULL,
  usr."createdAt",
  usr."createdBy"
FROM "UserScholarRole" usr
CROSS JOIN (VALUES
  ('scholar', 'write'), ('scholar', 'publish'),
  ('listing', 'write'), ('listing', 'publish'),
  ('media', 'write')
) AS legacy(target, capability)
WHERE usr."permissionType" = 'OWN_CONTENT'
UNION ALL
SELECT DISTINCT
  'legacy-scholar-editor-' || md5(random()::text || clock_timestamp()::text || usr."id"),
  usr."userId",
  'listing'::"AccessTarget",
  'write'::"AccessCapability",
  usr."scholarId",
  NULL,
  usr."createdAt",
  usr."createdBy"
FROM "UserScholarRole" usr
WHERE usr."permissionType" = 'ASSIGNED_EDITOR';

INSERT INTO "UserAccessGrant" ("id", "userId", "target", "capability", "scholarId", "locale", "grantedAt", "grantedBy")
SELECT DISTINCT
  'legacy-translator-' || md5(random()::text || clock_timestamp()::text || utr."id" || capability),
  utr."userId",
  'translation'::"AccessTarget",
  capability::"AccessCapability",
  utr."scholarId",
  utr."locale",
  utr."createdAt",
  utr."createdBy"
FROM "UserTranslatorRole" utr
CROSS JOIN (VALUES ('translate'), ('publish')) AS legacy(capability)
WHERE legacy.capability = 'translate' OR utr."canPublish" = true;

-- Existing global translation permissions apply to every supported locale.
INSERT INTO "UserAccessGrant" ("id", "userId", "target", "capability", "scholarId", "locale", "grantedAt", "grantedBy")
SELECT DISTINCT
  'legacy-global-translation-' || md5(random()::text || clock_timestamp()::text || up."id" || locale),
  up."userId",
  'translation'::"AccessTarget",
  CASE WHEN up."permission" = 'TRANSLATIONS_PUBLISH' THEN 'publish' ELSE 'translate' END::"AccessCapability",
  NULL,
  locale::"Locale",
  up."grantedAt",
  up."grantedBy"
FROM "UserPermission" up
CROSS JOIN (VALUES ('ar'), ('en')) AS supported(locale)
WHERE up."permission" IN ('TRANSLATIONS_CREATE', 'TRANSLATIONS_EDIT', 'TRANSLATIONS_PUBLISH');
