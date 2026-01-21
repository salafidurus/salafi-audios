# apps/api/Dockerfile
# Builder: install dependencies, generate prisma client, build app
FROM node:20-slim AS builder
WORKDIR /usr/src/app

# Use corepack/pnpm if you use pnpm; adapt if you use npm/yarn
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only package manifests first for caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json for packages used in build to improve caching
COPY packages/db/package.json ./packages/db/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install dependencies (workspace-aware)
RUN pnpm install --frozen-lockfile

# Copy the rest of the repo
COPY . .

# Generate Prisma client for packages/db (this step benefits from caching)
WORKDIR /usr/src/app/packages/db
RUN pnpm prisma:generate

# Build the API
WORKDIR /usr/src/app/apps/api
RUN pnpm build

# Final runtime image
FROM node:20-slim AS runner
WORKDIR /usr/src/app

# Copy runtime files: compiled js and node_modules (only needed modules)
# Note: distroless can't run node: copy the binaries produced by builder
COPY --from=builder /usr/src/app/apps/api/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Keep prisma client & schema so migrations can refer to it
COPY --from=builder /usr/src/app/packages/db/prisma ./packages/db/prisma

ENV NODE_ENV=production
# The process will run the compiled file; adjust if your start command differs
CMD ["dist/main.js"]
