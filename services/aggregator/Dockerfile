FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json tsconfig.base.json ./

# Copy aggregator package
COPY services/aggregator/package.json ./services/aggregator/
COPY services/aggregator/tsconfig.json ./services/aggregator/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY services/aggregator/src ./services/aggregator/src

# Build
WORKDIR /app/services/aggregator
RUN pnpm build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/services/aggregator/dist ./dist
COPY --from=base /app/services/aggregator/package.json ./
COPY --from=base /app/node_modules ./node_modules

EXPOSE 4100

CMD ["node", "dist/server.js"]

