import dotenv from "dotenv";

const nodeEnv = process.env.NODE_ENV ?? "development";

// Load local env files ONLY when not in production.
// In production/preview, the platform injects env vars.
if (nodeEnv !== "production") {
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".env.local", override: true });
  dotenv.config({ path: `.env.${nodeEnv}`, override: true });
  dotenv.config({ path: `.env.${nodeEnv}.local`, override: true });
}
