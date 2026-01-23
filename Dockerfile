FROM oven/bun:1.3.1 AS builder
WORKDIR /app

# Copy root package files and lockfile
COPY package.json bun.lock* turbo.json ./

# Copy package.json files for all workspaces (needed for dependency resolution)
COPY apps/web/package.json ./apps/web/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies (including workspace dependencies)
# Bun installs devDependencies by default, no need for --production flag
RUN bun install --frozen-lockfile

# Copy all source files (using .dockerignore to exclude unnecessary files)
COPY . .

# Build the web app
WORKDIR /app/apps/web

# Set environment variables for build
ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_APP_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build Next.js app
RUN bunx next build

FROM oven/bun:1.3.1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone build output
COPY --from=builder --chown=bun:bun /app/apps/web/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=bun:bun /app/apps/web/public ./apps/web/public

EXPOSE 3000

# Use the standalone server.js
CMD ["bun", "apps/web/server.js"]
