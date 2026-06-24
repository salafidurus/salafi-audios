import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDbEnv } from "./db-env.js";
import { loadDbEnvFiles } from "./load-db-env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDbEnvFiles(path.resolve(__dirname, ".."));

function runPnpm(args) {
  const r = spawnSync("pnpm", args, { stdio: "inherit", env: process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function autoName() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `auto-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

getDbEnv(process.env);

const name = autoName();

runPnpm(["run", "prisma:format"]);
runPnpm(["run", "prisma:validate"]);
runPnpm([
  "exec",
  "prisma",
  "migrate",
  "dev",
  "--create-only",
  "--name",
  name,
  "--schema=./prisma/schema.prisma",
  "--config=./prisma.config.ts",
]);
