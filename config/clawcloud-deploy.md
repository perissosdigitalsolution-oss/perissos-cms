# ClawCloud Deployment Configuration — Sprint 37
# Perissos CMS — Backoffice

## 1. Backoffice App (App Launchpad → Create App)

| Parameter | Value |
|-----------|-------|
| Application Name | `perissos-backoffice` |
| Image Type | Public |
| Image Name | `ghcr.io/perissosdigitalsolution-oss/backoffice:latest` |
| Usage Type | Fixed |
| Replicas | 1 |
| CPU | 1 Core |
| Memory | 1 GB |
| Container Port | 3000 |
| Public Access | ✅ Enabled |

### Environment Variables

```
DATABASE_URL=<SET_AFTER_DB_DEPLOY>
PAYLOAD_SECRET=<SET_AFTER_DB_DEPLOY>
NEXT_PUBLIC_CMS_URL=https://perissos-backoffice.clawcloud.run
CASDOOR_ENDPOINT=https://perissos-casdoor.clawcloud.run
CASDOOR_CLIENT_ID=perissos-backoffice
CASDOOR_CLIENT_SECRET=<generate-later>
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
S3_BUCKET=perissos-media
S3_ACCESS_KEY_ID=<r2-key>
S3_SECRET_ACCESS_KEY=<r2-secret>
NODE_ENV=production
```

### Health Check

| Parameter | Value |
|-----------|-------|
| Path | `/api/health` |
| Initial Delay | 30s |
| Interval | 30s |
| Timeout | 5s |
| Failure Threshold | 3 |

---

## 2. PostgreSQL Database (Database → Create Database)

| Parameter | Value |
|-----------|-------|
| Type | PostgreSQL |
| Version | postgresql-16 (or latest) |
| Name | `perissos-db` |
| CPU | 0.5 Core |
| Memory | 512 MB |
| Replicas | 1 |
| Storage | 3 Gi |
| Backup | Off |

### Connection Details (fill after deploy)

```
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/perissos-db
```

---

## 3. Casdoor (Phase 2 — Days 4-5)

| Parameter | Value |
|-----------|-------|
| Application Name | `perissos-casdoor` |
| Image Type | Public |
| Image Name | `casbin/casdoor:latest` |
| Usage Type | Fixed |
| Replicas | 1 |
| CPU | 0.5 Core |
| Memory | 512 MB |
| Container Port | 8000 |
| Public Access | ✅ Enabled |

### Environment Variables

```
driverName=postgres
dsn=postgresql://<user>:<pass>@<host>:<port>/casdoor?sslmode=disable
```

---

## 4. APISIX (Phase 2 — Days 4-5)

| Parameter | Value |
|-----------|-------|
| Application Name | `perissos-apisix` |
| Image Type | Public |
| Image Name | `apache/apisix:latest` |
| Usage Type | Fixed |
| Replicas | 1 |
| CPU | 0.5 Core |
| Memory | 512 MB |
| Container Port | 9080 |
| Public Access | ✅ Enabled |

---

## 5. Custom Domains (Phase 4 — Day 5)

| Service | ClawCloud Address | Custom Domain |
|---------|-------------------|---------------|
| Backoffice | `perissos-backoffice.clawcloud.run` | `cms.perissos.dev` |
| Casdoor | `perissos-casdoor.clawcloud.run` | `auth.perissos.dev` |
| APISIX | `perissos-apisix.clawcloud.run` | `api.perissos.dev` |

### DNS (Cloudflare)

```
cms.perissos.dev      CNAME  perissos-backoffice.clawcloud.run
auth.perissos.dev     CNAME  perissos-casdoor.clawcloud.run
api.perissos.dev      CNAME  perissos-apisix.clawcloud.run
```

---

## 6. Resource Budget

| Service | CPU | Memory | Est. Monthly |
|---------|-----|--------|-------------|
| Backoffice | 1 Core | 1 GB | ~$2.00 |
| PostgreSQL | 0.5 Core | 512 MB | ~$1.00 |
| Casdoor | 0.5 Core | 512 MB | ~$1.00 |
| APISIX | 0.5 Core | 512 MB | ~$0.50 |
| **Total** | **2.5 Core** | **2.5 GB** | **~$4.50/mo** |

Within $5 free budget. ✅

---

## 7. Critical Reminders

- ⚠️ **30-day inactivity**: Log into ClawCloud console at least once per month
- 🔐 **PAYLOAD_SECRET**: Set explicitly for persistence across restarts
- 🔄 **push: true**: Payload auto-creates schema on first boot
- 📋 **After first successful boot**: Set `push: false` to prevent schema drift

---

## 8. Execution Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Create ClawCloud account via GitHub | 🔲 |
| 2 | Deploy PostgreSQL database | 🔲 |
| 3 | Deploy backoffice app | 🔲 |
| 4 | Set DATABASE_URL + PAYLOAD_SECRET | 🔲 |
| 5 | Verify /api/health returns {"status":"ok"} | 🔲 |
| 6 | Verify /admin login works | 🔲 |
| 7 | Deploy Casdoor (Phase 2) | 🔲 |
| 8 | Deploy APISIX (Phase 2) | 🔲 |
| 9 | Configure custom domains | 🔲 |
| 10 | Set push:false after schema stable | 🔲 |
