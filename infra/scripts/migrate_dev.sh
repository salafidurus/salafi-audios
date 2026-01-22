#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f ./envs/.env.dev ] || { echo "Missing envs/.env.dev"; exit 2; }

set -a
. ./envs/.env.dev
set +a

# Ensure dev db is up
./scripts/up_dev_db.sh

# Run prisma migrate deploy from a one-off node container
docker run --rm \
  --network salafi_salafi_net \
  -v "$(pwd)/..:/work" \
  -w /work/packages/db \
  -e DATABASE_URL="${DATABASE_URL}" \
  node:20-slim \
  bash -lc "corepack enable && pnpm -v >/dev/null 2>&1 || npm i -g pnpm && pnpm i --frozen-lockfile && pnpm prisma migrate deploy"
