-- Backfill legacy write, translation, publish, delete, and user-management
-- assignments into the aggregate access model. Read permissions are omitted.

-- Global legacy permissions.
INSERT INTO "UserAccessGrant" ("id", "userId", "target", "capability", "scholarId", "locale", "grantedAt", "grantedBy")
SELECT
  md5('legacy-permission:' || up."id" || ':' || up."permission"),
  up."userId",
  CASE
    WHEN up."permission"::text LIKE 'SCHOLARS_%' THEN 'scholar'::"AccessTarget"
    WHEN up."permission"::text LIKE 'LISTINGS_%' THEN 'listing'::"AccessTarget"
    WHEN up."permission"::text LIKE 'TOPICS_%' THEN 'topic'::"AccessTarget"
    WHEN up."permission"::text LIKE 'MEDIA_%' THEN 'media'::"AccessTarget"
    ELSE 'user'::"AccessTarget"
  END,
  CASE
    WHEN up."permission"::text LIKE 'USERS_%' THEN 'manage'::"AccessCapability"
    WHEN up."permission"::text LIKE '%_PUBLISH' THEN 'publish'::"AccessCapability"
    WHEN up."permission"::text LIKE '%_DELETE' THEN 'delete'::"AccessCapability"
    ELSE 'write'::"AccessCapability"
  END,
  NULL,
  NULL,
  up."grantedAt",
  up."grantedBy"
FROM "UserPermission" up
WHERE up."permission"::text NOT LIKE '%_VIEW'
  AND up."permission"::text NOT LIKE 'TRANSLATIONS_%'
ON CONFLICT ("id") DO NOTHING;

-- Legacy global translation permissions apply to every supported locale.
INSERT INTO "UserAccessGrant" ("id", "userId", "target", "capability", "scholarId", "locale", "grantedAt", "grantedBy")
SELECT
  md5('legacy-translation-permission:' || up."id" || ':' || supported.locale),
  up."userId",
  'translation'::"AccessTarget",
  CASE WHEN up."permission"::text = 'TRANSLATIONS_PUBLISH'
    THEN 'publish'::"AccessCapability"
    ELSE 'translate'::"AccessCapability"
  END,
  NULL,
  supported.locale::"Locale",
  up."grantedAt",
  up."grantedBy"
FROM "UserPermission" up
CROSS JOIN (VALUES ('ar'), ('en')) AS supported(locale)
WHERE up."permission"::text IN ('TRANSLATIONS_CREATE', 'TRANSLATIONS_EDIT', 'TRANSLATIONS_PUBLISH')
ON CONFLICT ("id") DO NOTHING;

-- Legacy scholar links.
INSERT INTO "UserAccessGrant" ("id", "userId", "target", "capability", "scholarId", "locale", "grantedAt", "grantedBy")
SELECT
  md5('legacy-scholar-role:' || usr."id" || ':' || access.capability),
  usr."userId",
  access.target::"AccessTarget",
  access.capability::"AccessCapability",
  usr."scholarId",
  NULL,
  usr."createdAt",
  usr."createdBy"
FROM "UserScholarRole" usr
CROSS JOIN (VALUES
  ('OWN_CONTENT', 'scholar', 'write'),
  ('OWN_CONTENT', 'scholar', 'publish'),
  ('OWN_CONTENT', 'listing', 'write'),
  ('OWN_CONTENT', 'listing', 'publish'),
  ('OWN_CONTENT', 'media', 'write'),
  ('ASSIGNED_EDITOR', 'listing', 'write')
) AS access(permission_type, target, capability)
WHERE usr."permissionType"::text = access.permission_type
ON CONFLICT ("id") DO NOTHING;

-- Legacy translator roles.
INSERT INTO "UserAccessGrant" ("id", "userId", "target", "capability", "scholarId", "locale", "grantedAt", "grantedBy")
SELECT
  md5('legacy-translator-role:' || utr."id" || ':' || access.capability),
  utr."userId",
  'translation'::"AccessTarget",
  access.capability::"AccessCapability",
  utr."scholarId",
  utr."locale",
  utr."createdAt",
  utr."createdBy"
FROM "UserTranslatorRole" utr
CROSS JOIN (VALUES ('translate'), ('publish')) AS access(capability)
WHERE access.capability = 'translate' OR utr."canPublish" = true
ON CONFLICT ("id") DO NOTHING;
