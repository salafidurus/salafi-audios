/* eslint-disable no-console */

const path = require("path");
const fs = require("fs/promises");

async function main() {
  const pkgRoot = path.join(__dirname, "..");

  const src = path.join(pkgRoot, "src", "generated", "prisma");
  const dest = path.join(pkgRoot, "dist", "generated", "prisma");

  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.rm(dest, { recursive: true, force: true });
  await fs.cp(src, dest, { recursive: true });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
