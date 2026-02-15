import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@sd/db";
import { getDbEnv } from "@sd/env";
import { DryRunRollbackError } from "../core/errors";
import { bootstrapEnv } from "../shared/env.bootstrap";

bootstrapEnv();

type FixArgs = {
  dryRun: boolean;
  collectionCount: number;
  seriesCount: number;
};

type RecommendationKind = "collection" | "series";

type RecommendationRow = {
  id: string;
  entityKind: RecommendationKind;
  entityId: string;
  headline: string;
  orderIndex: number;
};

function parseBooleanFlag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function readFlagValue(
  arg: string,
  argv: string[],
  index: number,
): { value?: string; nextIndex: number } {
  const equalIndex = arg.indexOf("=");
  if (equalIndex > -1) {
    return { value: arg.slice(equalIndex + 1), nextIndex: index };
  }

  return { value: argv[index + 1], nextIndex: index + 1 };
}

function parseArgs(argv: string[]): FixArgs {
  const result: FixArgs = {
    dryRun: parseBooleanFlag(process.env.INGEST_DRY_RUN),
    collectionCount: 5,
    seriesCount: 15,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg) continue;

    if (arg === "--collections" || arg.startsWith("--collections=")) {
      const { value, nextIndex } = readFlagValue(arg, argv, index);
      if (value) result.collectionCount = Number(value);
      index = nextIndex;
      continue;
    }

    if (arg === "--series" || arg.startsWith("--series=")) {
      const { value, nextIndex } = readFlagValue(arg, argv, index);
      if (value) result.seriesCount = Number(value);
      index = nextIndex;
      continue;
    }

    if (arg === "--dry-run") {
      result.dryRun = true;
    }
  }

  if (!Number.isFinite(result.collectionCount) || result.collectionCount <= 0) {
    throw new Error("--collections must be a positive number.");
  }

  if (!Number.isFinite(result.seriesCount) || result.seriesCount <= 0) {
    throw new Error("--series must be a positive number.");
  }

  return result;
}

async function fetchRandomCollections(
  prisma: Prisma.TransactionClient,
  count: number,
): Promise<{ id: string; title: string }[]> {
  return prisma.$queryRaw<
    { id: string; title: string }[]
  >`SELECT id, title FROM "Collection" ORDER BY random() LIMIT ${count}`;
}

async function fetchRandomStandaloneSeries(
  prisma: Prisma.TransactionClient,
  count: number,
): Promise<{ id: string; title: string }[]> {
  return prisma.$queryRaw<
    { id: string; title: string }[]
  >`SELECT id, title FROM "Series" WHERE "collectionId" IS NULL ORDER BY random() LIMIT ${count}`;
}

function buildRecommendations(
  collections: { id: string; title: string }[],
  series: { id: string; title: string }[],
): RecommendationRow[] {
  const rows: RecommendationRow[] = [];
  let orderIndex = 0;

  for (const collection of collections) {
    rows.push({
      id: randomUUID(),
      entityKind: "collection",
      entityId: collection.id,
      headline: collection.title,
      orderIndex,
    });
    orderIndex += 1;
  }

  for (const entry of series) {
    rows.push({
      id: randomUUID(),
      entityKind: "series",
      entityId: entry.id,
      headline: entry.title,
      orderIndex,
    });
    orderIndex += 1;
  }

  return rows;
}

async function runFix(prisma: PrismaClient, args: FixArgs): Promise<number> {
  let inserted = 0;

  await prisma.$transaction(async (tx) => {
    const collections = await fetchRandomCollections(tx, args.collectionCount);
    const series = await fetchRandomStandaloneSeries(tx, args.seriesCount);
    const rows = buildRecommendations(collections, series);

    if (rows.length === 0) {
      return;
    }

    const tupleValues = rows.map(
      (row) => Prisma.sql`(${row.entityKind}::"AnalyticsContentKind", ${row.entityId})`,
    );
    const existing = await tx.$queryRaw<{ entityKind: RecommendationKind; entityId: string }[]>(
      Prisma.sql`SELECT "entityKind", "entityId" FROM "RecommendationHero" WHERE ("entityKind", "entityId") IN (${Prisma.join(
        tupleValues,
      )})`,
    );

    const existingKeys = new Set(
      existing.map(
        (row: { entityKind: RecommendationKind; entityId: string }) =>
          `${row.entityKind}:${row.entityId}`,
      ),
    );
    const newRows = rows.filter((row) => !existingKeys.has(`${row.entityKind}:${row.entityId}`));

    if (newRows.length > 0) {
      const insertValues = newRows.map(
        (row) =>
          Prisma.sql`(${row.id}, ${row.entityKind}::"AnalyticsContentKind", ${row.entityId}, ${row.headline}, ${row.orderIndex}, true)`,
      );
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO "RecommendationHero" ("id", "entityKind", "entityId", "headline", "orderIndex", "isActive") VALUES ${Prisma.join(
          insertValues,
        )}`,
      );
      inserted = newRows.length;
    }

    if (args.dryRun) {
      throw new DryRunRollbackError("Dry-run rollback");
    }
  });

  return inserted;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const { DATABASE_URL: databaseUrl } = getDbEnv({
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL ?? process.env.DIRECT_DB_URL,
  });

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({
    adapter,
    transactionOptions: {
      maxWait: 20_000,
      timeout: 300_000,
    },
  });

  await prisma.$connect();

  try {
    const inserted = await runFix(prisma, args);
    process.stdout.write(
      [
        `RecommendationHero ingest complete (${args.dryRun ? "dry-run" : "applied"}).`,
        `collections=${args.collectionCount}`,
        `series=${args.seriesCount}`,
        `inserted=${inserted}`,
      ].join(" ") + "\n",
    );
  } catch (error) {
    if (error instanceof DryRunRollbackError) {
      process.stdout.write("Dry-run succeeded.\n");
      return;
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`fix-recommendation-hero failed: ${message}\n`);
  process.exitCode = 1;
});
