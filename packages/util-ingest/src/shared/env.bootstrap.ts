import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

export function bootstrapEnv(baseDir = process.cwd()): void {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const envFiles = [".env", ".env.local", `.env.${nodeEnv}`, `.env.${nodeEnv}.local`];

  const protectedKeys = new Set(Object.keys(process.env));

  for (const envFile of envFiles) {
    const filePath = path.resolve(baseDir, envFile);
    if (!fs.existsSync(filePath)) continue;

    const parsed = dotenv.parse(fs.readFileSync(filePath));
    for (const [key, value] of Object.entries(parsed)) {
      if (protectedKeys.has(key)) continue;
      process.env[key] = value;
    }
  }
}
