import { createReadStream } from "node:fs";
import { access, writeFile } from "node:fs/promises";
import * as path from "node:path";
import * as readline from "node:readline";

type CliArgs = {
  inputPath: string;
  outputPath: string;
  audioFile: string;
  preferredLanguage: string;
};

type CopyTable = {
  columns: string[];
  rows: string[][];
};

type CategoryRow = {
  category_id: string;
  name: string | null;
  created_at: string | null;
  order: string | null;
};

type ScholarRow = {
  short_name: string;
  name: string | null;
  image_url: string | null;
  bio: string | null;
  created_at: string | null;
  order: string | null;
};

type LectureRow = {
  lect_id: string;
  name: string | null;
  scholar_id: string | null;
  language: string | null;
  created_at: string | null;
  audio_url: string | null;
  total_audios: string | null;
};

type LectureCategoryRow = {
  lecture_id: string;
  category_id: string;
  created_at: string | null;
  order: string | null;
};

type ContentDefinition = {
  version: 1;
  topics: TopicDefinition[];
  scholars: ScholarDefinition[];
};

type TopicDefinition = {
  slug: string;
  name: string;
  parentSlug?: string;
};

type LectureDefinition = {
  slug: string;
  title: string;
  description?: string;
  language?: string;
  status: "published";
  publishedAt?: string;
  orderIndex?: number;
  topicSlugs: string[];
  audioAssets: AudioAssetDefinition[];
};

type SeriesDefinition = {
  slug: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  status: "published";
  orderIndex?: number;
  topicSlugs: string[];
  lectures: LectureDefinition[];
};

type CollectionDefinition = {
  slug: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  status: "published";
  orderIndex?: number;
  topicSlugs: string[];
  series: SeriesDefinition[];
};

type ScholarDefinition = {
  slug: string;
  name: string;
  bio?: string;
  country?: string;
  mainLanguage?: string;
  imageUrl?: string;
  isActive: boolean;
  collections: CollectionDefinition[];
  series: SeriesDefinition[];
  lectures: LectureDefinition[];
};

type AudioAssetDefinition = {
  file: string;
  format?: string;
  isPrimary?: boolean;
};

const DEFAULT_INPUT_PATH = "../../.assets/supabase/supabase.backup";
const DEFAULT_OUTPUT_PATH = "content/supabase-import.json";
const DEFAULT_AUDIO_FILE = "content/audio/al-uthaymin/usul-thalatha/01.mp3";
const DEFAULT_PREFERRED_LANGUAGE = "en";
const NULL_TOKEN = `${String.fromCharCode(92)}N`;

function parseArgs(argv: string[]): CliArgs {
  const result: CliArgs = {
    inputPath: DEFAULT_INPUT_PATH,
    outputPath: DEFAULT_OUTPUT_PATH,
    audioFile: DEFAULT_AUDIO_FILE,
    preferredLanguage: DEFAULT_PREFERRED_LANGUAGE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg) continue;

    if (arg === "--input" || arg.startsWith("--input=")) {
      const value = readFlagValue(arg, argv, index);
      if (value) result.inputPath = value;
      if (arg === "--input") index += 1;
      continue;
    }

    if (arg === "--output" || arg.startsWith("--output=")) {
      const value = readFlagValue(arg, argv, index);
      if (value) result.outputPath = value;
      if (arg === "--output") index += 1;
      continue;
    }

    if (arg === "--audio-file" || arg.startsWith("--audio-file=")) {
      const value = readFlagValue(arg, argv, index);
      if (value) result.audioFile = value;
      if (arg === "--audio-file") index += 1;
      continue;
    }

    if (arg === "--prefer-language" || arg.startsWith("--prefer-language=")) {
      const value = readFlagValue(arg, argv, index);
      if (value) result.preferredLanguage = value;
      if (arg === "--prefer-language") index += 1;
    }
  }

  return result;
}

