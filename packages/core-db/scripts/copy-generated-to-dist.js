/* eslint-disable no-console */

const path = require("path");
const fs = require("fs/promises");
const {
  getGeneratedClientLockPath,
  withGeneratedClientLock,
} = require("./generated-client-lock.js");

async function copyGeneratedClient(pkgRoot) {
  const primarySrc = path.join(pkgRoot, "src", "generated", "primary");
  const analyticsSrc = path.join(pkgRoot, "src", "generated", "analytics");
  const generatedRoot = path.join(pkgRoot, "dist", "generated");
  const primaryDest = path.join(generatedRoot, "primary");
  const analyticsDest = path.join(generatedRoot, "analytics");

  await fs.rm(generatedRoot, { recursive: true, force: true });
  await fs.mkdir(generatedRoot, { recursive: true });
  await fs.cp(primarySrc, primaryDest, { recursive: true });
  await fs.cp(analyticsSrc, analyticsDest, { recursive: true });
}

async function main() {
  const pkgRoot = path.join(__dirname, "..");
  const lockPath = getGeneratedClientLockPath(pkgRoot);

  await withGeneratedClientLock(lockPath, () => copyGeneratedClient(pkgRoot));
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = { copyGeneratedClient };
