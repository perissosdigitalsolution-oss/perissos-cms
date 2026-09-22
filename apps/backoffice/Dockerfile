# apps/backoffice/Dockerfile
# Multi-stage build for Payload CMS Backoffice

# ─── Base Stage ───────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl postgresql-client curl
WORKDIR /app

# ─── Dependencies: npm install with flat node_modules ───────
FROM base AS deps
COPY package.json ./
COPY apps/backoffice/package.json apps/backoffice/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
# Use npm for flat installation (works better with Next.js webpack)
RUN npm install --production=false

# ─── Builder ──────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/backoffice
RUN npm run build

# ─── Runner (Production) ──────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=768"

# Copy production node_modules (npm install --production)
COPY package.json ./
COPY apps/backoffice/package.json apps/backoffice/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN npm install --production

# Copy built app from builder
COPY --from=builder /app/apps/backoffice/.next ./apps/backoffice/.next
COPY --from=builder /app/apps/backoffice/public ./apps/backoffice/public
COPY --from=builder /app/apps/backoffice/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --from=builder /app/apps/backoffice/package.json ./apps/backoffice/package.json

RUN chmod +x /usr/local/bin/docker-entrypoint.sh && mkdir -p ./apps/backoffice/public/images

# Create non-root user and fix ownership
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "apps/backoffice/server.js"]