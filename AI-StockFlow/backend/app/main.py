"""AI StockFlow API entry point (SRS §7.2 — modular monolith, API-first)."""
import logging
import time
import uuid
from collections import defaultdict, deque
from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import Base, engine
from app.models import entities

logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}',
)
log = logging.getLogger("stockflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.AUTO_CREATE_SCHEMA:
        Base.metadata.create_all(bind=engine)
    if settings.SEED_DEMO_DATA:
        from app.services.seed import seed_demo_tenant
        seed_demo_tenant()
        log.info("Demo tenant seeded")
    yield


app = FastAPI(
    title="AI StockFlow API",
    description=(
        "AI-Powered Inventory & Business Management Platform. "
        "Multi-tenant SaaS — every endpoint is scoped to the tenant in the access token."
    ),
    version="1.0.2",
    docs_url="/docs",
    openapi_url=f"{settings.API_V1}/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rate limiting ─────────────────────────────────────────────────────────────
_hits: dict[str, deque] = defaultdict(deque)
_AUTH_LIMIT = 20

@app.middleware("http")
async def rate_limit(request: Request, call_next):
    if "PYTEST_CURRENT_TEST" in os.environ:
        return await call_next(request)
    path = request.url.path
    if path.startswith(settings.API_V1):
        client = request.client.host if request.client else "unknown"
        is_auth = "/auth/" in path
        limit = _AUTH_LIMIT if is_auth else settings.RATE_LIMIT_PER_MINUTE
        window = _hits[f"{client}:{'auth' if is_auth else 'api'}"]
        now = time.monotonic()
        while window and now - window[0] > 60:
            window.popleft()
        if len(window) >= limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Wait a minute and try again."},
                headers={"Retry-After": "60"},
            )
        window.append(now)
    return await call_next(request)


@app.middleware("http")
async def observability(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000
    response.headers["x-request-id"] = request_id
    response.headers["x-response-time-ms"] = f"{elapsed_ms:.1f}"
    log.info("%s %s %s %.1fms rid=%s", request.method, request.url.path, response.status_code, elapsed_ms, request_id)
    return response


@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception):
    log.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong on our side. Try again in a moment."})


# ── Routers ───────────────────────────────────────────────────────────────────
# Dev A routers
from app.routers import ai, auth, dashboard, inventory, purchases, sales, finance
# Dev C routers
from app.routers import suppliers, crm, hrm, warehouse, audit

for router in (
    auth.router,
    inventory.router,
    purchases.router,
    suppliers.router,    # FR-PUR-03, FR-PUR-06, FR-PUR-07
    sales.router,
    finance.router,
    dashboard.router,
    ai.router,
    crm.router,          # FR-CRM-01 to FR-CRM-04
    hrm.router,          # FR-HRM-01 to FR-HRM-04
    warehouse.router,    # FR-WHS-01 to FR-WHS-04
    audit.router,        # NFR-08 audit trail
):
    app.include_router(router, prefix=settings.API_V1)


@app.get("/health", tags=["Ops"])
def health():
    return {"status": "ok", "version": app.version}


@app.get("/health/ready", tags=["Ops"])
def readiness():
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ready", "database": "up"}
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not_ready", "database": "down"})
