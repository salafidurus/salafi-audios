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
  -e DATABASE_URL="${MIGRATE_DATABASE_URL}" \
  salafi-migrator:preview \
  pnpm prisma migrate deploy
