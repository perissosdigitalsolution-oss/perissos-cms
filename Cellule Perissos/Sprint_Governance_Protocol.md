# Sprint Governance Protocol
## Document → Test → Approve → Validate (DTAP)

**Version:** 1.0  
**Date:** 2026-08-13  
**Location:** `/Users/apple/Desktop/Perissos CMS/Cellule Perissos/Sprint_Governance_Protocol.md`  
**Authority:** Agent Expert Roles (Cellule Perissos/*.md)  
**Classification:** Mandatory — All sprints must follow this protocol

---

## 1. Governance Philosophy

> **Every sprint is a professional deliverable.** Not "code that works" — **documented, tested, approved, validated** work that any agent can inherit without ambiguity.

This protocol binds the **Agent Expert Roles** (Backend_Architect, Frontend_Developer, DevOps_Automator, Security_Engineer, UI_Designer, Data_Engineer, Project_Shepherd, etc.) to a **four-gate lifecycle**:

| Gate | Purpose | Agent Authority | Artifact |
|------|---------|-----------------|----------|
| **D — Document** | Specify *what* and *why* before *how* | Project_Shepherd + Domain Lead | `Sprint_{n}_Spec.md` |
| **T — Test** | Prove it works, prove it's safe | DevOps_Automator + Security_Engineer | `test-report-{n}.json` + coverage |
| **A — Approve** | Cross-domain sign-off | All Domain Leads | `APPROVALS-{n}.md` |
| **V — Validate** | Production readiness & retrospection | Project_Shepherd + Orchestrator | `Sprint_{n}_Retro.md` + release tag |

**No gate skipped. No gate rushed. No exceptions.**

---

## 2. Agent Role Authority Matrix

Each gate has **mandatory reviewers** drawn from the Agent Expert roles:

| Agent Role | File | Domain Authority | Gates |
|------------|------|------------------|-------|
| **Project_Shepherd** | `Project_Shepherd_Agent.md` | Sprint scope, timeline, stakeholder alignment | D, A, V |
| **Backend_Architect** | `Backend_Architect_Agent.md` | Payload collections, API, DB, auth, hooks | D, T, A |
| **Frontend_Developer** | `Frontend_Developer_Agent.md` | Next.js, sections, static export, Core Web Vitals | D, T, A |
| **DevOps_Automator** | `DevOps_Automator_Agent.md` | Docker, CI/CD, Cloudflare, Neon, R2, monitoring | D, T, A, V |
| **Security_Engineer** | `Security_Engineer_Agent.md` | Auth, RBAC, secrets, CORS, vulnerability scanning | T, A |
| **UI_Designer** | `UI_Designer_Agent.md` | Payload admin customization, design system, accessibility | D, T, A |
| **Data_Engineer** | `Data_Engineer_Agent.md` | Schema migrations, analytics, ETL, backups | D, T, A |
| **Backend_Architect** | `Backend_Architect_Agent.md` | System architecture, scalability, reliability | D, A, V |
| **Rapid_Prototyper** | `Rapid_Prototyper_Agent.md` | Spike validation, proof-of-concept | D (optional) |
| **Mobile_App_Builder** | `Mobile_App_Builder_Agent.md` | Future: mobile clients | D (future) |
| **AI_Engineer** | `AI_Engineer_Agent.md` | AI features, embeddings, agents | D (future) |
| **Brand_Guardian** | `Brand_Guardian_Agent.md` | Visual identity, tone, consistency | D, A (future) |
| **Developer_Senior** | `Developer_Senior_Agent.md` | Code quality, mentoring, standards | T, A (all) |

**Rule:** An agent *must* review gates in their domain. No "drive-by approvals."

---

## 3. Gate Definitions & Templates

### 3.1 Gate D — DOCUMENT (Sprint Specification)

**When:** Sprint start (Day 0)  
**Owner:** Project_Shepherd + Domain Leads  
**Input:** Sprint goal from `Cellule_Taskforce_Report.md`  
**Output:** `Cellule Perissos/Sprints/Sprint_{n}_Spec.md`

#### Template: `Sprint_{n}_Spec.md`
```markdown
# Sprint {n} Specification: {Title}

**Sprint:** {n} | **Dates:** YYYY-MM-DD → YYYY-MM-DD  
**Goal (1 sentence, measurable):** {e.g., "Ship 5 default templates pre-installed via seed script"}  
**Related Taskforce Item:** Sprint {n} in Cellule_Taskforce_Report.md

## 1. Scope (IN / OUT)

### IN
- [ ] {Deliverable 1} — {Agent Role} — {Acceptance Criteria}
- [ ] {Deliverable 2} — {Agent Role} — {Acceptance Criteria}

### OUT (Explicitly Deferred)
- {Item} → Sprint {n+1} | Reason: {why}

## 2. Technical Design (per Domain)

### Backend (Backend_Architect)
- **Collections changed:** {list}
- **API endpoints:** {new/modified}
- **Hooks/Access Control:** {details}
- **Migrations:** {up/down scripts}

### Frontend (Frontend_Developer)
- **Components added/modified:** {list}
- **Pages affected:** {routes}
- **Performance budget:** {LCP, CLS, TBT targets}

### DevOps (DevOps_Automator)
- **Infra changes:** {Docker, CI, env vars, secrets}
- **Deploy targets:** {Vercel, Cloudflare, Neon}
- **Rollback plan:** {steps}

### Security (Security_Engineer)
- **Threat model:** {STRIDE summary}
- **Auth/RBAC changes:** {details}
- **Secrets rotation:** {plan}

### UI/UX (UI_Designer)
- **Design tokens:** {colors, spacing, typography}
- **Accessibility:** {WCAG level, test plan}
- **Payload admin changes:** {custom components, styles}

## 3. Acceptance Criteria (Testable, Measurable)

| ID | Criterion | Test Method | Owner |
|----|-----------|-------------|-------|
| AC-1 | {Description} | {Unit/E2E/Manual} | {Agent} |
| AC-2 | {Description} | {Unit/E2E/Manual} | {Agent} |

## 4. Dependencies & Risks

| Dependency | Owner | Status | Risk if Late |
|------------|-------|--------|--------------|
| {External/Internal} | {Agent} | {Ready/Blocked} | {Impact} |

## 5. Sign-Off (Gate D)

| Role | Agent | Signature | Date |
|------|-------|-----------|------|
| Project_Shepherd | | | |
| Backend_Architect | | | |
| Frontend_Developer | | | |
| DevOps_Automator | | | |
| Security_Engineer | | | |
| UI_Designer | | | |
```

---

### 3.2 Gate T — TEST (Verification & Validation)

**When:** Sprint end (before merge to main)  
**Owner:** DevOps_Automator + Security_Engineer + Domain Leads  
**Input:** Completed PRs on `sprint/{n}-*` branch  
**Output:** `Cellule Perissos/Sprints/test-report-{n}.json` + coverage report

#### Mandatory Test Suite
| Layer | Tool | Threshold | Agent |
|-------|------|-----------|-------|
| **TypeScript** | `pnpm typecheck` | 0 errors | All |
| **Build** | `pnpm build` | 0 errors | All |
| **Unit Tests** | Vitest/Jest | ≥80% coverage | Domain Lead |
| **Integration** | `pnpm test:api` | 100% pass | Backend_Architect |
| **E2E** | Playwright | Critical paths | Frontend_Developer |
| **Security Scan** | `pnpm audit` + Snyk | 0 high/critical | Security_Engineer |
| **Accessibility** | axe-core | WCAG 2.1 AA | UI_Designer |
| **Performance** | Lighthouse CI | LCP < 2.5s, CLS < 0.1 | Frontend_Developer |
| **Bundle Size** | `pnpm analyze` | < 100KB gzip (frontend) | Frontend_Developer |

#### Test Report Template: `test-report-{n}.json`
```json
{
  "sprint": {n},
  "timestamp": "ISO8601",
  "branch": "sprint/{n}-{name}",
  "commit": "sha",
  "gates": {
    "typecheck": { "passed": true, "duration_ms": 4734 },
    "build": { "passed": true, "duration_ms": 182000 },
    "unit": { "passed": true, "coverage": 87, "files": 42 },
    "integration": { "passed": true, "tests": 12 },
    "e2e": { "passed": true, "scenarios": 8 },
    "security": { "passed": true, "vulnerabilities": { "critical": 0, "high": 0 } },
    "a11y": { "passed": true, "violations": 0 },
    "performance": { "passed": true, "lcp_ms": 1840, "cls": 0.04 },
    "bundle": { "passed": true, "size_kb_gzip": 87 }
  },
  "artifacts": {
    "coverage": "path/to/coverage",
    "playwright": "path/to/playwright-report",
    "lighthouse": "path/to/lighthouse-report"
  }
}
```

---

### 3.3 Gate A — APPROVE (Cross-Domain Sign-Off)

**When:** All Gate T checks green  
**Owner:** Project_Shepherd (facilitates)  
**Input:** `test-report-{n}.json` + PR diffs  
**Output:** `Cellule Perissos/Sprints/APPROVALS-{n}.md`

#### Approval Template: `APPROVALS-{n}.md`
```markdown
# Sprint {n} Approvals

**Sprint:** {n} | **Branch:** sprint/{n}-{name} | **Commit:** {sha}  
**Test Report:** `test-report-{n}.json` ✅ All Gates Green

## Domain Approvals (Mandatory)

| Domain | Agent | Approved | Concerns | Date |
|--------|-------|----------|----------|------|
| Backend (Payload, API, DB) | Backend_Architect | ☐ | {any} | |
| Frontend (Next.js, Sections) | Frontend_Developer | ☐ | {any} | |
| DevOps (Infra, CI/CD, Deploy) | DevOps_Automator | ☐ | {any} | |
| Security (Auth, Secrets, Scan) | Security_Engineer | ☐ | {any} | |
| UI/UX (Admin, Design, A11y) | UI_Designer | ☐ | {any} | |
| Data (Migrations, Analytics) | Data_Engineer | ☐ | {any} | |
| Code Quality (Standards, Patterns) | Developer_Senior | ☐ | {any} | |

## Architectural Review (Backend_Architect + Project_Shepherd)

- [ ] No breaking changes without migration path
- [ ] Scalability validated (load test if applicable)
- [ ] Observability: logs, metrics, traces added
- [ ] Rollback tested

## Final Go/No-Go

| Role | Decision | Signature | Date |
|------|----------|-----------|------|
| Project_Shepherd | ☐ Go / ☐ No-Go | | |
| Orchestrator | ☐ Go / ☐ No-Go | | |

**If any No-Go:** Document blockers, return to Gate T.
```

---

### 3.4 Gate V — VALIDATE (Production Readiness & Retrospective)

**When:** Post-merge to `main`, post-deploy verification  
**Owner:** Project_Shepherd + Orchestrator  
**Input:** Deployed `main` + monitoring data  
**Output:** `Cellule Perissos/Sprints/Sprint_{n}_Retro.md` + Git tag `v0.{n}.0`

#### Retrospective Template: `Sprint_{n}_Retro.md`
```markdown
# Sprint {n} Retrospective & Validation

**Sprint:** {n} | **Tag:** v0.{n}.0 | **Deployed:** YYYY-MM-DD HH:MM UTC  
**Production URL:** https://perissos.dev (backoffice) | https://app.perissos.dev (frontend)

## 1. Delivered vs. Specified

| Spec Item (from Sprint_{n}_Spec.md) | Status | Notes |
|--------------------------------------|--------|-------|
| {AC-1} | ✅ Done / ⚠️ Partial / ❌ Deferred | {Evidence} |
| {AC-2} | ✅ Done / ⚠️ Partial / ❌ Deferred | {Evidence} |

## 2. Production Validation (24h Post-Deploy)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Backoffice health (`/api/health`) | 200 OK | | ☐ |
| Frontend render (active template) | 200 OK | | ☐ |
| Template import → activate → render | < 30s | | ☐ |
| Error rate (5xx) | < 0.1% | | ☐ |
| P99 latency (API) | < 500ms | | ☐ |
| Build time (CI) | < 3 min | | ☐ |

## 3. What Worked Well

- {Practice to continue}
- {Tool/Process that helped}

## 4. What Didn't Work

- {Pain point}
- {Root cause}
- **Action Item:** {Concrete fix for next sprint}

## 5. Technical Debt Incurred

| Item | Severity | Sprint to Address | Owner |
|------|----------|-------------------|-------|
| {Shortcut taken} | Low/Med/High | {n+X} | {Agent} |

## 6. Knowledge Captured (Update These Docs)

- [ ] `Cellule_Taskforce_Report.md` — Sprint history, roadmap adjustments
- [ ] `Agentic_Orchestration.md` — New decisions, pitfalls, commands
- [ ] Agent role files — New patterns, updated deliverables
- [ ] Architecture Decision Record (ADR) — if architectural

## 7. Sign-Off (Gate V)

| Role | Agent | Validated | Date |
|------|-------|-----------|------|
| Project_Shepherd | | ☐ | |
| Orchestrator | | ☐ | |
```

---

## 4. Sprint Governance Calendar (Per Sprint)

```
Day 0 (Sprint Start)
├── Project_Shepherd: Create Sprint_{n}_Spec.md (Gate D)
├── Domain Leads: Review & sign Gate D
└── Orchestrator: Create sprint branch, assign tasks

Day 1–(N-2) (Execution)
├── Daily Signals (Agentic_Orchestration.md)
├── WIP commits to sprint branch
├── Blockers → Escalation (4h rule)
└── Mid-sprint sync (Day N/2) — Gate D alignment check

Day N-1 (Freeze)
├── Feature complete
├── PRs opened against sprint branch
├── DevOps_Automator: CI runs full test suite (Gate T)
└── Security_Engineer: Security scan

Day N (Gate T → A)
├── All tests green → test-report-{n}.json
├── Project_Shepherd: Circulate APPROVALS-{n}.md
├── Domain Leads: Review PRs + test report → Sign Gate A
└── Orchestrator: Merge to main, tag v0.{n}.0

Day N+1 (Gate V)
├── Deploy to production (auto via CI/CD)
├── 24h monitoring validation
├── Project_Shepherd: Sprint_{n}_Retro.md
├── Update Cellule_Taskforce_Report.md
└── Sprint {n+1} planning begins
```

---

## 5. Artifact Repository Structure

```
/Users/apple/Desktop/Perissos CMS/Cellule Perissos/
├── Cellule_Taskforce_Report.md          # Vision, history, roadmap
├── Agentic_Orchestration.md             # Agent coordination protocol
├── Sprint_Governance_Protocol.md        # THIS FILE
├── Sprints/
│   ├── Sprint_0_Spec.md
│   ├── Sprint_0_Retro.md
│   ├── test-report-0.json
│   ├── APPROVALS-0.md
│   ├── Sprint_1_Spec.md
│   ├── ...
│   └── Sprint_6_Spec.md                 # Current active
└── Agents/
    ├── Backend_Architect_Agent.md
    ├── Frontend_Developer_Agent.md
    ├── DevOps_Automator_Agent.md
    ├── Security_Engineer_Agent.md
    ├── UI_Designer_Agent.md
    ├── Data_Engineer_Agent.md
    ├── Project_Shepherd_Agent.md
    ├── Developer_Senior_Agent.md
    ├── Rapid_Prototyper_Agent.md
    ├── Mobile_App_Builder_Agent.md
    ├── AI_Engineer_Agent.md
    ├── Brand_Guardian_Agent.md
    ├── # Blueprint Sprint 1 - Plateforme SaaS (Payload +...
    └── # Blueprint Sprint 2 - Automatisation & Expérience Client.md
```

---

## 6. Enforcement Rules

| Violation | Consequence |
|-----------|-------------|
| Skip Gate D | Sprint blocked — no work begins without spec |
| Skip Gate T | No merge to main — CI enforces `pnpm test:ci` |
| Skip Gate A | No deploy — requires all domain approvals |
| Skip Gate V | No sprint closure — retro mandatory for learning |
| Missing agent sign-off | Escalation to Orchestrator → Project_Shepherd |
| Falsified test reports | Immediate removal from agent manifest |

**CI Enforcement:** GitHub Actions will gate `main` merges on:
```yaml
- name: Verify Governance Gates
  run: |
    [[ -f "Cellule Perissos/Sprints/test-report-${SPRINT}.json" ]] || exit 1
    [[ -f "Cellule Perissos/Sprints/APPROVALS-${SPRINT}.md" ]] || exit 1
    # Parse JSON, verify all gates passed
```

---

## 7. Quick Reference: Agent → Gate Mapping

| Agent | Gate D (Doc) | Gate T (Test) | Gate A (Approve) | Gate V (Validate) |
|-------|--------------|---------------|------------------|-------------------|
| Project_Shepherd | ✅ Lead | | ✅ Facilitate | ✅ Lead |
| Backend_Architect | ✅ Domain | ✅ API/DB | ✅ Domain | |
| Frontend_Developer | ✅ Domain | ✅ FE/E2E | ✅ Domain | |
| DevOps_Automator | ✅ Infra | ✅ CI/CD/Perf | ✅ Domain | ✅ Deploy |
| Security_Engineer | | ✅ Scan/Threat | ✅ Domain | |
| UI_Designer | ✅ Design | ✅ A11y/Visual | ✅ Domain | |
| Data_Engineer | ✅ Schema | ✅ Migrations | ✅ Domain | |
| Developer_Senior | | ✅ Code Quality | ✅ All | |
| Orchestrator | | | ✅ Final | ✅ Final |

---

## 8. First Application: Sprint 6 (Template Library)

**Retroactively apply this protocol to Sprint 6:**

- [ ] Create `Sprint_6_Spec.md` from current Taskforce items
- [ ] Run full test suite → `test-report-6.json`
- [ ] Circulate `APPROVALS-6.md` for domain sign-off
- [ ] On merge: tag `v0.6.0`, write `Sprint_6_Retro.md`
- [ ] Update `Cellule_Taskforce_Report.md` with validated outcomes

**Going forward:** Every sprint (7, 8, 9...) follows this protocol from Day 0.

---

*End of Governance Protocol. This document is binding. The Agent Expert roles in Cellule Perissos/*.md are the constitutional authorities for their domains. Respect the gates. Honor the handoffs. Ship with confidence.*

**Shalom Shalom, Baruch HaShem le'Olam, Amen veAmen.**