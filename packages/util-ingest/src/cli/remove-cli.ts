export type RemoveCliArgs = {
  tag: string;
  environment: string;
  dryRun: boolean;
  skipR2: boolean;
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

export function parseRemoveArgs(argv: string[]): RemoveCliArgs {
  const result: RemoveCliArgs = {
    tag: process.env.INGEST_TAG ?? "",
    environment: process.env.INGEST_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    dryRun: parseBooleanFlag(process.env.INGEST_DRY_RUN),
    skipR2: parseBooleanFlag(process.env.INGEST_SKIP_R2_DELETE),
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

    if (arg === "--dry-run") {
      result.dryRun = true;
      continue;
    }

    if (arg === "--skip-r2") {
      result.skipR2 = true;
    }
  }

  if (!result.tag.trim()) {
    throw new Error("Missing required --tag. Example: pnpm ingest:remove -- --tag phase-02-seed");
  }

  return result;
}
