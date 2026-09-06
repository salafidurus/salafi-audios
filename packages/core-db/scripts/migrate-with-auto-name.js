import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getDbEnv } from "./db-env.js";
import { loadDbEnvFiles } from "./load-db-env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDbEnvFiles(path.resolve(__dirname, ".."));

function runBun(args) {
  const r = spawnSync("bun", args, { stdio: "inherit", env: process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function autoName() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `auto-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

const role = process.argv[2];
if (role !== "primary" && role !== "analytics") {
  throw new Error("A database role is required: primary or analytics");
}

getDbEnv(process.env, role);

const schemaPath = `./prisma/${role}/schema.prisma`;
const configPath = `./prisma.${role}.config.ts`;

const name = autoName();

runBun(["run", `${role}:prisma:format`]);
runBun(["run", `${role}:prisma:validate`]);
runBun([
  "x",
  "prisma",
  "migrate",
  "dev",
  "--create-only",
  "--name",
  name,
  `--schema=${schemaPath}`,
  `--config=${configPath}`,
]);
