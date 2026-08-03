import { PrismaPg } from "@prisma/adapter-pg";
/* eslint-disable no-console */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "../src/generated/prisma/client.js";
import { loadDbEnvFiles } from "./load-db-env.js";

export type AccessRow = {
  target: string;
  capability: string;
  scholarId: string | null;
  locale: string | null;
};

const locales = ["ar", "en"];

export function mapLegacyPermission(permission: string): AccessRow[] {
  if (permission.endsWith("_VIEW")) return [];
  if (permission.startsWith("TRANSLATIONS_")) {
    const capability = permission.endsWith("_PUBLISH") ? "publish" : "translate";
    return locales.map((locale) => ({
      target: "translation",
      capability,
      scholarId: null,
      locale,
    }));
  }

  const target = permission.startsWith("SCHOLARS_")
    ? "scholar"
    : permission.startsWith("LISTINGS_")
      ? "listing"
      : permission.startsWith("TOPICS_")
        ? "topic"
        : permission.startsWith("MEDIA_")
          ? "media"
          : permission.startsWith("USERS_")
            ? "user"
            : null;
  if (!target) return [];
  const capability =
    target === "user"
      ? "manage"
      : permission.endsWith("_PUBLISH")
        ? "publish"
        : permission.endsWith("_DELETE")
          ? "delete"
          : "write";
  return [{ target, capability, scholarId: null, locale: null }];
}

export function mapLegacyScholarRole(permissionType: string, scholarId: string): AccessRow[] {
  if (permissionType === "ASSIGNED_EDITOR") {
    return [{ target: "listing", capability: "write", scholarId, locale: null }];
  }
  return [
    { target: "scholar", capability: "write", scholarId, locale: null },
    { target: "scholar", capability: "publish", scholarId, locale: null },
    { target: "listing", capability: "write", scholarId, locale: null },
    { target: "listing", capability: "publish", scholarId, locale: null },
    { target: "media", capability: "write", scholarId, locale: null },
  ];
}

function key(row: AccessRow): string {
  return `${row.target}:${row.capability}:${row.scholarId ?? ""}:${row.locale ?? ""}`;
}

async function main(): Promise<void> {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  loadDbEnvFiles(path.resolve(scriptDir, ".."));
  const connectionString = process.env.DIRECT_DB_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL or DIRECT_DB_URL must be set.");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const [permissions, scholarRoles, translatorRoles, existing] = await Promise.all([
      prisma.userPermission.findMany({
        select: { id: true, userId: true, permission: true, grantedAt: true, grantedBy: true },
      }),
      prisma.userScholarRole.findMany({
        select: {
          id: true,
          userId: true,
          scholarId: true,
          permissionType: true,
          createdAt: true,
          createdBy: true,
        },
      }),
      prisma.userTranslatorRole.findMany({
        select: {
          id: true,
          userId: true,
          scholarId: true,
          locale: true,
          canPublish: true,
          createdAt: true,
          createdBy: true,
        },
      }),
      prisma.userAccessGrant.findMany({
        select: { userId: true, target: true, capability: true, scholarId: true, locale: true },
      }),
    ]);

    const existingKeys = new Set(existing.map((row) => `${row.userId}:${key(row)}`));
    const rows = new Map<string, Record<string, unknown>>();
    const add = (userId: string, access: AccessRow, grantedAt: Date, grantedBy: string | null) => {
      const rowKey = `${userId}:${key(access)}`;
      if (existingKeys.has(rowKey) || rows.has(rowKey)) return;
      rows.set(rowKey, { id: crypto.randomUUID(), userId, ...access, grantedAt, grantedBy });
    };

    for (const permission of permissions) {
      for (const access of mapLegacyPermission(String(permission.permission))) {
        add(permission.userId, access, permission.grantedAt, permission.grantedBy);
      }
    }
    for (const role of scholarRoles) {
      for (const access of mapLegacyScholarRole(String(role.permissionType), role.scholarId)) {
        add(role.userId, access, role.createdAt, role.createdBy);
      }
    }
    for (const role of translatorRoles) {
      add(
        role.userId,
        {
          target: "translation",
          capability: "translate",
          scholarId: role.scholarId,
          locale: role.locale,
        },
        role.createdAt,
        role.createdBy,
      );
      if (role.canPublish) {
        add(
          role.userId,
          {
            target: "translation",
            capability: "publish",
            scholarId: role.scholarId,
            locale: role.locale,
          },
          role.createdAt,
          role.createdBy,
        );
      }
    }

    const pending = [...rows.values()];
    if (pending.length) await prisma.userAccessGrant.createMany({ data: pending as never[] });
    console.log(`Backfilled ${pending.length} aggregate access row(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
