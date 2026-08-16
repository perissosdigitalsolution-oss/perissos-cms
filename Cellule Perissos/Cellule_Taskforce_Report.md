# Cellule Perissos — Taskforce Report
## Vision, Architecture & Sprint Roadmap

**Version:** 1.0  
**Date:** 2026-08-13  
**Classification:** Internal — Agent Onboarding Reference  
**Maintained by:** Agentic Orchestration Layer

> **New Agent?** Start with `AGENTS.md` in the project root for a quick overview of governance, roles, and the DTAP lifecycle.

---

## 1. Vision Statement

**Perissos CMS** is a **single-tenant, WordPress-style theme system** built on **Payload 3.x + Next.js 15** that enables:

- **One-click ZIP template import** — drag & drop a ZIP → live site in seconds
- **Non-technical admin UI** — Payload's native admin, zero custom code for content editors
- **Default templates pre-installed** — ships with production-ready templates (Digital Agency, SaaS, Portfolio, etc.)
- **Per-client template activation** — one active template per installation, instant frontend rebuild
- **Headless frontend** — Next.js static export to Cloudflare Pages, zero runtime dependency on CMS

**Core Philosophy:** *Payload is the CMS. Next.js is the frontend. The bridge is a clean API contract. No magic. No lock-in.*

---

## 2. Current Architecture (v0.9 — "Foundation Complete")

### 2.1 Stack
| Layer | Technology | Version | Hosting |
|-------|------------|---------|---------|
| CMS (Backoffice) | Payload CMS | 3.88.0 | Vercel (prod) / Docker (local) |
| Frontend | Next.js (App Router) | 15.5.23 | Cloudflare Pages (static export) |
| Database | PostgreSQL | 16 | Neon (prod) / Docker (local) |
| Media Storage | S3-compatible | — | Cloudflare R2 (prod) / MinIO (local) |
| Auth | Payload JWT (HttpOnly cookies) | — | Same-origin CSRF |
| CI/CD | GitHub Actions + pnpm turbo | — | — |

### 2.2 Repository Structure (Monorepo — pnpm + Turborepo)
```
/Users/apple/Desktop/Perissos CMS/
├── apps/
│   ├── backoffice/          # Payload CMS + custom admin components
│   │   ├── src/
│   │   │   ├── app/(payload)/       # Payload admin route group
│   │   │   │   ├── layout.tsx       # RootLayout + importMap + custom.scss
│   │   │   │   ├── admin/importMap.js  # Manual importMap (webpack RSC fix)
│   │   │   │   └── custom.scss      # Payload admin overrides
│   │   │   ├── collections/         # Payload collections
│   │   │   │   ├── Templates.ts     # Template collection (core)
│   │   │   │   ├── Media.ts         # Media (images, PDFs, ZIPs)
│   │   │   │   ├── Pages.ts         # Page builder
│   │   │   │   ├── BlogArticles.ts  # Blog
│   │   │   │   ├── Users.ts         # Users & roles
│   │   │   │   ├── Activities.ts    # Audit log
│   │   │   │   ├── ClientSettings.ts# Per-client config
│   │   │   │   └── Subscriptions.ts # Billing
│   │   │   ├── templates/           # Custom admin views
│   │   │   │   └── TemplateList.tsx # **Table-based list view (Payload-native)**
│   │   │   ├── app/api/             # Custom REST endpoints
│   │   │   │   ├── templates/import-zip/route.ts  # ZIP import
│   │   │   │   ├── templates/[id]/route.ts        # Activate/Delete
│   │   │   │   └── health/route.ts                # Health check
│   │   │   └── payload.config.ts    # Payload config
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── frontend/              # Next.js static export
│       ├── src/
│       │   ├── app/(marketing)/page.tsx   # Active template renderer
│       │   ├── components/sections/       # Section components (Hero, Features, etc.)
│       │   └── lib/api.ts                 # CMS API client
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── ui/                    # Shared React components (Tailwind/glass-morphism)
│   │   ├── src/components/    # Card, Button, Input, Textarea
│   │   └── package.json
│   ├── shared/                # TypeScript types, utilities
│   │   ├── src/
│   │   │   ├── types.ts       # Template, Section, LayoutConfig types
│   │   │   └── utils.ts       # cn(), helpers
│   │   └── package.json
│   └── payload-config/        # Shared Payload config (future)
│
├── template/                  # Static HTML mockups (Digital Agency, etc.)
├── Cellule Perissos/          # Blueprint docs + 12 agent role definitions
├── docker-compose.yml         # Local stack
├── turbo.json                 # Turborepo config
├── pnpm-workspace.yaml
└── package.json               # Root scripts (test:ci, build, typecheck)
```

