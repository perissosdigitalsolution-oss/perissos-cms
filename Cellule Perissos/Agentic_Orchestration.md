# Agentic Orchestration Protocol
## "Where From → Where To" — Agent Handoff & Coordination Guide

**Version:** 1.0  
**Date:** 2026-08-13  
**Location:** `/Users/apple/Desktop/Perissos CMS/Cellule Perissos/Agentic_Orchestration.md`  
**Classification:** Internal — Mandatory for all agents

---

## 1. Purpose

This document defines the **operating protocol** for multi-agent collaboration on Perissos CMS. Every agent (human or AI) entering the project must:

1. Read `Cellule_Taskforce_Report.md` (vision, history, roadmap)
2. Read this document (orchestration rules)
3. Complete the onboarding checklist
4. Register in the agent manifest below

**Goal:** Zero context loss, zero duplicated work, zero conflicting changes.

---

## 2. Agent Manifest (Registry)

| Agent ID | Role | Specialization | Started | Status | Current Sprint |
|----------|------|----------------|---------|--------|----------------|
| `orchestrator-prime` | Orchestrator | Architecture, sprint planning, cross-agent coordination | 2026-08-01 | Active | 6 |
| `backend-lead` | Backend Engineer | Payload collections, API routes, hooks, auth | 2026-08-05 | Active | 6 |
| `frontend-lead` | Frontend Engineer | Next.js, section components, static export | 2026-08-05 | Active | 6 |
| `devops-lead` | DevOps | Docker, CI/CD, Cloudflare, Neon, R2 | 2026-08-08 | Active | 5 |
| `ui-lead` | UI/UX Engineer | Payload admin customization, design system | 2026-08-10 | Active | 6 |
| `template-engineer` | Template Engineer | ZIP import, manifest, HTML→layoutConfig, seeding | 2026-08-12 | Active | 6 |

**New agents:** Add your entry above before starting work.

---

## 3. Communication Protocol

### 3.1 Handoff Format (Mandatory)

When passing work to another agent, use this exact format:

```markdown
## HANDOFF: [Task Name]
**From:** [agent-id]
**To:** [agent-id]
**Date:** YYYY-MM-DD
**Sprint:** [n]
**Priority:** High | Medium | Low

### Context (Where From)
- What was done: [2-3 bullets]
- Key files changed: [paths]
- Decisions made: [why, not just what]
- Blockers resolved: [how]

### Deliverable (Where To)
- What needs doing: [explicit, testable]
- Acceptance criteria: [measurable]
- Files to modify: [paths]
- Dependencies: [other agents, external]

### Critical Knowledge
- Gotchas: [non-obvious traps]
- Commands to run: [exact commands]
- Tests to pass: [specific test names]
```

### 3.2 Daily Sync (Async)

Each agent posts a **Daily Signal** in the shared log (this file, append-only):

```markdown
### [YYYY-MM-DD] [agent-id]
**Completed:** [what shipped]
**In Progress:** [current task]
**Blocked by:** [dependency, agent, or external]
**Next:** [tomorrow's focus]
**Decisions:** [any architectural choices made]
```

### 3.3 Escalation Path

```
Blocker → Tag responsible agent in Daily Signal
        → If no response in 4h → Orchestrator
        → If architectural → Orchestrator + Tech Lead sync
        → Document decision in Cellule_Taskforce_Report.md
```

---

## 4. Workflow Rules

### 4.1 Branch Strategy

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production-ready | Required: typecheck, build, test:ci |
| `sprint/n-*` | Sprint work (e.g., `sprint/6-template-library`) | PR required, 1 review |
| `hotfix/*` | Urgent prod fixes | Fast-track, orchestrator approval |

**Naming:** `agent-id/short-description` (e.g., `ui-lead/template-list-table-view`)

### 4.2 Commit Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

| Type | Use For |
|------|---------|
| `feat` | New feature (template import, new collection) |
| `fix` | Bug fix (hydration error, importMap) |
| `refactor` | Code restructuring (no behavior change) |
| `style` | CSS, formatting (no logic change) |
| `docs` | Documentation updates |
| `test` | Test additions/changes |
| `chore` | Build, deps, config |

**Scope:** `backoffice`, `frontend`, `shared`, `ui`, `infra`, `docs`

**Examples:**
```
feat(backoffice): add template versioning field
fix(frontend): resolve hydration mismatch in RootLayout
refactor(shared): extract layoutConfig types to types.ts
```

### 4.3 PR Requirements

- [ ] Typecheck passes (`pnpm typecheck`)
- [ ] Build passes (`pnpm build`)
- [ ] Tests pass (`pnpm test:ci`)
- [ ] Self-review: diff scanned for secrets, console.logs, TODOs
- [ ] Linked to sprint issue
- [ ] Updated `Cellule_Taskforce_Report.md` if sprint milestone changed

---

## 5. Environment & Commands Reference

### 5.1 Local Development

```bash
# Start full stack
cd /Users/apple/Desktop/Perissos\ CMS
docker compose up -d

# Verify
curl http://localhost:3000/api/health  # → {"status":"ok"}
curl http://localhost:3001/           # → frontend HTML

# Backoffice dev (hot reload)
docker compose logs -f backoffice

# Run tests
pnpm test:ci          # typecheck → build → test:api
pnpm typecheck        # 4 workspaces
pnpm build            # backoffice + frontend
```

