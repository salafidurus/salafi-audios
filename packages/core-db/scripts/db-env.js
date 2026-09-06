/**
 * Minimal DB env validation for migration scripts.
 */

/** @param {NodeJS.ProcessEnv} raw */
export function getDbEnv(raw = process.env, role = "primary") {
  const prefix = role === "analytics" ? "ANALYTICS" : "PRIMARY";
  const url = raw[`${prefix}_DATABASE_URL`];
  if (!url) {
    throw new Error(`Invalid DB environment variables:\n${prefix}_DATABASE_URL is required`);
  }
  try {
    new URL(url);
  } catch {
    throw new Error(
      `Invalid DB environment variables:\n${prefix}_DATABASE_URL must be a valid URL`,
    );
  }
  return {
    [`${prefix}_DATABASE_URL`]: url,
    [`${prefix}_DIRECT_DATABASE_URL`]: raw[`${prefix}_DIRECT_DATABASE_URL`],
    [`${prefix}_SHADOW_DATABASE_URL`]: raw[`${prefix}_SHADOW_DATABASE_URL`],
  };
}
