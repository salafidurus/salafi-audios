import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDbEnvFiles } from "./load-db-env.js";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDbEnvFiles(path.resolve(__dirname, ".."));

// Patch localhost → 127.0.0.1 for Bun (resolves IPv6/IPv4 ambiguity)
for (const key of ["DATABASE_URL", "DIRECT_DB_URL"] as const) {
  if (process.env[key]) {
    process.env[key] = process.env[key]!.replace("localhost", "127.0.0.1");
  }
}

const connectionString = process.env.DIRECT_DB_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_DB_URL is required");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: "e2e-test-",
        endsWith: "@salafidurus.com",
      },
    },
    select: { id: true, email: true },
  });

  if (users.length === 0) {
    console.log("No E2E test users found.");
    return;
  }

  console.log(`Found ${users.length} E2E test user(s). Deleting ...`);
  const userIds = users.map((u) => u.id);

  const [sessions, roleAssignments, permissions, progress, favorites, accounts, deletedUsers] =
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: { in: userIds } } }),
      prisma.userRoleAssignment.deleteMany({ where: { userId: { in: userIds } } }),
      prisma.userPermission.deleteMany({ where: { userId: { in: userIds } } }),
      prisma.userListingProgress.deleteMany({ where: { userId: { in: userIds } } }),
      prisma.favoriteListing.deleteMany({ where: { userId: { in: userIds } } }),
      prisma.account.deleteMany({ where: { userId: { in: userIds } } }),
      prisma.user.deleteMany({ where: { id: { in: userIds } } }),
    ]);

  console.log(`✓ Deleted ${deletedUsers.count} users successfully.`);
  console.log(`  Sessions:         ${sessions.count}`);
  console.log(`  Role assignments: ${roleAssignments.count}`);
  console.log(`  Permissions:      ${permissions.count}`);
  console.log(`  Progress records: ${progress.count}`);
  console.log(`  Favorites:        ${favorites.count}`);
  console.log(`  Accounts:         ${accounts.count}`);
}

main()
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
