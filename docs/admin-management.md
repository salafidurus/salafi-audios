# Admin and Permission Management

Complete guide for managing admin accounts, granting permissions, and handling SuperAdmin roles in Salafi Durus.

---

## Quick Start

### Make a User an Admin (All Permissions)

**Automated** (recommended):

```bash
bun run --filter @sd/core-db make-admin user@example.com
```

**Manual SQL**:

```sql
-- Promote role
UPDATE "User" SET role = 'admin' WHERE email = 'user@example.com';

-- Grant all permissions (33 total)
INSERT INTO "UserPermission" ("userId", "permission", "grantedAt")
SELECT u.id, perm, NOW()
FROM "User" u, (
  VALUES
    ('SCHOLARS_VIEW'), ('SCHOLARS_CREATE'), ('SCHOLARS_EDIT'), ('SCHOLARS_DELETE'), ('SCHOLARS_PUBLISH'),
    ('LISTINGS_VIEW'), ('LISTINGS_CREATE'), ('LISTINGS_EDIT'), ('LISTINGS_DELETE'), ('LISTINGS_PUBLISH'),
    ('TOPICS_VIEW'), ('TOPICS_CREATE'), ('TOPICS_EDIT'), ('TOPICS_DELETE'), ('TOPICS_PUBLISH'),
    ('TRANSLATIONS_VIEW'), ('TRANSLATIONS_CREATE'), ('TRANSLATIONS_EDIT'), ('TRANSLATIONS_DELETE'), ('TRANSLATIONS_PUBLISH'),
    ('MEDIA_UPLOAD'), ('MEDIA_DELETE'),
    ('USERS_VIEW'), ('USERS_EDIT'), ('USERS_DELETE'), ('USERS_GRANT_PERMISSIONS'), ('USERS_GRANT_ROLES'),
    ('LIVE_VIEW'), ('LIVE_CREATE'), ('LIVE_EDIT'), ('LIVE_DELETE'), ('LIVE_START'), ('LIVE_STOP')
) AS p(perm)
WHERE u.email = 'user@example.com'
ON CONFLICT DO NOTHING;
```

### Grant a Specific Permission

**Automated**:

```bash
bun run --filter @sd/core-db grant-permission user@example.com SCHOLARS_VIEW LISTINGS_CREATE
```

**Manual SQL**:

```sql
INSERT INTO "UserPermission" ("userId", "permission", "grantedAt")
SELECT u.id, 'SCHOLARS_VIEW', NOW()
FROM "User" u
WHERE u.email = 'user@example.com'
ON CONFLICT DO NOTHING;
```

---

## Admin System Overview

The admin system has two components:

1. **Role** (`User.role` or `UserRoleAssignment.role`) — coarse access level (admin, superadmin, etc.)
2. **Permissions** (`UserPermission` table) — fine-grained capabilities

### Role Types

| Role         | Creation Method       | API-Revokable | Description                                                |
| ------------ | --------------------- | ------------- | ---------------------------------------------------------- |
| `listener`   | Auto at OAuth/signup  | Yes           | Default role for authenticated users                       |
| `scholar`    | Manual via API/script | Yes           | Content creator managing their own lectures                |
| `editor`     | Manual via API/script | Yes           | Manages content for assigned or all scholars               |
| `translator` | Manual via API/script | Yes           | Translates content to assigned language(s)                 |
| `admin`      | Manual via script/SQL | Yes           | Platform administrator (permissions controlled separately) |
| `superadmin` | Manual via SQL only   | **No**        | Break-glass account; cannot be revoked via API             |

### Permission Types

**Scholar Permissions:**

- `SCHOLARS_VIEW`, `SCHOLARS_CREATE`, `SCHOLARS_EDIT`, `SCHOLARS_DELETE`, `SCHOLARS_PUBLISH`

**Listing Permissions** (Collections, Series, Singles, Modules, Lessons):

- `LISTINGS_VIEW`, `LISTINGS_CREATE`, `LISTINGS_EDIT`, `LISTINGS_DELETE`, `LISTINGS_PUBLISH`

**Topic Permissions:**

- `TOPICS_VIEW`, `TOPICS_CREATE`, `TOPICS_EDIT`, `TOPICS_DELETE`, `TOPICS_PUBLISH`

**Translation Permissions:**

- `TRANSLATIONS_VIEW`, `TRANSLATIONS_CREATE`, `TRANSLATIONS_EDIT`, `TRANSLATIONS_DELETE`, `TRANSLATIONS_PUBLISH`

**Media Permissions:**

- `MEDIA_UPLOAD`, `MEDIA_DELETE`

**User Management Permissions:**