function readFlagValue(arg: string, argv: string[], index: number): string | undefined {
  const equalIndex = arg.indexOf("=");
  if (equalIndex > -1) {
    return arg.slice(equalIndex + 1);
  }

  return argv[index + 1];
}

function parseCopyLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\t") {
      fields.push(current);
      current = "";
      continue;
    }

    if (char === "\\") {
      index += 1;
      const next = line[index];
      if (next === undefined) break;
      switch (next) {
        case "t":
          current += "\t";
          break;
        case "n":
          current += "\n";
          break;
        case "r":
          current += "\r";
          break;
        case "b":
          current += "\b";
          break;
        case "f":
          current += "\f";
          break;
        case "v":
          current += "\v";
          break;
        case "\\":
          current += "\\";
          break;
        default:
          current += next;
          break;
      }
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function normalizeCopyValue(value: string | undefined): string | null {
  if (!value || value === NULL_TOKEN) return null;
  return value;
}

function parseJson(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function pickName(value: string | null, preferredLanguage: string): string {
  const parsed = parseJson(value);
  if (!parsed) return "Untitled";

  const preferred = parsed[preferredLanguage];
  if (typeof preferred === "string" && preferred.trim()) return preferred.trim();

  const en = parsed.en;
  if (typeof en === "string" && en.trim()) return en.trim();

  const ar = parsed.ar;
  if (typeof ar === "string" && ar.trim()) return ar.trim();

  const firstValue = Object.values(parsed).find((entry) => typeof entry === "string");
  if (typeof firstValue === "string" && firstValue.trim()) return firstValue.trim();

  return "Untitled";
}

function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}

function normalizeSlug(value: string | null, fallback: string): string {
  if (!value || !value.trim()) return fallback;
  return value.trim();
}

function normalizeUrl(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (!parsed.protocol || parsed.protocol === "about:") return undefined;
    return trimmed;
  } catch {
    return undefined;
  }
}

