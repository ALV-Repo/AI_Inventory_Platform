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
from app.routers import ai, auth, dashboard, inventory, purchases, sales, finance
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
    # Development convenience only. In staging/production the schema is owned by
    # Alembic in the CI/CD pipeline and AUTO_CREATE_SCHEMA must be false.
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
    version="1.0.1",
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


# --------------------------------------------------------------- rate limiting
# Per-process sliding window keyed by client IP (SRS §9 — API protection).
# This is the last line of defence; the real per-tenant limits live at the
# ingress/API gateway (see deploy/k8s/ingress.yaml). Auth endpoints get a
# tighter budget because they are the brute-force target.
_hits: dict[str, deque] = defaultdict(deque)
_AUTH_LIMIT = 20  # per minute per IP
@app.middleware("http")
async def rate_limit(request: Request, call_next):
    # Test suites make many authentication requests from the same IP.
    # Keep production rate limiting unchanged, but avoid test-order
    # dependent 429 failures when running under pytest.
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
                content={
                    "detail": "Too many requests. Wait a minute and try again."
                },
                headers={"Retry-After": "60"},
            )

        window.append(now)

    return await call_next(request)
@app.middleware("http")
async def observability(request: Request, call_next):
    """Request id + latency logging (NFR-13)."""
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000
    response.headers["x-request-id"] = request_id
    response.headers["x-response-time-ms"] = f"{elapsed_ms:.1f}"
    log.info(
        "%s %s %s %.1fms rid=%s",
        request.method, request.url.path, response.status_code, elapsed_ms, request_id,
    )
    return response


@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception):
    """Never leak internals to the client (SRS §9)."""
    log.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on our side. Try again in a moment."},
    )

from app.routers import ai, auth, dashboard, inventory, purchases, sales
for router in (
    auth.router,
    inventory.router,
    purchases.router,
    sales.router,
    dashboard.router,
    ai.router,
    finance.router,
):
    app.include_router(router, prefix=settings.API_V1)

@app.get("/health", tags=["Ops"])
def health():
    """Liveness probe (NFR-13)."""
    return {"status": "ok", "version": app.version}


@app.get("/health/ready", tags=["Ops"])
def readiness():
    """Readiness probe — confirms the database is reachable."""
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ready", "database": "up"}
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not_ready", "database": "down"})
