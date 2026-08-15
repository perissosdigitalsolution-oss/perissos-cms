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

---

## Governance Structure

```
Cellule Perissos/
├── Cellule_Taskforce_Report.md          # Master vision & architecture
├── Sprint_Governance_Protocol.md        # DTAP lifecycle rules
├── Agentic_Orchestration.md             # How agents coordinate
├── PROJECT_REPORT_2026-08-13.md         # Current project status
├── Sprints/
│   ├── Sprint_6_Spec.md                 # Sprint 6 specification
│   ├── Sprint_7_Spec.md                 # Sprint 7 specification (current)
│   ├── TEST_REPORT_6.json               # Test evidence
│   ├── APPROVALS_6.md                   # Cross-domain sign-offs
│   └── RETRO_6.md                       # Retrospective
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
```

---

## Questions?

Refer to `Cellule Perissos/Agentic_Orchestration.md` for coordination protocols.
