import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.models.entities import (
    Product,
    SalesOrder,
    SalesOrderLine,
    StockItem,
)


TEST_DATABASE_URL = "sqlite:///./test_dashboard.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    from app.models.entities import Tenant, User, Warehouse

    tenant = Tenant(
        name="Dashboard Test Tenant",
        plan="starter",
    )
    session.add(tenant)
    session.flush()

    user = User(
        tenant_id=tenant.id,
        email="dashboard@example.com",
        password_hash="$2b$12$HUm1Qhttp4CSh6QKmv9C.ectCdAy0Ut80JVNDl/AdkX1sS5gQjBJK",
        role="owner",
        is_active=True,
    )
    session.add(user)

    warehouse = Warehouse(
        tenant_id=tenant.id,
        code="MAIN",
        name="Main Warehouse",
        is_active=True,
    )
    session.add(warehouse)

    product = Product(
        tenant_id=tenant.id,
        sku="DASH-001",
        name="Dashboard Test Product",
        cost_price=100,
        selling_price=150,
        reorder_level=10,
        is_active=True,
    )
    session.add(product)

    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "dashboard@example.com",
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


def test_dashboard_summary_empty(client, auth_headers):
    response = client.get(
        "/api/v1/dashboard/summary",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["today"]["revenue"] == 0
    assert data["today"]["orders"] == 0
    assert data["period"]["revenue"] == 0
    assert data["period"]["orders"] == 0
    assert data["period"]["gross_profit"] == 0
    assert data["period"]["margin_pct"] == 0
    assert data["period"]["revenue_change_pct"] == 0
    assert data["inventory"]["value"] == 0


def test_dashboard_sales_trend_zero_filled(client, auth_headers):
    response = client.get(
        "/api/v1/dashboard/sales-trend?days=7",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 7

    for row in data:
        assert "date" in row
        assert row["revenue"] == 0
        assert row["orders"] == 0


def test_dashboard_top_products_empty(client, auth_headers):
    response = client.get(
        "/api/v1/dashboard/top-products",
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json() == []


def test_dashboard_gst_summary_empty(client, auth_headers):
    response = client.get(
        "/api/v1/dashboard/gst-summary",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["period_days"] == 30
    assert data["slabs"] == []
    assert data["total_taxable"] == 0
    assert data["total_tax"] == 0


def test_dashboard_summary_with_inventory(client, auth_headers, db):
    product = db.query(Product).filter(
        Product.sku == "DASH-001"
    ).first()

    stock = StockItem(
        tenant_id=product.tenant_id,
        product_id=product.id,
        warehouse_id=1,
        quantity=5,
        reserved_qty=1,
        avg_cost=50,
    )
    db.add(stock)
    db.commit()

    response = client.get(
        "/api/v1/dashboard/summary",
        headers=auth_headers,
    )

    assert response.status_code == 200

    inventory = response.json()["inventory"]

    assert inventory["sku_count"] == 1
    assert inventory["low_stock_count"] == 1
    assert inventory["out_of_stock_count"] == 0
    assert inventory["value"] == 250


def test_dashboard_top_products_with_sales(client, auth_headers, db):
    product = db.query(Product).filter(
        Product.sku == "DASH-001"
    ).first()

    order = SalesOrder(
        tenant_id=product.tenant_id,
        order_number="SO-DASH-001",
        subtotal=200,
        tax_amount=36,
        total=236,
        cogs=80,
    )
    db.add(order)
    db.flush()

    line = SalesOrderLine(
        tenant_id=product.tenant_id,
        order_id=order.id,
        product_id=product.id,
        quantity=2,
        unit_price=100,
        discount=0,
        gst_rate=18,
        tax_amount=36,
        line_total=236,
        unit_cost=40,
    )
    db.add(line)
    db.commit()

    response = client.get(
        "/api/v1/dashboard/top-products",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["sku"] == "DASH-001"
    assert data[0]["name"] == "Dashboard Test Product"
    assert data[0]["units_sold"] == 2
    assert data[0]["revenue"] == 236
    assert data[0]["gross_profit"] == 120


def test_dashboard_gst_summary_with_sales(client, auth_headers, db):
    product = db.query(Product).filter(
        Product.sku == "DASH-001"
    ).first()

    order = SalesOrder(
        tenant_id=product.tenant_id,
        order_number="SO-GST-001",
        subtotal=100,
        tax_amount=18,
        total=118,
        cogs=50,
    )
    db.add(order)
    db.flush()

    line = SalesOrderLine(
        tenant_id=product.tenant_id,
        order_id=order.id,
        product_id=product.id,
        quantity=1,
        unit_price=100,
        discount=0,
        gst_rate=18,
        tax_amount=18,
        line_total=118,
        unit_cost=50,
    )
    db.add(line)
    db.commit()

    response = client.get(
        "/api/v1/dashboard/gst-summary",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["period_days"] == 30
    assert len(data["slabs"]) == 1
    assert data["slabs"][0]["gst_rate"] == 18
    assert data["slabs"][0]["taxable_value"] == 100
    assert data["slabs"][0]["tax_amount"] == 18
    assert data["total_taxable"] == 100
    assert data["total_tax"] == 18