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

async function withGeneratedClientLock(lockPath, operation) {
  await fs.mkdir(path.dirname(lockPath), { recursive: true });
  const lock = await acquireLock(lockPath);

  try {
    return await operation();
  } finally {
    // Remove the lock while this process still owns its open handle. Closing
    // first creates a window where another process can acquire the same path
    // before this cleanup removes the new owner's lock.
    await fs.rm(lockPath, { force: true });
    await lock.close();
  }
}

module.exports = { withGeneratedClientLock };
