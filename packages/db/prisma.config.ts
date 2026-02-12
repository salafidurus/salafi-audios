import "dotenv/config";
import { defineConfig } from "prisma/config";

const directDbUrl = process.env.DIRECT_DB_URL ?? process.env.DATABASE_URL;

if (!directDbUrl) {
  throw new Error("DIRECT_DB_URL or DATABASE_URL is required and no DB fallback is allowed.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: directDbUrl,
  },
});
