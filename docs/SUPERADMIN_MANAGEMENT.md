# SuperAdmin Role Management

This document describes how to create, manage, and demote SuperAdmin accounts in Salafi Durus.

## Understanding SuperAdmin vs Admin

The platform distinguishes between **Admin** and **SuperAdmin** roles with different operational constraints:

### Admin Role

- **Creation**: Via API or manual database operations
- **Permissions**: Full platform access (can manage all content, users, settings)
- **Promotion**: Can be promoted to SuperAdmin by another SuperAdmin
- **Demotion**: Can be demoted or have permissions revoked via API
- **Permission Revocation**: Individual permissions can be revoked through API

### SuperAdmin Role

- **Creation**: Only via direct database operations (SQL script or manual SQL)
- **Permissions**: Full platform access (same as Admin)
- **Promotion Authority**: Can promote Admins to SuperAdmin
- **Demotion**: Can ONLY be demoted via direct database operations
- **Protection**: Cannot be demoted through the API
- **Initial Setup**: Typically created during system initialization

## Why This Distinction?

The SuperAdmin role exists as a **break-glass account** for operational emergencies:

- Prevents accidental demotion of all administrative accounts
- Ensures at least one account cannot be locked out through normal API operations
- Requires intentional intervention for SuperAdmin changes (reduced risk of social engineering)

## Creating a SuperAdmin

### Option 1: SQL Script (Recommended)

Create a file named `create-superadmin.sql`:

```sql
-- Create SuperAdmin for user with email: admin@example.com
-- First, find the user ID (or use a known ID)
SELECT id, email FROM "User" WHERE email = 'admin@example.com';

-- Then, use the user ID in the following commands:
-- Replace 'user-id-here' with the actual user ID

-- 1. Create the superadmin role assignment
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
  NULL  -- grantedBy is NULL for manual creation
);

-- 2. Grant all permissions to the superadmin
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
) AS perms(perm)
ON CONFLICT DO NOTHING;
```

**Execution**:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/salafi_dev"

# Run the SQL file using psql
psql $DATABASE_URL -f create-superadmin.sql

# Or run the SQL file using the project's database commands
bun run --filter @sd/core-db -- psql -f create-superadmin.sql
```

### Option 2: Node.js/TypeScript Script

Create a file named `create-superadmin.ts` in the project root:

```typescript
import { PrismaClient } from "@sd/core-db/client";

const prisma = new PrismaClient();

