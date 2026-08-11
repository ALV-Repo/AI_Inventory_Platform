"""Database session and the mandatory tenant-scoping layer (SRS §7.3, NFR-01).

Every tenant-owned query must go through `scoped()`. No business code is allowed
to call `db.query(Model)` directly on a TenantMixin model — the cross-tenant
isolation test in tests/test_isolation.py enforces this contract.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Query, Session, declarative_base, sessionmaker

from app.core.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def scoped(db: Session, model, tenant_id: int) -> Query:
    """Return a query that can only ever see one tenant's rows."""
    if not hasattr(model, "tenant_id"):
        raise TypeError(f"{model.__name__} is not tenant-scoped; query it directly.")
    if tenant_id is None:
        raise ValueError("Refusing to run a query without a tenant scope.")
    return db.query(model).filter(model.tenant_id == tenant_id)
