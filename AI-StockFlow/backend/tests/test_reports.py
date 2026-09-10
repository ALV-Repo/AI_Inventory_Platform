import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import hash_password
from app.models.entities import Tenant, User


TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def auth_headers(client):
    db = TestingSessionLocal()

    tenant = Tenant(
        name="Reports Test Tenant",
        plan="pro",
    )
    db.add(tenant)
    db.flush()

    user = User(
        tenant_id=tenant.id,
        email="reports@example.com",
        full_name="Reports User",
        role="owner",
        password_hash=hash_password("Test@12345"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.close()

    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "reports@example.com",
            "password": "Test@12345",
        },
    )

    assert response.status_code == 200, response.text

    token = response.json()["access_token"]

    return {
        "Authorization": f"Bearer {token}",
    }


REPORT_ENDPOINTS = [
    "/api/v1/reports/stock-summary",
    "/api/v1/reports/stock-ledger",
    "/api/v1/reports/sales-register",
    "/api/v1/reports/purchase-register",
    "/api/v1/reports/gst-summary",
    "/api/v1/reports/aging",
    "/api/v1/reports/vendor-scorecard",
]


@pytest.mark.parametrize("endpoint", REPORT_ENDPOINTS)
def test_report_json_endpoints(client, auth_headers, endpoint):
    response = client.get(
        endpoint,
        headers=auth_headers,
    )

    assert response.status_code == 200, response.text

    body = response.json()

    assert "report" in body
    assert "columns" in body
    assert "rows" in body
    assert isinstance(body["columns"], list)
    assert isinstance(body["rows"], list)


@pytest.mark.parametrize("endpoint", REPORT_ENDPOINTS)
def test_report_csv_exports(client, auth_headers, endpoint):
    response = client.get(
        endpoint,
        params={"format": "csv"},
        headers=auth_headers,
    )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith("text/csv")
    assert "attachment" in response.headers.get(
        "content-disposition",
        "",
    )
    assert response.text.strip()


@pytest.mark.parametrize("endpoint", REPORT_ENDPOINTS)
def test_report_xlsx_exports(client, auth_headers, endpoint):
    response = client.get(
        endpoint,
        params={"format": "xlsx"},
        headers=auth_headers,
    )

    assert response.status_code == 200, response.text

    assert response.headers["content-type"].startswith(
        "application/vnd.openxmlformats-officedocument"
    )

    assert response.content[:2] == b"PK"


@pytest.mark.parametrize("endpoint", REPORT_ENDPOINTS)
def test_report_pdf_exports(client, auth_headers, endpoint):
    response = client.get(
        endpoint,
        params={"format": "pdf"},
        headers=auth_headers,
    )

    assert response.status_code == 200, response.text
    assert response.headers["content-type"].startswith(
        "application/pdf"
    )
    assert response.content.startswith(b"%PDF")


@pytest.mark.parametrize(
    "endpoint",
    [
        "/api/v1/reports/stock-ledger",
        "/api/v1/reports/sales-register",
        "/api/v1/reports/purchase-register",
        "/api/v1/reports/gst-summary",
        "/api/v1/reports/vendor-scorecard",
    ],
)
def test_report_rejects_invalid_date_range(
    client,
    auth_headers,
    endpoint,
):
    response = client.get(
        endpoint,
        params={
            "date_from": "2026-09-10",
            "date_to": "2026-09-01",
        },
        headers=auth_headers,
    )

    assert response.status_code == 400
    assert "date_to" in response.text


def test_report_rejects_invalid_format(client, auth_headers):
    response = client.get(
        "/api/v1/reports/stock-summary",
        params={"format": "docx"},
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_reports_require_authentication(client):
    response = client.get(
        "/api/v1/reports/stock-summary",
    )

    assert response.status_code in (401, 403)