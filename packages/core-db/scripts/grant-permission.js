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

// Complete list of valid permissions from the Permission enum
const VALID_PERMISSIONS = [
  // Scholar Permissions
  "SCHOLARS_VIEW",
  "SCHOLARS_CREATE",
  "SCHOLARS_EDIT",
  "SCHOLARS_DELETE",
  "SCHOLARS_PUBLISH",

  // Listing Permissions (Collections, Series, Singles, Modules, Lessons)
  "LISTINGS_VIEW",
  "LISTINGS_CREATE",
  "LISTINGS_EDIT",
  "LISTINGS_DELETE",
  "LISTINGS_PUBLISH",

  // Topic Permissions
  "TOPICS_VIEW",
  "TOPICS_CREATE",
  "TOPICS_EDIT",
  "TOPICS_DELETE",
  "TOPICS_PUBLISH",

  // Translation Permissions
  "TRANSLATIONS_VIEW",
  "TRANSLATIONS_CREATE",
  "TRANSLATIONS_EDIT",
  "TRANSLATIONS_DELETE",
  "TRANSLATIONS_PUBLISH",

  // Media Permissions
  "MEDIA_UPLOAD",
  "MEDIA_DELETE",

  // User Management Permissions
  "USERS_VIEW",
  "USERS_EDIT",
  "USERS_DELETE",
  "USERS_GRANT_PERMISSIONS",
  "USERS_GRANT_ROLES",
];

function printHelp() {
  console.log(`
Grant specific permissions to a user.

USAGE
  bun run --filter @sd/core-db grant-permission <email> <permission> [permission2] [permission3] ...
  bun run --filter @sd/core-db grant-permission --list
  bun run --filter @sd/core-db grant-permission --help

EXAMPLES
  # Grant a single permission
  bun run --filter @sd/core-db grant-permission user@example.com SCHOLARS_VIEW

  # Grant multiple permissions
  bun run --filter @sd/core-db grant-permission user@example.com SCHOLARS_VIEW SCHOLARS_EDIT LISTINGS_CREATE

  # List all valid permissions
  bun run --filter @sd/core-db grant-permission --list

VALID PERMISSIONS
  Scholar Permissions:
    SCHOLARS_VIEW, SCHOLARS_CREATE, SCHOLARS_EDIT, SCHOLARS_DELETE, SCHOLARS_PUBLISH

  Listing Permissions:
    LISTINGS_VIEW, LISTINGS_CREATE, LISTINGS_EDIT, LISTINGS_DELETE, LISTINGS_PUBLISH

  Topic Permissions:
    TOPICS_VIEW, TOPICS_CREATE, TOPICS_EDIT, TOPICS_DELETE, TOPICS_PUBLISH

  Translation Permissions:
    TRANSLATIONS_VIEW, TRANSLATIONS_CREATE, TRANSLATIONS_EDIT, TRANSLATIONS_DELETE, TRANSLATIONS_PUBLISH

  Media Permissions:
    MEDIA_UPLOAD, MEDIA_DELETE

  User Management Permissions:
    USERS_VIEW, USERS_EDIT, USERS_DELETE, USERS_GRANT_PERMISSIONS, USERS_GRANT_ROLES

NOTES
  - The script is idempotent — re-running with the same user and permission is a no-op.
  - Permissions are case-sensitive and must match the exact names listed above.
  - Use DATABASE_URL or DIRECT_DB_URL environment variables to target a specific database.
  - To revoke permissions, see the documentation in docs/admin-management.md
  `);
}

async function grantPermissions(email, permissions) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`❌ User with email "${email}" not found.`);
      process.exit(1);
    }

    // Validate all permissions
    const invalidPermissions = permissions.filter((p) => !VALID_PERMISSIONS.includes(p));
    if (invalidPermissions.length > 0) {
      console.error(`❌ Invalid permission(s): ${invalidPermissions.join(", ")}`);
      console.error(`   Use --list to see all valid permissions.`);
      process.exit(1);
    }

    // Grant each permission
    let grantedCount = 0;
    const skippedPermissions = [];

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
        console.log(`  ✓ Granted ${permission}`);
      } catch (err) {
        // If permission already exists (unique constraint), skip it
        if (err.code === "P2002") {
          skippedPermissions.push(permission);
          console.log(`  ⊘ Already has ${permission}`);
        } else {
          throw err;
        }
      }
    }

    console.log("\n✅ Permission grant complete!");
    console.log(`   User: ${user.email} (${user.id})`);
    console.log(`   Granted: ${grantedCount} permission(s)`);
    if (skippedPermissions.length > 0) {
      console.log(`   Skipped: ${skippedPermissions.length} permission(s) (already held)`);
    }
  } catch (err) {
    console.error("❌ Error granting permissions:", err.message);
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
    console.log("Valid permissions:\n");
    console.log("Scholar Permissions:");
    console.log(
      "  " +
        [
          "SCHOLARS_VIEW",
          "SCHOLARS_CREATE",
          "SCHOLARS_EDIT",
          "SCHOLARS_DELETE",
          "SCHOLARS_PUBLISH",
        ].join(", "),
    );
    console.log("\nListing Permissions:");
    console.log(
      "  " +
        [
          "LISTINGS_VIEW",
          "LISTINGS_CREATE",
          "LISTINGS_EDIT",
          "LISTINGS_DELETE",
          "LISTINGS_PUBLISH",
        ].join(", "),
    );
    console.log("\nTopic Permissions:");
    console.log(
      "  " +
        ["TOPICS_VIEW", "TOPICS_CREATE", "TOPICS_EDIT", "TOPICS_DELETE", "TOPICS_PUBLISH"].join(
          ", ",
        ),
    );
    console.log("\nTranslation Permissions:");
    console.log(
      "  " +
        [
          "TRANSLATIONS_VIEW",
          "TRANSLATIONS_CREATE",
          "TRANSLATIONS_EDIT",
          "TRANSLATIONS_DELETE",
          "TRANSLATIONS_PUBLISH",
        ].join(", "),
    );
    console.log("\nMedia Permissions:");
    console.log("  " + ["MEDIA_UPLOAD", "MEDIA_DELETE"].join(", "));
    console.log("\nUser Management Permissions:");
    console.log(
      "  " +
        [
          "USERS_VIEW",
          "USERS_EDIT",
          "USERS_DELETE",
          "USERS_GRANT_PERMISSIONS",
          "USERS_GRANT_ROLES",
        ].join(", "),
    );
    console.log("");
    process.exit(0);
  }

  const email = args[0];
  const permissions = args.slice(1);

  if (!email || permissions.length === 0) {
    console.error(
      "❌ Usage: bun run --filter @sd/core-db grant-permission <email> <permission> [permission2] ...",
    );
    console.error("   Use --help for more information.");
    process.exit(1);
  }

  await grantPermissions(email, permissions);
}

main();
