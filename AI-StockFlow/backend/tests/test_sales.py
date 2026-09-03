import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app
from app.models.entities import (
    Product,
    ProductBOM,
    ProductBOMLine,
    StockItem,
    StockSerial,
    Tenant,
    User,
    Warehouse,
)


TEST_DATABASE_URL = "sqlite:///./test_sales.db"

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
        name="Sales Test Tenant",
        plan="starter",
    )
    session.add(tenant)
    session.flush()

    user = User(
        tenant_id=tenant.id,
        email="sales@example.com",
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
        sku="SALE-001",
        name="Sales Test Product",
        cost_price=100,
        selling_price=150,
        gst_rate=18,
        is_active=True,
        track_serial=False,
        track_batch=False,
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
            "username": "sales@example.com",
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200, response.text

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


@pytest.fixture
def sales_data(db):
    tenant = (
        db.query(Tenant)
        .filter(Tenant.name == "Sales Test Tenant")
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
            Product.sku == "SALE-001",
        )
        .one()
    )

    return {
        "tenant_id": tenant.id,
        "warehouse_id": warehouse.id,
        "product_id": product.id,
    }


def add_stock(db, sales_data, quantity=10):
    stock = StockItem(
        tenant_id=sales_data["tenant_id"],
        product_id=sales_data["product_id"],
        warehouse_id=sales_data["warehouse_id"],
        quantity=quantity,
        reserved_qty=0,
        avg_cost=100,
    )
    db.add(stock)
    db.commit()
    return stock


class TestSales:

    def test_bom_sale_deducts_components(
        self,
        client,
        auth_headers,
        db,
        sales_data,
    ):
        bundle_stock = add_stock(db, sales_data, 5)

        component = Product(
            tenant_id=sales_data["tenant_id"],
            sku="COMP-001",
            name="BOM Component",
            cost_price=40,
            selling_price=60,
            gst_rate=18,
            is_active=True,
            track_serial=False,
            track_batch=False,
        )
        db.add(component)
        db.flush()

        component_stock = StockItem(
            tenant_id=sales_data["tenant_id"],
            product_id=component.id,
            warehouse_id=sales_data["warehouse_id"],
            quantity=10,
            reserved_qty=0,
            avg_cost=40,
        )
        db.add(component_stock)

        bom = ProductBOM(
            tenant_id=sales_data["tenant_id"],
            product_id=sales_data["product_id"],
            is_active=True,
        )
        db.add(bom)
        db.flush()

        db.add(ProductBOMLine(
            tenant_id=sales_data["tenant_id"],
            bom_id=bom.id,
            component_product_id=component.id,
            quantity=2,
        ))
        db.commit()

        response = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "warehouse_id": sales_data["warehouse_id"],
                "lines": [
                    {
                        "product_id": sales_data["product_id"],
                        "quantity": 3,
                    }
                ],
            },
        )

        assert response.status_code == 201, response.text

        db.refresh(bundle_stock)
        db.refresh(component_stock)

        assert bundle_stock.quantity == 2
        assert component_stock.quantity == 4
        assert response.json()["gross_profit"] == -90.0

    def test_create_sale(
        self,
        client,
        auth_headers,
        db,
        sales_data,
    ):
        add_stock(db, sales_data, 10)

        response = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "warehouse_id": sales_data["warehouse_id"],
                "lines": [
                    {
                        "product_id": sales_data["product_id"],
                        "quantity": 2,
                    }
                ],
                "payment_mode": "cash",
                "channel": "pos",
            },
        )

        assert response.status_code == 201, response.text

        body = response.json()

        assert body["id"] > 0
        assert body["order_number"].startswith("INV-")
        assert body["subtotal"] > 0
        assert body["tax_amount"] > 0
        assert body["total"] > 0
        assert body["duplicate"] is False

    def test_sale_reduces_stock(
        self,
        client,
        auth_headers,
        db,
        sales_data,
    ):
        stock = add_stock(db, sales_data, 10)

        response = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "warehouse_id": sales_data["warehouse_id"],
                "lines": [
                    {
                        "product_id": sales_data["product_id"],
                        "quantity": 3,
                    }
                ],
            },
        )

        assert response.status_code == 201, response.text

        db.refresh(stock)

        assert stock.quantity == 7

    def test_insufficient_stock_is_rejected(
        self,
        client,
        auth_headers,
        db,
        sales_data,
    ):
        add_stock(db, sales_data, 2)

        response = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "warehouse_id": sales_data["warehouse_id"],
                "lines": [
                    {
                        "product_id": sales_data["product_id"],
                        "quantity": 5,
                    }
                ],
            },
        )

        assert response.status_code == 400
        assert "available" in response.text.lower()

    def test_missing_product_is_rejected(
        self,
        client,
        auth_headers,
        sales_data,
    ):
        response = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "warehouse_id": sales_data["warehouse_id"],
                "lines": [
                    {
                        "product_id": 999999,
                        "quantity": 1,
                    }
                ],
            },
        )

        assert response.status_code == 404

    def test_sale_requires_authentication(
        self,
        client,
        sales_data,
    ):
        response = client.get("/api/v1/sales")

        assert response.status_code in {401, 403}

    def test_list_sales(
        self,
        client,
        auth_headers,
        db,
        sales_data,
    ):
        add_stock(db, sales_data, 10)

        create_response = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "warehouse_id": sales_data["warehouse_id"],
                "lines": [
                    {
                        "product_id": sales_data["product_id"],
                        "quantity": 1,
                    }
                ],
            },
        )

        assert create_response.status_code == 201

        response = client.get(
            "/api/v1/sales",
            headers=auth_headers,
        )

        assert response.status_code == 200

        body = response.json()

        assert isinstance(body, list)
        assert len(body) >= 1
        assert body[0]["order_number"].startswith("INV-")

    def test_idempotency_prevents_duplicate_sale(
        self,
        client,
        auth_headers,
        db,
        sales_data,
    ):
        stock = add_stock(db, sales_data, 10)

        payload = {
            "warehouse_id": sales_data["warehouse_id"],
            "idempotency_key": "SALE-IDEMPOTENCY-001",
            "lines": [
                {
                    "product_id": sales_data["product_id"],
                    "quantity": 2,
                }
            ],
        }

        first = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json=payload,
        )

        assert first.status_code == 201, first.text
        assert first.json()["duplicate"] is False

        db.refresh(stock)
        assert stock.quantity == 8

        second = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json=payload,
        )

        assert second.status_code == 201, second.text
        assert second.json()["duplicate"] is True

        db.refresh(stock)
        assert stock.quantity == 8