async function createSuperAdmin(userEmail: string) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`User with email ${userEmail} not found`);
      process.exit(1);
    }

    console.log(`Creating SuperAdmin for user: ${user.name} (${user.email})`);

    // Create superadmin role assignment
    const roleAssignment = await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        role: "superadmin",
        grantedBy: null,
      },
    });

    console.log(`✓ Superadmin role assigned: ${roleAssignment.id}`);

    // Grant all permissions
    const permissions = [
      "SCHOLARS_VIEW",
      "SCHOLARS_CREATE",
      "SCHOLARS_EDIT",
      "SCHOLARS_DELETE",
      "SCHOLARS_PUBLISH",
      "LISTINGS_VIEW",
      "LISTINGS_CREATE",
      "LISTINGS_EDIT",
      "LISTINGS_DELETE",
      "LISTINGS_PUBLISH",
      "TOPICS_VIEW",
      "TOPICS_CREATE",
      "TOPICS_EDIT",
      "TOPICS_DELETE",
      "TOPICS_PUBLISH",
      "TRANSLATIONS_VIEW",
      "TRANSLATIONS_CREATE",
      "TRANSLATIONS_EDIT",
      "TRANSLATIONS_DELETE",
      "TRANSLATIONS_PUBLISH",
      "MEDIA_UPLOAD",
      "MEDIA_DELETE",
      "USERS_VIEW",
      "USERS_EDIT",
      "USERS_DELETE",
      "USERS_GRANT_PERMISSIONS",
      "USERS_GRANT_ROLES",
      "LIVE_VIEW",
      "LIVE_CREATE",
      "LIVE_EDIT",
      "LIVE_DELETE",
      "LIVE_START",
      "LIVE_STOP",
    ];

    let grantedCount = 0;
    for (const permission of permissions) {
      try {
        await prisma.userPermission.create({
          data: {
            userId: user.id,
            permission: permission as any,
            grantedBy: null,
          },
        });
        grantedCount++;
      } catch (e) {
        // Permission may already exist, skip
      }
    }

    console.log(`✓ Granted ${grantedCount} permissions`);
    console.log("\n✅ SuperAdmin account created successfully!");
    console.log(`   User: ${user.email}`);
    console.log(`   User ID: ${user.id}`);
  } catch (error) {
    console.error("Error creating superadmin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run with: npx ts-node create-superadmin.ts admin@example.com
const userEmail = process.argv[2];
if (!userEmail) {
  console.error("Usage: npx ts-node create-superadmin.ts <user-email>");
  process.exit(1);
}

createSuperAdmin(userEmail);
```

**Execution**:

```bash
# Make sure you're in the project root
bun run create-superadmin.ts admin@example.com
```

## Demoting a SuperAdmin

### Option 1: SQL Script (Recommended)

Create a file named `demote-superadmin.sql`:

```sql
-- Demote SuperAdmin to Admin
-- Replace 'user-id-here' with the actual user ID or use email to find it

-- Find user by email if needed
SELECT id, email FROM "User" WHERE email = 'admin@example.com';

-- Revoke superadmin role
DELETE FROM "UserRoleAssignment"
WHERE "userId" = 'user-id-here' AND role = 'superadmin';

-- Optionally: Grant admin role if transitioning to Admin
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
  'admin',
  CURRENT_TIMESTAMP,
  NULL
)
ON CONFLICT ("userId", "role") DO NOTHING;
```

**Execution**:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/salafi_dev"
psql $DATABASE_URL -f demote-superadmin.sql
```

### Option 2: Node.js/TypeScript Script

Create a file named `demote-superadmin.ts`:

```typescript
import { PrismaClient } from "@sd/core-db/client";

const prisma = new PrismaClient();

async function demoteSuperAdmin(userEmail: string, demoteToRole?: "admin" | "editor" | "listener") {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`User with email ${userEmail} not found`);
      process.exit(1);
    }

    console.log(`Demoting SuperAdmin: ${user.name} (${user.email})`);

    // Verify user has superadmin role
    const superAdminRole = await prisma.userRoleAssignment.findUnique({
      where: {
        userId_role: {
          userId: user.id,
          role: "superadmin",
        },
      },
    });

    if (!superAdminRole) {
      console.error(`User ${user.email} is not a SuperAdmin`);
      process.exit(1);
    }

    // Revoke superadmin role
    await prisma.userRoleAssignment.delete({
      where: { id: superAdminRole.id },
    });

    console.log("✓ Superadmin role revoked");

    // Optionally assign new role
    if (demoteToRole) {
      const newRole = await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          role: demoteToRole,
          grantedBy: null,
        },
      });
      console.log(`✓ Assigned ${demoteToRole} role: ${newRole.id}`);
    }

    console.log("\n✅ SuperAdmin account demoted successfully!");
    console.log(`   User: ${user.email}`);
    console.log(`   User ID: ${user.id}`);
    if (demoteToRole) {
      console.log(`   New Role: ${demoteToRole}`);
    }
  } catch (error) {
    console.error("Error demoting superadmin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run with: npx ts-node demote-superadmin.ts admin@example.com admin
const userEmail = process.argv[2];
const newRole = (process.argv[3] as any) || undefined;

if (!userEmail) {
  console.error("Usage: npx ts-node demote-superadmin.ts <user-email> [admin|editor|listener]");
  process.exit(1);
}

demoteSuperAdmin(userEmail, newRole);
```

**Execution**:

```bash
# Demote to no role
bun run demote-superadmin.ts admin@example.com

# Demote to admin role
bun run demote-superadmin.ts admin@example.com admin
```

## Listing SuperAdmins

### SQL Query

```sql
SELECT u.id, u.email, u.name, ura."grantedAt"
FROM "User" u
JOIN "UserRoleAssignment" ura ON u.id = ura."userId"
WHERE ura.role = 'superadmin'
ORDER BY ura."grantedAt" DESC;
```

### Node.js Query

```typescript
import { PrismaClient } from "@sd/core-db/client";

const prisma = new PrismaClient();

async function listSuperAdmins() {
  const superAdmins = await prisma.userRoleAssignment.findMany({
    where: { role: "superadmin" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { grantedAt: "desc" },
  });

  console.log("SuperAdmins:");
  superAdmins.forEach((sa) => {
    console.log(`  - ${sa.user.name} (${sa.user.email}) - ID: ${sa.user.id}`);
  });
}

listSuperAdmins().then(() => process.exit(0));
```

## Security Considerations

1. **Access Control**: Only execute these scripts in secure environments with proper database access controls.
2. **Audit Trail**: Superadmin changes bypass the API and don't create audit logs. Document manual changes separately.
3. **Backups**: Always ensure database backups exist before making superadmin changes.
4. **Multiple SuperAdmins**: It's recommended to have at least 2 SuperAdmins for operational resilience.
5. **Monitoring**: Monitor superadmin account activity regularly.

## Emergency Recovery

If you need to recover access when all administrative accounts are locked:

1. Connect directly to the database using `psql`
2. Run the `create-superadmin.sql` script with a known user email
3. Verify the user can log in and has full permissions
4. Investigate what caused the lockout

## API Errors

When attempting SuperAdmin operations via API:

### Error: Attempting to grant SuperAdmin without being SuperAdmin

```text
"Only superadmin can grant superadmin role. Use direct database operations for superadmin management."
```

**Solution**: Have an existing SuperAdmin execute the operation, or use direct database operations.

### Error: Attempting to revoke SuperAdmin via API

```text
"SuperAdmin role cannot be revoked through the API. Use direct database operations (SQL or script) for superadmin management."
```

**Solution**: Use the SQL script or Node.js script described in the "Demoting a SuperAdmin" section.

## Troubleshooting

### User has no permissions after SuperAdmin creation

Verify that the permissions were inserted correctly:

```sql
SELECT COUNT(*) FROM "UserPermission" WHERE "userId" = 'user-id-here';
```

Should return 33 (one for each permission). If not, run the permission grant SQL again.

### Can't find user by email

Verify the email address is correct:

```sql
SELECT id, email FROM "User" WHERE email ILIKE '%search-text%';
```

### Changes not taking effect

The user needs to log out and log in again for permission changes to take effect in the application.
