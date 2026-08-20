# Perissos CMS — Start Stack Guide

## Quick Start

```bash
# Development (fast, HMR enabled) — recommended for daily work
docker compose --profile dev up -d

# Production (built Docker images) — for final testing
docker compose --profile prod up -d --build
```

## Services & Ports

| Service | Dev Port | Prod Port | URL | Purpose |
|---------|----------|-----------|-----|---------|
| **Backoffice** (Payload CMS) | 3000 | 3000 | `http://localhost:3000/admin` | CMS admin, API |
| **Frontend** (Next.js) | 3001 | 3001 | `http://localhost:3001` | Public website |
| **PostgreSQL** | 5432 | 5432 | `localhost:5432` | Database |
| **MinIO** (S3) | 9000/9001 | 9000/9001 | `http://localhost:9001` | Media storage |
| **pgAdmin** | 5050 | — | `http://localhost:5050` | DB admin UI |

### Credentials

- **Admin login**: `admin@perissos.dev` / `Admin123!@#`
- **PostgreSQL**: `perissos` / `perissos_dev_password` / `perissos_dev`
- **MinIO**: `perissos` / `perissos_minio_password`

---

## Profiles

The `docker-compose.yml` uses Docker Compose **profiles** to separate dev and prod:

| Profile | Containers | Behavior |
|---------|-----------|----------|
| `dev` | `backoffice-dev`, `frontend-dev`, `postgres`, `minio`, `minio-setup`, `pgadmin` | Source bind-mounted, `next dev` with HMR, no rebuild needed |
| `prod` | `backoffice`, `frontend`, `postgres`, `minio` | Pre-built Docker images, `next start`, production mode |
| *(none)* | `postgres`, `minio` | Infrastructure only |

### Switching between profiles

```bash
# Stop everything
docker compose --profile dev down
docker compose --profile prod down

# Start dev
docker compose --profile dev up -d

# Start prod (rebuild first if code changed)
docker compose --profile prod up -d --build
```

---

## First-Time Setup

### 1. Start infrastructure

```bash
docker compose --profile dev up -d postgres minio
```

Wait ~15 seconds for health checks, then start the rest.

### 2. Start full stack

```bash
docker compose --profile dev up -d
```

On **first run**, pnpm installs dependencies inside the containers (~3-4 minutes). Subsequent starts use cached `node_modules` volumes (~10 seconds).

### 3. Verify

```bash
curl http://localhost:3000/api/health   # Should return {"status":"ok"}
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001  # Should return 200
```

---

## Development Workflow

### How Dev Mode Works

- Source code is **bind-mounted** from your host into the containers
- `next dev` runs inside the container with **Hot Module Replacement (HMR)**
- Edit files on your host → changes appear in the browser instantly
- No Docker rebuild needed for code changes

### Volumes

| Volume | Purpose |
|--------|---------|
| `backoffice_node` | Persists `node_modules` across container restarts |
| `backoffice_next` | Persists `.next` build cache for faster startups |
| `frontend_node` | Same for frontend |
| `frontend_next` | Same for frontend |

### Reinstalling Dependencies

If `node_modules` gets corrupted or you update `pnpm-lock.yaml`:

```bash
docker compose --profile dev down
docker volume rm perissoscms_backoffice_node perissoscms_frontend_node
docker compose --profile dev up -d  # Will reinstall (~3-4 min first time)
```

---

## Local Development (without Docker)

For Payload admin development with faster compilation:

```bash
# Start only infrastructure
docker compose --profile dev up -d postgres minio

# Run backoffice locally
pnpm --filter backoffice dev

# Run frontend locally (in another terminal)
pnpm --filter frontend dev
```

This runs Next.js on your host machine (faster than Docker for heavy compilation).

---

## Useful Commands

```bash
# View logs
docker compose logs -f backoffice-dev    # Follow backoffice logs
docker compose logs frontend-dev         # Last 100 frontend lines
docker compose logs postgres             # Database logs

# Restart a single service
docker compose --profile dev up -d backoffice-dev

# Shell into a container
docker exec -it perissos-backoffice-dev sh
docker exec -it perissos-postgres psql -U perissos -d perissos_dev

# Full rebuild (clean start)
docker compose --profile dev down
docker volume rm perissoscms_backoffice_node perissoscms_backoffice_next \
                perissoscms_frontend_node perissoscms_frontend_next
docker compose --profile dev up -d --build

# Stop everything (including named volumes)
docker compose --profile dev down -v

# Run test suite (requires backoffice on port 3000)
pnpm test:ci
```

---

## Troubleshooting

### "Cannot find module" errors
```bash
docker volume rm perissoscms_backoffice_node
docker compose --profile dev up -d backoffice-dev
```

### Backoffice port 3000 not responding
```bash
# Check if container is running
docker ps | grep backoffice

# Check logs
docker logs perissos-backoffice-dev --tail 20

# Verify health
curl http://localhost:3000/api/health
```

### Frontend shows 404 on root `/`
This is expected — the root page is CMS-driven. Create a "Home" page in the backoffice admin (`/admin`) and it will render on the frontend.

### Database connection refused
```bash
# Check PostgreSQL is healthy
docker ps | grep postgres

# Reset database
docker compose --profile dev down -v
docker compose --profile dev up -d postgres
# Wait for health check, then start the rest
```

### MinIO bucket not created
The `minio-setup` container runs once at startup. If it fails:
```bash
docker compose --profile dev run --rm minio-setup
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Docker Network              │
│                                              │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL   │  │  MinIO (S3)          │  │
│  │  :5432        │  │  :9000 (API)         │  │
│  └──────┬───────┘  │  :9001 (Console)     │  │
│         │          └──────────┬───────────┘  │
│         │                     │              │
│  ┌──────┴─────────────────────┴───────────┐  │
│  │         Backoffice (Payload CMS)        │  │
│  │         :3000                            │  │
│  │  - Admin UI (/admin)                     │  │
│  │  - REST API (/api/*)                     │  │
│  │  - GraphQL (/api/graphql)                │  │
│  └──────────────────┬──────────────────────┘  │
│                     │                          │
│  ┌──────────────────┴──────────────────────┐  │
│  │         Frontend (Next.js)               │  │
│  │         :3001                            │  │
│  │  - Public website                        │  │
│  │  - Static export + client-side rendering │  │
│  └─────────────────────────────────────────┘  │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Service definitions, profiles, volumes |
| `apps/backoffice/Dockerfile` | Multi-stage backoffice build |
| `apps/frontend/Dockerfile` | Multi-stage frontend build |
| `apps/backoffice/scripts/docker-entrypoint.sh` | Health checks + startup |
| `apps/backoffice/next.config.mjs` | Next.js + Payload config |
| `apps/frontend/next.config.mjs` | Frontend Next.js config |
| `packages/shared/src/registry/sections.ts` | Section registry (16 types) |

---

## Notes

- **Dev mode uses bind mounts** — your local source code IS the code running in the container
- **`pnpm-lock.yaml` changes** require reinstalling node_modules in the container
- **Payload `push: false`** — schema changes require manual SQL or `payload generate:types`
- **Frontend is static export** — changes to pages require `pnpm --filter frontend build` or dev mode
- **MinIO bucket** must exist before media uploads work — `minio-setup` handles this automatically
