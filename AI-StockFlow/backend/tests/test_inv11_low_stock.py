"""FR-INV-11 — Low stock alert: products below reorder_level appear in alert list."""
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

    # Product A — below reorder level (5 on hand, reorder at 10)
    product_low = Product(
        tenant_id=tenant.id, sku="LOW-001", name="Low Stock Product",
        cost_price=100.0, selling_price=150.0, gst_rate=18.0,
        reorder_level=10, safety_stock=5, is_active=True,
    )
    # Product B — above reorder level (50 on hand, reorder at 10)
    product_ok = Product(
        tenant_id=tenant.id, sku="OK-001", name="OK Stock Product",
        cost_price=200.0, selling_price=300.0, gst_rate=18.0,
        reorder_level=10, safety_stock=5, is_active=True,
    )
    session.add_all([product_low, product_ok])
    session.flush()

    session.add(StockItem(
        tenant_id=tenant.id, product_id=product_low.id,
        warehouse_id=warehouse.id, quantity=5.0, avg_cost=100.0,
    ))
    session.add(StockItem(
        tenant_id=tenant.id, product_id=product_ok.id,
        warehouse_id=warehouse.id, quantity=50.0, avg_cost=200.0,
    ))
    session.commit()

    yield session, tenant, user, warehouse, product_low, product_ok
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


def test_low_stock_filter_returns_only_low_items(client, auth_headers, db):
    """FR-INV-11: low_stock_only=true returns only products below reorder level."""
    response = client.get(
        "/api/v1/inventory/products?low_stock_only=true",
        headers=auth_headers,
    )
    assert response.status_code == 200
    products = response.json()

    skus = [p["sku"] for p in products]
    assert "LOW-001" in skus
    assert "OK-001" not in skus


def test_full_list_returns_all_products(client, auth_headers):
    """FR-INV-11: Without filter, all active products are returned."""
    response = client.get("/api/v1/inventory/products", headers=auth_headers)
    assert response.status_code == 200
    products = response.json()
    skus = [p["sku"] for p in products]
    assert "LOW-001" in skus
    assert "OK-001" in skus


def test_low_stock_count_in_dashboard(client, auth_headers, db):
    """FR-INV-11: Dashboard summary reflects correct low_stock_count."""
    response = client.get("/api/v1/dashboard/summary?days=30", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["inventory"]["low_stock_count"] >= 1


def test_reorder_suggestions_include_low_stock_sku(client, auth_headers):
    """FR-INV-11: AI reorder suggestions include the low-stock product."""
    response = client.get("/api/v1/ai/reorder-suggestions", headers=auth_headers)
    assert response.status_code == 200
    suggestions = response.json()
    skus = [s["sku"] for s in suggestions]
    assert "LOW-001" in skus
