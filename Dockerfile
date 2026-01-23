FROM oven/bun:1.3.1 AS builder
WORKDIR /app

# Copy root package files
COPY package.json bun.lockb* turbo.json ./

# Copy package.json files for all workspaces (needed for dependency resolution)
COPY apps/web/package.json ./apps/web/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies (including workspace dependencies)
# Don't set NODE_ENV=production yet, we need devDependencies for build
RUN bun install --frozen-lockfile

# Copy all source files
COPY . .

# Build the web app
WORKDIR /app/apps/web
# Set NODE_ENV=production only for the build step
ENV NODE_ENV=production
# Set default env vars if not provided (can be overridden at build time)
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_APP_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build with verbose output to see errors
RUN set -x && bunx next build

FROM oven/bun:1.3.1 AS runner
WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000
CMD ["bun", "apps/web/server.js"]
