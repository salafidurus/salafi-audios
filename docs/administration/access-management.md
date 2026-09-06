# Admin and Access Management

Salafi Durus uses system roles plus aggregate access grants. Catalog reads are public; grants protect editorial mutations and user administration.

## Access Model

`UserRoleAssignment` stores system roles (like `superadmin`). `UserAccessGrant` stores fine-grained capabilities and scope attributes (like `scholarId` and `locale`) used by backend CASL policy checks.

| Target        | Capabilities                     | Scope                                                    |
| ------------- | -------------------------------- | -------------------------------------------------------- |
| `scholar`     | `write`, `publish`, `delete`     | global or one or more scholars                           |
| `listing`     | `write`, `publish`, `delete`     | global or one or more scholars                           |
| `media`       | `write`, `delete`                | global or one or more scholars                           |
| `topic`       | `write`, `publish`, `delete`     | global only                                              |
| `translation` | `translate`, `publish`, `delete` | global or one or more scholars, plus one or more locales |
| `user`        | `manage`                         | global only                                              |

- **Separation of Deleters**: Delete capabilities are separate from write capabilities.
- **Derived Roles**: Roles shown in the admin UI (`Editor`, `Translator`, `Publisher`, `Deleter`, and `User manager`) are dynamically derived from a user's active access grants rather than stored as database role strings.
- **SuperAdmin Role**: `superadmin` is the only protected system role. A superadmin bypasses all policy capability checks and is managed explicitly; normal capability-based access grants do not grant superadmin status.

---

## Command-Line CLI Administration

The `grant:access` script inside `@sd/core-db` is the recommended way to manage roles and capabilities. The script resolves scholar slugs to database IDs automatically.

### Usage

Run the script from the repository root:

```bash
# 1. Ensure the Prisma client is generated
bun run --filter @sd/core-db prisma:generate

# 2. Grant global listing write access (Global Editor)
bun run --filter @sd/core-db grant:access user@example.com listing write

# 3. Grant listing write access scoped to specific scholar slugs
bun run --filter @sd/core-db grant:access user@example.com listing write \
  --scholars bin-baz,al-fawzan

# 4. Grant scholar-scoped translation and publishing access for selected locales
bun run --filter @sd/core-db grant:access user@example.com translation translate \
  --scholars bin-baz --locales ar,en

# 5. Grant global user management capability
bun run --filter @sd/core-db grant:access user@example.com user manage

# 6. Grant break-glass superadmin system role
bun run --filter @sd/core-db grant:access user@example.com superadmin grant
```

### Options Reference

- `--scholars <slug,...>`: Scope content access to one or more scholars.
- `--locales <ar,en>`: Scope translation access to one or more locales.

### Production and External Databases

To run the CLI script against a production database, supply `PRIMARY_DATABASE_URL` or `PRIMARY_DIRECT_DATABASE_URL` as environment variables:

```bash
PRIMARY_DIRECT_DATABASE_URL="<database-url>" \
  bun run --filter @sd/core-db grant:access admin@example.com superadmin grant
```

The command is idempotent. Scholar arguments use scholar slugs, and unknown slugs or invalid target/capability combinations are rejected. Translation grants always require `--locales`; topics and users reject scholar scope.

---

## Direct SQL Administration

For production environments, direct SQL access allows emergency recovery, break-glass administration, or automated scripting without using NestJS or the CLI scripts.

> [!WARNING]
>
> - **Primary Key Generation (`id`)**: The tables `"UserRoleAssignment"` and `"UserAccessGrant"` use CUID strings for primary keys. Since PostgreSQL does not generate CUIDs natively, you **must** supply a unique `id` string when performing SQL inserts. A safe pattern is using `'sql-' || gen_random_uuid()`.
> - **Optimistic Cache Invalidation (`accessVersion`)**: Active admin user sessions and UI clients check `"User".accessVersion` to detect permission updates. **Whenever you change roles or access grants via SQL, you must increment the user's `accessVersion` by 1** so the system reloads their CASL abilities on subsequent requests.

### 1. Setting Up a SuperAdmin

