import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.entities import Product, Tenant, User


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

    tenant = Tenant(name="Variant Tenant", plan="starter")
    session.add(tenant)
    session.flush()

    session.add(
        User(
            tenant_id=tenant.id,
            email="variant@example.com",
            full_name="Variant Owner",
            role="owner",
            password_hash=hash_password("Test@12345"),
        )
    )

    parent = Product(
        tenant_id=tenant.id,
        sku="SHIRT-001",
        name="Classic Shirt",
        category="Clothing",
        cost_price=500,
        selling_price=900,
    )

    session.add(parent)
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
            "username": "variant@example.com",
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200, response.text

    return {
        "Authorization": f"Bearer {response.json()['access_token']}"
    }


@pytest.fixture
def parent_id(db):
    return (
        db.query(Product)
        .filter(Product.sku == "SHIRT-001")
        .one()
        .id
    )


class TestProductVariants:

    def test_create_variant(
        self,
        client,
        auth_headers,
        parent_id,
    ):
        response = client.post(
            f"/api/v1/inventory/products/{parent_id}/variants",
            json={
                "sku": "SHIRT-001-BLUE-M",
                "name": "Classic Shirt Blue Medium",
                "category": "Clothing",
                "attributes": {
                    "color": "Blue",
                    "size": "M",
                },
            },
            headers=auth_headers,
        )

        assert response.status_code == 201, response.text

        body = response.json()

        assert body["sku"] == "SHIRT-001-BLUE-M"
        assert body["attributes"]["color"] == "Blue"
        assert body["attributes"]["size"] == "M"

    def test_list_variants(
        self,
        client,
        auth_headers,
        parent_id,
    ):
        response = client.get(
            f"/api/v1/inventory/products/{parent_id}/variants",
            headers=auth_headers,
        )

        assert response.status_code == 200, response.text

        variants = response.json()

        assert isinstance(variants, list)
        assert any(
            item["sku"] == "SHIRT-001-BLUE-M"
            for item in variants
        )

    def test_variant_is_linked_to_parent(
        self,
        db,
        parent_id,
    ):
        variant = (
            db.query(Product)
            .filter(Product.sku == "SHIRT-001-BLUE-M")
            .one()
        )

        assert variant.parent_id == parent_id

    def test_duplicate_variant_sku_rejected(
        self,
        client,
        auth_headers,
        parent_id,
    ):
        response = client.post(
            f"/api/v1/inventory/products/{parent_id}/variants",
            json={
                "sku": "SHIRT-001-BLUE-M",
                "name": "Duplicate Variant",
                "attributes": {
                    "color": "Blue",
                    "size": "M",
                },
            },
            headers=auth_headers,
        )

        assert response.status_code == 409

    def test_nonexistent_parent_rejected(
        self,
        client,
        auth_headers,
    ):
        response = client.post(
            "/api/v1/inventory/products/999999/variants",
            json={
                "sku": "SHIRT-999-RED-L",
                "name": "Invalid Parent Variant",
                "attributes": {
                    "color": "Red",
                    "size": "L",
                },
            },
            headers=auth_headers,
        )

        assert response.status_code == 404

    def test_variant_parent_mismatch_rejected(
        self,
        client,
        auth_headers,
        parent_id,
    ):
        response = client.post(
            f"/api/v1/inventory/products/{parent_id}/variants",
            json={
                "sku": "SHIRT-001-RED-L",
                "name": "Mismatched Parent",
                "parent_id": 999999,
                "attributes": {
                    "color": "Red",
                    "size": "L",
                },
            },
            headers=auth_headers,
        )

        assert response.status_code == 400