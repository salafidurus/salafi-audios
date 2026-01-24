#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f ./envs/.env.preview ] || { echo "Missing envs/.env.preview"; exit 2; }

set -a
. ./envs/.env.preview
set +a

echo "Building Migrator Image..."
docker build \
  -f ../apps/api/Dockerfile \
  --target migrator \
  -t salafi-migrator:preview \
  ..

docker compose -p salafi \
  -f docker-compose.base.yml \
  -f docker-compose.preview.yml \
  -f docker-compose.caddy.preview.yml \
  up -d --build
