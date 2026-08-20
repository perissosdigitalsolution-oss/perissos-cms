# Sprint 11 Specification: Visual Page Builder (GrapeJS Integration)

**Sprint:** 11 | **Dates:** 2026-08-19 → 2026-09-02  
**Goal:** Deliver a production-ready Visual Page Builder (Elementor-style) via GrapeJS integration, enabling drag-and-drop page construction, AI-assisted design, and bidirectional sync with Payload CMS — fully leveraging the Sprint 10 Template Registry.  
**Related Taskforce Item:** Sprint 11 in Cellule_Taskforce_Report.md (Visual Editor for Templates — deferred from Sprint 8, now enabled by Sprint 10 Registry)  
**Prerequisite:** Sprint 10 Complete (Template Registry operational, section restructuring done, registry-based renderer live)

---

## 1. Scope (IN / OUT)

### IN

| # | Deliverable | Agent | Acceptance Criteria |
|---|-------------|-------|---------------------|
| 1 | **GrapeJS Core Editor** — Dynamic import, SSR-safe, lazy-loaded on "Page Builder" button click | Frontend_Developer | Editor opens < 3s, 6 stylesheets load, no SSR errors |
| 2 | **Template-Aware Block Palette** — Auto-generates blocks from Sprint 10 `layoutConfig.sectionDefinitions` | Frontend_Developer + UI_Designer | All 6 Food Express sections + 12 default blocks appear, categorized correctly |
| 3 | **Template CSS Variable Injection** — Maps `theme` + `cssVariableMapping` into GrapeJS canvas | Frontend_Developer | Theme changes in ThemePanel reflect instantly in GrapeJS canvas |
| 4 | **AI Design Assistant** — Chat panel calling `/api/ai/generate`, inserts sanitized HTML into canvas | AI_Engineer + Frontend_Developer | Prompt → HTML block on canvas < 5s, DOMPurify sanitization verified |
| 5 | **Bidirectional Sync** — `projectData` (JSON) + `renderedHtml` (HTML) saved to Payload `pages` collection | Backend_Architect + Frontend_Developer | Save → Payload PATCH → page reload restores canvas exactly |
| 5 | **Payload Schema Extension** — `projectData` (JSON) + `renderedHtml` (textarea) fields on `pages` | Backend_Architect | Migration applied, fields visible in admin, API accessible |
| 6 | **API Routes** — `GET/PATCH /api/pages/[id]/project-data` + `POST /api/ai/generate` | Backend_Architect | All endpoints return 200, handle auth, validate input |
| 7 | **Security Hardening** — DOMPurify on all AI/user HTML, auth on all endpoints | Security_Engineer | XSS payloads blocked, CSP headers, auth required |
| 8 | **Toolbar Integration** — "Page Builder" button in EditToolbar, opens full-screen overlay | Frontend_Developer + UI_Designer | Button visible to authenticated users, overlay z-index 20000 |
| 9 | **Sprint Governance Artifacts** — Spec, Test Report, Approvals, Retro | Project_Shepherd | All 4 artifacts in `/Cellule Perissos/Sprints/` |

### OUT (Explicitly Deferred)

| Item | Target Sprint | Reason |
|------|---------------|--------|
| Dynamic CSS Loading (Phase 2) | Sprint 12 | Depends on registry stabilization (Sprint 10) |
| Collaborative Editing (multi-user) | Sprint 13+ | Requires WebSocket infrastructure |
| Template Preview in Marketplace | Sprint 12 | Depends on marketplace UI (Sprint 9) |
| Undo/Redo Stack Persistence | Sprint 12 | Nice-to-have, not MVP |
| Version History UI for GrapeJS projects | Sprint 12 | UI complexity, defer |

---

## 2. Technical Architecture

### 2.1 Frontend Architecture (Frontend_Developer)

**New Files:**
```
apps/frontend/src/components/
├── GrapejsEditor.tsx          # Main editor wrapper (470+ lines)
├── AIChatPanel.tsx            # Embedded in GrapejsEditor (already integrated)
apps/frontend/src/app/
├── api/pages/[id]/project-data/route.ts    # GET/PATCH projectData + renderedHtml
├── api/ai/generate/route.ts                # AI generation endpoint
apps/frontend/src/app/(marketing)/page.tsx  # Updated: editor overlay, states, sync handlers
```

