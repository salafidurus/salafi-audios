#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="./envs/.env.preview"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE missing"
  exit 2
fi

# export envs so docker compose env substitutions work if used
set -a
. "$ENV_FILE"
set +a

# bring up services (db + others) but don't block on readiness
docker compose up -d

# wait for postgres_preview to accept connections
DB_SERVICE="postgres_preview"
DB_USER="${DB_USER:-${PREVIEW_DB_USER:-preview_user}}"
DB_NAME="${DB_NAME:-${PREVIEW_DB_NAME:-preview_db}}"
TIMEOUT=60
SLEEP=2
elapsed=0

echo "Waiting up to ${TIMEOUT}s for ${DB_SERVICE} to be ready..."
while ! docker compose exec -T "$DB_SERVICE" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
  elapsed=$((elapsed + SLEEP))
  if [ "$elapsed" -ge "$TIMEOUT" ]; then
    echo "ERROR: ${DB_SERVICE} not ready after ${TIMEOUT}s"
    docker compose logs --no-color --tail 100 "$DB_SERVICE" || true
    exit 3
  fi
  sleep "$SLEEP"
done

echo "${DB_SERVICE} is ready (after ${elapsed}s)."

# Now (re)build/start api
docker compose up -d --build api

echo "Deploy completed."