function normalizeTimestamp(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.replace(" ", "T").replace(/\+00$/, "+00:00");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function buildAudioAsset(filePath: string): AudioAssetDefinition {
  const extension = path.extname(filePath).replace(".", "").toLowerCase();
  return {
    file: filePath,
    format: extension || undefined,
    isPrimary: true,
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function stripNumbers(value: string): string {
  return value.replace(/\d+/g, "").replace(/\s+/g, " ").trim();
}

async function readCopyTables(inputPath: string): Promise<Map<string, CopyTable>> {
  const targetTables = new Set(["categories", "lectures", "lectures_categories", "scholars"]);
  const tables = new Map<string, CopyTable>();

  const stream = createReadStream(inputPath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let activeTable: string | null = null;
  let activeColumns: string[] = [];

  for await (const line of rl) {
    if (!activeTable) {
      const match = line.match(/^COPY\s+public\.(\w+)\s+\(([^)]+)\)\s+FROM stdin;$/);
      if (match) {
        const tableName = match[1];
        if (tableName && targetTables.has(tableName)) {
          activeTable = tableName;
          activeColumns = match[2]?.split(",").map((col) => col.trim()) ?? [];
          tables.set(tableName, { columns: activeColumns, rows: [] });
        }
      }
      continue;
    }

    if (line === "\\.") {
      activeTable = null;
      activeColumns = [];
      continue;
    }

    const table = tables.get(activeTable);
    if (!table) continue;
    const fields = parseCopyLine(line);
    table.rows.push(fields);
  }

  return tables;
}

function mapCategories(table: CopyTable | undefined, preferredLanguage: string): TopicDefinition[] {
  if (!table) return [];

  return table.rows.map((row) => {
    const record = Object.fromEntries(
      table.columns.map((column, index) => [column, normalizeCopyValue(row[index])]),
    ) as CategoryRow;

    return {
      slug: normalizeSlug(record.category_id, "category"),
      name: pickName(record.name, preferredLanguage),
    };
  });
}

function mapLectureCategories(table: CopyTable | undefined): Map<string, string[]> {
  const mapping = new Map<string, string[]>();
  if (!table) return mapping;

  for (const row of table.rows) {
    const record = Object.fromEntries(
      table.columns.map((column, index) => [column, normalizeCopyValue(row[index])]),
    ) as LectureCategoryRow;

    const lectureId = normalizeSlug(record.lecture_id, "");
    const categoryId = normalizeSlug(record.category_id, "");
    if (!lectureId || !categoryId) continue;

    const current = mapping.get(lectureId) ?? [];
    if (!current.includes(categoryId)) {
      current.push(categoryId);
    }
    mapping.set(lectureId, current);
  }

  return mapping;
}

function mapScholars(
  table: CopyTable | undefined,
  preferredLanguage: string,
): Map<string, ScholarDefinition> {
  const mapping = new Map<string, ScholarDefinition>();
  if (!table) return mapping;

  for (const row of table.rows) {
    const record = Object.fromEntries(
      table.columns.map((column, index) => [column, normalizeCopyValue(row[index])]),
    ) as ScholarRow;

    const slug = normalizeSlug(record.short_name, "scholar");
    const name = pickName(record.name, preferredLanguage);

    mapping.set(slug, {
      slug,
      name,
      bio: record.bio ?? undefined,
      imageUrl: normalizeUrl(record.image_url),
      isActive: true,
      collections: [],
      series: [],
      lectures: [],
    });
  }

  return mapping;
}

function mapLectures(
  table: CopyTable | undefined,
  lectureTopics: Map<string, string[]>,
  scholars: Map<string, ScholarDefinition>,
  preferredLanguage: string,
  audioFile: string,
): void {
  if (!table) return;

  const seriesIndexByScholar = new Map<string, number>();
  const lectureIndexByScholar = new Map<string, number>();
  const collectionIndexByScholar = new Map<string, number>();
  const collectionsByScholar = new Map<string, Map<string, CollectionDefinition>>();
  const groupedBaseByLectureId = new Map<string, string>();

  for (const row of table.rows) {
    const record = Object.fromEntries(
      table.columns.map((column, index) => [column, normalizeCopyValue(row[index])]),
    ) as LectureRow;

    const scholarSlug = normalizeSlug(record.scholar_id, "unknown-scholar");
    const lectureId = normalizeSlug(record.lect_id, "lecture");
    const lectureTitle = pickName(record.name, preferredLanguage);
    const baseKey = stripNumbers(lectureTitle || lectureId) || lectureId;
    const normalizedBase = slugify(baseKey);
    const groupKey = `${scholarSlug}::${normalizedBase}`;

    const existing = groupedBaseByLectureId.get(lectureId);
    if (!existing) {
      groupedBaseByLectureId.set(lectureId, groupKey);
    }
  }

  const groupCounts = new Map<string, number>();
  for (const groupKey of groupedBaseByLectureId.values()) {
    groupCounts.set(groupKey, (groupCounts.get(groupKey) ?? 0) + 1);
  }

  for (const row of table.rows) {
    const record = Object.fromEntries(
      table.columns.map((column, index) => [column, normalizeCopyValue(row[index])]),
    ) as LectureRow;

    const scholarSlug = normalizeSlug(record.scholar_id, "unknown-scholar");
    const lectureId = normalizeSlug(record.lect_id, "lecture");
    const lectureTitle = pickName(record.name, preferredLanguage);
    const language = record.language ?? undefined;
    const publishedAt = normalizeTimestamp(record.created_at);
    const lectureCount = Math.max(1, toNumber(record.total_audios) ?? 1);
    const topicSlugs = lectureTopics.get(lectureId) ?? [];
    const baseKey = stripNumbers(lectureTitle || lectureId) || lectureId;
    const normalizedBase = slugify(baseKey);
    const groupKey = `${scholarSlug}::${normalizedBase}`;
    const isGrouped = (groupCounts.get(groupKey) ?? 0) > 1;

    const scholar = scholars.get(scholarSlug) ?? {
      slug: scholarSlug,
      name: scholarSlug,
      isActive: true,
      collections: [],
      series: [],
      lectures: [],
    };

    if (!scholars.has(scholarSlug)) {
      scholars.set(scholarSlug, scholar);
    }

    const shouldBeSeries = lectureCount > 1 || isGrouped;

    if (!shouldBeSeries) {
      const lectureIndex = (lectureIndexByScholar.get(scholarSlug) ?? 0) + 1;
      lectureIndexByScholar.set(scholarSlug, lectureIndex);

      scholar.lectures.push({
        slug: lectureId,
        title: lectureTitle,
        language,
        status: "published",
        publishedAt,
        orderIndex: lectureIndex,
        topicSlugs,
        audioAssets: [buildAudioAsset(audioFile)],
      });
      continue;
    }

    const currentSeriesIndex = seriesIndexByScholar.get(scholarSlug) ?? 0;
    seriesIndexByScholar.set(scholarSlug, currentSeriesIndex + 1);

    const seriesSlug = lectureId;
    const series: SeriesDefinition = {
      slug: seriesSlug,
      title: lectureTitle,
      language,
      status: "published",
      orderIndex: currentSeriesIndex + 1,
      topicSlugs,
      lectures: [],
    };

    for (let index = 1; index <= lectureCount; index += 1) {
      const suffix = lectureCount === 1 ? "" : `-${String(index).padStart(2, "0")}`;
      const slug = `${seriesSlug}${suffix}`;
      const title = lectureCount === 1 ? lectureTitle : `${lectureTitle} ${index}`;

      series.lectures.push({
        slug,
        title,
        language,
        status: "published",
        publishedAt,
        orderIndex: index,
        topicSlugs,
        audioAssets: [buildAudioAsset(audioFile)],
      });
    }

    if (isGrouped) {
      let scholarCollections = collectionsByScholar.get(scholarSlug);
      if (!scholarCollections) {
        scholarCollections = new Map();
        collectionsByScholar.set(scholarSlug, scholarCollections);
      }

      let collection = scholarCollections.get(normalizedBase);
      if (!collection) {
        const collectionIndex = (collectionIndexByScholar.get(scholarSlug) ?? 0) + 1;
        collectionIndexByScholar.set(scholarSlug, collectionIndex);

        const collectionSlug = normalizedBase || `${scholarSlug}-collection-${collectionIndex}`;
        collection = {
          slug: collectionSlug,
          title: baseKey || lectureTitle,
          status: "published",
          orderIndex: collectionIndex,
          topicSlugs,
          series: [],
        };
        scholar.collections.push(collection);
        scholarCollections.set(normalizedBase, collection);
      }

      collection.series.push(series);
    } else {
      scholar.series.push(series);
    }
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  await access(path.resolve(process.cwd(), args.inputPath));
  await access(path.resolve(process.cwd(), args.audioFile));

  const tables = await readCopyTables(args.inputPath);
  const topics = mapCategories(tables.get("categories"), args.preferredLanguage);
  const lectureTopics = mapLectureCategories(tables.get("lectures_categories"));
  const scholars = mapScholars(tables.get("scholars"), args.preferredLanguage);

  mapLectures(
    tables.get("lectures"),
    lectureTopics,
    scholars,
    args.preferredLanguage,
    args.audioFile,
  );

  const content: ContentDefinition = {
    version: 1,
    topics,
    scholars: Array.from(scholars.values()),
  };

  const outputPath = path.resolve(process.cwd(), args.outputPath);
  await writeFile(outputPath, JSON.stringify(content, null, 2) + "\n", "utf8");

  process.stdout.write(
    [
      "Supabase conversion complete.",
      `input=${args.inputPath}`,
      `output=${args.outputPath}`,
      `scholars=${content.scholars.length}`,
      `topics=${content.topics.length}`,
    ].join(" ") + "\n",
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`convert-supabase failed: ${message}\n`);
  process.exitCode = 1;
});
