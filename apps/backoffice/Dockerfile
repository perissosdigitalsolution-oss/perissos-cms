# apps/backoffice/Dockerfile
# Multi-stage build for Payload CMS Backoffice

# ─── Base Stage ───────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl postgresql-client curl
WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backoffice/package.json apps/backoffice/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate \
    && pnpm install --frozen-lockfile

# ─── Builder: deploy standalone backoffice ────────────────
FROM base AS builder
COPY --from=deps /app /app
COPY . .
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate \
    && pnpm deploy --filter=backoffice --prod /app/backoffice-deploy
WORKDIR /app/backoffice-deploy
RUN pnpm run build

# ─── Runner (Production) ──────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=768"

# Copy standalone deployment from builder
COPY --from=builder /app/backoffice-deploy ./

# Copy built app from builder
COPY --from=builder /app/backoffice-deploy/.next ./.next
COPY --from=builder /app/backoffice-deploy/public ./public
COPY --from=builder /app/apps/backoffice/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh && mkdir -p ./public/images

# Create non-root user and fix ownership
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]