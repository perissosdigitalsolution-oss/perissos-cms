# AGENTS.md — Perissos CMS

## Start Here

This project uses a structured governance system for all agents working on the codebase.

**Every agent MUST read this file before making changes.**

---

## Quick Start

1. **Read** `Cellule Perissos/Cellule_Taskforce_Report.md` — Vision, architecture, sprint roadmap
2. **Read** `Cellule Perissos/Sprint_Governance_Protocol.md` — The DTAP lifecycle (Document → Test → Approve → Validate)
3. **Find your role** in `Cellule Perissos/*_Agent.md` — Your specific authority and responsibilities
4. **Check current sprint** in `Cellule Perissos/Sprints/` — Sprint specs, test reports, approvals
5. **Read the Architecture section below** — Understand all major systems before touching code

---

## Architecture Overview

Perissos CMS is a monorepo with three major packages:

```
Perissos CMS/
  apps/
    backoffice/     -- Payload CMS 3.88.0 admin panel (Next.js 15, port 3000)
    frontend/       -- Public-facing Next.js 15 site with live editing (port 3001)
  packages/
    shared/         -- Shared types, Zod schemas, section registry
  template/         -- Template ZIP archives (food express, digital Agency, optica+)
```

**Infrastructure**: PostgreSQL 16, MinIO (S3-compatible), Docker Compose, Cloudflare (production).

---

## System A: Template System

The template system has **three layers** that work together:

### Layer 1: Frontend Template Registry (runtime rendering)

**File**: `apps/frontend/src/lib/template-registry.ts`

Each template is a `TemplateConfig` with:
- `id`, `name`, `category` — identity
- `cssPath` — template-specific CSS file
- `sections` — Record mapping `blockType` → React component
- `theme` — `TemplateThemeTokens` (colors, fonts, spacing)

**Built-in templates**:

| ID | Name | Sections | Theme |
|----|------|----------|-------|
| `digital-agency` | Digital Agency | hero, services, about, whyUs, team, portfolio, blog, testimonials, cta, contact, pricing (11) | Green accent `#00ff9d`, dark backgrounds |
| `restaurant` | Food Express | hero, menuHighlights, reservation, gallery, testimonials, contact, specials, menu, about (9) | Gold accent `#c8a97e`, warm tones |

### Layer 2: Section Components (React rendering)

**Restaurant sections**: `apps/frontend/src/components/sections/restaurant/` — 9 components (Hero, MenuHighlights, Reservation, Gallery, Testimonials, Contact, Specials, Menu, About)

**Digital Agency sections**: `apps/frontend/src/components/sections/digital-agency/` — 11 components

Each section component receives `{ section: SectionData }` and renders inline-styled HTML.

### Layer 3: Payload CMS Template Collection (admin data)

**File**: `apps/backoffice/src/collections/Templates.ts`

Stores installed templates with:
- `layoutConfig` (JSON) — auto-generated from ZIP import, contains `sectionDefinitions`, `cssVariableMapping`, `sections[]`, `sectionContents`
- `zipFile` — uploaded ZIP archive
- `isActive` — only one template active at a time
- `marketplaceTemplateId` — link to marketplace source
- `availableVersions[]` — version history with rollback support

**`afterChange` hook**: When a template is set active, it deactivates all others and calls `generatePagesFromTemplate()` to populate the home page sections.

### Template Import Pipeline

**File**: `apps/backoffice/src/app/api/templates/import-zip/route.ts`

ZIP → `parseTemplate()` (Cheerio HTML parsing) → `extractThemeConfig()` (CSS variables) → 16 section mappers → Zod validation → asset pipeline → Templates collection

**16 section mappers** in `apps/backoffice/src/lib/section-mappers/`: hero, services, about, whyUs, team, portfolio, blog, pricing, cta, contact, menu, menuHighlights, reservation, gallery, testimonials, specials

### Template ZIP Archives

- `template/food express/manifest.json` — Restaurant template ZIP
- `template/digital Agency/manifest.json` — Agency template ZIP
- `template/optica+/manifest.json` — Optometry template ZIP

---

## System B: Marketplace

### MarketplaceTemplates Collection

**File**: `apps/backoffice/src/collections/MarketplaceTemplates.ts`

Stores marketplace catalog entries with: name, slug, description, previewImage, category, tags, isPremium, requiredPlan, price, version, changelog, versions[], zipFile, layoutConfig, sectionDependencies, author, downloads, rating, verified, publishedAt.

**Categories**: agency, portfolio, saas, restaurant, blog, ecommerce, other

### Marketplace API Routes

