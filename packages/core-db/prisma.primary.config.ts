import { defineConfig } from "prisma/config";

import { loadDbEnvFiles } from "./scripts/load-db-env.js";

loadDbEnvFiles(process.cwd());

const directDbUrl = process.env.PRIMARY_DIRECT_DATABASE_URL ?? process.env.PRIMARY_DATABASE_URL;

if (!directDbUrl) {
  throw new Error(
    "PRIMARY_DIRECT_DATABASE_URL or PRIMARY_DATABASE_URL is required and no DB fallback is allowed.",
  );
}

export default defineConfig({
  schema: "prisma/primary/schema.prisma",
  migrations: {
    path: "prisma/primary/migrations",
  },
  datasource: {
    url: directDbUrl,
  },
});
