# apps/frontend/Dockerfile
# Multi-stage build for Next.js static export frontend

# ─── Base Stage ───────────────────────────────────────────
FROM node:20-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

# ─── Builder ──────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_CMS_URL=http://localhost:3000
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
RUN pnpm turbo build --filter=frontend

# ─── Runner (Nginx for static files) ──────────────────────
FROM nginx:alpine AS runner

RUN apk add --no-cache curl

# Copy built static files
COPY --from=builder /app/apps/frontend/out /usr/share/nginx/html

# Copy nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY --from=builder /app/apps/frontend/scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
