# apps/backoffice/Dockerfile
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl postgresql-client curl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backoffice/package.json apps/backoffice/
COPY apps/frontend/package.json apps/frontend/
COPY apps/apisix/package.json apps/apisix/
COPY apps/casdoor/package.json apps/casdoor/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
COPY . .
RUN pnpm install && find /app -name "@payloadcms" -type d 2>&1 || echo "NO @payloadcms found" && find /app -name "@shadowmkj" -type d 2>&1 || echo "NO @shadowmkj found" && find /app -name ".pnpm" -type d 2>&1 || echo "NO .pnpm found" && cd apps/backoffice && pnpm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl postgresql-client curl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=768"
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backoffice/.next ./apps/backoffice/.next
COPY --from=builder /app/apps/backoffice/public ./apps/backoffice/public
COPY --from=builder /app/apps/backoffice/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --from=builder /app/apps/backoffice/package.json ./apps/backoffice/package.json
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "node_modules/.bin/next", "start"]