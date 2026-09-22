import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.models.entities import (
    Product,
    Supplier,
    Tenant,
    User,
    Warehouse,
)


TEST_DATABASE_URL = "sqlite:///./test_purchases.db"

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

    tenant = Tenant(
        name="Purchase Test Tenant",
        plan="starter",
    )
    session.add(tenant)
    session.flush()

    user = User(
        tenant_id=tenant.id,
        email="purchase@example.com",
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

    supplier = Supplier(
        tenant_id=tenant.id,
        name="Test Supplier",
        phone="9999999999",
        email="supplier@example.com",
        is_active=True,
    )
    session.add(supplier)

    product = Product(
    tenant_id=tenant.id,
    sku="PUR-001",
    name="Purchase Test Product",
    cost_price=100,
    selling_price=150,
    is_active=True,
    track_batch=True,
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
            "username": "purchase@example.com",
            "password": "Test@12345",
        },
    )
    print("RECEIVE STATUS:", response.status_code)
    print("RECEIVE BODY:", response.text)
    assert response.status_code == 200
 

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


@pytest.fixture
def purchase_data(db):
    tenant = (
        db.query(Tenant)
        .filter(Tenant.name == "Purchase Test Tenant")
        .one()
    )

    supplier = (
        db.query(Supplier)
        .filter(Supplier.tenant_id == tenant.id)
        .one()
    )

    warehouse = (
        db.query(Warehouse)
        .filter(Warehouse.tenant_id == tenant.id)
        .one()
    )

    product = (
        db.query(Product)
        .filter(
            Product.tenant_id == tenant.id,
            Product.sku == "PUR-001",
        )
        .one()
    )

    return {
        "supplier_id": supplier.id,
        "warehouse_id": warehouse.id,
        "product_id": product.id,
    }


def create_order(client, headers, data, po_number="PO-001"):
    return client.post(
        "/api/v1/purchases/orders",
        headers=headers,
        json={
            "po_number": po_number,
            "supplier_id": data["supplier_id"],
            "warehouse_id": data["warehouse_id"],
            "lines": [
                {
                    "product_id": data["product_id"],
                    "quantity": 10,
                    "unit_price": 100,
                    "gst_rate": 18,
                }
            ],
        },
    )


