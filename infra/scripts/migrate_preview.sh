#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f ./envs/.env.preview ] || { echo "Missing envs/.env.preview"; exit 2; }

set -a
. ./envs/.env.preview
set +a

# Ensure preview stack (and network) is up before running migrations
./scripts/deploy_preview.sh

# Use the docker network hostname for the preview DB service
MIGRATE_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_ENC}@postgres_preview:5432/${DB_NAME}"

docker run --rm \
  --network salafi_salafi_net \
  -v "$(pwd)/..:/work" \
  -w /work/packages/db \
  -e DATABASE_URL="${MIGRATE_DATABASE_URL}" \
  node:20-slim \
  bash -lc "apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && \
            corepack enable && (pnpm -v >/dev/null 2>&1 || npm i -g pnpm) && \
            pnpm i --frozen-lockfile && pnpm prisma migrate deploy"
