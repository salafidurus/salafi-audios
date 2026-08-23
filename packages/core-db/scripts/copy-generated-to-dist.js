/* eslint-disable no-console */

const path = require("path");
const fs = require("fs/promises");

const LOCK_RETRY_MS = 25;
const STALE_LOCK_MS = 60_000;

const sleep = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

async function acquireLock(lockPath) {
  while (true) {
    try {
      return await fs.open(lockPath, "wx");
    } catch (error) {
      if (error.code !== "EEXIST") throw error;

      try {
        const stats = await fs.stat(lockPath);
        if (Date.now() - stats.mtimeMs > STALE_LOCK_MS) {
          await fs.rm(lockPath, { force: true });
          continue;
        }
      } catch (statError) {
        if (statError.code !== "ENOENT") throw statError;
        continue;
      }

      await sleep(LOCK_RETRY_MS);
    }
  }
}

async function main() {
  const pkgRoot = path.join(__dirname, "..");

  const src = path.join(pkgRoot, "src", "generated", "prisma");
  const distRoot = path.join(pkgRoot, "dist");
  const generatedRoot = path.join(pkgRoot, "dist", "generated");
  const dest = path.join(generatedRoot, "prisma");
  const lockPath = path.join(distRoot, ".generated-prisma.lock");

  await fs.mkdir(distRoot, { recursive: true });
  const lock = await acquireLock(lockPath);

  try {
    await fs.rm(generatedRoot, { recursive: true, force: true });
    await fs.mkdir(generatedRoot, { recursive: true });
    await fs.cp(src, dest, { recursive: true });
  } finally {
    await lock.close();
    await fs.rm(lockPath, { force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