class TestPurchaseOrders:

    def test_create_purchase_order(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        response = create_order(
            client,
            auth_headers,
            purchase_data,
        )

        assert response.status_code == 201, response.text

        body = response.json()

        assert body["po_number"] == "PO-001"
        assert body["supplier_id"] == purchase_data["supplier_id"]
        assert body["warehouse_id"] == purchase_data["warehouse_id"]
        assert body["status"] == "draft"
        assert body["subtotal"] == 1000
        assert body["tax_amount"] == 180
        assert body["total"] == 1180
        assert len(body["lines"]) == 1

    def test_duplicate_po_is_rejected(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        first = create_order(
            client,
            auth_headers,
            purchase_data,
        )

        assert first.status_code == 201

        second = create_order(
            client,
            auth_headers,
            purchase_data,
        )

        assert second.status_code == 409

    def test_missing_supplier_is_rejected(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        payload = {
            "po_number": "PO-BAD-SUPPLIER",
            "supplier_id": 999999,
            "warehouse_id": purchase_data["warehouse_id"],
            "lines": [
                {
                    "product_id": purchase_data["product_id"],
                    "quantity": 10,
                    "unit_price": 100,
                    "gst_rate": 18,
                }
            ],
        }

        response = client.post(
            "/api/v1/purchases/orders",
            headers=auth_headers,
            json=payload,
        )

        assert response.status_code == 404

    def test_missing_warehouse_is_rejected(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        payload = {
            "po_number": "PO-BAD-WAREHOUSE",
            "supplier_id": purchase_data["supplier_id"],
            "warehouse_id": 999999,
            "lines": [
                {
                    "product_id": purchase_data["product_id"],
                    "quantity": 10,
                    "unit_price": 100,
                    "gst_rate": 18,
                }
            ],
        }

        response = client.post(
            "/api/v1/purchases/orders",
            headers=auth_headers,
            json=payload,
        )

        assert response.status_code == 404

    def test_missing_product_is_rejected(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        payload = {
            "po_number": "PO-BAD-PRODUCT",
            "supplier_id": purchase_data["supplier_id"],
            "warehouse_id": purchase_data["warehouse_id"],
            "lines": [
                {
                    "product_id": 999999,
                    "quantity": 10,
                    "unit_price": 100,
                    "gst_rate": 18,
                }
            ],
        }

        response = client.post(
            "/api/v1/purchases/orders",
            headers=auth_headers,
            json=payload,
        )

        assert response.status_code == 404

    def test_approve_purchase_order(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        created = create_order(
            client,
            auth_headers,
            purchase_data,
            "PO-APPROVE",
        )

        assert created.status_code == 201

        order_id = created.json()["id"]

        response = client.post(
            f"/api/v1/purchases/orders/{order_id}/approve",
            headers=auth_headers,
        )

        assert response.status_code == 200
        assert response.json()["status"] == "approved"

    def test_cannot_approve_twice(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        created = create_order(
            client,
            auth_headers,
            purchase_data,
            "PO-DOUBLE",
        )

        order_id = created.json()["id"]

        first = client.post(
            f"/api/v1/purchases/orders/{order_id}/approve",
            headers=auth_headers,
        )

        assert first.status_code == 200

        second = client.post(
            f"/api/v1/purchases/orders/{order_id}/approve",
            headers=auth_headers,
        )

        assert second.status_code == 400

    def test_receive_purchase_order(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        created = create_order(
            client,
            auth_headers,
            purchase_data,
            "PO-RECEIVE",
        )

        order_id = created.json()["id"]

        approved = client.post(
            f"/api/v1/purchases/orders/{order_id}/approve",
            headers=auth_headers,
        )

        assert approved.status_code == 200

        received = client.post(
            f"/api/v1/purchases/orders/{order_id}/receive",
            headers=auth_headers,
            json={
                "lines": [
                    {
                        "product_id": purchase_data["product_id"],
                        "quantity": 10,
                        "batch_no": "BATCH-001",
                    }
                ]
            },
        )

        print("RECEIVE STATUS:", received.status_code)
        print("RECEIVE BODY:", received.text)
        assert received.status_code == 200  

        body = received.json()

        assert body["id"] == order_id
        assert body["status"] == "received"
        assert body["received_lines"] == 1

    def test_partial_purchase_receipt(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        created = create_order(
            client,
            auth_headers,
            purchase_data,
            "PO-PARTIAL",
        )

        order_id = created.json()["id"]

        client.post(
            f"/api/v1/purchases/orders/{order_id}/approve",
            headers=auth_headers,
        )

        response = client.post(
            f"/api/v1/purchases/orders/{order_id}/receive",
            headers=auth_headers,
            json={
                "lines": [
                    {
                        "product_id": purchase_data["product_id"],
                        "quantity": 4,
                        "batch_no": "BATCH-002",
                    }
                ]
            },
        )

        assert response.status_code == 200
        assert response.json()["status"] == "partial"

    def test_receiving_more_than_ordered_is_rejected(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        created = create_order(
            client,
            auth_headers,
            purchase_data,
            "PO-OVER",
        )

        order_id = created.json()["id"]

        client.post(
            f"/api/v1/purchases/orders/{order_id}/approve",
            headers=auth_headers,
        )

        response = client.post(
            f"/api/v1/purchases/orders/{order_id}/receive",
            headers=auth_headers,
            json={
                "lines": [
                    {
                        "product_id": purchase_data["product_id"],
                        "quantity": 11,
                    }
                ]
            },
        )

        assert response.status_code == 400

    def test_receive_unknown_product_is_rejected(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        created = create_order(
            client,
            auth_headers,
            purchase_data,
            "PO-UNKNOWN",
        )

        order_id = created.json()["id"]

        client.post(
            f"/api/v1/purchases/orders/{order_id}/approve",
            headers=auth_headers,
        )

        response = client.post(
            f"/api/v1/purchases/orders/{order_id}/receive",
            headers=auth_headers,
            json={
                "lines": [
                    {
                        "product_id": 999999,
                        "quantity": 1,
                    }
                ]
            },
        )

        assert response.status_code == 400

    def test_list_purchase_orders(
        self,
        client,
        auth_headers,
        purchase_data,
    ):
        create_order(
            client,
            auth_headers,
            purchase_data,
            "PO-LIST",
        )

        response = client.get(
            "/api/v1/purchases/orders",
            headers=auth_headers,
        )

        assert response.status_code == 200

        body = response.json()

        assert isinstance(body, list)
        assert len(body) >= 1
        assert any(
            order["po_number"] == "PO-LIST"
            for order in body
        )

    def test_purchase_requires_authentication(
        self,
        client,
        purchase_data,
    ):
        response = client.get(
            "/api/v1/purchases/orders",
        )

        assert response.status_code in {401, 403}