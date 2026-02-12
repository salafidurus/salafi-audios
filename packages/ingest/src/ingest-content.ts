import { readFile } from "node:fs/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@sd/db/client";
import { parseArgs, resolveInputPath } from "./cli";
import { parseContentDefinition } from "./content-schema";
import { DryRunRollbackError } from "./errors";
import { runIngestion } from "./run-ingestion";

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = await resolveInputPath(args.filePath);
  const rawFile = await readFile(inputPath, "utf8");
  const parsedJson = JSON.parse(rawFile) as unknown;
  const definition = parseContentDefinition(parsedJson);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run content ingestion.");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });
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
