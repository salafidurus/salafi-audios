const path = require("path");
const { spawn } = require("child_process");

const { copyGeneratedClient } = require("./copy-generated-to-dist.js");
const {
  getGeneratedClientLockPath,
  withGeneratedClientLock,
} = require("./generated-client-lock.js");

function runPrismaGenerate(pkgRoot) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      path.join(pkgRoot, "node_modules", ".bin", "prisma"),
      ["generate", "--schema=./prisma/schema.prisma", "--config=./prisma.config.ts"],
      { cwd: pkgRoot, stdio: "inherit" },
    );

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Prisma generation failed with ${signal ?? `exit code ${code}`}`));
    });
  });
}

async function main() {
  const pkgRoot = path.join(__dirname, "..");
  const lockPath = getGeneratedClientLockPath(pkgRoot);

  await withGeneratedClientLock(lockPath, async () => {
    await runPrismaGenerate(pkgRoot);
    await copyGeneratedClient(pkgRoot);
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

module.exports = { runPrismaGenerate };
