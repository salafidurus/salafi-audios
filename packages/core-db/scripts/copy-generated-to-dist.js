/* eslint-disable no-console */

const path = require("path");
const fs = require("fs/promises");
const {
  getGeneratedClientLockPath,
  withGeneratedClientLock,
} = require("./generated-client-lock.js");

async function copyGeneratedClient(pkgRoot) {
  const src = path.join(pkgRoot, "src", "generated", "prisma");
  const generatedRoot = path.join(pkgRoot, "dist", "generated");
  const dest = path.join(generatedRoot, "prisma");

  await fs.rm(generatedRoot, { recursive: true, force: true });
  await fs.mkdir(generatedRoot, { recursive: true });
  await fs.cp(src, dest, { recursive: true });
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
