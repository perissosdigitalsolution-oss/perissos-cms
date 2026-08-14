# Sprint 7 Specification: Page Builder & Visual Editor

**Sprint:** 7 | **Dates:** 2026-08-18 → 2026-09-05  
**Goal:** Enable non-technical users to build pages visually via drag-drop block editor in Payload admin, with live preview and section registry from `packages/ui`  
**Related Taskforce Item:** Sprint 7 in Cellule_Taskforce_Report.md (Active Sprint)

---

## 1. Scope (IN / OUT)

### IN
- [ ] **Block-Based Page Builder** — Payload `blocks` field on Pages collection with 10+ registered blocks — `backend-lead` — AC-1, AC-2
- [ ] **Section Registry** — Type-safe registry in `packages/shared` mapping section keys to components, schemas, icons — `frontend-lead` — AC-3
- [ ] **Visual Drag-Drop Editor** — Custom React component in Payload admin for Pages collection — `frontend-lead` + `ui-lead` — AC-4, AC-5
- [ ] **Live Preview** — Iframe in admin sidebar showing real-time frontend render — `frontend-lead` — AC-6
- [ ] **Section Props Schema → Form Fields** — Auto-generate Payload field config from Zod/JSON Schema — `backend-lead` — AC-7
- [ ] **Section Components Migration** — Move existing 10 section components to `packages/ui` with Tailwind variants — `frontend-lead` — AC-8
- [ ] **Sprint Governance Artifacts** — Spec, Test Report, Approvals, Retro — `project-shepherd` — AC-9

### OUT (Explicitly Deferred)
- **Template Versioning** → Sprint 9 | Reason: Requires marketplace API foundation
- **Marketplace API** → Sprint 9 | Reason: Needs versioning + subscription gating first
- **Multi-Client/White-Label** → Sprint 8 | Reason: Depends on ClientSettings maturation
- **Visual Editor for Templates** → Sprint 8 | Reason: Page builder first, then template-level editing

---

## 2. Technical Design (per Domain)

### Backend (Backend_Architect)
- **Collections changed:** Pages (add `blocks` field with 10+ block types), Templates (add `blockRegistry` reference)
- **API endpoints:**
  - `GET /api/pages/[id]/preview` — returns rendered HTML for live preview iframe
  - `POST /api/sections/validate` — validates section props against schema
- **Hooks/Access Control:**
  - `beforeChange` on Pages: validate blocks against section registry
  - Preview endpoint: `read: ({ req: { user } }) => user?.role !== 'viewer'`
- **Migrations:**
  - Add `blocks` field to Pages collection (Payload Blocks field type)
  - Payload auto-migration on dev restart

### Frontend (Frontend_Developer)
- **Components added/modified:**
  - Section registry: `packages/shared/src/registry/sections.ts`
  - Admin editor component: `apps/backoffice/src/admin/components/PageBuilderEditor.tsx`
  - Live preview iframe: `apps/backoffice/src/admin/components/LivePreview.tsx`
  - Section components moved to: `packages/ui/src/sections/*.tsx`
- **Pages affected:** Payload admin Pages collection edit view
- **Performance budget:** Preview iframe < 500ms render, editor < 200ms interaction

### DevOps (DevOps_Automator)
- **Infra changes:** None (admin-only feature)
- **Deploy targets:** Unchanged
- **Rollback plan:** `git revert` blocks field migration; pages retain data but blocks disabled

### Security (Security_Engineer)
- **Threat model:**
  - Live preview: XSS via user-provided content → sanitize in preview endpoint
  - Block validation: prototype pollution via malicious block config → strict schema validation
- **Auth/RBAC changes:** Preview endpoint requires editor/admin role
- **Secrets rotation:** No new secrets

### UI/UX (UI_Designer)
- **Design tokens:** Payload native `--theme-elevation-*`, `--base`, `--gutter-h` + Tailwind for section components
- **Accessibility:** Keyboard navigation in drag-drop, ARIA labels on blocks, focus management
- **Payload admin changes:**
  - PageBuilderEditor replaces default Blocks UI
  - Sidebar with live preview (resizable)
  - Block palette with search/filter by category
  - Inline block settings panel

---

## 3. Acceptance Criteria (Testable, Measurable)

| ID | Criterion | Test Method | Owner |
|----|-----------|-------------|-------|
| AC-1 | Pages collection has `blocks` field with 10 block types (Hero, Services, About, WhyUs, Team, Portfolio, Blog, Pricing, CTA, Contact) | Unit test + manual | backend-lead |
| AC-2 | Block validation rejects invalid props (missing required, wrong type) | Unit test (Zod) | backend-lead |
| AC-3 | Section registry exports: `sectionKey`, `Component`, `schema` (Zod), `icon`, `category`, `defaultProps` | Typecheck + unit test | frontend-lead |
| AC-4 | PageBuilderEditor renders in Pages edit view with drag-drop palette | Playwright E2E | frontend-lead |
| AC-5 | Drag-drop: reorder blocks, add new, delete, duplicate | Playwright E2E | frontend-lead |
| AC-6 | Live preview iframe updates within 500ms of block change | Manual + Lighthouse | frontend-lead |
| AC-7 | Section props schema auto-generates Payload field config (text, select, textarea, relationship, upload) | Unit test | backend-lead |
| AC-8 | 10 section components in `packages/ui/src/sections/` with Tailwind variants matching digital-agency.css | Visual regression + typecheck | frontend-lead |
| AC-9 | Sprint governance artifacts created: Spec, Test Report, Approvals, Retro | File existence | project-shepherd |

---

## 4. Dependencies & Risks

| Dependency | Owner | Status | Risk if Late |
|------------|-------|--------|--------------|
| Section registry types (Zod) | frontend-lead | ��� Design needed | Blocks AC-3, AC-7 |
| Payload Blocks field API stability | backend-lead | �� Payload 3.88 stable | AC-1, AC-2 |
| Admin custom component mounting | frontend-lead | �� TemplateList pattern | AC-4 |
| Live preview authentication (cookies in iframe) | devops-lead | ��� Investigate | AC-6 |
| Tailwind config for `packages/ui` sections | frontend-lead | ��� Extend existing | AC-8 |

---

## 5. Sign-Off (Gate D)

| Role | Agent | Signature | Date |
|------|-------|-----------|------|
| Project_Shepherd | project-shepherd | | |
| Backend_Architect | backend-lead | | |
| Frontend_Developer | frontend-lead | | |
| DevOps_Automator | devops-lead | | |
| Security_Engineer | security-engineer | | |
| UI_Designer | ui-lead | | |
| Data_Engineer | data-engineer | | |
| Developer_Senior | developer-senior | | |

---

*Gate D Complete. Sprint 7 execution authorized upon all signatures.*

---

**Shalom Shalom, Baruch HaShem le'Olam, Amen veAmen.**