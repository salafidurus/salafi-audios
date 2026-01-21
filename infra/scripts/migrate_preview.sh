#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# ensure env exists
if [ ! -f ./envs/.env.preview ]; then
  echo "Missing envs/.env.preview"
  exit 2
fi

# source envs (safely)
export $(grep -v '^#' ./envs/.env.preview | xargs)

# run migration inside api container (works if prisma is available inside image)
docker compose exec -T api \
  sh -lc "DATABASE_URL='${DATABASE_URL}' npx prisma migrate deploy --schema=/usr/src/app/packages/db/prisma/schema.prisma"