class TestSerializedSales:

    def test_serialized_sale_marks_serial_sold(
        self,
        client,
        auth_headers,
        db,
        sales_data,
    ):
        product = (
            db.query(Product)
            .filter(Product.id == sales_data["product_id"])
            .one()
        )

        product.track_serial = True

        stock = StockItem(
            tenant_id=sales_data["tenant_id"],
            product_id=product.id,
            warehouse_id=sales_data["warehouse_id"],
            quantity=1,
            reserved_qty=0,
            avg_cost=100,
        )
        db.add(stock)

        serial = StockSerial(
            tenant_id=sales_data["tenant_id"],
            product_id=product.id,
            warehouse_id=sales_data["warehouse_id"],
            serial_number="SERIAL-001",
            status="available",
        )
        db.add(serial)

        db.commit()

        response = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "warehouse_id": sales_data["warehouse_id"],
                "lines": [
                    {
                        "product_id": product.id,
                        "quantity": 1,
                        "serial_numbers": ["SERIAL-001"],
                    }
                ],
            },
        )

        assert response.status_code == 201, response.text

        db.refresh(serial)

        assert serial.status == "sold"

    def test_serialized_sale_requires_serial_number(
        self,
        client,
        auth_headers,
        db,
        sales_data,
    ):
        product = (
            db.query(Product)
            .filter(Product.id == sales_data["product_id"])
            .one()
        )

        product.track_serial = True

        stock = StockItem(
            tenant_id=sales_data["tenant_id"],
            product_id=product.id,
            warehouse_id=sales_data["warehouse_id"],
            quantity=1,
            reserved_qty=0,
            avg_cost=100,
        )
        db.add(stock)
        db.commit()

        response = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "warehouse_id": sales_data["warehouse_id"],
                "lines": [
                    {
                        "product_id": product.id,
                        "quantity": 1,
                        "serial_numbers": [],
                    }
                ],
            },
        )

        assert response.status_code == 400
        assert "serial" in response.text.lower()

    def test_unavailable_serial_is_rejected(
        self,
        client,
        auth_headers,
        db,
        sales_data,
    ):
        product = (
            db.query(Product)
            .filter(Product.id == sales_data["product_id"])
            .one()
        )

        product.track_serial = True

        stock = StockItem(
            tenant_id=sales_data["tenant_id"],
            product_id=product.id,
            warehouse_id=sales_data["warehouse_id"],
            quantity=1,
            reserved_qty=0,
            avg_cost=100,
        )
        db.add(stock)

        serial = StockSerial(
            tenant_id=sales_data["tenant_id"],
            product_id=product.id,
            warehouse_id=sales_data["warehouse_id"],
            serial_number="SERIAL-SOLD",
            status="sold",
        )
        db.add(serial)

        db.commit()

        response = client.post(
            "/api/v1/sales",
            headers=auth_headers,
            json={
                "warehouse_id": sales_data["warehouse_id"],
                "lines": [
                    {
                        "product_id": product.id,
                        "quantity": 1,
                        "serial_numbers": ["SERIAL-SOLD"],
                    }
                ],
            },
        )

        assert response.status_code == 400
        assert "unavailable" in response.text.lower()


class TestCustomers:

    def test_list_customers(
        self,
        client,
        auth_headers,
    ):
        response = client.get(
            "/api/v1/sales/customers",
            headers=auth_headers,
        )

        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_create_and_revise_quotation(
        self,
        client,
        auth_headers,
        sales_data,
    ):
        create_response = client.post(
            "/api/v1/sales/quotations",
            headers=auth_headers,
            json={
                "lines": [
                    {
                        "product_id": sales_data["product_id"],
                        "quantity": 2,
                        "unit_price": 150,
                        "discount": 0,
                    }
                ],
                "valid_until": "2026-09-30",
            },
        )

        assert create_response.status_code == 201, create_response.text
        quotation = create_response.json()

        assert quotation["revision"] == 1
        assert quotation["status"] == "draft"
        assert quotation["total"] > 0

        revision_response = client.post(
            f"/api/v1/sales/quotations/{quotation['id']}/revisions",
            headers=auth_headers,
            json={
                "lines": [
                    {
                        "product_id": sales_data["product_id"],
                        "quantity": 3,
                        "unit_price": 140,
                        "discount": 0,
                    }
                ],
                "valid_until": "2026-10-15",
            },
        )

        assert revision_response.status_code == 200, revision_response.text
        revised = revision_response.json()

        assert revised["id"] == quotation["id"]
        assert revised["quote_number"] == quotation["quote_number"]
        assert revised["revision"] == 2
        assert revised["status"] == "draft"
        assert revised["valid_until"] == "2026-10-15"
        assert revised["total"] > 0
        assert revised["total"] != quotation["total"]