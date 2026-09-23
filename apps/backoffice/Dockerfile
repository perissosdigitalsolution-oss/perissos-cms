# apps/backoffice/Dockerfile
# Multi-stage build for Payload CMS Backoffice

# ─── Base Stage ───────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl postgresql-client curl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backoffice/package.json apps/backoffice/
COPY apps/frontend/package.json apps/frontend/
COPY apps/apisix/package.json apps/apisix/
COPY apps/casdoor/package.json apps/casdoor/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile --shamefully-hoist

# ─── Builder ──────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app /app
COPY . .
WORKDIR /app/apps/backoffice
RUN pnpm run build

# ─── Runner (Production) ──────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=768"

# Copy production deps
COPY --from=deps /app/node_modules ./node_modules
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
CMD ["node", "node_modules/.bin/next", "start"]