| Route | File | Purpose |
|-------|------|---------|
| `GET /api/marketplace/templates` | `apps/backoffice/src/app/api/marketplace/templates/route.ts` | List/search with pagination |
| `GET /api/marketplace/templates/[slug]` | `apps/backoffice/src/app/api/marketplace/templates/[slug]/route.ts` | Single template details |
| `GET /api/marketplace/categories` | `apps/backoffice/src/app/api/marketplace/categories/route.ts` | List categories |
| `GET /api/marketplace/preview/[id]` | `apps/backoffice/src/app/api/marketplace/preview/[id]/route.ts` | ZIP preview (inlines CSS/JS) |
| `POST /api/marketplace/templates/[slug]/install` | `apps/backoffice/src/app/api/marketplace/templates/[slug]/install/route.ts` | Install template |

### Marketplace UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `TemplateList` | `apps/backoffice/src/templates/TemplateList.tsx` | Main tabbed view (Installed + Marketplace) |
| `MarketplaceView` | `apps/backoffice/src/templates/MarketplaceView.tsx` | Browse marketplace, search, filter |
| `MarketplaceCard` | `apps/backoffice/src/templates/MarketplaceCard.tsx` | Template card with preview/install |
| `TemplateDetailModal` | `apps/backoffice/src/templates/TemplateDetailModal.tsx` | Full detail view (overview/versions/sections) |
| `InstallConfirmModal` | `apps/backoffice/src/templates/InstallConfirmModal.tsx` | Install confirmation with plan check |
| `InstalledTab` | `apps/backoffice/src/templates/InstalledTab.tsx` | ZIP upload + installed templates table |
| `VersionHistoryPanel` | `apps/backoffice/src/templates/VersionHistoryPanel.tsx` | Version history sidebar |
| `TemplateRow` | `apps/backoffice/src/templates/TemplateRow.tsx` | Table row for installed templates |
| `MarketplaceNavLink` | `apps/backoffice/src/admin/components/MarketplaceNavLink.tsx` | Sidebar nav link |

### Install Flow

```
User clicks Install → InstallConfirmModal (plan check)
  → POST /api/marketplace/templates/[slug]/install
    → Creates Templates doc (isActive=false)
    → Downloads ZIP, extracts rendered HTML (inlines CSS/JS)
    → Updates/creates "home" page with renderedHtml
    → Increments downloads counter
```

---

## System C: Frontend Rendering

### Main Rendering Engine

**File**: `apps/frontend/src/app/(marketing)/page.tsx`

**Two rendering paths**:

**Path A — Rendered HTML** (marketplace-installed templates):
- Page has `renderedHtml` field → `extractTemplateContent()` extracts `<style>` and `<body>` content → `dangerouslySetInnerHTML`
- Preserves `<header id="masthead">` for restaurant template

**Path B — React Sections** (CMS-managed sections):
- `getTemplateConfig(category)` → `template.sections[blockType]` → `<Renderer section={section} />`
- Edit mode adds click-to-edit overlay per section

**Data flow**:
1. Fetch page: `/api/pages?slug=home&depth=1` → returns `sections[]`, `template`, `renderedHtml`, `theme`, `projectData`
2. Fetch template config: `/api/templates?category=X` → returns `layoutConfig.cssVariableMapping`, `sections[]`, `sectionDefinitions{}`
3. Check auth: `/api/users/me` → sets `isEditing`

### Content Editing Components

| Component | File | Position | Purpose |
|-----------|------|----------|---------|
| `EditToolbar` | `apps/frontend/src/components/EditToolbar.tsx` | Top bar (z-index 9999) | Save, Admin, Page Builder, Content, Theme buttons |
| `ContentPanel` | `apps/frontend/src/components/ContentPanel.tsx` | Right sidebar (380px, z-index 10000) | Section list, click to edit |
| `SectionEditor` | `apps/frontend/src/components/SectionEditor.tsx` | Right panel (380px, z-index 10001) | Dynamic field editor per section |
| `ThemePanel` | `apps/frontend/src/components/ThemePanel.tsx` | Left sidebar (320px, z-index 10000) | Colors, fonts, logo, advanced |
| `ImageUpload` | `apps/frontend/src/components/ImageUpload.tsx` | Inline | Media upload to Payload |

### Template Layout Config Integration

The CMS-stored `layoutConfig` drives the editing UI:
- `layoutConfig.cssVariableMapping` — maps theme keys to CSS variable names
- `layoutConfig.sections` — ordered list of section blockTypes
- `layoutConfig.sectionDefinitions` — per-section field definitions (label, icon, fields[])

