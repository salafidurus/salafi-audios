#!/usr/bin/env bash
set -euo pipefail

# run from packages/db
# usage: ./apply_migrations.sh
# ensure DATABASE_URL env var is set, e.g. export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# 1) generate and apply Prisma migrations (production: use migrate deploy)
echo "Running prisma migrate deploy..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

# 2) run post-migration SQL for partial indexes, FTS, triggers
SQL_FILE="./prisma/migrations_sql/000_post_migration.sql"
if [ -f "$SQL_FILE" ]; then
  echo "Applying post-migration SQL: $SQL_FILE"
  # psql accepts a connection string in $DATABASE_URL
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL env var not set"
    exit 2
  fi
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL_FILE"
else
  echo "No post-migration SQL found at $SQL_FILE - skipping"
fi

echo "Migrations + post-migration SQL applied successfully."
