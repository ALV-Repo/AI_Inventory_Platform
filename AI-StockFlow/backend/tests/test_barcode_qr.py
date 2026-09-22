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

    alpha = Tenant(
        name="Barcode Alpha",
        plan="starter",
    )
    beta = Tenant(
        name="Barcode Beta",
        plan="starter",
    )

    session.add_all([alpha, beta])
    session.flush()

    session.add_all(
        [
            User(
                tenant_id=alpha.id,
                email="barcode-alpha@example.com",
                full_name="Barcode Alpha Owner",
                role="owner",
                password_hash=hash_password("Test@12345"),
            ),
            User(
                tenant_id=beta.id,
                email="barcode-beta@example.com",
                full_name="Barcode Beta Owner",
                role="owner",
                password_hash=hash_password("Test@12345"),
            ),
        ]
    )

    session.add_all(
        [
            Product(
                tenant_id=alpha.id,
                sku="BARCODE-ALPHA-001",
                name="Barcode Alpha Product",
                cost_price=100,
                selling_price=200,
                gst_rate=18,
            ),
            Product(
                tenant_id=beta.id,
                sku="BARCODE-BETA-001",
                name="Barcode Beta Product",
                cost_price=100,
                selling_price=200,
                gst_rate=18,
            ),
        ]
    )

    session.commit()

    yield session

    session.close()


@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def token_for(client, email):
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": email,
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200, response.text

    return response.json()["access_token"]


@pytest.fixture
def alpha_headers(client):
    return {
        "Authorization": (
            f"Bearer {token_for(client, 'barcode-alpha@example.com')}"
        )
    }


@pytest.fixture
def beta_headers(client):
    return {
        "Authorization": (
            f"Bearer {token_for(client, 'barcode-beta@example.com')}"
        )
    }


class TestBarcodeAndQr:

    def test_generate_product_barcode(self, client, alpha_headers):
        response = client.get(
            "/api/v1/inventory/products/1/barcode",
            headers=alpha_headers,
        )

        assert response.status_code == 200, response.text
        assert response.headers["content-type"].startswith("image/png")
        assert len(response.content) > 100

    def test_generate_product_qr(self, client, alpha_headers):
        response = client.get(
            "/api/v1/inventory/products/1/qr",
            headers=alpha_headers,
        )

        assert response.status_code == 200, response.text
        assert response.headers["content-type"].startswith("image/png")
        assert len(response.content) > 100

    def test_barcode_requires_authentication(self, client):
        response = client.get(
            "/api/v1/inventory/products/1/barcode"
        )

        assert response.status_code == 401

    def test_qr_requires_authentication(self, client):
        response = client.get(
            "/api/v1/inventory/products/1/qr"
        )

        assert response.status_code == 401

    def test_barcode_rejects_missing_product(
        self,
        client,
        alpha_headers,
    ):
        response = client.get(
            "/api/v1/inventory/products/999999/barcode",
            headers=alpha_headers,
        )

        assert response.status_code == 404

    def test_qr_rejects_missing_product(
        self,
        client,
        alpha_headers,
    ):
        response = client.get(
            "/api/v1/inventory/products/999999/qr",
            headers=alpha_headers,
        )

        assert response.status_code == 404

    def test_barcode_cannot_access_other_tenant_product(
        self,
        client,
        alpha_headers,
    ):
        response = client.get(
            "/api/v1/inventory/products/2/barcode",
            headers=alpha_headers,
        )

        assert response.status_code == 404

    def test_qr_cannot_access_other_tenant_product(
        self,
        client,
        alpha_headers,
    ):
        response = client.get(
            "/api/v1/inventory/products/2/qr",
            headers=alpha_headers,
        )

        assert response.status_code == 404