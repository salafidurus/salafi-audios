# Admin and Access Management

Salafi Durus uses system roles plus aggregate access grants. Catalog reads are
public; grants protect editorial mutations and user administration.

## Access model

`UserRoleAssignment` stores system roles. `UserAccessGrant` stores the actual
capabilities used by backend policy checks.

| Target        | Capabilities                     | Scope                                                    |
| ------------- | -------------------------------- | -------------------------------------------------------- |
| `scholar`     | `write`, `publish`, `delete`     | global or one or more scholars                           |
| `listing`     | `write`, `publish`, `delete`     | global or one or more scholars                           |
| `media`       | `write`, `delete`                | global or one or more scholars                           |
| `topic`       | `write`, `publish`, `delete`     | global only                                              |
| `translation` | `translate`, `publish`, `delete` | global or one or more scholars, plus one or more locales |
| `user`        | `manage`                         | global only                                              |

Delete is deliberately separate from write. Topics are not scholar-owned for
access purposes. Roles shown in the admin UI (`Editor`, `Translator`,
`Publisher`, `Deleter`, and `User manager`) are derived from the grants rather
than stored as editorial roles.

Superadmin is the only protected system role. A superadmin bypasses capability
checks and is managed explicitly; normal access grants do not create one.

## Grant access with the database script

Run the script from the repository root:

```bash
# Global listing write access
bun run --filter @sd/core-db grant:access user@example.com listing write

# Listing write access for multiple scholars
bun run --filter @sd/core-db grant:access user@example.com listing write \
  --scholars scholar-one,scholar-two

# Arabic and English translation access for selected scholars
bun run --filter @sd/core-db grant:access user@example.com translation translate \
  --scholars scholar-one,scholar-two --locales ar,en

# Global user management
bun run --filter @sd/core-db grant:access user@example.com user manage

# Break-glass superadmin role
bun run --filter @sd/core-db grant:access user@example.com superadmin grant
```

The command is idempotent. Scholar arguments use scholar slugs, and unknown
slugs or invalid target/capability combinations are rejected. Translation
grants always require `--locales`; topics and users reject scholar scope.

For another database, provide `DIRECT_DB_URL` or `DATABASE_URL` for the command:

```bash
DIRECT_DB_URL="postgresql://..." \
  bun run --filter @sd/core-db grant:access user@example.com topic write
```

## Unified admin API

Users with global `manage` access on `UserAccess` can manage another user's
grants through:

```text
GET /admin/users/:userId/access
PUT /admin/users/:userId/access
```

The GET response includes the current version and normalized grants. The PUT
request replaces the complete grant set and must include that version. A stale
version is rejected, preventing concurrent administrators from silently
overwriting each other's changes.

The admin users screen uses one access dialog for all targets, capabilities,
scholar scopes, and locale scopes.

## Migrations and legacy data

Apply migrations normally:

```bash
bun run --filter @sd/core-db migrate:deploy
```

The aggregate schema migration creates `UserAccessGrant` and `User.accessVersion`.
The following data migration backfills supported write, translate, publish,
delete, and user-management access from legacy rows while intentionally omitting
legacy read permissions. Do not run an ad-hoc backfill script or edit applied
migrations; use the checked-in Prisma migrations.

## Verification

```sql
SELECT u.email, g.target, g.capability, g."scholarId", g.locale
FROM "User" u
LEFT JOIN "UserAccessGrant" g ON g."userId" = u.id
WHERE u.email = 'user@example.com'
ORDER BY g.target, g.capability, g.locale;

SELECT u.email, r.role
FROM "User" u
JOIN "UserRoleAssignment" r ON r."userId" = u.id
WHERE u.email = 'user@example.com';
```

Authorization is reloaded on every protected request. A user does not need to
log out and back in after an access grant changes, although an already-open UI
may need to refresh its profile query to update affordances.
