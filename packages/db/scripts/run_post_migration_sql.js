#!/usr/bin/env node
/* eslint-disable no-console */
// Node script to run post-migration SQL using 'pg' package when psql is not available
// Usage: NODE_ENV=production DATABASE_URL="postgresql://user:pass@host:5432/db" node run_post_migration_sql.js

import fs from "fs";
import { Client } from "pg";
import path from "path";

const SQL_FILE = path.resolve(
  new URL(".", import.meta.url).pathname,
  "../prisma/migrations_sql/000_post_migration.sql",
);

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");

  const sql = fs.readFileSync(SQL_FILE, "utf8");
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    console.log("Running post-migration SQL...");
    await client.query("BEGIN");
    // split on \n; careful: we just send the entire SQL; pg supports multiple statements
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Post-migration SQL applied");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error applying post-migration SQL:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