### 5.2 Key Files to Know

| File | Why It Matters |
|------|----------------|
| `apps/backoffice/src/templates/TemplateList.tsx` | Custom admin list view — **current pattern** |
| `apps/backoffice/src/collections/Templates.ts` | Template collection schema + hooks |
| `apps/backoffice/src/app/api/templates/import-zip/route.ts` | ZIP import pipeline |
| `apps/backoffice/src/app/(payload)/layout.tsx` | Payload root layout (RootLayout, importMap) |
| `apps/backoffice/src/app/(payload)/admin/importMap.js` | Manual importMap (webpack RSC fix) |
| `apps/backoffice/src/app/(payload)/custom.scss` | Payload admin CSS overrides |
| `apps/frontend/src/app/(marketing)/page.tsx` | Active template renderer |
| `packages/shared/src/types.ts` | Shared TypeScript types |
| `scripts/test-api.mjs` | API smoke tests |
| `docker-compose.yml` | Local stack definition |
| `turbo.json` | Turborepo pipeline config |

### 5.3 Common Pitfalls (Read Before Coding)

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Turbo strips env vars | `PAYLOAD_SECRET` missing in `next dev` | Use direct `pnpm --filter backoffice run dev` in docker-compose |
| Payload CLI broken on Node 20 | `ERR_REQUIRE_ASYNC_MODULE` | Manual `importMap.js` with `@/` alias |
| Webpack RSC import error | `Module not found: ./TemplateList` | Use `@/templates/TemplateList#TemplateList` in importMap |
| Hydration mismatch | `<html>` child of `<body>` | Export `RootLayout` directly, no wrapper component |
| Frontend env not baked | `NEXT_PUBLIC_CMS_URL` undefined at runtime | Docker ARG → ENV in Dockerfile |
| Shared types missing | `Cannot find module '@perissos/shared'` | `pnpm install` at root, check `pnpm-workspace.yaml` |

---

## 6. Sprint Execution Protocol

### 6.1 Sprint Start (Orchestrator)
1. Update `Cellule_Taskforce_Report.md` — move items from "Upcoming" to "Active Sprint"
2. Create sprint branch: `sprint/n-name`
3. Assign tasks to agents with Handoff format
4. Set sprint goal (1 sentence, measurable)

### 6.2 During Sprint (All Agents)
- Daily Signal posted by EOD
- Commit early, commit often (WIP commits OK on sprint branch)
- Blockers → escalate immediately (4h rule)
- No direct pushes to `main`

### 6.3 Sprint End (Orchestrator)
1. All PRs merged to `main`
2. `pnpm test:ci` green on `main`
3. Update `Cellule_Taskforce_Report.md` — move completed to "Completed Sprints"
4. Tag release: `v0.n.0`
5. Retrospective notes appended to this file

---

## 7. Decision Log (Append-Only)

| Date | Decision | Made By | Rationale | Reversible? |
|------|----------|---------|-----------|-------------|
| 2026-08-01 | Monorepo: pnpm + Turborepo | orchestrator-prime | Shared types, atomic commits, cached builds | Yes (high cost) |
| 2026-08-03 | Payload 3.x (not 2.x) | backend-lead | App Router support, better TS, active maint | No |
| 2026-08-05 | Single-tenant per install | orchestrator-prime | Simpler auth, clearer data model, WordPress parity | Yes (before Sprint 8) |
| 2026-08-08 | Docker backoffice bypasses Turbo | devops-lead | Turbo 2.x strips env vars → PAYLOAD_SECRET lost | No (workaround) |
| 2026-08-10 | Manual importMap with @/ alias | backend-lead | Webpack RSC loader requires alias, not relative | Until Payload CLI fixed |
| 2026-08-13 | TemplateList → table-based (Payload-native) | ui-lead | Card grid used wrong CSS vars, alien look | No |

---

## 8. Knowledge Transfer Checklist

When an agent leaves or rotates:

- [ ] All WIP committed to sprint branch
- [ ] Handoff doc created for each active task
- [ ] Daily Signals up to date
- [ ] Secrets rotated if agent had access
- [ ] Agent manifest updated (status → "Rotated")
- [ ] Orchestrator notified

---

## 9. Emergency Contacts

| Role | Agent | Channel |
|------|-------|---------|
| Orchestrator | orchestrator-prime | Direct |
| Backend Emergency | backend-lead | Direct |
| Infra Emergency | devops-lead | Direct |
| Security Incident | orchestrator-prime + devops-lead | Immediate |

---

## 10. Quality Gates (Non-Negotiable)

| Gate | Command | Must Pass |
|------|---------|-----------|
| TypeScript | `pnpm typecheck` | 0 errors |
| Build | `pnpm build` | 0 errors |
| API Tests | `pnpm test:api` | 100% pass |
| Lint | `pnpm lint` (if added) | 0 warnings |
| Bundle | `pnpm analyze` (future) | < threshold |

**No merge to `main` without all gates green.**

---

*End of Orchestration Protocol. This is a living document — append decisions, update manifest, log signals. The strength of the cellule is in the clarity of the handoff.*