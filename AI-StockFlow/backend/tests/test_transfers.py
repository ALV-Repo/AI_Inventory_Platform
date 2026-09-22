import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.entities import (
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

    tenant = Tenant(name="Transfer Tenant", plan="starter")
    session.add(tenant)
    session.flush()

    session.add(
        User(
            tenant_id=tenant.id,
            email="transfer@example.com",
            full_name="Transfer Owner",
            role="owner",
            password_hash=hash_password("Test@12345"),
        )
    )

    source = Warehouse(
        tenant_id=tenant.id,
        code="SRC",
        name="Source Warehouse",
    )

    destination = Warehouse(
        tenant_id=tenant.id,
        code="DST",
        name="Destination Warehouse",
    )

    session.add_all([source, destination])
    session.flush()

    product = Product(
        tenant_id=tenant.id,
        sku="TRANSFER-001",
        name="Transfer Product",
        cost_price=100,
        selling_price=200,
        gst_rate=18,
    )

    session.add(product)
    session.flush()

    session.add_all(
        [
            StockItem(
                tenant_id=tenant.id,
                product_id=product.id,
                warehouse_id=source.id,
                quantity=50,
                avg_cost=100,
            ),
            StockItem(
                tenant_id=tenant.id,
                product_id=product.id,
                warehouse_id=destination.id,
                quantity=0,
                avg_cost=0,
            ),
        ]
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


# Reuse one login token for all transfer tests.
# This avoids triggering the application's login rate limiter.
@pytest.fixture(scope="module")
def auth_headers(client):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "transfer@example.com",
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200, response.text

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}"
    }


@pytest.fixture
def transfer_data(db):
    tenant = (
        db.query(Tenant)
        .filter(Tenant.name == "Transfer Tenant")
        .one()
    )

    product = (
        db.query(Product)
        .filter(
            Product.tenant_id == tenant.id,
            Product.sku == "TRANSFER-001",
        )
        .one()
    )

    source = (
        db.query(Warehouse)
        .filter(
            Warehouse.tenant_id == tenant.id,
            Warehouse.code == "SRC",
        )
        .one()
    )

    destination = (
        db.query(Warehouse)
        .filter(
            Warehouse.tenant_id == tenant.id,
            Warehouse.code == "DST",
        )
        .one()
    )

    return {
        "product_id": product.id,
        "from_warehouse_id": source.id,
        "to_warehouse_id": destination.id,
    }


class TestStockTransferWorkflow:

    def test_create_transfer_starts_pending(
        self,
        client,
        auth_headers,
        transfer_data,
    ):
        response = client.post(
            "/api/v1/inventory/transfers",
            json={
                **transfer_data,
                "quantity": 10,
            },
            headers=auth_headers,
        )

        assert response.status_code == 201, response.text

        body = response.json()

        assert body["status"] == "pending"
        assert body["quantity"] == 10
        assert body["id"] is not None

    def test_complete_transfer_workflow(
        self,
        client,
        db,
        auth_headers,
        transfer_data,
    ):
        create = client.post(
            "/api/v1/inventory/transfers",
            json={
                **transfer_data,
                "quantity": 10,
            },
            headers=auth_headers,
        )

        assert create.status_code == 201, create.text

        transfer_id = create.json()["id"]

        approve = client.post(
            f"/api/v1/inventory/transfers/{transfer_id}/approve",
            headers=auth_headers,
        )

        assert approve.status_code == 200, approve.text
        assert approve.json()["status"] == "approved"

        dispatch = client.post(
            f"/api/v1/inventory/transfers/{transfer_id}/dispatch",
            headers=auth_headers,
        )

        assert dispatch.status_code == 200, dispatch.text
        assert dispatch.json()["status"] == "in_transit"

        source = (
            db.query(StockItem)
            .filter(
                StockItem.product_id == transfer_data["product_id"],
                StockItem.warehouse_id == transfer_data["from_warehouse_id"],
            )
            .one()
        )

        assert source.quantity == 40

        receive = client.post(
            f"/api/v1/inventory/transfers/{transfer_id}/receive",
            headers=auth_headers,
        )

        assert receive.status_code == 200, receive.text
        assert receive.json()["status"] == "received"

        destination = (
            db.query(StockItem)
            .filter(
                StockItem.product_id == transfer_data["product_id"],
                StockItem.warehouse_id == transfer_data["to_warehouse_id"],
            )
            .one()
        )

        assert destination.quantity == 10

    def test_cannot_dispatch_before_approval(
        self,
        client,
        auth_headers,
        transfer_data,
    ):
        create = client.post(
            "/api/v1/inventory/transfers",
            json={
                **transfer_data,
                "quantity": 5,
            },
            headers=auth_headers,
        )

        transfer_id = create.json()["id"]

        response = client.post(
            f"/api/v1/inventory/transfers/{transfer_id}/dispatch",
            headers=auth_headers,
        )

        assert response.status_code == 400

    def test_cannot_receive_before_dispatch(
        self,
        client,
        auth_headers,
        transfer_data,
    ):
        create = client.post(
            "/api/v1/inventory/transfers",
            json={
                **transfer_data,
                "quantity": 5,
            },
            headers=auth_headers,
        )

        transfer_id = create.json()["id"]

        response = client.post(
            f"/api/v1/inventory/transfers/{transfer_id}/receive",
            headers=auth_headers,
        )

        assert response.status_code == 400

    def test_same_warehouse_is_rejected(
        self,
        client,
        auth_headers,
        transfer_data,
    ):
        response = client.post(
            "/api/v1/inventory/transfers",
            json={
                "product_id": transfer_data["product_id"],
                "from_warehouse_id": transfer_data["from_warehouse_id"],
                "to_warehouse_id": transfer_data["from_warehouse_id"],
                "quantity": 5,
            },
            headers=auth_headers,
        )

        assert response.status_code == 400

    def test_insufficient_stock_is_rejected(
        self,
        client,
        auth_headers,
        transfer_data,
    ):
        response = client.post(
            "/api/v1/inventory/transfers",
            json={
                **transfer_data,
                "quantity": 1000,
            },
            headers=auth_headers,
        )

        assert response.status_code == 400