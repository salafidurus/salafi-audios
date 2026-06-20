# Database Admin Setup

How to promote a user to **admin** and grant the admin permissions enforced by the API.

Admin access has two parts:

1. `User.role = 'admin'` — the coarse role flag.
2. Rows in `AdminPermission` — the fine-grained capabilities. The canonical set is
   `ADMIN_PERMISSIONS` in `@sd/core-contracts`
   (`packages/core-contracts/src/types/admin.types.ts`):
   `manage:scholars`, `manage:topics`, `manage:content`, `manage:livestreams`,
   `manage:users`, `manage:admin`.

`AdminPermission` uses a composite primary key `@@id([userId, permission])`, so a
`(userId, permission)` pair can exist only once.

---

## Option A — Automated script (recommended)

The `make-admin` script promotes the role and upserts every permission from the
canonical `ADMIN_PERMISSIONS` enum, so it never drifts from what the API enforces.

```bash
# 1. Generate the Prisma client (requires DATABASE_URL / DIRECT_DB_URL)
pnpm --filter @sd/core-db prisma:generate

# 2. Local database (reads .env / .env.local in packages/core-db)
pnpm --filter @sd/core-db make-admin user@example.com

# 3. Against a Neon preview/production database
DATABASE_URL="postgresql://user:pass@ep-xxxx.region.aws.neon.tech/neondb" \
  pnpm --filter @sd/core-db make-admin user@example.com
```

The script is idempotent — re-running it on an existing admin is a no-op for
already-granted permissions.

---

## Option B — Manual SQL

Run in the Neon Console SQL Editor (or any psql session) against the target database.

```sql
-- 1. Promote the user's role to 'admin'
UPDATE "User"
SET role = 'admin'
WHERE email = 'user@example.com';

-- 2. Grant every admin permission.
--    AdminPermission has a composite PK @@id([userId, permission]),
--    so ON CONFLICT targets those two columns.
INSERT INTO "AdminPermission" ("userId", "permission", "grantedAt", "grantedById")
SELECT id, perm, NOW(), NULL
FROM "User",
  (VALUES
    ('manage:scholars'),
    ('manage:topics'),
    ('manage:content'),
    ('manage:livestreams'),
    ('manage:users'),
    ('manage:admin')
  ) AS p(perm)
WHERE email = 'user@example.com'
ON CONFLICT ("userId", "permission") DO NOTHING;
```

### Verify

```sql
-- Role
SELECT id, name, email, role FROM "User" WHERE email = 'user@example.com';

-- Permissions
SELECT p.permission, p."grantedAt", u.email AS granter_email
FROM "AdminPermission" p
LEFT JOIN "User" u ON p."grantedById" = u.id
WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'user@example.com');
```

---

## Option C — Prisma Studio

```bash
pnpm --filter @sd/core-db prisma studio
```

- In the `User` table, set `role` to `admin` for the target user.
- In the `AdminPermission` table, add one row per permission for that `userId`
  (using the permission strings listed above).