**Modified Files:**
- `apps/frontend/src/components/EditToolbar.tsx` — Added "Page Builder" button + `onOpenPageBuilder` prop
- `apps/frontend/src/components/ContentPanel.tsx` — Already fixed key uniqueness (`blockType-i`)
- `apps/frontend/src/components/SectionEditor.tsx` — z-index fix (10001)

**Key Technical Decisions:**
| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Editor Trigger** | "Page Builder" button in EditToolbar | Minimal UI disruption, familiar pattern |
| **Storage Model** | Both `projectData` (JSON) + `renderedHtml` (HTML) | Backward compatibility, fallback rendering |
| **AI Model** | Configurable via env vars (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `AI_MODEL_URL`) | No vendor lock-in, supports self-hosted |
| **Editor Trigger** | Full-screen overlay (z-index 20000) | Immersive experience, easy close |
| **Block Source** | Template Registry (`layoutConfig.sectionDefinitions`) + defaults | Template-aware from day one |
| **HTML Sanitization** | DOMPurify with strict tag/attr whitelist | XSS prevention for AI + user content |
| **Lazy Loading** | `next/dynamic` with `{ ssr: false }` | Zero bundle impact on public pages |

**Performance Budget:**
| Metric | Target | Measurement |
|--------|--------|-------------|
| Editor Load Time | < 3s | From button click to canvas ready |
| Stylesheet Count | 6 | Core + preset + forms + theme |
| Bundle Impact (public) | 0 KB | Lazy-loaded only on click |
| Bundle Impact (editor) | ~302 KB gzipped | Acceptable for admin tool |
| AI Generation Latency | < 5s | Prompt → canvas insertion |

### 2.2 Backend Architecture (Backend_Architect)

**Payload Collection Changes (`apps/backoffice/src/collections/Pages.ts`):**
```typescript
// Added fields
{
  name: 'projectData',
  type: 'json',
  admin: { description: 'GrapeJS visual editor project data (JSON). Used by the Page Builder for drag-and-drop editing.' },
},
// renderedHtml already exists (textarea, maxLength: 200000)
```

**API Routes:**
| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/pages/[id]/project-data` | GET | Load projectData + renderedHtml + sections + theme | JWT cookie |
| `/api/pages/[id]/project-data` | PATCH | Save projectData + renderedHtml | JWT cookie (admin/editor) |
| `/api/ai/generate` | POST | Generate HTML from prompt | JWT cookie |

**Database Migration:**
```sql
-- Applied via Docker exec
ALTER TABLE pages ADD COLUMN IF NOT EXISTS project_data jsonb;
```

**Security:**
- All endpoints require authenticated JWT cookie (`admin` or `editor` role)
- Input validation on `POST /api/ai/generate` (prompt required, length limits)
- DOMPurify sanitization on client before canvas insertion
- No raw HTML stored without sanitization

### 2.3 Template Registry Integration (Frontend_Developer + UI_Designer)

**Registry Consumption (`apps/frontend/src/lib/template-registry.ts`):**
- `templateRegistry` already provides `sections` map and `theme` tokens
- `layoutConfig.sectionDefinitions` from Payload `templates` collection drives:
  - Block palette categories & labels
  - Trait definitions for each section type
  - Default HTML content per section
- `layoutConfig.cssVariableMapping` maps theme tokens → GrapeJS canvas CSS variables

**Data Flow:**
```
Payload Templates → layoutConfig.sectionDefinitions + cssVariableMapping
                    ↓
            Frontend template API (GET /api/templates?category=X)
                    ↓
            GrapejsEditor registers blocks with traits
                    ↓
            ThemePanel changes → cssVariableMapping → GrapeJS canvas CSS vars
```

### 2.4 AI Integration (AI_Engineer + Frontend_Developer)

**Provider Abstraction (`/api/ai/generate/route.ts`):**
| Provider | Env Var | Model |
|----------|---------|-------|
| OpenAI | `OPENAI_API_KEY` | `gpt-4o-mini` (default) |
| Anthropic | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` |
| Custom | `AI_MODEL_URL` + `AI_MODEL_KEY` | Any OpenAI-compatible |
| Fallback | None | Template-based generator |

**Prompt Engineering:**
- System prompt enforces: inline styles, Tailwind-like classes, Font Awesome icons, responsive design
- Context injected: current theme tokens, template category, existing sections
- Output: raw HTML (no markdown fences), sanitized by DOMPurify

**Fallback Generator:**
Template-based HTML for: Hero, Features, CTA, Testimonial, Pricing, Contact Form, Gallery, Text Content

