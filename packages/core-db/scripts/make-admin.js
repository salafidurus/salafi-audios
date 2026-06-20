/* eslint-disable no-console */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ADMIN_PERMISSIONS } from "@sd/core-contracts";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { loadDbEnvFiles } from "./load-db-env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env files relative to the package root (matches sibling scripts).
loadDbEnvFiles(path.resolve(__dirname, ".."));

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm --filter @sd/core-db make-admin <email>");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });

    // ADMIN_PERMISSIONS is the canonical enum enforced by the API — single source of truth.
    for (const permission of ADMIN_PERMISSIONS) {
      await prisma.adminPermission.upsert({
        where: { userId_permission: { userId: user.id, permission } },
        create: { userId: user.id, permission },
        update: {},
      });
    }

    console.log(
      `Successfully made ${email} an admin with all permissions (${ADMIN_PERMISSIONS.join(", ")}).`,
    );
  } catch (err) {
    console.error("Error promoting user:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
