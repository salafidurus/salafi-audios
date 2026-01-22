#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f ./envs/.env.preview ] || { echo "Missing envs/.env.preview"; exit 2; }

set -a
. ./envs/.env.preview
set +a

docker compose -p salafi \
  -f docker-compose.base.yml \
  -f docker-compose.preview.yml \
  up -d --build
