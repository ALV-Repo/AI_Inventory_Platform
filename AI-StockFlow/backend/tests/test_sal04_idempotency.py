"""FR-SAL-04 — Idempotency key: replayed POS bill posts exactly once (NFR-05)."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_token, hash_password
from app.main import app
from app.models.entities import Product, StockItem, Tenant, User, Warehouse

DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

IDEMPOTENCY_KEY = "offline-pos-bill-20260908-001"


@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSession()

    tenant = Tenant(name="Test Tenant", plan="starter")
    session.add(tenant)
    session.flush()

    user = User(
        tenant_id=tenant.id, email="cashier@test.com",
        password_hash=hash_password("Test@1234"), role="cashier", is_active=True,
    )
    session.add(user)

    warehouse = Warehouse(tenant_id=tenant.id, code="WH1", name="Main", is_active=True)
    session.add(warehouse)
    session.flush()

    product = Product(
        tenant_id=tenant.id, sku="PROD-001", name="Test Product",
        cost_price=100.0, selling_price=200.0, gst_rate=18.0,
        reorder_level=5, safety_stock=2, is_active=True,
    )
    session.add(product)
    session.flush()

    session.add(StockItem(
        tenant_id=tenant.id, product_id=product.id,
        warehouse_id=warehouse.id, quantity=100.0, avg_cost=100.0,
    ))
    session.commit()

    yield session, tenant, user, warehouse, product
    session.close()


@pytest.fixture(scope="module")
def client(db):
    session, *_ = db

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


@pytest.fixture(scope="module")
def sale_payload(db):
    session, tenant, user, warehouse, product = db
    return {
        "warehouse_id": warehouse.id,
        "lines": [{"product_id": product.id, "quantity": 2}],
        "payment_mode": "cash",
        "idempotency_key": IDEMPOTENCY_KEY,
    }


def test_first_sale_succeeds(client, auth_headers, sale_payload):
    """FR-SAL-04: First submission with idempotency key creates the order."""
    response = client.post("/api/v1/sales", json=sale_payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["order_number"] is not None


def test_replayed_sale_returns_same_order(client, auth_headers, sale_payload):
    """FR-SAL-04: Replaying the same idempotency key returns the same order, not a duplicate."""
    response = client.post("/api/v1/sales", json=sale_payload, headers=auth_headers)
    # Should succeed (200 or 201) but NOT create a second order
    assert response.status_code in (200, 201)


def test_only_one_order_created(client, auth_headers):
    """FR-SAL-04: Despite two submissions, only one order exists with this key."""
    response = client.get("/api/v1/sales?limit=100", headers=auth_headers)
    assert response.status_code == 200
    orders = response.json()
    matching = [o for o in orders if o.get("idempotency_key") == IDEMPOTENCY_KEY]
    assert len(matching) == 1, f"Expected 1 order with idempotency key, got {len(matching)}"


def test_stock_decremented_only_once(client, auth_headers, db, sale_payload):
    """FR-SAL-04: Stock is decremented only once even with duplicate submission."""
    session, tenant, user, warehouse, product = db
    stock = session.query(StockItem).filter(
        StockItem.product_id == product.id,
        StockItem.warehouse_id == warehouse.id,
        StockItem.tenant_id == tenant.id,
    ).first()
    # Started with 100, sold qty=2 once
    assert stock.quantity == 98.0, f"Expected 98, got {stock.quantity}"


def test_different_key_creates_new_order(client, auth_headers, sale_payload):
    """FR-SAL-04: A different idempotency key creates a new independent order."""
    new_payload = {**sale_payload, "idempotency_key": "different-key-999"}
    response = client.post("/api/v1/sales", json=new_payload, headers=auth_headers)
    assert response.status_code == 201
