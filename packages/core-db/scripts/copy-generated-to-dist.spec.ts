import { afterEach, expect, it } from "bun:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const {
  getGeneratedClientLockPath,
  withGeneratedClientLock,
} = require("./generated-client-lock.js");

const temporaryDirectories: string[] = [];

it("keeps the generation lock outside dist so build cleanup cannot remove it", () => {
  const packageRoot = "/tmp/core-db-package";

  expect(getGeneratedClientLockPath(packageRoot)).toBe(join(packageRoot, ".generated-prisma.lock"));
});

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

it("serializes concurrent generated-client operations", async () => {
  const directory = await mkdtemp(join(tmpdir(), "core-db-lock-"));
  temporaryDirectories.push(directory);

  const lockPath = join(directory, ".generated-prisma.lock");
  let activeOperations = 0;
  let maximumActiveOperations = 0;

  const operations = Array.from({ length: 8 }, (_, index) =>
    withGeneratedClientLock(lockPath, async () => {
      activeOperations += 1;
      maximumActiveOperations = Math.max(maximumActiveOperations, activeOperations);
      await Bun.sleep(10);
      activeOperations -= 1;
      return index;
    }),
  );

  await expect(Promise.all(operations)).resolves.toEqual(
    Array.from({ length: 8 }, (_, index) => index),
  );
  expect(maximumActiveOperations).toBe(1);
});

it("generates and publishes the Prisma client", async () => {
  const packageRoot = join(import.meta.dir, "..");
  const generator = Bun.spawn([process.execPath, join(import.meta.dir, "generate-prisma.js")], {
    cwd: packageRoot,
    stderr: "pipe",
    stdout: "pipe",
  });

  expect(await generator.exited).toBe(0);

  const generatedClient = await readFile(
    join(packageRoot, "dist", "generated", "prisma", "client.js"),
    "utf8",
  );
  const generatedIndex = await readFile(
    join(packageRoot, "dist", "generated", "prisma", "index.js"),
    "utf8",
  );
  expect(generatedClient).toContain("require('.')");
  expect(generatedIndex).toContain("getPrismaClient");
});
