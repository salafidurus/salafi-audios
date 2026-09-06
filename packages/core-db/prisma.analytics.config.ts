import { defineConfig } from "prisma/config";

import { loadDbEnvFiles } from "./scripts/load-db-env.js";

loadDbEnvFiles(process.cwd());

const analyticsDatabaseUrl = process.env.ANALYTICS_DATABASE_URL;

if (!analyticsDatabaseUrl) {
  throw new Error("ANALYTICS_DATABASE_URL is required for analytics Prisma commands.");
}

export default defineConfig({
  schema: "prisma/analytics/schema.prisma",
  migrations: {
    path: "prisma/analytics/migrations",
  },
  datasource: {
    url: analyticsDatabaseUrl,
  },
});