- `USERS_VIEW`, `USERS_EDIT`, `USERS_DELETE`, `USERS_GRANT_PERMISSIONS`, `USERS_GRANT_ROLES`

**Live Session Permissions:**

- `LIVE_VIEW`, `LIVE_CREATE`, `LIVE_EDIT`, `LIVE_DELETE`, `LIVE_START`, `LIVE_STOP`

---

## Creating an Admin User

### Option A: Automated Script (Recommended)

The `make-admin` script promotes the user role and grants all admin permissions atomically.

```bash
# 1. Generate the Prisma client (first time setup)
bun run --filter @sd/core-db prisma:generate

# 2. Promote a local user to admin
bun run --filter @sd/core-db make-admin user@example.com

# 3. Against a production database (Neon example)
DATABASE_URL="postgresql://user:pass@ep-xxxx.region.aws.neon.tech/neondb" \
  bun run --filter @sd/core-db make-admin user@example.com
```

**Idempotent** — re-running on an existing admin is safe.

### Option B: Manual SQL

Execute in the database console (Neon SQL Editor, psql, etc.):

```sql
-- 1. Find the user ID by email
SELECT id, email FROM "User" WHERE email = 'user@example.com';

-- 2. Promote the user's role to 'admin'
UPDATE "User"
SET role = 'admin'
WHERE email = 'user@example.com';

-- 3. Grant all admin permissions
--    UserPermission uses composite unique constraint on (userId, permission)
INSERT INTO "UserPermission" ("userId", "permission", "grantedAt", "grantedBy")
SELECT id, perm, NOW(), NULL
FROM "User",
  (VALUES
    ('SCHOLARS_VIEW'),
    ('SCHOLARS_CREATE'),
    ('SCHOLARS_EDIT'),
    ('SCHOLARS_DELETE'),
    ('SCHOLARS_PUBLISH'),
    ('LISTINGS_VIEW'),
    ('LISTINGS_CREATE'),
    ('LISTINGS_EDIT'),
    ('LISTINGS_DELETE'),
    ('LISTINGS_PUBLISH'),
    ('TOPICS_VIEW'),
    ('TOPICS_CREATE'),
    ('TOPICS_EDIT'),
    ('TOPICS_DELETE'),
    ('TOPICS_PUBLISH'),
    ('TRANSLATIONS_VIEW'),
    ('TRANSLATIONS_CREATE'),
    ('TRANSLATIONS_EDIT'),
    ('TRANSLATIONS_DELETE'),
    ('TRANSLATIONS_PUBLISH'),
    ('MEDIA_UPLOAD'),
    ('MEDIA_DELETE'),
    ('USERS_VIEW'),
    ('USERS_EDIT'),
    ('USERS_DELETE'),
    ('USERS_GRANT_PERMISSIONS'),
    ('USERS_GRANT_ROLES'),
    ('LIVE_VIEW'),
    ('LIVE_CREATE'),
    ('LIVE_EDIT'),
    ('LIVE_DELETE'),
    ('LIVE_START'),
    ('LIVE_STOP')
  ) AS p(perm)
WHERE email = 'user@example.com'
ON CONFLICT ("userId", "permission") DO NOTHING;

-- 4. Verify
SELECT u.email, u.role, COUNT(p.id) as permission_count
FROM "User" u
LEFT JOIN "UserPermission" p ON u.id = p."userId"
WHERE u.email = 'user@example.com'
GROUP BY u.id, u.email, u.role;
```

### Option C: Prisma Studio

```bash
bun run --filter @sd/core-db prisma studio
```

1. Open the `User` table and set `role` to `admin` for the target user
2. Open the `UserPermission` table and add one row per permission for that user ID
3. Grant the 33 permissions listed in the permission types section above

---

## Granting Specific Permissions

Use the `grant-permission` script to grant individual permissions to a user.

### Automated Script (Recommended)

```bash
# Grant a single permission
bun run --filter @sd/core-db grant-permission user@example.com SCHOLARS_VIEW

# Grant multiple permissions at once
bun run --filter @sd/core-db grant-permission user@example.com SCHOLARS_VIEW SCHOLARS_EDIT LISTINGS_CREATE

# List all valid permissions
bun run --filter @sd/core-db grant-permission --list
```

**Idempotent** — re-running with the same user and permission is a no-op.

### Manual SQL

