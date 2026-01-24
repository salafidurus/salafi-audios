FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

# ---------------------------------------------------------
# 1. Prune Stage: Slice the monorepo
# ---------------------------------------------------------
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
# Generates a partial monorepo in /app/out/json and /app/out/full
RUN turbo prune api --docker

# ---------------------------------------------------------
# 2. Builder Stage: Install deps & Build
# ---------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy lockfile and package.json's from the pruned slice
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install ALL dependencies (including devDeps for building)
RUN pnpm install --frozen-lockfile

# Copy full source code from the pruned slice
COPY --from=pruner /app/out/full/ .

# Generate Prisma Client (Critical for both API and Migrator)
RUN pnpm --filter=@sd/db prisma:generate

# Build the API
RUN pnpm build --filter=api...

# Prune to production-only deps (to save space in final image)
# We run this in a separate step so we can copy it cleanly later
RUN pnpm prune --prod --no-optional

# ---------------------------------------------------------
# 3. Target: Migrator (The solution to your 2nd request)
# ---------------------------------------------------------
FROM base AS migrator
WORKDIR /app

# Copy production node_modules (contains Prisma CLI)
COPY --from=builder /app/node_modules ./node_modules
# Copy DB package (contains schema.prisma and migrations folder)
COPY --from=builder /app/packages/db ./packages/db

# Set working directory to where schema.prisma usually lives
WORKDIR /app/packages/db

# Default command (can be overridden)
CMD ["pnpm", "prisma", "migrate", "deploy"]


# ---------------------------------------------------------
# 4. Target: Runner (The API)
# ---------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Copy Prisma Engines/Client (often located in node_modules or package folder)
COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules

CMD ["node", "apps/api/dist/main.js"]