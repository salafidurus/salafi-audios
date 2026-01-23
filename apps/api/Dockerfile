# apps/api/Dockerfile
FROM node:20-slim AS builder
WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json ./packages/db/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile

COPY . .

WORKDIR /usr/src/app/packages/db
RUN pnpm prisma:generate

WORKDIR /usr/src/app/apps/api
RUN pnpm build


FROM node:20-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

# Copy manifests needed to install prod deps for api (workspace aware)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json

# Install only production deps (workspace aware)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built output
COPY --from=builder /usr/src/app/apps/api/dist ./dist

# If your runtime needs prisma files at runtime (often yes)
COPY --from=builder /usr/src/app/packages/db/prisma ./packages/db/prisma
# If your app imports generated prisma client from packages/db, copy it too:
COPY --from=builder /usr/src/app/packages/db/node_modules/.prisma ./packages/db/node_modules/.prisma
COPY --from=builder /usr/src/app/packages/db/node_modules/@prisma ./packages/db/node_modules/@prisma

CMD ["node", "dist/main.js"]