A `superadmin` bypasses all capability checks. To grant this role to a user via direct SQL using their email address:

```sql
-- Step 1: Assign the superadmin role assignment
INSERT INTO "UserRoleAssignment" (id, "userId", role, "grantedAt", "grantedBy")
SELECT
  'sql-' || gen_random_uuid(),
  u.id,
  'superadmin'::"UserRole",
  CURRENT_TIMESTAMP,
  NULL
FROM "User" u
WHERE u.email = 'user@example.com'
ON CONFLICT ("userId", role) DO NOTHING;

-- Step 2: Increment the accessVersion to force a client session reload
UPDATE "User"
SET "accessVersion" = "accessVersion" + 1
WHERE email = 'user@example.com';
```

### 2. Demoting a SuperAdmin

To remove the `superadmin` assignment via SQL:

```sql
-- Step 1: Delete the role assignment
DELETE FROM "UserRoleAssignment"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com')
  AND role = 'superadmin'::"UserRole";

-- Step 2: Increment accessVersion to notify client
UPDATE "User"
SET "accessVersion" = "accessVersion" + 1
WHERE email = 'user@example.com';
```

### 3. Granting Fine-Grained Access Grants (ABAC)

Fine-grained capabilities are stored in `"UserAccessGrant"`. Below are common patterns to insert grants directly via SQL using the user's email and scholar's slug.

#### A. Global Listing Write Access (Global Editor)

To grant listing write access across all content:

```sql
INSERT INTO "UserAccessGrant" (id, "userId", target, capability, "scholarId", locale, "grantedAt", "grantedBy")
SELECT
  'sql-' || gen_random_uuid(),
  u.id,
  'listing'::"AccessTarget",
  'write'::"AccessCapability",
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  NULL
FROM "User" u
WHERE u.email = 'user@example.com'
ON CONFLICT DO NOTHING;

UPDATE "User"
SET "accessVersion" = "accessVersion" + 1
WHERE email = 'user@example.com';
```

#### B. Scholar-Scoped Listing Write Access

To grant listing write access scoped to a specific scholar slug:

```sql
INSERT INTO "UserAccessGrant" (id, "userId", target, capability, "scholarId", locale, "grantedAt", "grantedBy")
SELECT
  'sql-' || gen_random_uuid(),
  u.id,
  'listing'::"AccessTarget",
  'write'::"AccessCapability",
  s.id,
  NULL,
  CURRENT_TIMESTAMP,
  NULL
FROM "User" u
CROSS JOIN "Scholar" s
WHERE u.email = 'user@example.com'
  AND s.slug = 'scholar-slug'
ON CONFLICT DO NOTHING;

UPDATE "User"
SET "accessVersion" = "accessVersion" + 1
WHERE email = 'user@example.com';
```

#### C. Scholar-Scoped Locale-Scoped Translation (Translator)

To grant translation translation/publishing access scoped to a scholar slug and the Arabic (`ar`) language:

```sql
INSERT INTO "UserAccessGrant" (id, "userId", target, capability, "scholarId", locale, "grantedAt", "grantedBy")
SELECT
  'sql-' || gen_random_uuid(),
  u.id,
  'translation'::"AccessTarget",
  capabilities.cap::"AccessCapability",
  s.id,
  'ar'::"Locale",
  CURRENT_TIMESTAMP,
  NULL
FROM "User" u
CROSS JOIN "Scholar" s
CROSS JOIN (VALUES ('translate'), ('publish')) AS capabilities(cap)
WHERE u.email = 'user@example.com'
  AND s.slug = 'scholar-slug'
ON CONFLICT DO NOTHING;

UPDATE "User"
SET "accessVersion" = "accessVersion" + 1
WHERE email = 'user@example.com';
```

### 4. Revoking and Resetting Access

#### Revoking a Specific Grant

```sql
DELETE FROM "UserAccessGrant"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com')
  AND target = 'listing'::"AccessTarget"
  AND capability = 'write'::"AccessCapability"
  AND "scholarId" = (SELECT id FROM "Scholar" WHERE slug = 'scholar-slug');

UPDATE "User"
SET "accessVersion" = "accessVersion" + 1
WHERE email = 'user@example.com';
```