```sql
-- Grant a single permission
INSERT INTO "UserPermission" ("userId", "permission", "grantedAt")
SELECT u.id, 'SCHOLARS_VIEW', NOW()
FROM "User" u
WHERE u.email = 'user@example.com'
ON CONFLICT ("userId", "permission") DO NOTHING;

-- Grant multiple permissions
INSERT INTO "UserPermission" ("userId", "permission", "grantedAt")
SELECT u.id, perm, NOW()
FROM "User" u,
  (VALUES
    ('SCHOLARS_VIEW'),
    ('SCHOLARS_EDIT'),
    ('LISTINGS_CREATE')
  ) AS p(perm)
WHERE u.email = 'user@example.com'
ON CONFLICT ("userId", "permission") DO NOTHING;

-- Verify granted permissions
SELECT p.permission, p."grantedAt"
FROM "UserPermission" p
WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'user@example.com')
ORDER BY p."permission";
```

### Revoking Permissions

```sql
-- Revoke a specific permission
DELETE FROM "UserPermission"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com')
AND permission = 'SCHOLARS_VIEW';

-- Revoke all permissions for a user
DELETE FROM "UserPermission"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com');
```

---

## SuperAdmin Management

**SuperAdmin is a break-glass account** that cannot be revoked through the API. Use it only for emergency recovery.

### Understanding SuperAdmin vs Admin

| Aspect          | Admin                 | SuperAdmin                |
| --------------- | --------------------- | ------------------------- |
| **Creation**    | API/script            | SQL/script only           |
| **Permissions** | Controlled via API    | Full platform access      |
| **Revocation**  | Via API               | SQL/script only           |
| **Protection**  | Normal                | Cannot be demoted via API |
| **Use Case**    | Day-to-day operations | Emergency break-glass     |

### Creating a SuperAdmin

#### Method 1: SQL Script (Recommended)

```sql
-- Step 1: Find the user ID (or use a known ID)
SELECT id, email FROM "User" WHERE email = 'admin@example.com';

-- Step 2: Create the superadmin role assignment
-- Replace 'user-id-here' with the actual user ID from step 1
INSERT INTO "UserRoleAssignment" (
  id,
  "userId",
  role,
  "grantedAt",
  "grantedBy"
)
VALUES (
  gen_random_uuid()::text,
  'user-id-here',
  'superadmin',
  CURRENT_TIMESTAMP,
  NULL
);

-- Step 3: Grant all permissions to the superadmin
INSERT INTO "UserPermission" (
  id,
  "userId",
  permission,
  "grantedAt",
  "grantedBy"
)
SELECT
  gen_random_uuid()::text,
  'user-id-here',
  perm,
  CURRENT_TIMESTAMP,
  NULL
FROM (
  VALUES
    ('SCHOLARS_VIEW'), ('SCHOLARS_CREATE'), ('SCHOLARS_EDIT'), ('SCHOLARS_DELETE'), ('SCHOLARS_PUBLISH'),
    ('LISTINGS_VIEW'), ('LISTINGS_CREATE'), ('LISTINGS_EDIT'), ('LISTINGS_DELETE'), ('LISTINGS_PUBLISH'),
    ('TOPICS_VIEW'), ('TOPICS_CREATE'), ('TOPICS_EDIT'), ('TOPICS_DELETE'), ('TOPICS_PUBLISH'),
    ('TRANSLATIONS_VIEW'), ('TRANSLATIONS_CREATE'), ('TRANSLATIONS_EDIT'), ('TRANSLATIONS_DELETE'), ('TRANSLATIONS_PUBLISH'),
    ('MEDIA_UPLOAD'), ('MEDIA_DELETE'),
    ('USERS_VIEW'), ('USERS_EDIT'), ('USERS_DELETE'), ('USERS_GRANT_PERMISSIONS'), ('USERS_GRANT_ROLES'),
    ('LIVE_VIEW'), ('LIVE_CREATE'), ('LIVE_EDIT'), ('LIVE_DELETE'), ('LIVE_START'), ('LIVE_STOP')
) AS perms(perm)
ON CONFLICT DO NOTHING;

-- Step 4: Verify
SELECT u.email, ura.role, COUNT(p.id) as permission_count
FROM "User" u
LEFT JOIN "UserRoleAssignment" ura ON u.id = ura."userId"
LEFT JOIN "UserPermission" p ON u.id = p."userId"
WHERE u.email = 'admin@example.com'
GROUP BY u.id, u.email, ura.role;
```

#### Method 2: Node.js Script

Create `create-superadmin.js` in `packages/core-db/scripts/`:

```bash
# Usage:
bun run create-superadmin.js admin@example.com
```

### Demoting a SuperAdmin

**Demotion requires SQL** — cannot be done via API.

#### Option 1: SQL

