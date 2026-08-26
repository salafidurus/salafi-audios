/**
 * Database client setup for seeding
 */

import { PrismaPg } from "@prisma/adapter-pg";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "../../src/generated/prisma/client.js";
import { loadDbEnvFiles } from "../load-db-env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment files
loadDbEnvFiles(path.resolve(__dirname, "../.."));

const connectionString = process.env.DIRECT_DB_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_DB_URL must be set.");
}

// Create and export Prisma client
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
