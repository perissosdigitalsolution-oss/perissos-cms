# Sprint 10 Specification: Template Registry & Dynamic CSS

**Sprint:** 10 | **Dates:** 2026-08-19 -> 2026-09-02  
**Goal:** Replace conditional template switching with a centralized Template Registry enabling dynamic CSS loading, scoped section components, and zero unused CSS — making the marketplace truly extensible for any number of templates.  
**Related Taskforce Item:** Sprint 10 in Cellule_Taskforce_Report.md (Upcoming Sprint)  
**Prerequisite:** Sprint 9 Complete (all 11 AC met, 36 tests passing)

---

## 1. Scope (IN / OUT)

### IN

- [ ] **Template Registry** — Centralized config (`template-registry.ts`) defining CSS, sections, theme tokens per template — `frontend-lead` — AC-1, AC-2
- [ ] **Section Restructuring** — Move sections to `components/sections/{digital-agency,restaurant}/` with template-specific implementations — `frontend-lead` + `ui-lead` — AC-3
- [ ] **Registry-Based Renderer** — Replace conditional `renderSection` with registry lookup — `frontend-lead` — AC-4
- [ ] **Backoffice Preview Parity** — Use same registry for marketplace preview rendering — `backend-lead` + `frontend-lead` — AC-5
- [ ] **Theme Token Sharing** — Registry exports theme tokens for both frontend and backoffice — `ui-lead` — AC-6
- [ ] **Sprint Governance Artifacts** — Spec, Test Report, Approvals, Retro — `project-shepherd` — AC-7

### OUT (Explicitly Deferred)

- **Dynamic CSS Loading** (Phase 2) -> Sprint 11 | Reason: Registry structure must stabilize first
- **Dynamic Section Components** (Phase 3) -> Sprint 11 | Reason: Depends on registry + restructure
- **External Template Registry Sync** -> Future | Reason: Local registry first, remote sync later

---

## 2. Technical Architecture

### 2.1 Template Registry (`apps/frontend/src/lib/template-registry.ts`)

```typescript
export interface TemplateSectionRenderer {
  [blockType: string]: React.FC<{ section: Section; index: number }>
}

export interface TemplateThemeTokens {
  primary: string
  primaryHover: string
  dark: string
  light: string
  fontBody: string
  fontHeading: string
  fontDisplay?: string
  spacing: string
  borderRadius: string
}

export interface TemplateConfig {
  id: string
  name: string
  category: string
  cssPath: string
  sections: TemplateSectionRenderer
  theme: TemplateThemeTokens
  previewImage?: string
}

export const templateRegistry: Record<string, TemplateConfig> = {
  'digital-agency': {
    id: 'digital-agency',
    name: 'Digital Agency',
    category: 'agency',
    cssPath: '/styles/digital-agency.css',
    sections: {
      hero: DigitalAgencyHero,
      services: DigitalAgencyServices,
      about: DigitalAgencyAbout,
      whyUs: DigitalAgencyWhyUs,
      team: DigitalAgencyTeam,
      portfolio: DigitalAgencyPortfolio,
      blog: DigitalAgencyBlog,
      testimonials: DigitalAgencyTestimonials,
      cta: DigitalAgencyCTA,
      contact: DigitalAgencyContact,
      pricing: DigitalAgencyPricing,
    },
    theme: {
      primary: '#00ff9d',
      primaryHover: '#00ff59',
      dark: '#181817',
      light: '#F6F4F1',
      fontBody: 'DM Sans, sans-serif',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      spacing: '16px',
      borderRadius: '8px',
    },
  },
  'restaurant': {
    id: 'restaurant',
    name: 'Food Express',
    category: 'restaurant',
    cssPath: '/styles/restaurant.css',
    sections: {
      hero: RestaurantHero,
      menuHighlights: RestaurantMenuHighlights,
      reservation: RestaurantReservation,
      gallery: RestaurantGallery,
      testimonials: RestaurantTestimonials,
      contact: RestaurantContact,
      specials: RestaurantSpecials,
      menu: RestaurantMenu,
    },
    theme: {
      primary: '#c8a97e',
      primaryHover: '#b8956a',
      dark: '#1a1a1a',
      light: '#F5F5F5',
      fontBody: 'Open Sans, sans-serif',
      fontHeading: 'Roboto Slab, serif',
      fontDisplay: 'Marcellus, serif',
      spacing: '16px',
      borderRadius: '8px',
    },
  },
}

export function getTemplateConfig(category: string): TemplateConfig {
  return templateRegistry[category] || templateRegistry['digital-agency']
}

export function getTemplateTheme(category: string): TemplateThemeTokens {
  return getTemplateConfig(category).theme
}
```

### 2.2 Section Restructuring

