/* eslint-disable no-console */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { loadDbEnvFiles } from "./load-db-env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env files relative to the package root (matches sibling scripts).
loadDbEnvFiles(path.resolve(__dirname, ".."));

const connectionString = process.env.DIRECT_DB_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_DB_URL must be set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Valid roles from UserRole enum
const VALID_ROLES = ["listener", "scholar", "translator", "editor", "admin", "superadmin"];

// Default permissions granted per role
// These follow the permission mapping from the PBAC system
const ROLE_PERMISSIONS = {
  listener: [],
  // Scholar role gets permissions to manage their own content
  scholar: [
    "SCHOLARS_EDIT",
    "LISTINGS_CREATE",
    "LISTINGS_EDIT",
    "LISTINGS_PUBLISH",
    "MEDIA_UPLOAD",
  ],
  // Translator role gets permissions to translate content
  translator: ["TRANSLATIONS_VIEW", "TRANSLATIONS_CREATE", "TRANSLATIONS_EDIT"],
  // Editor role gets permissions to manage listings and media
  editor: ["LISTINGS_VIEW", "LISTINGS_CREATE", "LISTINGS_EDIT", "LISTINGS_PUBLISH", "MEDIA_UPLOAD"],
  // Admin role gets all permissions (full platform access)
  admin: [
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
  ],
  // Superadmin role gets all permissions (break-glass account)
  // Note: Superadmin role assignment requires direct SQL, not API
  superadmin: [
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
  ],
};

function printHelp() {
  console.log(`
Grant a role to a user and automatically assign all role-default permissions.

USAGE
  bun run --filter @sd/core-db grant-role <email> <role>
  bun run --filter @sd/core-db grant-role --list
  bun run --filter @sd/core-db grant-role --help

EXAMPLES
  # Grant 'scholar' role to a user
  bun run --filter @sd/core-db grant-role user@example.com scholar

  # Grant 'editor' role to a user
  bun run --filter @sd/core-db grant-role user@example.com editor

  # List all available roles
  bun run --filter @sd/core-db grant-role --list

AVAILABLE ROLES
  listener    - Default user role (no special permissions)
  scholar     - Content creator role (can manage own content, upload media)
  translator  - Translation role (can translate content to assigned languages)
  editor      - Content editor role (can edit and publish all content)
  admin       - Platform administrator (all permissions except superadmin)
  superadmin  - Break-glass emergency account (requires SQL, not API)

NOTES
  - Each role grants specific default permissions automatically
  - Users can have multiple roles simultaneously
  - Re-running with the same user and role is safe (idempotent)
  - For granular permission control, use grant-permission.js instead
  - To create a superadmin account, use direct SQL (see docs/admin-management.md)
  `);
}

async function grantRole(email, role) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`❌ User with email "${email}" not found.`);
      process.exit(1);
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      console.error(`❌ Invalid role: ${role}`);
      console.error(`   Valid roles are: ${VALID_ROLES.join(", ")}`);
      console.error(`   Use --list to see all available roles.`);
      process.exit(1);
    }

    // Warn about superadmin
    // if (role === "superadmin") {
    //   console.warn(
    //     `⚠️  Superadmin role assignment requires direct SQL.\n   See docs/admin-management.md for instructions.\n`,
    //   );
    //   process.exit(0);
    // }

    console.log(`\n📋 Assigning role '${role}' to ${user.email}...\n`);

    // 1. Assign the role via UserRoleAssignment

    try {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          role,
          grantedAt: new Date(),
          grantedBy: null, // Manual grant via script
        },
      });

      console.log(`  ✓ Assigned role: ${role}`);
    } catch (err) {
      if (err.code === "P2002") {
        // Role already exists for this user

        console.log(`  ⊘ Already has role: ${role}`);
      } else {
        throw err;
      }
    }

    // 2. Grant all default permissions for this role
    const permissions = ROLE_PERMISSIONS[role] || [];
    if (permissions.length === 0) {
      console.log(`\n✅ Role assignment complete!`);
      console.log(`   User: ${user.email} (${user.id})`);
      console.log(`   Role: ${role}`);
      console.log(`   Permissions: none (listener role has no special permissions)`);
      return;
    }

    let grantedCount = 0;
    let skippedCount = 0;

    for (const permission of permissions) {
      try {
        await prisma.userPermission.create({
          data: {
            userId: user.id,
            permission,
            grantedAt: new Date(),
            grantedBy: null, // Manual grant via script
          },
        });
        grantedCount++;
      } catch (err) {
        if (err.code === "P2002") {
          // Permission already exists
          skippedCount++;
        } else {
          throw err;
        }
      }
    }

    console.log(`\n✅ Role assignment complete!`);
    console.log(`   User: ${user.email} (${user.id})`);
    console.log(`   Role: ${role}`);
    console.log(`   Permissions granted: ${grantedCount}`);
    if (skippedCount > 0) {
      console.log(`   Permissions already held: ${skippedCount}`);
    }
  } catch (err) {
    console.error("❌ Error assigning role:", err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    printHelp();
    process.exit(0);
  }

  if (args[0] === "--list") {
    console.log("Available roles:\n");
    for (const role of VALID_ROLES) {
      const perms = ROLE_PERMISSIONS[role];
      const permCount = perms ? perms.length : 0;
      const permText = permCount === 0 ? "(no special permissions)" : `(${permCount} permissions)`;
      console.log(`  • ${role.padEnd(12)} ${permText}`);
    }
    console.log("");
    process.exit(0);
  }

  const email = args[0];
  const role = args[1];

  if (!email || !role) {
    console.error("❌ Usage: bun run --filter @sd/core-db grant-role <email> <role>");
    console.error("   Use --help for more information.");
    process.exit(1);
  }

  await grantRole(email, role);
}

main();
