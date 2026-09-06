import { PrismaPg } from "@prisma/adapter-pg";
/* eslint-disable no-console */
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "../src/generated/primary/client.js";
import { loadDbEnvFiles } from "./load-db-env.js";

export const ACCESS_TARGETS = [
  "scholar",
  "listing",
  "media",
  "topic",
  "translation",
  "user",
] as const;
export const ACCESS_CAPABILITIES = ["write", "translate", "publish", "delete", "manage"] as const;
export const LOCALES = ["ar", "en"] as const;

type Target = (typeof ACCESS_TARGETS)[number];
type Capability = (typeof ACCESS_CAPABILITIES)[number];

export type ParsedAccessArgs =
  | {
      email: string;
      target: Target;
      capability: Capability;
      scholarSlugs: string[];
      locales: string[];
    }
  | { email: string; superadmin: true };

const allowedCapabilities = {
  scholar: ["write", "publish", "delete"],
  listing: ["write", "publish", "delete"],
  media: ["write", "delete"],
  topic: ["write", "publish", "delete"],
  translation: ["translate", "publish", "delete"],
  user: ["manage"],
} as const satisfies Record<Target, readonly Capability[]>;

function isAccessTarget(value: string): value is Target {
  return ACCESS_TARGETS.some((target) => target === value);
}

function isAccessCapability(value: string): value is Capability {
  return ACCESS_CAPABILITIES.some((capability) => capability === value);
}

function isLocale(value: string): value is (typeof LOCALES)[number] {
  return LOCALES.some((locale) => locale === value);
}

function csv(value: string | undefined): string[] {
  return value
    ? [
        ...new Set(
          value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ]
    : [];
}

export function parseAccessArgs(args: string[]): ParsedAccessArgs {
  const [email, target, capability, ...options] = args;
  if (!email || !target || !capability) {
    throw new Error(
      "Usage: grant:access <email> <target> <capability> [--scholars a,b] [--locales ar,en]",
    );
  }
  if (target === "superadmin" && capability === "grant") {
    if (options.length) throw new Error("The superadmin command does not accept options");
    return { email, superadmin: true };
  }
  if (!isAccessTarget(target)) throw new Error(`Invalid target: ${target}`);
  if (!isAccessCapability(capability)) {
    throw new Error(`Invalid capability: ${capability}`);
  }

  let scholars: string[] = [];
  let locales: string[] = [];
  for (let index = 0; index < options.length; index += 2) {
    const option = options[index];
    const value = options[index + 1];
    if (!value || (option !== "--scholars" && option !== "--locales")) {
      throw new Error("Options must be --scholars <slug,...> or --locales <locale,...>");
    }
    if (option === "--scholars") scholars = csv(value);
    if (option === "--locales") locales = csv(value);
  }

  if (!allowedCapabilities[target].includes(capability)) {
    throw new Error(`${capability} cannot be granted on ${target}`);
  }
  if (target === "topic" || target === "user") {
    if (scholars.length) throw new Error(`${target} access cannot be scholar-scoped`);
  }
  if (target !== "translation" && locales.length) {
    throw new Error("Locale scope is only valid for translation access");
  }
  if (target === "translation" && !locales.length) {
    throw new Error("Translation access requires --locales");
  }
  if (locales.some((locale) => !isLocale(locale))) {
    throw new Error(`Invalid locale. Use: ${LOCALES.join(", ")}`);
  }

  return {
    email,
    target,
    capability,
    scholarSlugs: scholars,
    locales,
  };
}

export function printHelp(): void {
  console.log(`
Grant aggregate access to a user.

USAGE
  bun run --filter @sd/core-db grant:access <email> <target> <capability> [options]
  bun run --filter @sd/core-db grant:access <email> superadmin grant

TARGETS / CAPABILITIES
  scholar      write, publish, delete
  listing      write, publish, delete
  media        write, delete
  topic        write, publish, delete (never scholar-scoped)
  translation  translate, publish, delete (requires --locales)
  user         manage (global only)

OPTIONS
  --scholars <slug,...>  Scope content access to one or more scholars.
  --locales <ar,en>      Scope translation access to one or more locales.

Roles such as Editor, Translator, Publisher, Deleter, and User manager are derived from grants.
Superadmin is the only protected system role and is managed explicitly by the second command.
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (!args.length || args.includes("--help")) {
    printHelp();
    return;
  }

  const parsed = parseAccessArgs(args);
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  loadDbEnvFiles(path.resolve(scriptDir, ".."));
  const connectionString =
    process.env.PRIMARY_DIRECT_DATABASE_URL ?? process.env.PRIMARY_DATABASE_URL;
  if (!connectionString) {
    throw new Error("PRIMARY_DATABASE_URL or PRIMARY_DIRECT_DATABASE_URL must be set.");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true, email: true },
    });
    if (!user) throw new Error(`User not found: ${parsed.email}`);

    if ("superadmin" in parsed) {
      await prisma.userRoleAssignment.upsert({
        where: { userId_role: { userId: user.id, role: "superadmin" } },
        update: {},
        create: { userId: user.id, role: "superadmin" },
      });
      console.log(`Granted superadmin to ${user.email}`);
      return;
    }

    const scholars = parsed.scholarSlugs.length
      ? await prisma.scholar.findMany({
          where: { slug: { in: parsed.scholarSlugs } },
          select: { id: true, slug: true },
        })
      : [];
    if (scholars.length !== parsed.scholarSlugs.length) {
      const found = new Set(scholars.map((scholar) => scholar.slug));
      throw new Error(
        `Unknown scholar(s): ${parsed.scholarSlugs.filter((slug) => !found.has(slug)).join(", ")}`,
      );
    }

    const rows = parsed.scholarSlugs.length ? scholars : [{ id: null, slug: "" }];
    const locales = parsed.target === "translation" ? parsed.locales : [null];
    let created = 0;
    for (const scholar of rows) {
      for (const locale of locales) {
        const existing = await prisma.userAccessGrant.findFirst({
          where: {
            userId: user.id,
            target: parsed.target,
            capability: parsed.capability,
            scholarId: scholar.id,
            locale,
          },
        });
        if (existing) continue;
        await prisma.userAccessGrant.create({
          data: {
            userId: user.id,
            target: parsed.target,
            capability: parsed.capability,
            scholarId: scholar.id,
            locale,
          },
        });
        created += 1;
      }
    }
    console.log(`Granted ${created} access row(s) to ${user.email}`);
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
