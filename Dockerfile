FROM oven/bun:1.3.1 AS builder
WORKDIR /app

# Copy root package files
COPY package.json turbo.json ./

# Copy lockfile if exists (optional, will regenerate if needed)
COPY bun.lock* ./

# Copy all workspace package.json files
COPY apps/web/package.json ./apps/web/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Copy package source files (needed for workspace dependencies)
COPY packages ./packages

# Install dependencies
# Install without --frozen-lockfile to allow Bun to resolve workspace dependencies
RUN bun install

# Copy remaining source code
COPY apps ./apps

# Build Next.js
WORKDIR /app/apps/web

ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_APP_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build
RUN bun run build

FROM oven/bun:1.3.1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone output
COPY --from=builder --chown=bun:bun /app/apps/web/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=bun:bun /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["bun", "apps/web/server.js"]