```
apps/frontend/src/components/sections/
├── digital-agency/
│   ├── Hero.tsx
│   ├── Services.tsx
│   ├── About.tsx
│   ├── WhyUs.tsx
│   ├── Team.tsx
│   ├── Portfolio.tsx
│   ├── Blog.tsx
│   ├── Testimonials.tsx
│   ├── CTA.tsx
│   ├── Contact.tsx
│   ├── Pricing.tsx
│   └── index.ts          # exports all + registry entry
├── restaurant/
│   ├── Hero.tsx
│   ├── MenuHighlights.tsx
│   ├── Reservation.tsx
│   ├── Gallery.tsx
│   ├── Testimonials.tsx
│   ├── Contact.tsx
│   ├── Specials.tsx
│   ├── Menu.tsx
│   └── index.ts
├── shared/
│   ├── HighlightTitle.tsx
│   ├── Button.tsx
│   └── SectionWrapper.tsx
└── index.ts              # registry composition
```

### 2.3 Registry-Based Page Renderer

```tsx
// apps/frontend/src/app/(marketing)/page.tsx
import { getTemplateConfig, getTemplateTheme } from '@/lib/template-registry'

export default function LandingPage() {
  const [templateCategory, setTemplateCategory] = useState('digital-agency')
  const template = getTemplateConfig(templateCategory)
  const theme = getTemplateTheme(templateCategory)

  // Dynamic CSS loading (Phase 2 - placeholder for now)
  useEffect(() => {
    document.body.className = `${templateCategory}-template`
    // TODO: Phase 2 - dynamically load template.cssPath
  }, [templateCategory])

  return (
    <main style={{ ...themeVars(theme) }}>
      {sections.map((section, i) => {
        const Renderer = template.sections[section.blockType]
        if (!Renderer) {
          console.warn(`No renderer for blockType: ${section.blockType}`)
          return <div key={i} data-missing-section={section.blockType} />
        }
        return <Renderer key={i} section={section} index={i} />
      })}
    </main>
  )
}
```

### 2.4 Backoffice Preview Parity

```tsx
// apps/backoffice/src/templates/MarketplaceView.tsx
import { getTemplateConfig } from '@/../frontend/src/lib/template-registry'

function TemplatePreview({ template }) {
  const config = getTemplateConfig(template.category)
  // Use same section renderers for preview
  return (
    <div className="preview-frame" style={config.theme}>
      {template.layoutConfig.sections.map((type, i) => {
        const Renderer = config.sections[type]
        return Renderer ? <Renderer key={i} section={mockSection(type)} /> : null
      })}
    </div>
  )
}
```

---

## 3. Acceptance Criteria (Testable, Measurable)

| ID | Criterion | Test Method | Owner |
|----|-----------|-------------|-------|
| AC-1 | `template-registry.ts` exports both templates with sections, theme, cssPath | Unit test: `Object.keys(templateRegistry).length === 2` | frontend-lead |
| AC-2 | Registry theme tokens match existing CSS variables | Visual regression + token comparison test | ui-lead |
| AC-3 | Sections moved to `components/sections/{digital-agency,restaurant}/` | File existence + import test | frontend-lead |
| AC-4 | `renderSection` replaced with registry lookup — no conditional classes | Code review + typecheck | frontend-lead |
| AC-5 | Frontend renders Food Express with registry (Marcellus, gold #c8a97e) | Puppeteer: fontFamily=Marcellus, badge color=#c8a97e | frontend-lead |
| AC-6 | Backoffice marketplace preview uses same registry | Visual parity check + integration test | backend-lead |
| AC-7 | All existing tests pass (typecheck, build, API, frontend, E2E) | `pnpm test:ci` | project-shepherd |

---

## 4. Dependencies & Risks

| Dependency | Owner | Status | Risk if Late |
|------------|-------|--------|--------------|
| Sprint 9 Complete | project-shepherd | ✅ Done | Cannot start |
| Section components extraction | frontend-lead | Planned | Blocks registry composition |
| Restaurant CSS class audit | ui-lead | Planned | Theme token mismatch |
| Backoffice preview refactor | backend-lead | Planned | Preview/render drift |

---

## 5. Phase Plan (Sprint 10 = Phase 1)

| Phase | Week | Deliverable |
|-------|------|-------------|
| **Phase 1a** | Day 1-2 | Create `template-registry.ts` with both templates |
| **Phase 1b** | Day 2-4 | Restructure sections into template-specific folders |
| **Phase 1c** | Day 4-5 | Update page renderer to use registry |
| **Phase 1d** | Day 5-6 | Update backoffice preview parity |
| **Phase 1e** | Day 6-7 | Tests, documentation, governance artifacts |

---

## 6. Governance Artifacts

- `Cellule Perissos/Sprints/Sprint_10_Spec.md` (this file)
- `Cellule Perissos/Sprints/test-report-10.json`
- `Cellule Perissos/Sprints/APPROVALS-10.md`
- `Cellule Perissos/Sprints/Sprint_10_Retro.md`
- `Cellule Perissos/Sprints/SPRINT10_PROGRESS_2026-08-19.md`

---

## 7. Sprint 10 — Phase 2 & 3 Preview (Not in this sprint)

| Phase | Sprint | Goal |
|-------|--------|------|
| **Phase 2** | 11 | Dynamic CSS loading via `next/dynamic` + cache + FOUC prevention |
| **Phase 3** | 11 | Dynamic section components — registry maps `blockType` → lazy-loaded React component |

---

*Gate D Authorized: All Sprint 9 approvals received. Sprint 10 execution authorized.*

Baruch Hachem le'Olam, Amen veAmen.