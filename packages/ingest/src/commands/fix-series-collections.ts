import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Status } from "@sd/db";
import { getDbEnv } from "@sd/env";
import { DryRunRollbackError } from "../core/errors";
import { bootstrapEnv } from "../shared/env.bootstrap";

bootstrapEnv();

const DEFAULT_PREFIXES = [
  "shAbadSB",
  "shBnBazSB",
  "shFahdFiqhMuyassar",
  "shArafatUmdah",
  "shArafatManhajSalikin",
  "shUthayminTafsir",
  "shUthayminSahihMuslim",
];

type FixArgs = {
  tag: string;
  environment: string;
  dryRun: boolean;
  prefixes: string[];
};

type SeriesRecord = {
  id: string;
  slug: string;
  title: string;
  status: Status;
  language: string | null;
  deletedAt: Date | null;
  scholarId: string;
  scholar: {
    slug: string;
    name: string;
  };
  lectures: {
    status: Status;
    durationSeconds: number | null;
    deletedAt: Date | null;
  }[];
};

type FixCounters = {
  groups: number;
  collectionsCreated: number;
  collectionsUpdated: number;
  seriesUpdated: number;
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

function parsePrefixes(input?: string): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function parseArgs(argv: string[]): FixArgs {
  const result: FixArgs = {
    tag: process.env.INGEST_TAG ?? "",
    environment: process.env.INGEST_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    dryRun: parseBooleanFlag(process.env.INGEST_DRY_RUN),
    prefixes: [...DEFAULT_PREFIXES],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg) continue;

    if (arg === "--tag" || arg.startsWith("--tag=")) {
      const { value, nextIndex } = readFlagValue(arg, argv, index);
      if (value) result.tag = value;
      index = nextIndex;
      continue;
    }

    if (arg === "--environment" || arg.startsWith("--environment=")) {
      const { value, nextIndex } = readFlagValue(arg, argv, index);
      if (value) result.environment = value;
      index = nextIndex;
      continue;
    }

    if (arg === "--prefixes" || arg.startsWith("--prefixes=")) {
      const { value, nextIndex } = readFlagValue(arg, argv, index);
      const prefixes = parsePrefixes(value);
      if (prefixes.length > 0) result.prefixes = prefixes;
      index = nextIndex;
      continue;
    }

    if (arg === "--prefix" || arg.startsWith("--prefix=")) {
      const { value, nextIndex } = readFlagValue(arg, argv, index);
      const prefixes = parsePrefixes(value);
      if (prefixes.length > 0) result.prefixes = prefixes;
      index = nextIndex;
      continue;
    }

    if (arg === "--dry-run") {
      result.dryRun = true;
    }
  }

  if (!result.tag.trim()) {
    throw new Error(
      "Missing required --tag. Example: pnpm --filter @sd/ingest fix:series-collections -- --tag phase-02-series-fix",
    );
  }

  if (result.prefixes.length === 0) {
    throw new Error("No prefixes provided. Pass --prefixes or remove the flag to use defaults.");
  }

  return result;
}

function tokenizeTitle(title: string): string[] {
  return title
    .trim()
    .replace(/[–—]/g, "-")
    .split(/[\s:-]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
}

function findCommonPrefix(titles: string[]): string | null {
  const tokenized = titles.map((title) => tokenizeTitle(title));
  if (tokenized.length === 0) return null;

  const minLength = Math.min(...tokenized.map((words) => words.length));
  const common: string[] = [];

  for (let index = 0; index < minLength; index += 1) {
    const word = tokenized[0][index];
    if (!word) break;
    const lower = word.toLowerCase();
    const allMatch = tokenized.every((words) => words[index]?.toLowerCase() === lower);
    if (!allMatch) break;
    common.push(word);
  }

  if (common.length >= 2) {
    return common.join(" ");
  }

  for (let length = 4; length >= 2; length -= 1) {
    const counts = new Map<string, { count: number; sample: string }>();
    for (const words of tokenized) {
      if (words.length < length) continue;
      const sample = words.slice(0, length).join(" ");
      const key = sample.toLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, { count: 1, sample });
      }
    }

    let best: { count: number; sample: string } | null = null;
    for (const entry of counts.values()) {
      if (!best || entry.count > best.count) {
        best = entry;
      }
    }

    if (best && best.count >= 2) {
      return best.sample;
    }
  }

  return null;
}

