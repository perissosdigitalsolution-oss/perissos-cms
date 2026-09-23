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
COPY apps/casdoor/package.json apps/casdoor/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

# ─── Builder: pnpm deploy + copy source ───────────────────
FROM base AS builder
COPY --from=deps /app /app
COPY . .
COPY tsconfig.json ./
# Deploy backoffice as standalone with flat node_modules
RUN pnpm deploy --filter=backoffice --prod /app/backoffice-deploy
WORKDIR /app/backoffice-deploy
# Copy source code from the workspace (needed for build)
RUN cp -r /app/apps/backoffice/src ./src && \
    mkdir -p ./public && \
    cp /app/apps/backoffice/next.config.mjs ./next.config.mjs && \
    cp /app/tsconfig.json ./tsconfig.json && \
    cp -r /app/packages/shared/src ./node_modules/@perissos/shared/src && \
    cp -r /app/packages/ui/src ./node_modules/@perissos/ui/src
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
CMD ["node", "node_modules/.bin/next", "start"]