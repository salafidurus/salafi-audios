#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f ./envs/.env.dev ] || { echo "Missing envs/.env.dev"; exit 2; }

set -a
. ./envs/.env.dev
set +a

docker compose -p salafi \
  -f docker-compose.base.yml \
  -f docker-compose.dev.yml \
  up -d
