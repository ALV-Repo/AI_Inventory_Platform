# AI StockFlow

**CONFIDENTIAL — AI Lead Vision Pvt. Ltd.**

AI-powered inventory and business management platform. Multi-tenant SaaS built to the
requirements in `AI_Inventory_Platform_SRS_v2_CONFIDENTIAL.pdf`.

> **v1.0.1** — hardened after a full code review; see `CODE_REVIEW.md` for the
> findings (reorder-approval contract, invoice-number races, login lockout,
> rate limiting, CI fixes) and the accepted-risk register.

---

## Run it locally

```bash
cp .env.example .env        # then set JWT_SECRET
make up
```

| What | Where |
|---|---|
| Dashboard | http://localhost:3000 |
| API docs (Swagger) | http://localhost:8000/docs |
| Health check | http://localhost:8000/health |

Demo sign-ins (seeded automatically, password `Demo@12345`):

| Email | Role | Sees |
|---|---|---|
| `owner@irobox.in` | Owner | Everything |
| `manager@irobox.in` | Store manager | Inventory, purchase, sales, AI |
| `cashier@irobox.in` | Cashier | POS and stock lookup only |
| `accounts@irobox.in` | Accountant | Finance and reports only |

Signing in as the cashier is the quickest way to see RBAC working — the AI panels and
finance widgets disappear.

Other commands: `make test`, `make lint`, `make logs`, `make fresh` (wipe and reseed).

---

## Layout

```
backend/
  app/
    core/         config, database + tenant scoping, security/RBAC
    models/       SQLAlchemy entities (SRS §8.1)
    routers/      auth, inventory, sales, dashboard, ai
    services/     logic.py (pure business rules), copilot.py, seed.py
  alembic/        migrations
  tests/          logic tests + cross-tenant isolation gate
frontend/
  app/            Next.js routes (dashboard, login)
  components/     dashboard widgets
  lib/api.ts      typed API client with token refresh
deploy/k8s/       deployments, ingress, HPA, backup + forecast cronjobs
.github/workflows/ci-cd.yml
```

---

## Architecture

Modular monolith (SRS §7.2) — one FastAPI deployable with hard module boundaries, so
the AI engine and POS can be extracted into services later without a rewrite.

```
Web (Next.js) ─┐
Mobile (Flutter)├─→ API Gateway ─→ Core services ─→ PostgreSQL (schema per tenant)
Voice ─────────┘   auth, tenant     inventory       Redis (cache, events)
                   routing,         purchase        Object storage
                   rate limits      sales/POS
                                    finance
                                    ↓
                                 AI Gateway ─→ forecasting · copilot (RAG)
                                               vision · pricing · anomaly
```

### Tenant isolation

Every tenant-owned query goes through `scoped(db, Model, tenant_id)` in
`app/core/database.py`. It refuses to run without a tenant scope and refuses models
that have no `tenant_id`. The tenant comes from a signed JWT claim and is re-checked
against the stored user record on every request.

`tests/test_isolation.py` runs on every build and blocks the release if any endpoint,
report, or Copilot answer can reach another tenant's rows (NFR-01).

### AI safety

Nothing with a financial effect commits itself:

- Reorder proposals draft a PO and wait for **Approve** (FR-AI-PUR-02).
- Price suggestions are never auto-applied (FR-AI-PRC-02).
- Copilot retrieval is filtered by tenant **and** by the asking user's permissions
  (FR-AI-COP-03), and every answer ships the figures behind it (FR-AI-COP-02).
- Retrieved records are passed to the model as data, never as instructions.
- Forecasts built on thin history are labelled `heuristic:*` so nobody mistakes a
  guess for a model output (FR-AI-FOR-04).

Swap LLM providers with `AI_PROVIDER` — business code never talks to a vendor SDK.
With `AI_PROVIDER=stub` the Copilot still answers using deterministic rules, so the
product degrades rather than breaks when the provider is down.

---

## Pipeline

`.github/workflows/ci-cd.yml`, gated per SRS §13:

1. **Backend** — ruff, pytest with ≥70% coverage, isolation gate, `alembic check`.
2. **Frontend** — lint, typecheck, production build.
3. **Security** — pip-audit, npm audit, Trivy (fails on HIGH/CRITICAL), gitleaks.
4. **Publish** — multi-arch images to GHCR, tagged with the commit SHA.
5. **Deploy** — `develop` → staging automatically; `main` → production behind a
   manual approval environment, migrations first, then a rolling update with
   automatic rollback if the smoke test fails.

---

## Traceability

| Requirement | Implementation |
|---|---|
| FR-INV-08 adjustments need a reason | `routers/inventory.py` — `reason_code` is required |
| FR-INV-12 immutable ledger | `StockMovement`, append-only; corrections are reversing entries |
| FR-SAL-04 offline POS | `idempotency_key` on `SalesOrder`; replays return the original bill |
| FR-FIN-01 GST | `logic.compute_gst` — CGST/SGST vs IGST by place of supply |
| FR-AI-FOR-01/04 forecasting | `logic.forecast_demand` with labelled heuristic fallback |
| FR-AI-PUR-01/03 auto purchase | `logic.suggest_reorder` returns `reasoning` with every proposal |
| FR-AI-DSD-01 dead stock | `logic.classify_stock` |
| FR-AI-BHS-01 health score | `logic.business_health_score` |
| NFR-01 tenant isolation | `core/database.scoped` + `tests/test_isolation.py` |
| NFR-05 no lost transactions | idempotent sale posting |
| NFR-06 backups | `deploy/k8s/cronjobs.yaml` |
| NFR-08 audit trail | `AuditLog` written on every stock/finance/permission change |
| NFR-13 observability | request-id and latency middleware in `main.py` |

---

## Before production

- [ ] Replace `JWT_SECRET` with a vault-injected value; rotate on a schedule.
- [ ] Point `DATABASE_URL` at managed PostgreSQL with encryption at rest.
- [ ] Set `SEED_DEMO_DATA=false` and `AUTO_CREATE_SCHEMA=false` (Alembic owns the schema).
- [ ] Fill in the real cluster deploy steps in the pipeline's deploy jobs.
- [ ] Run `alembic revision --autogenerate` and review before the first real migration.
- [ ] Commit `frontend/package-lock.json` after the first `npm install` so CI can
      switch to `npm ci` and `npm audit` activates.
- [ ] Move login-lockout and rate-limit state to Redis before scaling past one replica.
- [ ] Book a penetration test — the SRS requires one before major releases.