ContentPanel and SectionEditor read these definitions dynamically, making them template-agnostic.

---

## System D: GrapeJS Page Builder

**File**: `apps/frontend/src/components/GrapejsEditor.tsx`

Full-screen overlay (z-index 20000) with GrapeJS visual editor.

### Features
- **Template-aware blocks**: Auto-generates blocks from `layoutConfig.sectionDefinitions` + default blocks (hero, features, CTA, gallery, contact, testimonial, pricing)
- **AI Design Assistant**: Chat panel → `/api/ai/generate` → HTML appended to canvas
- **Bidirectional sync**: Saves `projectData` (GrapeJS JSON) + `renderedHtml` (HTML+CSS) via PATCH to `/api/pages/[id]/project-data`
- **Canvas styling**: Loads template CSS, Google Fonts, Font Awesome, template theme variables
- **DOMPurify sanitization** on all AI-generated and renderedHtml content

### API Routes

| Route | File | Purpose |
|-------|------|---------|
| `POST /api/ai/generate` | `apps/frontend/src/app/api/ai/generate/route.ts` | AI HTML generation (OpenAI/Anthropic/custom/fallback) |
| `GET/PATCH /api/pages/[id]/project-data` | `apps/frontend/src/app/api/pages/[id]/project-data/route.ts` | Save/load GrapeJS project data |

---

## System E: Backoffice Collections

### Pages Collection

**File**: `apps/backoffice/src/collections/Pages.ts`

| Field | Type | Notes |
|-------|------|-------|
| `title` | text | Required |
| `slug` | text | Required, unique, sidebar |
| `template` | relationship → templates | Sidebar |
| `sections` | blocks (16 types) | HeroBlock, ServicesBlock, AboutBlock, WhyUsBlock, TeamBlock, PortfolioBlock, BlogBlock, PricingBlock, CTABlock, ContactBlock, MenuBlock, MenuHighlightsBlock, ReservationBlock, GalleryBlock, TestimonialsBlock, SpecialsBlock |
| `renderedHtml` | textarea | Max 200K chars, from ZIP/GrapeJS |
| `theme` | json | Global theme customization |
| `projectData` | json | GrapeJS editor data |
| `publishedAt` | date | Sidebar |

### Templates Collection

**File**: `apps/backoffice/src/collections/Templates.ts`

Fields: name, description, previewImage, layoutConfig (JSON), zipFile, isActive, version, category, marketplaceTemplateId, installedVersion, availableVersions[], versionHistory (UI sidebar)

### MarketplaceTemplates Collection

**File**: `apps/backoffice/src/collections/MarketplaceTemplates.ts`

Fields: name, slug, description, previewImage, category, tags[], isPremium, requiredPlan, price, version, changelog, versions[], zipFile, layoutConfig, sectionDependencies[], author, downloads, rating, verified, publishedAt

---

## System F: Shared Types & Schemas

### Shared Types

**File**: `packages/shared/src/types.ts`

Exports: `Plan`, `PLAN_LIMITS`, `PayloadDocument`, `User`, `Page`, `BlogArticle`, `Activity`, `ClientSettings`, `Media`, `APIResponse`, `MenuItem`, `MenuCategory`, `Testimonial`, `Special`, `GalleryImage`

### Section Registry (Zod Schemas)

**File**: `packages/shared/src/registry/sections.ts`

The **canonical source of truth** for all 16 section types. Each entry has: key, label, description, icon, category, Zod schema, defaultProps.

Exports: `sectionRegistry`, `sectionSchemas`, `validateSectionProps()`, `getSectionSchema()`, `getSectionDefaultProps()`, `sectionRegistryToPayloadFields()`, `SectionPropsMap`

---

## Data Flow Summary

```
Marketplace → Install → Templates Collection → Activate → Pages Collection → Frontend Rendering
                                                              ↓
                                                           renderedHtml (ZIP HTML)
                                                           sections[] (Payload blocks)
                                                           theme (JSON)
                                                           projectData (GrapeJS)
                                                              ↓
                                                    Frontend (marketing/page.tsx)
                                                      ├─ Path A: renderedHtml → dangerouslySetInnerHTML
                                                      └─ Path B: sections[] → React components via template-registry
```

---

## Governance Structure