```sql
-- Find the user
SELECT id, email FROM "User" WHERE email = 'admin@example.com';

-- Revoke superadmin role
DELETE FROM "UserRoleAssignment"
WHERE "userId" = 'user-id-here' AND role = 'superadmin';

-- Optionally: Assign a lower role
INSERT INTO "UserRoleAssignment" (
  id,
  "userId",
  role,
  "grantedAt",
  "grantedBy"
)
VALUES (
  gen_random_uuid()::text,
  'user-id-here',
  'admin',  -- or 'editor', 'listener', etc.
  CURRENT_TIMESTAMP,
  NULL
)
ON CONFLICT ("userId", "role") DO NOTHING;

-- Verify
SELECT u.email, ura.role
FROM "User" u
LEFT JOIN "UserRoleAssignment" ura ON u.id = ura."userId"
WHERE u.email = 'admin@example.com';
```

### Listing SuperAdmins

```sql
SELECT u.id, u.email, u.name, ura."grantedAt"
FROM "User" u
JOIN "UserRoleAssignment" ura ON u.id = ura."userId"
WHERE ura.role = 'superadmin'
ORDER BY ura."grantedAt" DESC;
```

---

## Security Considerations

1. **Access Control** — Only execute admin scripts in secure environments with restricted database access.
2. **Audit Trail** — SuperAdmin changes bypass the API and don't create audit logs. Document manual changes separately.
3. **Backups** — Always ensure database backups exist before making admin changes.
4. **Multiple SuperAdmins** — Recommended to have at least 2 SuperAdmins for operational resilience.
5. **Monitoring** — Monitor admin and superadmin account activity regularly.
6. **Permission Revocation** — User must log out and log in again for permission changes to take effect.

---

## Verification Queries

### Check User's Roles

```sql
SELECT u.email, array_agg(ura.role) as roles
FROM "User" u
LEFT JOIN "UserRoleAssignment" ura ON u.id = ura."userId"
WHERE u.email = 'user@example.com'
GROUP BY u.id, u.email;
```

### Check User's Permissions

```sql
SELECT u.email, array_agg(p.permission ORDER BY p.permission) as permissions
FROM "User" u
LEFT JOIN "UserPermission" p ON u.id = p."userId"
WHERE u.email = 'user@example.com'
GROUP BY u.id, u.email;
```

### Find All Admins

```sql
SELECT DISTINCT u.id, u.email, u.name, u.role, COUNT(p.id) as permission_count
FROM "User" u
LEFT JOIN "UserPermission" p ON u.id = p."userId"
WHERE u.role = 'admin' OR ura.role = 'admin'
GROUP BY u.id, u.email, u.name, u.role
ORDER BY u.email;
```

### Find All SuperAdmins

```sql
SELECT u.id, u.email, u.name, ura."grantedAt"
FROM "User" u
JOIN "UserRoleAssignment" ura ON u.id = ura."userId"
WHERE ura.role = 'superadmin'
ORDER BY ura."grantedAt" DESC;
```

---

## Emergency Recovery

If you need to recover access when all administrative accounts are locked:

1. Connect directly to the database using `psql`:

   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/salafi_dev"
   psql $DATABASE_URL
   ```

2. Create a temporary SuperAdmin with a known user email:

   ```sql
   -- Use the SQL commands from "Creating a SuperAdmin" above
   ```

3. Verify the user can log in with full permissions

4. Investigate what caused the lockout and revoke temporary access

---

## Troubleshooting

### User has no permissions after admin creation

```sql
-- Verify permissions were inserted
SELECT COUNT(*) as permission_count
FROM "UserPermission"
WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com');

-- Should return 33 for full admin. If not, re-grant permissions.
```

### Permission changes not taking effect

The user must **log out and log in again** for permission changes to take effect in the application.

### Can't find user by email

```sql
-- Search with partial match
SELECT id, email, name FROM "User" WHERE email ILIKE '%search-text%';
```

### Database connection errors

Verify `DATABASE_URL` or `DIRECT_DB_URL` is set correctly:

```bash
# Check current value (if set)
echo $DATABASE_URL
echo $DIRECT_DB_URL

# Set for a session
export DATABASE_URL="postgresql://user:pass@localhost:5432/db"
```

### Script permission errors

Ensure the `make-admin` and `grant-permission` scripts have execute permissions:

```bash
chmod +x packages/core-db/scripts/make-admin.js
chmod +x packages/core-db/scripts/grant-permission.js
```

---

## API Errors

### Error: Attempting to grant SuperAdmin without being SuperAdmin

```text
"Only superadmin can grant superadmin role. Use direct database operations for superadmin management."
```

**Solution:** Have an existing SuperAdmin execute the operation, or use direct database operations (SQL).

### Error: Attempting to revoke SuperAdmin via API

```text
"SuperAdmin role cannot be revoked through the API. Use direct database operations (SQL or script) for superadmin management."
```

**Solution:** Use the SQL or script commands from the "Demoting a SuperAdmin" section above.
