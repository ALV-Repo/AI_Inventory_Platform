"""FR-INV-07 — Cycle count: variance drives stock adjustment with audit trail."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_token, hash_password
from app.main import app
from app.models.entities import (
    CycleCountEntry, CycleCountSession,
    Product, StockItem, Tenant, User, Warehouse,
)

DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSession()

    tenant = Tenant(name="Test Tenant", plan="starter")
    session.add(tenant)
    session.flush()

    user = User(
        tenant_id=tenant.id, email="owner@test.com",
        password_hash=hash_password("Test@1234"), role="owner", is_active=True,
    )
    session.add(user)

    warehouse = Warehouse(tenant_id=tenant.id, code="WH1", name="Main", is_active=True)
    session.add(warehouse)
    session.flush()

    product = Product(
        tenant_id=tenant.id, sku="TEST-001", name="Test Product",
        cost_price=100.0, selling_price=150.0, gst_rate=18.0,
        reorder_level=10, safety_stock=5, is_active=True,
    )
    session.add(product)
    session.flush()

    # Opening stock — 50 units
    stock = StockItem(
        tenant_id=tenant.id, product_id=product.id,
        warehouse_id=warehouse.id, quantity=50.0, avg_cost=100.0,
    )
    session.add(stock)
    session.commit()

    yield session, tenant, user, warehouse, product, stock
    session.close()


@pytest.fixture(scope="module")
def client(db):
    session, tenant, user, *_ = db

    def override_db():
        yield session

    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="module")
def auth_headers(db):
    session, tenant, user, *_ = db
    token = create_token(user_id=user.id, tenant_id=tenant.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}


def test_cycle_count_session_created(client, auth_headers, db):
    """FR-INV-07: Can open a cycle count session for a warehouse."""
    session, tenant, user, warehouse, *_ = db

    # Create session directly in DB (no router yet — Dev A owns it)
    cc_session = CycleCountSession(
        tenant_id=tenant.id,
        warehouse_id=warehouse.id,
        status="open",
        created_by=user.id,
    )
    session.add(cc_session)
    session.commit()
    session.refresh(cc_session)

    assert cc_session.id is not None
    assert cc_session.status == "open"


def test_cycle_count_entry_variance_detected(client, auth_headers, db):
    """FR-INV-07: Entry records variance between system qty and counted qty."""
    session, tenant, user, warehouse, product, stock = db

    # Get system quantity
    system_qty = stock.quantity  # 50

    # Simulated physical count — only 45 found
    counted_qty = 45.0
    variance = counted_qty - system_qty  # -5

    cc_session = session.query(CycleCountSession).filter(
        CycleCountSession.tenant_id == tenant.id
    ).first()

    entry = CycleCountEntry(
        tenant_id=tenant.id,
        session_id=cc_session.id,
        product_id=product.id,
        system_quantity=system_qty,
        counted_quantity=counted_qty,
        variance=variance,
        counted_by=user.id,
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)

    assert entry.variance == -5.0
    assert entry.counted_quantity == 45.0


def test_variance_creates_stock_adjustment(client, auth_headers, db):
    """FR-INV-07: A negative variance reduces stock via adjustment endpoint."""
    session, tenant, user, warehouse, product, stock = db

    initial_qty = stock.quantity  # 50

    # Apply the adjustment via the inventory API
    response = client.post(
        "/api/v1/inventory/adjustments",
        json={
            "product_id": product.id,
            "warehouse_id": warehouse.id,
            "quantity": -5,
            "reason_code": "cycle_count_variance",
        },
        headers=auth_headers,
    )

    assert response.status_code in (200, 201)

    # Refresh stock
    session.refresh(stock)
    assert stock.quantity == initial_qty - 5


def test_variance_adjustment_is_audit_logged(client, auth_headers, db):
    """FR-INV-07: Stock adjustment from cycle count appears in audit log."""
    response = client.get("/api/v1/audit-logs", headers=auth_headers)
    assert response.status_code == 200

    logs = response.json()
    adjustment_logs = [
        l for l in logs
        if "adjustment" in str(l.get("action", "")).lower()
        or "cycle" in str(l.get("details", "")).lower()
    ]
    assert len(adjustment_logs) >= 1
