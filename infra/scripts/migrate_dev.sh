#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f ./envs/.env.dev ] || { echo "Missing envs/.env.dev"; exit 2; }

set -a
. ./envs/.env.dev
set +a

# Ensure dev db is up
./scripts/up_dev_db.sh

# For migrations we must use the docker network DB host (postgres_dev) rather than localhost:5433.
# Build a DATABASE_URL usable from inside the docker network:
MIGRATE_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@postgres_dev:5432/${DB_NAME}"

docker run --rm \
  --network salafi_salafi_net \
  -v "$(pwd)/..:/work" \
  -w /work/packages/db \
  -e DATABASE_URL="${MIGRATE_DATABASE_URL}" \
  node:20-slim \
  bash -lc "apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && \
            corepack enable && (pnpm -v >/dev/null 2>&1 || npm i -g pnpm) && \
            pnpm i --frozen-lockfile && pnpm prisma migrate deploy"
