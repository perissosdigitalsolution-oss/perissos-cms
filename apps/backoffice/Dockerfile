# apps/backoffice/Dockerfile
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl postgresql-client curl

WORKDIR /app

# Copy all package.json files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backoffice/package.json apps/backoffice/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/

# Install dependencies with shamefully-hoist for flat node_modules
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate \
    && pnpm install --frozen-lockfile --shamefully-hoist

# Copy source code
COPY . .

# Build backoffice
WORKDIR /app/apps/backoffice
RUN pnpm run build

# Production settings
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=768"

# Setup entrypoint
COPY apps/backoffice/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && mkdir -p ./public/images

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "--filter", "backoffice", "start"]