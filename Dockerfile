FROM oven/bun:1.3.1 AS builder
WORKDIR /app

COPY package.json bun.lockb* turbo.json ./
COPY apps/web/package.json ./apps/web/
RUN bun install --frozen-lockfile

COPY . .
WORKDIR /app/apps/web

# ❌ เปลี่ยนจาก turbopack -> ✅ build ปกติ
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