function titleCaseFromSlug(slug: string): string {
  let spaced = slug.replace(/[_-]+/g, " ");
  spaced = spaced.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  spaced = spaced.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  spaced = spaced.replace(/([a-zA-Z])([0-9])/g, "$1 $2");
  spaced = spaced.replace(/([0-9])([a-zA-Z])/g, "$1 $2");

  return spaced
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => {
      if (word.toUpperCase() === word && word.length <= 4) return word;
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function resolveCollectionTitle(slug: string, titles: string[]): string {
  const common = findCommonPrefix(titles);
  if (common && common.trim().length >= 4) {
    return common.trim();
  }
  return titleCaseFromSlug(slug);
}

function resolveCollectionStatus(series: SeriesRecord[]): Status {
  const priorities: Record<Status, number> = {
    [Status.published]: 3,
    [Status.review]: 2,
    [Status.draft]: 1,
    [Status.archived]: 0,
  };

  let best: Status = Status.draft;
  let bestPriority = priorities[best];

  for (const item of series) {
    const priority = priorities[item.status] ?? 0;
    if (priority > bestPriority) {
      bestPriority = priority;
      best = item.status;
    }
  }

  return best;
}

function resolveCollectionLanguage(series: SeriesRecord[]): string | null {
  const counts = new Map<string, number>();
  for (const item of series) {
    if (!item.language) continue;
    counts.set(item.language, (counts.get(item.language) ?? 0) + 1);
  }

  let bestLanguage: string | null = null;
  let bestCount = 0;
  for (const [language, count] of counts.entries()) {
    if (count > bestCount) {
      bestLanguage = language;
      bestCount = count;
    }
  }

  return bestLanguage;
}

function computePublishedLectureAggregates(series: SeriesRecord[]): {
  publishedLectureCount: number;
  publishedDurationSeconds: number | null;
} {
  const lectures = series.flatMap((item) => item.lectures);
  const published = lectures.filter(
    (lecture) => lecture.status === Status.published && !lecture.deletedAt,
  );

  if (published.length === 0) {
    return { publishedLectureCount: 0, publishedDurationSeconds: 0 };
  }

  const durations = published.map((lecture) => lecture.durationSeconds);
  const hasAllDurations = durations.every(
    (value) => typeof value === "number" && Number.isFinite(value),
  );
  if (!hasAllDurations) {
    return { publishedLectureCount: published.length, publishedDurationSeconds: null };
  }

  const publishedDurationSeconds = durations.reduce<number>(
    (sum, value) => sum + (value as number),
    0,
  );
  return { publishedLectureCount: published.length, publishedDurationSeconds };
}

async function runFix(prisma: PrismaClient, args: FixArgs): Promise<FixCounters> {
  const counters: FixCounters = {
    groups: 0,
    collectionsCreated: 0,
    collectionsUpdated: 0,
    seriesUpdated: 0,
  };

  await prisma.$transaction(async (tx) => {
    const batch = await tx.ingestionBatch.upsert({
      where: {
        tag_environment: {
          tag: args.tag,
          environment: args.environment,
        },
      },
      create: {
        tag: args.tag,
        environment: args.environment,
      },
      update: {},
      select: { id: true },
    });

    for (const prefix of args.prefixes) {
      const seriesRecords = await tx.series.findMany({
        where: {
          slug: { startsWith: prefix },
        },
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          language: true,
          deletedAt: true,
          scholarId: true,
          scholar: {
            select: {
              slug: true,
              name: true,
            },
          },
          lectures: {
            select: {
              status: true,
              durationSeconds: true,
              deletedAt: true,
            },
          },
        },
      });

      if (seriesRecords.length === 0) {
        continue;
      }

      const grouped = new Map<string, SeriesRecord[]>();
      for (const record of seriesRecords) {
        const list = grouped.get(record.scholarId) ?? [];
        list.push(record);
        grouped.set(record.scholarId, list);
      }

      for (const [scholarId, series] of grouped.entries()) {
        counters.groups += 1;

        const activeSeries = series.some((item) => !item.deletedAt)
          ? series.filter((item) => !item.deletedAt)
          : series;
        const titles = activeSeries
          .map((item) => item.title)
          .filter((title) => title.trim().length > 0);
        const collectionTitle = resolveCollectionTitle(prefix, titles);
        const collectionStatus = resolveCollectionStatus(activeSeries);
        const collectionLanguage = resolveCollectionLanguage(activeSeries);
        const aggregates = computePublishedLectureAggregates(activeSeries);

        const existingCollection = await tx.collection.findUnique({
          where: {
            scholarId_slug: {
              scholarId,
              slug: prefix,
            },
          },
          select: { id: true },
        });

        let collectionId: string;
        if (existingCollection) {
          const updated = await tx.collection.update({
            where: { id: existingCollection.id },
            data: {
              title: collectionTitle,
              status: collectionStatus,
              language: collectionLanguage,
              publishedLectureCount: aggregates.publishedLectureCount,
              publishedDurationSeconds: aggregates.publishedDurationSeconds,
              ingestionBatchId: batch.id,
            },
            select: { id: true },
          });
          counters.collectionsUpdated += 1;
          collectionId = updated.id;
        } else {
          const created = await tx.collection.create({
            data: {
              scholarId,
              slug: prefix,
              title: collectionTitle,
              status: collectionStatus,
              language: collectionLanguage,
              publishedLectureCount: aggregates.publishedLectureCount,
              publishedDurationSeconds: aggregates.publishedDurationSeconds,
              ingestionBatchId: batch.id,
            },
            select: { id: true },
          });
          counters.collectionsCreated += 1;
          collectionId = created.id;
        }

        const updateResult = await tx.series.updateMany({
          where: {
            scholarId,
            slug: { startsWith: prefix },
          },
          data: {
            collectionId,
          },
        });
        counters.seriesUpdated += updateResult.count;
      }
    }

    if (args.dryRun) {
      throw new DryRunRollbackError("Dry-run rollback");
    }
  });

  return counters;
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
    const counters = await runFix(prisma, args);
    process.stdout.write(
      [
        `Series collection fix complete (${args.dryRun ? "dry-run" : "applied"}).`,
        `tag=${args.tag}`,
        `environment=${args.environment}`,
        `groups=${counters.groups}`,
        `collectionsCreated=${counters.collectionsCreated}`,
        `collectionsUpdated=${counters.collectionsUpdated}`,
        `seriesUpdated=${counters.seriesUpdated}`,
      ].join(" ") + "\n",
    );
  } catch (error) {
    if (error instanceof DryRunRollbackError) {
      process.stdout.write(`Dry-run succeeded. tag=${args.tag}\n`);
      return;
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`fix-series-collections failed: ${message}\n`);
  process.exitCode = 1;
});
