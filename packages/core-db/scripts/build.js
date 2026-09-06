const path = require("path");
const { spawn } = require("child_process");

const { copyGeneratedClient } = require("./copy-generated-to-dist.js");
const { runPrismaGenerate } = require("./generate-prisma.js");
const {
  getGeneratedClientLockPath,
  withGeneratedClientLock,
} = require("./generated-client-lock.js");

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} failed with ${signal ?? `exit code ${code}`}`));
    });
  });
}

async function main() {
  const pkgRoot = path.join(__dirname, "..");
  const lockPath = getGeneratedClientLockPath(pkgRoot);

  await withGeneratedClientLock(lockPath, async () => {
    await runPrismaGenerate(pkgRoot, "primary");
    await runPrismaGenerate(pkgRoot, "analytics");
    await runCommand(
      process.execPath,
      ["run", "tsup", "src/index.ts", "--format", "esm,cjs", "--out-dir", "dist"],
      pkgRoot,
    );
    await copyGeneratedClient(pkgRoot);
    await runCommand(process.execPath, ["run", "tsc", "-p", "tsconfig.build.json"], pkgRoot);
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