### 2.3 Key Collections (Payload)

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| **Templates** | Theme management | `name`, `description`, `previewImage`, `layoutConfig` (JSON), `zipFile`, `isActive`, `version`, `category` |
| **Media** | Asset storage | S3/R2 upload, supports `image/*`, `application/pdf`, `application/zip` |
| **Pages** | Page builder | Flexible layout via `layoutConfig` sections |
| **BlogArticles** | Blog | Rich text (Lexical), categories, SEO |
| **ClientSettings** | Per-install config | Site name, logo, colors, domain, analytics |
| **Users** | Auth & RBAC | `role: admin|editor|viewer`, JWT cookies |
| **Activities** | Audit log | Auto-tracked create/update/delete |
| **Subscriptions** | Billing | Stripe integration |

### 2.4 Critical Technical Decisions (Hard-Won)

| Issue | Root Cause | Resolution |
|-------|------------|------------|
| **Missing `PAYLOAD_SECRET` in Next.js** | Turbo 2.x strips undeclared env vars | `docker-compose.yml`: backoffice command = `["pnpm", "--filter", "backoffice", "run", "dev"]` (bypasses turbo) |
| **Payload CLI `generate:importmap` broken (Node 20)** | `@payloadcms/richtext-lexical` top-level await → `ERR_REQUIRE_ASYNC_MODULE` | Manual `importMap.js` with `@/` alias; `next dev` auto-regenerates on compile |
| **Webpack RSC loader error on relative importMap paths** | `./TemplateList` → webpack resolves as external | Use alias: `@/templates/TemplateList#TemplateList` |
| **Hydration error: `<html>` child of `<body>`** | `(payload)/layout.tsx` wrapped RootLayout in named component | Export `RootLayout` function directly |
| **Frontend `NEXT_PUBLIC_CMS_URL` not baked at build** | Docker ARG not passed to Next.js build | `Dockerfile`: `ARG NEXT_PUBLIC_CMS_URL` → `ENV NEXT_PUBLIC_CMS_URL=${NEXT_PUBLIC_CMS_URL}` |
| **Shared package typecheck fails** | Missing `@types/node` | `pnpm add -D -w @types/node` |

---

## 3. Completed Sprints

### Sprint 0 — Infrastructure & Local Stack (Week 1)
- [x] Docker Compose: Postgres 16, MinIO, pgAdmin, backoffice, frontend, nginx
- [x] Payload 3.x + Next.js 15 monorepo setup (pnpm + Turborepo)
- [x] Database schema + migrations
- [x] MinIO S3-compatible media storage
- [x] Admin user: `admin@perissos.dev` / `Admin123!@#`

### Sprint 1 — Core CMS Collections (Week 2)
- [x] Templates collection with `afterChange` deactivation hook
- [x] Media collection (images, PDFs, ZIPs)
- [x] Pages, BlogArticles, ClientSettings, Users, Activities, Subscriptions
- [x] Access control (RBAC: admin/editor/viewer)

### Sprint 2 — Template Import Pipeline (Week 3)
- [x] `/api/templates/import-zip` — AdmZip extraction
- [x] Auto-generates `layoutConfig` from HTML heuristics
- [x] Uploads preview + ZIP to Media collection
- [x] Creates Template doc via Payload Local API
- [x] JWT cookie auth + CSRF protection

### Sprint 3 — Custom Admin UI (Week 4)
- [x] TemplateList custom list view (card grid → **table-based Payload-native**)
- [x] Drag-drop ZIP upload with progress state
- [x] Activate/Delete actions with confirmation
- [x] Payload CSS variables throughout (`--theme-elevation-*`, `--base`, `--gutter-h`, etc.)
- [x] ImportMap alias fix (`@/templates/TemplateList#TemplateList`)

