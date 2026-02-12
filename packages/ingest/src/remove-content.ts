import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@sd/db/client";
import { parseRemoveArgs } from "./remove-cli";
import { runRemoval } from "./run-removal";

async function main(): Promise<void> {
  const args = parseRemoveArgs(process.argv.slice(2));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run content removal.");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();

  try {
    const counters = await runRemoval(prisma, {
      tag: args.tag,
      environment: args.environment,
      dryRun: args.dryRun,
      skipR2: args.skipR2,
    });

    process.stdout.write(
      [
        `Removal complete (${args.dryRun ? "dry-run" : "applied"}).`,
        `tag=${args.tag}`,
        `environment=${args.environment}`,
        `scholars=${counters.scholars}`,
        `collections=${counters.collections}`,
        `series=${counters.series}`,
        `lectures=${counters.lectures}`,
        `audioAssets=${counters.audioAssets}`,
        `topics=${counters.topics}`,
        `r2Keys=${counters.r2Keys}`,
      ].join(" ") + "\n",
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`remove-content failed: ${message}\n`);
  process.exitCode = 1;
});