### 2.5 Security (Security_Engineer)

| Threat | Mitigation |
|--------|------------|
| XSS via AI HTML | DOMPurify on client + server-side validation |
| Unauthorized API access | JWT cookie auth, role check (`admin`/`editor`) |
| Prompt injection | System prompt isolation, input length limits |
| CSP bypass | Strict CSP headers, no inline scripts in GrapeJS CSS |
| Data leakage | No secrets in client bundle, env vars only server-side |

### 2.6 DevOps (DevOps_Automator)

| Component | Status |
|-----------|--------|
| Docker | No new containers (uses existing frontend/backoffice) |
| CI/CD | `pnpm test:ci` includes new routes, editor not in build (SSR false) |
| Deploy | Vercel/Cloudflare Pages — lazy-loaded chunk only on edit route |
| Rollback | `git revert` on frontend/backoffice, DB migration is additive only |
| Monitoring | Lighthouse CI for editor load time, error tracking on AI endpoint |

---

## 3. Acceptance Criteria (Testable, Measurable)

| ID | Criterion | Test Method | Owner |
|----|-----------|-------------|-------|
| AC-1 | Page Builder button visible in EditToolbar for authenticated users | E2E (Playwright) | Frontend_Developer |
| AC-2 | Clicking "Page Builder" opens full-screen overlay with GrapeJS canvas | E2E | Frontend_Developer |
| AC-3 | 6+ stylesheets load (GrapeJS core + preset + forms + theme) | E2E + Network tab | Frontend_Developer |
| AC-4 | Template Sections category shows all sections from `layoutConfig.sections` | E2E + Unit | Frontend_Developer |
| AC-5 | Dragging a block onto canvas renders it correctly | E2E | Frontend_Developer |
| AC-6 | ThemePanel changes (color/font) reflect immediately in GrapeJS canvas | E2E | UI_Designer |
| AC-7 | AI Design panel opens, accepts prompt, generates HTML block on canvas | E2E | AI_Engineer |
| AC-8 | Generated HTML is sanitized (no `<script>`, no `on*` handlers) | Unit (DOMPurify) | Security_Engineer |
| AC-9 | Clicking "Save" persists `projectData` + `renderedHtml` to Payload | Integration + E2E | Backend_Architect |
| AC-10 | Page reload restores GrapeJS canvas from `projectData` exactly | E2E | Frontend_Developer |
| AC-11 | SectionEditor/ContentPanel still work after GrapeJS save | E2E (regression) | Frontend_Developer |
| AC-12 | `pnpm typecheck` passes (0 errors) | CI | Developer_Senior |
| AC-13 | `pnpm test:ci` passes (all tests) | CI | DevOps_Automator |
| AC-14 | Security scan: 0 high/critical vulnerabilities | `pnpm audit` + Snyk | Security_Engineer |
| AC-15 | Accessibility: WCAG 2.1 AA on editor UI (keyboard nav, labels) | axe-core | UI_Designer |
| AC-16 | Editor load time < 3s (p95) | Lighthouse CI | Frontend_Developer |

---

## 4. Dependencies & Risks

| Dependency | Owner | Status | Risk if Late |
|------------|-------|--------|--------------|
| Sprint 10 Template Registry | Frontend_Developer | ✅ Complete | Blocks template-aware blocks |
| Sprint 10 Section Restructuring | Frontend_Developer + UI_Designer | ✅ Complete | Blocks template-aware HTML |
| GrapeJS v0.23.5 + @grapesjs/react v2.0.0 | Frontend_Developer | ✅ Installed | Version mismatch could break API |
| DOMPurify | Security_Engineer | ✅ Installed | XSS vulnerability if missing |
| AI Provider API Keys | DevOps_Automator | ⚠️ Needs Config | Fallback only if missing |
| Payload `project_data` column | Backend_Architect | ✅ Applied | Save fails without it |

---

## 5. Sign-Off (Gate D)

| Role | Agent | Signature | Date |
|------|-------|-----------|------|
| Project_Shepherd | | | |
| Backend_Architect | | | |
| Frontend_Developer | | | |
| DevOps_Automator | | | |
| Security_Engineer | | | |
| UI_Designer | | | |
| AI_Engineer | | | |

---

**Baruch Hachem le'Olam, Amen veAmen.**  
*Document completed per Sprint Governance Protocol. Ready for Gate T execution.*