### Sprint 4 — Frontend Renderer (Week 5)
- [x] Next.js static export to Cloudflare Pages
- [x] `page.tsx` fetches active template from `NEXT_PUBLIC_CMS_URL/api/templates`
- [x] Section components: Hero, Features, Testimonials, Pricing, CTA
- [x] HTML prop injection for dynamic content
- [x] Docker build arg for `NEXT_PUBLIC_CMS_URL`

### Sprint 5 — Quality Gates & CI (Week 6)
- [x] Typecheck: `pnpm typecheck` (4/4 workspaces)
- [x] Build: `pnpm build` (backoffice + frontend)
- [x] API smoke tests: `scripts/test-api.mjs` (health, auth, CRUD, import, activate)
- [x] CI pipeline: `pnpm test:ci` = typecheck → build → test:api
- [x] All containers healthy, verified endpoints

---

## 4. Active Sprint

### Sprint 7 — Page Builder & Visual Editor (Week 9-11) — **COMPLETE**
**Goal:** Enable non-technical users to build pages visually via drag-drop block editor in Payload admin, with live preview and section registry from `packages/ui`

| Deliverable | Status | Owner |
|-------------|--------|-------|
| Block-Based Page Builder (Payload Blocks field) | ✅ Complete | backend-lead |
| Section Registry (packages/shared) | ✅ Complete | frontend-lead |
| Visual Drag-Drop Editor (admin custom component) | ✅ Complete | frontend-lead + ui-lead |
| Live Preview (iframe in admin sidebar) | ⏳ Pending (Sprint 8) | frontend-lead |
| Section Props Schema → Auto Form Fields | ✅ Complete | backend-lead |
| Section Components Migration (packages/ui) | ✅ Complete | frontend-lead |
| Sprint Governance Artifacts | ✅ Complete | project-shepherd |
| Inline Frontend Editing Mode | ✅ Complete | frontend-lead |
| SectionEditor Bug Fix | ✅ Complete | frontend-lead |
| Frontend Integration Tests (Puppeteer) | ✅ Complete | frontend-lead |
| SectionEditor Array/Image Support | ✅ Complete | frontend-lead |
| Edit Toolbar Header Fix | ✅ Complete | frontend-lead |
| Image Replacement for Icons | ✅ Complete | frontend-lead |
| Global Theme Panel (Colors/Fonts) | ✅ Complete | frontend-lead |

**Tasks:**
1. ✅ Design section registry schema (Zod) + TypeScript types
2. ✅ Migrate 10 section components to `packages/ui/src/sections/`
3. ✅ Add `blocks` field to Pages collection
4. ✅ Build PageBuilderEditor admin component (drag-drop palette + canvas)
5. ⏳ Build LivePreview iframe component with auth (Sprint 8)
6. ✅ Auto-generate Payload field config from section schemas
7. ⏳ E2E tests for editor + preview flow (Sprint 8)
8. ✅ Build inline frontend editing mode (EditToolbar + SectionEditor)
9. ✅ Fix SectionEditor data loading bug — bulletproof prop-reading approach
10. ✅ Add Puppeteer frontend integration tests to `test:ci` pipeline
11. ✅ SectionEditor array field support — 53+ repeatable items across 10 block types
12. ✅ EditToolbar auto-height spacer — no longer covers site header
13. ✅ Image replacement fields — 10 block types with optional image alongside icons
14. ✅ Global theme customization — 9 colors, 2 fonts, 5 presets, advanced settings

**Sprint 7 Gates:**
| Gate | Status | Evidence |
|------|--------|----------|
| **D — Document** | ✅ | Sprint_7_Spec.md, section registry schema |
| **T — Test** | ✅ | `pnpm test:ci` passes (typecheck → build → API → frontend) |
| **A — Approve** | ✅ | Cross-domain sign-offs in APPROVALS_7.md |
| **V — Validate** | ✅ | Docker deploy verified, production-ready |

---

## 5. Upcoming Sprints (Roadmap)

