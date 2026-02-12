import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@sd/db/client";
import { getDbEnv } from "@sd/env/db";
import { parseArgs, resolveInputPath } from "../cli/ingest-cli";
import { parseContentDefinition } from "../schema/content-schema";
import { DryRunRollbackError } from "../core/errors";
import { runIngestion } from "../core/run-ingestion";

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = await resolveInputPath(args.filePath);
  const rawFile = await readFile(inputPath, "utf8");
  const parsedJson = JSON.parse(rawFile) as unknown;
  const definition = parseContentDefinition(parsedJson);

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
    const counters = await runIngestion(prisma, definition, {
      tag: args.tag,
      environment: args.environment,
      dryRun: args.dryRun,
      strictAudioUpload: args.strictAudioUpload,
      audioBaseDir: args.audioDir,
    });

    process.stdout.write(
      [
        `Ingestion complete (${args.dryRun ? "dry-run" : "applied"}).`,
        `source=${inputPath}`,
        `tag=${args.tag}`,
        `environment=${args.environment}`,
        `scholars=${counters.scholars}`,
        `collections=${counters.collections}`,
        `series=${counters.series}`,
        `lectures=${counters.lectures}`,
      ].join(" ") + "\n",
    );
  } catch (error) {
    if (error instanceof DryRunRollbackError) {
      process.stdout.write(`Dry-run succeeded. source=${inputPath} tag=${args.tag}\n`);
      return;
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`ingest-content failed: ${message}\n`);
  process.exitCode = 1;
});
