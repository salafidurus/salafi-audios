import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDbEnv } from "@sd/env/db";
import { loadDbEnvFiles } from "./load-db-env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDbEnvFiles(path.resolve(__dirname, ".."));

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", env: process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function autoName() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `auto-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

getDbEnv(process.env);

const name = autoName();

run("pnpm", ["run", "prisma:format"]);
run("pnpm", ["run", "prisma:validate"]);
run("pnpm", [
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
