/**
 * Database client setup for seeding
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDbEnvFiles } from "../load-db-env.js";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment files
loadDbEnvFiles(path.resolve(__dirname, "../.."));

const connectionString = process.env.DIRECT_DB_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_DB_URL must be set.");
}

// Media CDN base URL (defaults to placeholder for dev)
export const MEDIA_CDN_BASE_URL = process.env.MEDIA_CDN_BASE_URL ?? "https://placeholder.dev/audio";

// Create and export Prisma client
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
