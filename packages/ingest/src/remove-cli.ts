export type RemoveCliArgs = {
  tag: string;
  environment: string;
  dryRun: boolean;
  skipR2: boolean;
};

function parseBooleanFlag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export function parseRemoveArgs(argv: string[]): RemoveCliArgs {
  const result: RemoveCliArgs = {
    tag: process.env.INGEST_TAG ?? "phase-02-seed",
    environment: process.env.INGEST_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
    dryRun: parseBooleanFlag(process.env.INGEST_DRY_RUN),
    skipR2: parseBooleanFlag(process.env.INGEST_SKIP_R2_DELETE),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg) continue;

    if (arg === "--tag") {
      const value = argv[index + 1];
      if (value) result.tag = value;
      index += 1;
      continue;
    }

    if (arg === "--environment") {
      const value = argv[index + 1];
      if (value) result.environment = value;
      index += 1;
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

  return result;
}
