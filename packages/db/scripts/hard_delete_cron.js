#!/usr/bin/env node
/* eslint-disable no-console */
// packages/db/scripts/hard_delete_cron.js
// Run daily (or more frequently) to hard-delete soft-deleted content in bottom-up order.

import { Client } from "pg";

const DB = process.env.DATABASE_URL;
if (!DB) {
  console.error("DATABASE_URL not set");
  process.exit(2);
}

const client = new Client({ connectionString: DB });

async function run() {
  await client.connect();
  try {
    console.log("Starting hard-delete cron at", new Date().toISOString());

    // 1) delete lectures whose deleteAfterAt <= now()
    console.log("Deleting lectures...");
    await client.query(
      `DELETE FROM "Lecture" WHERE "deleteAfterAt" IS NOT NULL AND "deleteAfterAt" <= now()`,
    );

    // 2) delete series
    console.log("Deleting series...");
    await client.query(
      `DELETE FROM "Series" WHERE "deleteAfterAt" IS NOT NULL AND "deleteAfterAt" <= now()`,
    );

    // 3) delete collections
    console.log("Deleting collections...");
    await client.query(
      `DELETE FROM "Collection" WHERE "deleteAfterAt" IS NOT NULL AND "deleteAfterAt" <= now()`,
    );

    // Optionally: clean up orphaned topics / other cleanup as needed

    console.log("Hard-delete cron completed");
  } catch (err) {
    console.error("Hard-delete cron error", err);
  } finally {
    await client.end();
  }
}

run();
