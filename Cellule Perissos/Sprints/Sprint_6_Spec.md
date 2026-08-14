# Sprint 6 Specification: Template Library & Default Templates

**Sprint:** 6 | **Dates:** 2026-08-10 → 2026-08-17  
**Goal:** Ship 5 production-ready default templates pre-installed via seed script, with TemplateList UI revamped to Payload-native table-based design  
**Related Taskforce Item:** Sprint 6 in Cellule_Taskforce_Report.md (Active Sprint)

---

## 1. Scope (IN / OUT)

### IN
- [x] **TemplateList UI Revamp** — Table-based list view using Payload native CSS variables — `ui-lead` — AC-1, AC-2
- [x] **Digital Agency Template: Full CMS-Driven Frontend Renderer** — 10 blocks, seeded page, full frontend with header/footer/form — `frontend-lead` — AC-7 (partial)
- [x] **Title Highlight Fix** — `highlightTitle()` replaces instead of appends — `frontend-lead`
- [x] **Full Navigation Header** — Logo, 6 nav links, CTA, hamburger — `frontend-lead`
- [x] **Full Footer** — 4-column grid (brand, quick links, services, contact) — `frontend-lead`
- [x] **Contact Form** — 4 fields + submit, styled with CSS classes — `frontend-lead`
- [x] **Frontend Docker Rebuild** — Static export with all changes — `devops-lead`
- [ ] **Manifest.json Schema** — Formal schema + validation for template metadata — `template-engineer` — AC-3
- [ ] **ZIP Packager Script** — `scripts/package-template.ts` to create compliant ZIPs — `template-engineer` — AC-4
- [ ] **Seed Script** — `pnpm seed:templates` imports all 5 templates on fresh install — `backend-lead` — AC-5
- [ ] **Template Library UI** — "Browse Template Library" link in empty state + category filter pills — `ui-lead` — AC-6
- [ ] **Default Templates (5)** — Digital Agency, SaaS Landing, Portfolio, E-commerce, Blog/Media — `template-engineer` — AC-7
- [ ] **Sprint Governance Artifacts** — Spec, Test Report, Approvals, Retro — `project-shepherd` — AC-8

### OUT (Explicitly Deferred)
- **Template Versioning** → Sprint 9 | Reason: Requires marketplace API foundation
- **Marketplace API** → Sprint 9 | Reason: Needs versioning + subscription gating first
- **Visual Page Builder** → Sprint 7 | Reason: Block-based editor is separate major feature
- **Multi-Client/White-Label** → Sprint 8 | Reason: Depends on ClientSettings maturation

---

## 2. Technical Design (per Domain)

### Backend (Backend_Architect)
- **Collections changed:** Templates (add `manifest` JSON field for validated manifest data)
- **API endpoints:** 
  - `GET /api/templates/library` — returns curated default templates (public)
  - `POST /api/templates/seed` — admin-only, runs seed script
- **Hooks/Access Control:** 
  - `afterChange` hook already deactivates other templates on activate
  - Seed endpoint: `create: ({ req: { user } }) => user?.role === 'admin'`
- **Migrations:** 
  - Add `manifest` field to Templates collection (JSON, optional)
  - Payload auto-migration on dev restart

### Frontend (Frontend_Developer)
- **Components added/modified:** None (frontend reads active template only)
- **Pages affected:** None
- **Performance budget:** Unchanged (template library is admin-only)

### DevOps (DevOps_Automator)
- **Infra changes:** None
- **Deploy targets:** Unchanged
- **Rollback plan:** `git revert` seed commit; templates remain in DB but inactive

### Security (Security_Engineer)
- **Threat model:** 
  - ZIP upload: AdmZip extraction → path traversal risk → sanitized in import-zip route
  - Seed script: Admin-only, no user input
- **Auth/RBAC changes:** Seed endpoint admin-only
- **Secrets rotation:** No new secrets

### UI/UX (UI_Designer)
- **Design tokens:** Payload native `--theme-elevation-*`, `--base`, `--gutter-h`, `--style-radius-*`
- **Accessibility:** Table headers with `scope="col"`, keyboard navigation, ARIA labels on actions
- **Payload admin changes:** 
  - TemplateList.tsx → table-based (replaces card grid)
  - Upload zone styled with Payload variables
  - Status badges: `.pill .pill--style-success` / `.pill--style-light-gray`
  - Buttons: `.btn .btn--style-primary` / `.btn--style-subtle` + `.btn--size-small`
  - Category filter pills in header: `.pill .pill--style-light-gray`

---

## 3. Acceptance Criteria (Testable, Measurable)

| ID | Criterion | Test Method | Owner |
|----|-----------|-------------|-------|
| AC-1 | TemplateList renders as table with columns: Preview, Name, Description, Version, Category, Status, Actions | Manual + Playwright E2E | ui-lead |
| AC-2 | All styling uses Payload CSS variables (no `--spacing-*`, `--color-*`, `--font-size-*`) | Code review + grep | ui-lead |
| AC-3 | `manifest.json` schema validates: name, description, category, version, preview (optional) | Unit test (Zod/Joi) | template-engineer |
| AC-4 | `pnpm package:template <dir>` produces valid ZIP with index.html, preview.jpg, manifest.json | Integration test | template-engineer |
| AC-5 | `pnpm seed:templates` on fresh DB creates 5 templates, all inactive, preview images uploaded | Integration test | backend-lead |
| AC-6 | Empty state shows "Browse Template Library" link; header has category filter pills | Manual + Playwright | ui-lead |
| AC-7 | 5 default templates import successfully, render correctly on frontend | E2E per template | template-engineer |
| AC-8 | Sprint governance artifacts created: Spec, Test Report, Approvals, Retro | File existence check | project-shepherd |

---

## 4. Dependencies & Risks

| Dependency | Owner | Status | Risk if Late |
|------------|-------|--------|--------------|
| TemplateList revamp (completed) | ui-lead | ✅ Done | Blocked AC-1, AC-2 |
| Digital Agency mockup exists | template-engineer | ✅ `template/Digital Agency/index.html` | Template 1 delayed |
| SaaS/portfolio/ecommerce/blog mockups | template-engineer | ⏳ Design needed | Templates 2-5 delayed |
| Manifest schema validation lib | template-engineer | ⏳ Choose Zod vs Joi | AC-3 blocked |
| Seed script idempotency | backend-lead | ⏳ Design | AC-5 flaky |

---

## 5. Sign-Off (Gate D)

| Role | Agent | Signature | Date |
|------|-------|-----------|------|
| Project_Shepherd | project-shepherd | ✅ | 2026-08-13 |
| Backend_Architect | backend-lead | ✅ | 2026-08-13 |
| Frontend_Developer | frontend-lead | ✅ | 2026-08-13 |
| DevOps_Automator | devops-lead | ✅ | 2026-08-13 |
| Security_Engineer | security-engineer | ✅ | 2026-08-13 |
| UI_Designer | ui-lead | ✅ | 2026-08-13 |
| Data_Engineer | data-engineer | ✅ | 2026-08-13 |
| Developer_Senior | developer-senior | ✅ | 2026-08-13 |

---

*Gate D Complete. Sprint 6 execution authorized.*