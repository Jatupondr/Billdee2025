FROM oven/bun:1.3.1 AS builder
WORKDIR /app

# Copy workspace configs
COPY package.json bun.lockb* turbo.json ./

# Copy workspace package.json files (needed for dependency resolution)
COPY apps/web/package.json ./apps/web/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

WORKDIR /app/apps/web

# ✅ ตั้งค่า ENV และ ARG ก่อน build
ARG NEXT_PUBLIC_API_URL=https://api.billdee.net/api
ARG NEXT_PUBLIC_APP_URL=https://billdee.net
ARG NEXT_PUBLIC_WEB_URL=https://billdee.net
ARG AUTH_URL=https://billdee.net/auth

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_WEB_URL=${NEXT_PUBLIC_WEB_URL}
ENV AUTH_URL=${AUTH_URL}
ENV NODE_ENV=production

# ✅ Build Next.js app
RUN bun run build

# ---------------------------------------------
FROM oven/bun:1.3.1 AS runner
WORKDIR /app

# Copy from builder
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# ✅ Runtime ENV
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_URL=https://api.billdee.net/api
ENV NEXT_PUBLIC_APP_URL=https://billdee.net
ENV NEXT_PUBLIC_WEB_URL=https://billdee.net
ENV AUTH_URL=https://billdee.net/auth

EXPOSE 3000
CMD ["bun", "apps/web/server.js"]