#### Wiping All Grants (Resetting User)

```sql
-- Wipes all capabilities
DELETE FROM "UserAccessGrant"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com');

-- Wipes all roles
DELETE FROM "UserRoleAssignment"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com');

UPDATE "User"
SET "accessVersion" = 0
WHERE email = 'user@example.com';
```

### 5. Granting All Global Accesses (Without SuperAdmin)

To explicitly grant all possible capability-based access grants globally to a user (without assigning the break-glass `superadmin` role):

```sql
INSERT INTO "UserAccessGrant" (id, "userId", target, capability, "scholarId", locale, "grantedAt", "grantedBy")
SELECT
  'sql-' || gen_random_uuid(),
  u.id,
  grant_combos.target::"AccessTarget",
  grant_combos.capability::"AccessCapability",
  NULL,
  grant_combos.locale::"Locale",
  CURRENT_TIMESTAMP,
  NULL
FROM "User" u
CROSS JOIN (
  VALUES
    -- Scholar management
    ('scholar', 'write', NULL),
    ('scholar', 'publish', NULL),
    ('scholar', 'delete', NULL),

    -- Content / listing management
    ('listing', 'write', NULL),
    ('listing', 'publish', NULL),
    ('listing', 'delete', NULL),

    -- Media files management
    ('media', 'write', NULL),
    ('media', 'delete', NULL),

    -- Topic management
    ('topic', 'write', NULL),
    ('topic', 'publish', NULL),
    ('topic', 'delete', NULL),

    -- User management (User manager role)
    ('user', 'manage', NULL),

    -- Translation capabilities (requires locale scope)
    ('translation', 'translate', 'ar'),
    ('translation', 'translate', 'en'),
    ('translation', 'publish', 'ar'),
    ('translation', 'publish', 'en'),
    ('translation', 'delete', 'ar'),
    ('translation', 'delete', 'en')
) AS grant_combos(target, capability, locale)
WHERE u.email = 'user@example.com'
ON CONFLICT DO NOTHING;

-- Force active client sessions to reload permissions
UPDATE "User"
SET "accessVersion" = "accessVersion" + 1
WHERE email = 'user@example.com';
```

---

## Unified Admin API

Users with global `manage` access on `UserAccess` can manage another user's grants through:

```text
GET /admin/users/:userId/access
PUT /admin/users/:userId/access
```

The GET response includes the current version and normalized grants. The PUT request replaces the complete grant set and must include that version. A stale version is rejected, preventing concurrent administrators from silently overwriting each other's changes.

---

## Migrations and Legacy Data

Apply migrations normally:

```bash
bun run --filter @sd/core-db migrate:deploy
```

The aggregate schema migration creates `UserAccessGrant` and `User.accessVersion`. The following data migration backfills supported write, translate, publish, delete, and user-management access from legacy rows while intentionally omitting legacy read access. Do not run an ad-hoc backfill script or edit applied migrations; use the checked-in Prisma migrations.

---

## Verification & Auditing Queries

### Check a User's Roles

```sql
SELECT u.email, ura.role, ura."grantedAt"
FROM "User" u
JOIN "UserRoleAssignment" ura ON u.id = ura."userId"
WHERE u.email = 'user@example.com';
```

### Check a User's Grants

```sql
SELECT u.email, g.target, g.capability, s.slug as "scholarSlug", g.locale, g."grantedAt"
FROM "User" u
LEFT JOIN "UserAccessGrant" g ON g."userId" = u.id
LEFT JOIN "Scholar" s ON g."scholarId" = s.id
WHERE u.email = 'user@example.com'
ORDER BY g.target, g.capability, g.locale;
```

### Find All SuperAdmins

```sql
SELECT u.id, u.email, u.name, ura."grantedAt"
FROM "User" u
JOIN "UserRoleAssignment" ura ON u.id = ura."userId"
WHERE ura.role = 'superadmin'::"UserRole"
ORDER BY ura."grantedAt" DESC;
```
