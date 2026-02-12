import "dotenv/config";
import { defineConfig } from "prisma/config";

const directDbUrl =
  process.env.DIRECT_DB_URL ?? "postgresql://postgres:postgres@localhost:5432/sd_ci?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: directDbUrl,
  },
});
