# Root Dockerfile - Multi-stage build for the entire monorepo
# Usage: docker build -t perissos-cms .

# ─── Base Stage ───────────────────────────────────────────
FROM node:20-alpine AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# ─── Install Dependencies ─────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backoffice/package.json apps/backoffice/
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
RUN pnpm install --frozen-lockfile

# ─── Build Stage ──────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm turbo build --filter=backoffice --filter=frontend

# ─── Backoffice Production Image ──────────────────────────
FROM base AS backoffice
WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/apps/backoffice/.next/standalone ./
COPY --from=builder /app/apps/backoffice/.next/static ./.next/static
COPY --from=builder /app/apps/backoffice/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backoffice/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Use the standalone server
CMD ["node", "server.js"]

# ─── Frontend Production Image (Static) ───────────────────
FROM nginx:alpine AS frontend
COPY --from=builder /app/apps/frontend/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
