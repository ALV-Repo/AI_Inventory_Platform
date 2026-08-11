# Code Review Report — AI StockFlow v1.0 → v1.0.1

**CONFIDENTIAL — AI Lead Vision Pvt. Ltd.**
Scope: full backend, frontend, and pipeline review for production readiness.
Every finding below is fixed in this release unless marked otherwise.

---

## Critical (would have failed in production)

### C1 — Reorder approvals were wired to the wrong identifier
The dashboard's Approve button sent a `product_id` to
`POST /ai/recommendations/{rec_id}/decision`, but the reorder-suggestions
endpoint never created recommendation records at all — every approval would
have 404'd, and nothing at all would have happened after "Approve".
**Fix:** `/ai/reorder-suggestions` now persists each proposal as a pending
`AIRecommendation` (refreshing the payload on later calls) and returns its
`recommendation_id`. Accepting one drafts a real purchase order in `draft`
status with the AI's reasoning attached (FR-AI-PUR-01/02/03), and the response
carries `draft_po_id`. Frontend types and components updated to match.
Covered by three new integration tests, including a cross-tenant write attempt.

### C2 — `pydantic.Field` used as a FastAPI query-parameter default
`seasonality_index: float = Field(default=1.0)` in a route signature isn't a
validated query parameter — the forecast endpoint's seasonality input was
broken. **Fix:** `Query(1.0, ge=0.1, le=5.0)`, plus bounds on `horizon_days`.

### C3 — CI pipeline could not pass as shipped
Two independent failures: (a) `alembic check` compared fifteen ORM tables
against a stub migration that created two, so the migration gate failed on
every build; (b) `npm ci` requires a `package-lock.json` the repo doesn't
contain yet, so the frontend job and Docker build failed at install.
**Fix:** migration 0001 now mirrors `Base.metadata` exactly (later changes must
come from reviewed `--autogenerate` revisions); install steps fall back to
`npm install` until a lockfile is committed, and `npm audit` is skipped with a
notice rather than erroring when the lockfile is absent.

### C4 — Invoice numbers raced and could collide or reuse
Numbering by row count breaks two ways: concurrent bills compute the same
count (unique failure at best, duplicate number at worst), and any deletion
makes a number repeat — unacceptable for GST documents.
**Fix:** numbers derive from `max(id)`, a unique index on
`(tenant_id, order_number)` makes the database the arbiter, and `create_sale`
retries with a bumped sequence on collision. Offline-POS replay protection got
the same treatment: a partial unique index on `(tenant_id, idempotency_key)`
plus an `IntegrityError` handler that returns the winning bill instead of a 500
when two replays race (NFR-05).

## High

### H1 — No brute-force protection on sign-in
SRS §9 requires it; nothing enforced it. **Fix:** five failed attempts per
email+IP locks sign-in for 15 minutes with a `Retry-After` header; success
clears the counter. State is per-process — move to Redis when replicas > 1
(noted in code). Regression test included.

### H2 — Rate limiting configured but never enforced
`RATE_LIMIT_PER_MINUTE` existed in config and nothing read it. **Fix:**
sliding-window middleware on all `/api/v1` paths, with a tighter 20/min budget
on `/auth/*`. Documented as defence-in-depth behind the ingress limits.

### H3 — Multi-worker startup raced the seeder and the schema
Four uvicorn workers each ran `create_all` and the demo seeder; the
existence check is not atomic, so duplicate demo tenants were possible.
**Fix:** seeding takes a Postgres advisory lock; `create_all` is now gated
behind `AUTO_CREATE_SCHEMA` (default true for dev, must be false in
staging/production where Alembic owns the schema).

### H4 — Silent layout breakage from invalid Tailwind classes
`px-4.5`, `h-4.5`, `w-4.5` aren't in Tailwind's default scale — they compile
to nothing, so every card header quietly lost its padding. **Fix:** `4.5`
added to the spacing scale in `tailwind.config.ts`.

## Medium

- **M1 — Timezone handling:** `last_sale.replace(tzinfo=utc)` corrupts values
  that arrive timezone-aware. Replaced with an `_as_utc()` normaliser.
- **M2 — Deprecated FastAPI startup hook:** `@app.on_event("startup")` migrated
  to the lifespan context manager.
- **M3 — Deprecated Pydantic config:** `class Config: from_attributes` migrated
  to `model_config = ConfigDict(...)`.
- **M4 — Session expiry dead-ended the dashboard:** a 401 after token refresh
  failure showed an error card with no way forward; it now routes to `/login`.
- **M5 — Missing `.eslintrc.json`** meant `next lint` prompted interactively in
  CI. Added with `next/core-web-vitals`.
- **M6 — Missing `.dockerignore`** in both images shipped tests, caches, and
  env files into layers. Added for backend and frontend.

## Accepted as-is (documented decisions)

- **Tokens in `sessionStorage`** are readable by any XSS payload. Acceptable
  for the pilot given the CSP-less MVP frontend; the production plan is
  httpOnly cookies issued by a BFF route. Tracked, not fixed here.
- **In-memory throttle/limit state** resets on restart and is per-replica.
  Correct at pilot scale; Redis-backed when the HPA scales past one pod.
- **`bcrypt` truncates passwords at 72 bytes** — inherent to the algorithm,
  no practical impact at sane password lengths.

## Test results after changes

- Business-logic suite: **37/37 passing** (run in this environment).
- Isolation/integration suite: extended from 10 to **14 tests** — new coverage
  for accepted-reorder→draft-PO, decision finality (409), cross-tenant write
  rejection, and login lockout. Runs in CI (requires Postgres + FastAPI stack).
- Full backend compiles clean; workflow and K8s YAML parse clean.
