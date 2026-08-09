# syntax=docker/dockerfile:1
#
# SalafiDurus backend API — production Docker image.
#
# Coolify build settings (Build Pack: Dockerfile):
#   Base Directory:      /      (repo root, so `turbo prune` sees the whole monorepo)
#   Dockerfile Location: docker/api/Dockerfile
#   Port Exposes:        3000   (app defaults to this via ENV PORT below)
#   Port Mappings:       empty  (Coolify/Traefik route internally)
#
# All runtime env vars (DATABASE_URL, better-auth, OAuth, R2, CORS, ...) are
# injected by Coolify at runtime. Nothing secret is baked into this image and
# no .env file is copied in. Neon PostgreSQL, Cloudflare R2 and Redis run
# outside this container.

# ============================================================
# Stage 1: pruner
#   Uses Turborepo's prune to isolate the `api` workspace plus the
#   workspace packages it depends on (core-contracts / core-db / core-i18n)
#   and drop web/native/infra entirely. This is the repo's established
#   deployment strategy (scripts/deploy/* and docs/dev-ops.md §8).
# ============================================================
FROM oven/bun:1.3.14 AS pruner
WORKDIR /repo
COPY . .
# Pin Turbo to the repo's devDependency version (turbo.json v2).
RUN bunx turbo@2.10.5 prune api --docker

# ============================================================
# Stage 2: dependency install + build
# ============================================================
FROM oven/bun:1.3.14 AS builder
WORKDIR /app

# Build-time ONLY — never carried into the runtime image.
# prisma.config.ts (packages/core-db) refuses to run `prisma generate`
# without DIRECT_DB_URL or DATABASE_URL. Prisma 7 generation is OFFLINE
# (it does not connect to the database), so the value only needs to be
# non-empty — it is never used to connect and never reaches the runtime
# image. This is a deliberate, non-secret placeholder. Coolify can override
# it via build args only if you ever need generation to read a live schema.
ARG DIRECT_DB_URL="prisma-generate-offline-placeholder"
ARG DATABASE_URL="${DIRECT_DB_URL}"
ENV DIRECT_DB_URL="$DIRECT_DB_URL" DATABASE_URL="$DATABASE_URL"

# Install from pruned manifests + lockfile first (caching: source-code
# changes never force a full dependency reinstall).
COPY --from=pruner /repo/out/json/ ./

# Mirrors scripts/deploy/install.mjs:
#   - husky `prepare` fails without .git in the pruned context -> strip it.
#   - the pruned bun.lock carries stale workspace aliases -> reconcile once,
#     then install frozen.
#   - --ignore-scripts guarantees NO lifecycle/postinstall script runs during
#     the build (the only trusted dep, @sentry/cli, is a native/Expo-only dep
#     outside this closure). Nothing here needs a postinstall: the Prisma WASM
#     client is generated explicitly by the core-db build below.
RUN sed -i '/"prepare"[[:space:]]*:/d' package.json \
    && bun install --lockfile-only --ignore-scripts \
    && bun install --frozen-lockfile --ignore-scripts

# Overlay full pruned source, plus the root tsconfig files that turbo prune
# does NOT include but every package's tsconfig extends (../../tsconfig.*).
# Without these the packages are unable to build.
COPY --from=pruner /repo/out/full/ ./
# turbo prune does not emit the root tsconfig files that the workspaces extend.
COPY --from=pruner /repo/tsconfig.json /repo/tsconfig.base.json \
                   /repo/tsconfig.nest.json /repo/tsconfig.packages.json \
                   /repo/tsconfig.strict.json ./

# Strip husky `prepare` again (out/full re-adds it) so the runtime production
# install below cannot attempt it. Then build api + its workspace closure.
RUN sed -i '/"prepare"[[:space:]]*:/d' package.json \
    && bun run build --filter=api...

# Remove development node_modules and build caches before handing off.
# The runtime stage reinstalls only production dependencies.
RUN rm -rf node_modules apps/*/node_modules packages/*/node_modules \
       .turbo apps/*/.turbo packages/*/.turbo out .pruned-target \
    && find . -name '*.tsbuildinfo' -type f -delete

# ============================================================
# Stage 3: runtime (minimal, non-root, production only)
# ============================================================
FROM oven/bun:1.3.14 AS runtime

ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

# Copy the pruned workspace: api source (run directly by Bun), the built
# workspace packages (core-db dist incl. Prisma WASM client), manifests and
# lockfile. No node_modules here and no dev tooling.
COPY --from=builder /app/ ./

# Production-only dependencies, no lifecycle scripts (--ignore-scripts), so
# installs are fully deterministic and no postinstall touches the runtime
# node_modules. Bun skips install at container startup entirely; install
# happens here, during image build only.
RUN bun install --frozen-lockfile --production --ignore-scripts \
    && rm -rf .turbo apps/*/.turbo packages/*/.turbo \
    && bun pm cache rm

# Run as a non-root user (no privileged capabilities required).
# Uses uid 1000 directly so it works on any oven/bun variant (debian, slim,
# alpine, distroless) — no dependency on adduser/useradd or a shell. /app is
# owned by uid 1000 so Bun can treat it as a writable HOME if needed.
RUN chown -R 1000:1000 /app
USER 1000
ENV HOME=/app

EXPOSE 3000
WORKDIR /app/apps/api

# Production entrypoint — equivalent to `start:prod`
# (NODE_ENV is already production; binds 0.0.0.0 inside bootstrap).
CMD ["bun", "--bun", "src/main.ts"]