import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.entities import (
    CycleCountEntry,
    CycleCountSession,
    Product,
    StockItem,
    Tenant,
    User,
    Warehouse,
)


engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSession = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestSession()

    tenant = Tenant(
        name="Cycle Count Tenant",
        plan="starter",
    )
    session.add(tenant)
    session.flush()

    session.add(
        User(
            tenant_id=tenant.id,
            email="cyclecount@example.com",
            full_name="Cycle Count Owner",
            role="owner",
            password_hash=hash_password("Test@12345"),
        )
    )

    warehouse = Warehouse(
        tenant_id=tenant.id,
        code="COUNT",
        name="Cycle Count Warehouse",
    )
    session.add(warehouse)
    session.flush()

    product = Product(
        tenant_id=tenant.id,
        sku="COUNT-001",
        name="Cycle Count Product",
        cost_price=100,
        selling_price=200,
        gst_rate=18,
    )
    session.add(product)
    session.flush()

    session.add(
        StockItem(
            tenant_id=tenant.id,
            product_id=product.id,
            warehouse_id=warehouse.id,
            quantity=50,
            avg_cost=100,
        )
    )

    session.commit()

    yield session

    session.close()


@pytest.fixture(scope="module")
def client(db):
    def override():
        yield db

    app.dependency_overrides[get_db] = override

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "cyclecount@example.com",
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200, response.text

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


@pytest.fixture
def cycle_count_data(db):
    tenant = (
        db.query(Tenant)
        .filter(Tenant.name == "Cycle Count Tenant")
        .one()
    )

    product = (
        db.query(Product)
        .filter(
            Product.tenant_id == tenant.id,
            Product.sku == "COUNT-001",
        )
        .one()
    )

    warehouse = (
        db.query(Warehouse)
        .filter(
            Warehouse.tenant_id == tenant.id,
            Warehouse.code == "COUNT",
        )
        .one()
    )

    return {
        "product_id": product.id,
        "warehouse_id": warehouse.id,
    }


class TestCycleCountWorkflow:

    def test_create_cycle_count_session(
        self,
        client,
        auth_headers,
        cycle_count_data,
    ):
        response = client.post(
            "/api/v1/inventory/cycle-counts",
            json={
                "warehouse_id": cycle_count_data["warehouse_id"],
            },
            headers=auth_headers,
        )

        assert response.status_code == 201, response.text

        body = response.json()

        assert body["id"] is not None
        assert body["warehouse_id"] == cycle_count_data["warehouse_id"]
        assert body["status"] == "open"
        assert body["entry_count"] == 1

    def test_submit_count_calculates_variance(
        self,
        client,
        auth_headers,
        cycle_count_data,
    ):
        create = client.post(
            "/api/v1/inventory/cycle-counts",
            json={
                "warehouse_id": cycle_count_data["warehouse_id"],
            },
            headers=auth_headers,
        )

        assert create.status_code == 201, create.text

        session_id = create.json()["id"]

        response = client.post(
            f"/api/v1/inventory/cycle-counts/{session_id}/entries",
            json={
                "product_id": cycle_count_data["product_id"],
                "counted_quantity": 45,
            },
            headers=auth_headers,
        )

        assert response.status_code == 200, response.text

        body = response.json()

        assert body["system_quantity"] == 50
        assert body["counted_quantity"] == 45
        assert body["variance"] == -5

    def test_close_cycle_count_applies_variance(
        self,
        client,
        db,
        auth_headers,
        cycle_count_data,
    ):
        create = client.post(
            "/api/v1/inventory/cycle-counts",
            json={
                "warehouse_id": cycle_count_data["warehouse_id"],
            },
            headers=auth_headers,
        )

        assert create.status_code == 201, create.text

        session_id = create.json()["id"]

        count = client.post(
            f"/api/v1/inventory/cycle-counts/{session_id}/entries",
            json={
                "product_id": cycle_count_data["product_id"],
                "counted_quantity": 45,
            },
            headers=auth_headers,
        )

        assert count.status_code == 200, count.text

        close = client.post(
            f"/api/v1/inventory/cycle-counts/{session_id}/close",
            headers=auth_headers,
        )

        assert close.status_code == 200, close.text

        body = close.json()

        assert body["status"] == "closed"
        assert body["entry_count"] == 1
        assert body["adjusted_count"] == 1

        stock = (
            db.query(StockItem)
            .filter(
                StockItem.product_id == cycle_count_data["product_id"],
                StockItem.warehouse_id == cycle_count_data["warehouse_id"],
            )
            .one()
        )

        assert stock.quantity == 45

    def test_cannot_close_with_uncounted_entries(
        self,
        client,
        auth_headers,
        cycle_count_data,
    ):
        create = client.post(
            "/api/v1/inventory/cycle-counts",
            json={
                "warehouse_id": cycle_count_data["warehouse_id"],
            },
            headers=auth_headers,
        )

        assert create.status_code == 201, create.text

        session_id = create.json()["id"]

        response = client.post(
            f"/api/v1/inventory/cycle-counts/{session_id}/close",
            headers=auth_headers,
        )

        assert response.status_code == 400

    def test_invalid_product_count_is_rejected(
        self,
        client,
        auth_headers,
        cycle_count_data,
    ):
        create = client.post(
            "/api/v1/inventory/cycle-counts",
            json={
                "warehouse_id": cycle_count_data["warehouse_id"],
            },
            headers=auth_headers,
        )

        assert create.status_code == 201, create.text

        session_id = create.json()["id"]

        response = client.post(
            f"/api/v1/inventory/cycle-counts/{session_id}/entries",
            json={
                "product_id": 999999,
                "counted_quantity": 10,
            },
            headers=auth_headers,
        )

        assert response.status_code == 404

    def test_nonexistent_session_is_rejected(
        self,
        client,
        auth_headers,
        cycle_count_data,
    ):
        response = client.post(
            "/api/v1/inventory/cycle-counts/999999/entries",
            json={
                "product_id": cycle_count_data["product_id"],
                "counted_quantity": 10,
            },
            headers=auth_headers,
        )

        assert response.status_code == 404