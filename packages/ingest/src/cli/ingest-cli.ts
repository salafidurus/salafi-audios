import { access } from "node:fs/promises";
import * as path from "node:path";

const DEFAULT_AUDIO_DIR = "packages/ingest/content/audio";

export type IngestCliArgs = {
  filePath?: string;
  tag: string;
  environment: string;
  dryRun: boolean;
  strictAudioUpload: boolean;
  audioDir?: string;
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

export function parseArgs(argv: string[]): IngestCliArgs {
  const result: IngestCliArgs = {
    filePath: undefined,
    tag: process.env.INGEST_TAG ?? "",
    environment: process.env.INGEST_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    dryRun: parseBooleanFlag(process.env.INGEST_DRY_RUN),
    strictAudioUpload: parseBooleanFlag(process.env.INGEST_STRICT_AUDIO_UPLOAD),
    audioDir: process.env.INGEST_AUDIO_DIR ?? DEFAULT_AUDIO_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg) continue;

    if (arg === "--file" || arg.startsWith("--file=")) {
      const { value, nextIndex } = readFlagValue(arg, argv, index);
      if (value) result.filePath = value;
      index = nextIndex;
      continue;
    }

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

    if (arg === "--dry-run") {
      result.dryRun = true;
      continue;
    }

    if (arg === "--strict-audio-upload") {
      result.strictAudioUpload = true;
      continue;
    }

    if (arg === "--audio-dir" || arg.startsWith("--audio-dir=")) {
      const { value, nextIndex } = readFlagValue(arg, argv, index);
      if (value) result.audioDir = value;
      index = nextIndex;
    }
  }

  if (!result.tag.trim()) {
    throw new Error("Missing required --tag. Example: pnpm ingest:content -- --tag phase-02-seed");
  }

  return result;
}

function resolveCandidateInputPaths(filePath?: string): string[] {
  if (filePath) {
    return [path.resolve(process.cwd(), filePath)];
  }

  return [
    path.resolve(process.cwd(), "content/phase-02-sample.json"),
    path.resolve(process.cwd(), "packages/ingest/content/phase-02-sample.json"),
  ];
}

export async function resolveInputPath(filePath?: string): Promise<string> {
  const candidates = resolveCandidateInputPaths(filePath);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error(`Could not find ingestion content file. Checked: ${candidates.join(", ")}`);
}