```
Cellule Perissos/
├── Cellule_Taskforce_Report.md          # Master vision & architecture
├── Sprint_Governance_Protocol.md        # DTAP lifecycle rules
├── Agentic_Orchestration.md             # How agents coordinate
├── PROJECT_REPORT_2026-08-13.md         # Current project status
├── Sprints/
│   ├── Sprint_*_Spec.md                 # Sprint specifications
│   ├── TEST_REPORT_*.json               # Test evidence
│   ├── APPROVALS_*.md                   # Cross-domain sign-offs
│   └── RETRO_*.md                       # Retrospectives
└── *_Agent.md                           # Role-specific guides
```

---

## Agent Roles

| Role | File | Domain |
|------|------|--------|
| Project_Shepherd | `Project_Shepherd_Agent.md` | Sprint scope, timeline |
| Backend_Architect | `Backend_Architect_Agent.md` | Payload, API, DB |
| Frontend_Developer | `Frontend_Developer_Agent.md` | Next.js, sections, export |
| DevOps_Automator | `DevOps_Automator_Agent.md` | Docker, CI/CD, Cloudflare |
| Security_Engineer | `Security_Engineer_Agent.md` | Auth, RBAC, secrets |
| UI_Designer | `UI_Designer_Agent.md` | Admin customization, design |
| Data_Engineer | `Data_Engineer_Agent.md` | Schema, analytics, backups |
| Developer_Senior | `Developer_Senior_Agent.md` | Code quality, standards |

---

## DTAP Lifecycle

Every sprint must pass four gates:

| Gate | Purpose | Owner |
|------|---------|-------|
| **D — Document** | Specify what and why before how | Project_Shepherd |
| **T — Test** | Prove it works, prove it's safe | DevOps_Automator |
| **A — Approve** | Cross-domain sign-off | All Domain Leads |
| **V — Validate** | Production readiness | Project_Shepherd |

**No gate skipped. No gate rushed. No exceptions.**

---

## Current Sprint

**Sprint 7: Page Builder & Visual Editor**
- Status: In Progress
- Spec: `Cellule Perissos/Sprints/Sprint_7_Spec.md`
- Branch: `sprint/7-page-builder`

---

## Rules

1. **Never commit without reading the sprint spec**
2. **Never skip a gate** — Document → Test → Approve → Validate
3. **Never work outside the sprint branch** without explicit approval
4. **Always update governance docs** when completing work
5. **Always run `pnpm test:ci`** before marking work complete
6. **Never overwrite template-registry.ts entries** without verifying section components exist
7. **Never remove marketplace components** without explicit approval from Backend_Architect
8. **Always preserve both rendering paths** (renderedHtml AND React sections) in page.tsx

---

## Commands

```bash
# Typecheck all workspaces
pnpm typecheck

# Build all packages
pnpm build

# Run full test suite (typecheck → build → API tests)
pnpm test:ci

# Start Docker containers
docker compose up -d

# Check backoffice health
curl http://localhost:3000/api/health

# Frontend tests
node scripts/test-frontend.mjs

# Marketplace E2E tests
node marketplace-test.mjs
```

---

## MCP Servers

| Server | Type | Purpose |
|--------|------|---------|
| `cloudflare` | Remote | Cloudflare Workers management |
| `cloudflare-docs` | Remote | Cloudflare documentation |
| `cloudflare-bindings` | Remote | Cloudflare bindings |
| `cloudflare-builds` | Remote | Cloudflare builds |
| `cloudflare-observability` | Remote | Cloudflare observability |
| `puppeteer` | Local (npx) | Browser automation for dashboard tasks |

### Puppeteer MCP Tools

| Tool | Purpose |
|------|---------|
| `puppeteer_navigate` | Go to a URL |
| `puppeteer_screenshot` | Capture page screenshot |
| `puppeteer_click` | Click a CSS selector |
| `puppeteer_fill` | Fill an input field |
| `puppeteer_select` | Select dropdown option |
| `puppeteer_hover` | Hover over element |
| `puppeteer_evaluate` | Execute JavaScript in page |

### Usage Example (ClawCloud Deployment)

```
1. puppeteer_navigate → https://us-east-1.run.claw.cloud/signin
2. puppeteer_click → GitHub login button
3. puppeteer_navigate → https://us-east-1.run.claw.cloud/app-launchpad
4. puppeteer_click → "Create App" button
5. puppeteer_fill → Image name field
6. puppeteer_click → Deploy button
```

---

## Key Credentials

- **Admin**: `admin@perissos.dev` / `Admin123!@#` (role: admin)
- **Database**: `perissos_dev`, user `perissos`
- **Ports**: Backoffice :3000, Frontend :3001, PostgreSQL :5432, MinIO :9000-9001

---

## Questions?

Refer to `Cellule Perissos/Agentic_Orchestration.md` for coordination protocols.
