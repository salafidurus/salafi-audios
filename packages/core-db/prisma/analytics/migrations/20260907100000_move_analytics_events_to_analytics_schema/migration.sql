-- Keep the analytics archive isolated by PostgreSQL namespace when the archive
-- shares a physical database with the primary application database.
CREATE SCHEMA IF NOT EXISTS "analytics";

ALTER TABLE IF EXISTS "public"."analytics_events"
  SET SCHEMA "analytics";
