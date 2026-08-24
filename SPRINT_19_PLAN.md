# Sprint 19 — Comptabilité & Finance (Plan with Bigcapital)

## Overview
**Objective**: Integrate Bigcapital accounting (Node.js/TypeScript/PostgreSQL) into Perissos CMS via adapter pattern, AI actions, webhook from Medusa, and APISIX gateway.

**Branch**: `sprint/19-accounting-finance`

**Gate D (Document)**: ✅ This plan
**Gate T (Test)**: E2E tests with Bigcapital
**Gate A (Approve)**: Cross-domain sign-off
**Gate V (Validate)**: Production readiness

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PERISSOS DIGITAL AI AGENCY                            │
│                         Sprint 19                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │               PERISSOS COMMERCE (Medusa)                         │   │
│  │  ✅ order.paid webhook                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                           │                                             │
│                           ▼ (Webhook: POST /api/accounting/webhook)    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              PERISSOS ACCOUNTING (Bigcapital)                    │   │
│  │  ✅ API REST : /api/invoices, /api/journal-entries              │   │
│  │  ✅ PostgreSQL (ACID, multi-tenant)                             │   │
│  │  ✅ Docker Compose : port 3200 (host) → 3000 (container)        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                           │                                             │
│                           ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              ASSISTANT IA (14+5 = 19 actions)                    │   │
│  │  ✅ query_balance, create_invoice, update_invoice               │   │
│  │  ✅ query_transactions, generate_report                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                           │                                             │
│                           ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              APISIX GATEWAY                                      │   │
│  │  ✅ /api/accounting/* → Bigcapital (rate limited)               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Port Allocation

| Service | Host Port | Container Port | Purpose |
|---------|-----------|----------------|---------|
| Bigcapital App | **3200** | 3000 | Accounting server |
| Bigcapital Postgres | **5435** | 5432 | Accounting database |

*Following pattern: 3000/3001/3002/3100 → 3200; 5432/5433/5434 → 5435*

---

## Deliverables

### 1. Docker Compose: `docker-compose.accounting.yml`
- Bigcapital app (official Docker image or build from source)
- PostgreSQL 16 for Bigcapital
- Health checks
- Connected to `perissos-network`

### 2. Accounting Adapter: `apps/backoffice/src/lib/accounting-adapter.ts`
- `AccountingAdapter` interface (following CRM/Commerce patterns)
- `MockAccountingAdapter` (in-memory for dev)
- `BigcapitalAccountingAdapter` (HTTP client for Bigcapital API)
- Factory: `getAccountingAdapter()` via `ACCOUNTING_PROVIDER=mock|bigcapital`

### 3. Shared Types: `packages/shared/src/types.ts` (extend)
- `AccountingInvoice`, `AccountingInvoiceLineItem`
- `AccountingJournalEntry`, `AccountingJournalEntryLine`
- `AccountingAccount`, `AccountingBalance`
- `FinancialReport` (P&L, Balance Sheet, Trial Balance)
- `AccountingActionResult`, `AccountingMutation`

### 4. AI Actions: `apps/backoffice/src/app/api/ai/actions/route.ts` (extend)
Add 5 new action types:
| Action | Params | Description |
|--------|--------|-------------|
| `query_balance` | `{ accountId?, startDate?, endDate? }` | Account balance / trial balance |
| `create_invoice` | `{ customerId, lineItems[], dueDate, notes? }` | Create draft invoice |
| `update_invoice` | `{ id, status?, lineItems?, dueDate? }` | Update invoice (status: draft/sent/paid/void) |
| `query_transactions` | `{ accountId?, startDate?, endDate?, limit? }` | Journal entries / transactions |
| `generate_report` | `{ type: 'pl'|'bs'|'tb', startDate, endDate }` | P&L, Balance Sheet, Trial Balance |

### 5. Webhook: `apps/backoffice/src/app/api/accounting/webhook/route.ts` (new)
- `POST /api/accounting/webhook` - receives `order.paid` from Medusa
- Idempotent: uses `x-medusa-event-id` header for deduplication
- Creates journal entry: Debit AR / Credit Revenue
- Creates invoice if needed

### 6. APISIX Route: `apisix/routes.yaml` (extend)
Insert before catch-all (line 129):
```yaml
  - uri: /api/accounting/*
    name: "accounting-proxy"
    desc: "Accounting routes proxied to Bigcapital"
    upstream:
      nodes:
        "perissos-accounting-server:3000": 1
      type: roundrobin
    plugins:
      limit-count:
        count: 30
        time_window: 60
        key_type: var
        key: "remote_addr"
        rejected_code: 429
        rejected_msg: '{"error":"Rate limit exceeded. Please try again later."}'
      proxy-rewrite:
        regex_uri: ["^/api/accounting/(.*)", "/$1"]
```

### 7. Environment Variables: `.env.example` (extend)
```bash
# ─── Accounting Integration (Sprint 19) ────────────────────
ACCOUNTING_PROVIDER=mock
# BIGCAPITAL_API_URL=http://localhost:3200
# BIGCAPITAL_API_KEY=your-bigcapital-api-key
# ACCOUNTING_PG_USER=perissos_accounting
# ACCOUNTING_PG_PASSWORD=perissos_accounting_dev
# ACCOUNTING_PG_DB=perissos_accounting
# ACCOUNTING_PG_PORT=5435
# ACCOUNTING_SERVER_PORT=3200
```

### 8. System Prompt Update: `apps/backoffice/src/app/api/ai/chat/route.ts`
Add 5 accounting capabilities to the 14 existing (total 19).

### 9. E2E Tests: `scripts/test-ecosystem.mjs` (extend)
Add 5+ new scenarios for accounting actions.

---

## Day-by-Day Plan (10 Days)

| Day | Task | Owner | Dependencies |
|-----|------|-------|--------------|
| 1 | **Bigcapital PoC**: `docker run` Bigcapital, test API endpoints (auth, invoices, journal entries, reports) | Backend_Architect | — |
| 1-2 | **Bigcapital Docker Compose**: Create `docker-compose.accounting.yml`, verify health checks, test on `perissos-network` | DevOps_Automator | Day 1 |
| 2 | **Accounting Adapter Types**: Define interfaces in `accounting-adapter.ts` + shared types | Backend_Architect | Day 1 |
| 2-3 | **MockAccountingAdapter**: In-memory implementation for dev | Backend_Architect | Day 2 |
| 3-4 | **BigcapitalAccountingAdapter**: HTTP client with auth, error handling, retries | Backend_Architect | Day 2 |
| 4 | **AI Actions (5)**: Add cases to `route.ts`, update system prompt | AI_Engineer | Day 3 |
| 5 | **Medusa → Accounting Webhook**: New route, idempotency, journal entry creation | Backend_Architect + AI_Engineer | Day 3 |
| 6 | **APISIX Route**: Add accounting proxy route, reload config | DevOps_Automator | Day 5 |
| 7-8 | **E2E Tests**: Extend `test-ecosystem.mjs` with accounting scenarios | QA | Day 6 |
| 9 | **Documentation**: Update ARCHITECTURE.md, README | Tech Lead | Day 8 |
| 10 | **Governance**: Spec, Test Report, Approvals, Retro | Project_Shepherd | Day 9 |

---

## Bigcapital API Endpoints (Research Needed Day 1)

Expected endpoints to verify:
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/invoices` | List invoices |
| POST | `/api/invoices` | Create invoice |
| PATCH | `/api/invoices/:id` | Update invoice |
| GET | `/api/journal-entries` | List journal entries |
| POST | `/api/journal-entries` | Create journal entry |
| GET | `/api/accounts` | Chart of accounts |
| GET | `/api/reports/trial-balance` | Trial balance |
| GET | `/api/reports/profit-loss` | P&L |
| GET | `/api/reports/balance-sheet` | Balance Sheet |

---

## File Changes Summary

| File | Change Type |
|------|-------------|
| `docker-compose.accounting.yml` | **CREATE** (new) |
| `apps/backoffice/src/lib/accounting-adapter.ts` | **CREATE** (new) |
| `packages/shared/src/types.ts` | **MODIFY** (add accounting types) |
| `apps/backoffice/src/app/api/ai/actions/route.ts` | **MODIFY** (add 5 actions + import) |
| `apps/backoffice/src/app/api/ai/chat/route.ts` | **MODIFY** (update system prompt) |
| `apps/backoffice/src/app/api/accounting/webhook/route.ts` | **CREATE** (new) |
| `apisix/routes.yaml` | **MODIFY** (add accounting route before catch-all) |
| `.env.example` | **MODIFY** (add accounting vars) |
| `scripts/test-ecosystem.mjs` | **MODIFY** (add accounting tests) |
| `Cellule Perissos/Sprints/Sprint_19_Spec.md` | **CREATE** (governance) |
| `Cellule Perissos/Sprints/TEST_REPORT_19.md` | **CREATE** (after tests) |
| `Cellule Perissos/Sprints/APPROVALS-19.md` | **CREATE** (after approvals) |
| `Cellule Perissos/Sprints/RETRO_19.md` | **CREATE** (after retro) |
| `Cellule Perissos/ARCHITECTURE_Sprint19.md` | **CREATE** (architecture doc) |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bigcapital API differs from expectations | Medium | Medium | Day 1 PoC validates endpoints before commit |
| Bigcapital multi-tenant auth complexity | Low | Medium | Use API key auth (simpler than OAuth) |
| Webhook idempotency edge cases | Medium | High | Use `x-medusa-event-id` + DB unique constraint |
| APISIX route ordering (catch-all) | Low | High | Explicit insert before line 129, test ordering |
| Port conflicts (9001 MinIO/APISIX) | Medium | Low | Bigcapital uses 3200, no conflict |

---

## Success Criteria

- [ ] Bigcapital runs on `docker-compose.accounting.yml` with health checks passing
- [ ] `ACCOUNTING_PROVIDER=bigcapital` works end-to-end
- [ ] 5 AI actions execute correctly via `/api/ai/actions`
- [ ] Medusa `order.paid` webhook creates journal entry in Bigcapital
- [ ] APISIX proxies `/api/accounting/*` to Bigcapital with rate limiting
- [ ] E2E tests pass (all 15+ scenarios including 5 new accounting)
- [ ] Governance docs complete (Spec, Test Report, Approvals, Retro, Architecture)

---

## Next Steps

1. **Approve this plan** → Create branch `sprint/19-accounting-finance`
2. **Day 1**: Run Bigcapital PoC locally
3. **Proceed per day-by-day plan**