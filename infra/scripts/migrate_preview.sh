#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f ./envs/.env.preview ] || { echo "Missing envs/.env.preview"; exit 2; }

set -a
. ./envs/.env.preview
set +a

# Ensure preview stack (and network) is up before running migrations
./scripts/deploy_preview.sh

docker run --rm \
  --network salafi_salafi_net \
  -v "$(pwd)/..:/work" \
  -w /work/packages/db \
  -e DATABASE_URL="${DATABASE_URL}" \
  node:20-slim \
  bash -lc "corepack enable && pnpm -v >/dev/null 2>&1 || npm i -g pnpm && pnpm i --frozen-lockfile && pnpm prisma migrate deploy"
