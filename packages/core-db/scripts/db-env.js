/**
 * Minimal DB env validation for migration scripts.
 * Mirrors the schema in packages/util-ingest/src/env.ts without the zod dependency.
 */

/** @param {NodeJS.ProcessEnv} raw */
export function getDbEnv(raw = process.env) {
  const url = raw["DATABASE_URL"];
  if (!url) {
    throw new Error("Invalid DB environment variables:\nDATABASE_URL is required");
  }
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid DB environment variables:\nDATABASE_URL must be a valid URL");
  }
  return {
    DATABASE_URL: url,
    DIRECT_DB_URL: raw["DIRECT_DB_URL"],
    SHADOW_DATABASE_URL: raw["SHADOW_DATABASE_URL"],
  };
}
