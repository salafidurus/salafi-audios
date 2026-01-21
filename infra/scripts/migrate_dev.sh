#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f ./envs/.env.dev ]; then
  echo "Missing envs/.env.dev"
  exit 2
fi

export $(grep -v '^#' ./envs/.env.dev | xargs)

# If you prefer to run from a one-off container (safe when runtime image is minimal), uncomment below:
# docker run --rm \
#   --network $(docker network ls --filter name=salafi_net -q) \
#   -v /srv/salafi-durus/code:/work \
#   -w /work/packages/db \
#   -e DATABASE_URL="${DATABASE_URL}" \
#   node:20-slim \
#   bash -lc "npm ci --no-audit --no-fund && npx prisma migrate deploy --schema=./prisma/schema.prisma"

# otherwise try to run inside api container:
docker compose exec -T api \
  sh -lc "DATABASE_URL='${DATABASE_URL}' npx prisma migrate deploy --schema=/usr/src/app/packages/db/prisma/schema.prisma"