### Sprint 8 — Multi-Client / White-Label (Week 12-13)
- **ClientSettings collection** → per-install branding
- **Domain routing** — `client.perissos.dev` → isolated template
- **White-label admin** — custom logo, colors, favicon
- **API keys** per client for headless integrations

### Sprint 9 — Marketplace & Template Versioning (Week 14-15)
- **Template versioning** — semver, changelog, rollback
- **Marketplace API** — browse, purchase, install from registry
- **Subscription gating** — premium templates require active plan
- **Template dependencies** — shared sections, design tokens

### Sprint 10 — Enterprise Features (Week 16-18)
- **SSO/SAML/OIDC** — enterprise auth
- **Audit log UI** — Activities collection in admin
- **Role-based page permissions** — editor can edit pages, not templates
- **Webhooks** — template activated, page published, form submitted
- **i18n** — multi-language templates & content

### Sprint 11 — Performance & Scale (Week 19-20)
- **ISR/SSG hybrid** — per-page caching strategy
- **Edge middleware** — geo-routing, A/B testing
- **Database read replicas** — Neon scaling
- **CDN purge API** — instant cache invalidation on publish
- **Bundle analysis** — frontend < 100KB gzipped

### Sprint 12 — Developer Experience (Week 21-22)
- **CLI tool** — `perissos create-template`, `perissos dev`, `perissos deploy`
- **VS Code extension** — template snippets, schema validation
- **Storybook** — section component library
- **E2E tests** — Playwright (admin + frontend)
- **Documentation site** — Docusaurus + auto-generated API docs

---

## 6. Technical Debt & Known Risks

| Area | Risk | Mitigation |
|------|------|------------|
| **ImportMap manual maintenance** | Payload CLI broken on Node 20 | Monitor Payload 3.15+ for fix; automate regeneration script |
| **ZIP import heuristics** | `layoutConfig` generation fragile | Add manifest.json schema validation; fallback to manual mapping |
| **Single active template** | No A/B testing, no draft preview | Sprint 7: draft/publish flow; Sprint 9: versioning |
| **Frontend build-time CMS URL** | Can't change CMS URL without rebuild | Sprint 8: runtime config via `/api/client-settings` |
| **No automated template tests** | Regression risk on import | Sprint 12: E2E tests for import → activate → render flow |
| **MinIO local only** | Prod uses R2 — config drift | Use same S3 client config; env-driven endpoint |

---

## 7. Success Metrics (KPIs)

| Metric | Current | Target (Sprint 12) |
|--------|---------|-------------------|
| Template import → live | ~30 sec | < 10 sec |
| Cold start (Docker) | ~2 min | < 45 sec |
| Typecheck time | 4.7s | < 3s |
| Build time | ~3 min | < 2 min |
| Bundle size (frontend) | Unknown | < 100KB gzip |
| Test coverage | 0% | > 80% |
| Templates in library | 0 | 10+ |
| Zero-downtime deploys | No | Yes |

---

## 8. Agent Onboarding Checklist

New agents **must** complete before contributing:

- [ ] Read this document (`Cellule_Taskforce_Report.md`)
- [ ] Read `Agentic_Orchestration.md`
- [ ] Run `pnpm install && pnpm dev` (verify local stack)
- [ ] Import `digital_agency_test.zip` via admin → verify frontend renders
- [ ] Run `pnpm test:ci` — all green
- [ ] Review `apps/backoffice/src/templates/TemplateList.tsx` (current pattern)
- [ ] Review `apps/backoffice/src/collections/Templates.ts` (collection config)
- [ ] Understand Payload Local API vs REST API boundaries

---

## 9. Reference Links

- **Payload 3.x Docs:** https://payloadcms.com/docs
- **Next.js 15 App Router:** https://nextjs.org/docs/app
- **Turborepo:** https://turbo.build/repo/docs
- **pnpm Workspaces:** https://pnpm.io/workspaces
- **Cloudflare Pages:** https://developers.cloudflare.com/pages/
- **Neon Postgres:** https://neon.tech/docs
- **Cloudflare R2:** https://developers.cloudflare.com/r2/

---

*End of Taskforce Report. This document is the single source of truth for project vision and sprint history. Update at the start of each sprint.*