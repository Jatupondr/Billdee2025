FROM oven/bun:1.3.1 AS builder
WORKDIR /app

# Copy root package files
COPY package.json bun.lockb* turbo.json ./

# Copy package.json files for workspaces (needed for dependency resolution)
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install all dependencies (including workspace dependencies)
RUN bun install --frozen-lockfile

# Copy all source files
COPY . .

# Build the web app
WORKDIR /app/apps/web
RUN bunx next build

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
