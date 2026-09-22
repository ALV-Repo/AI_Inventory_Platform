"""FR-FIN-05 — Payment reminders: customers with outstanding balance appear at 30/60/90 days."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_token, hash_password
from app.main import app
from app.models.entities import Customer, Tenant, User

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
        tenant_id=tenant.id, email="accounts@test.com",
        password_hash=hash_password("Test@1234"), role="accountant", is_active=True,
    )
    session.add(user)

    # Customer with outstanding balance — should appear in reminders
    customer_owing = Customer(
        tenant_id=tenant.id, name="Owing Customer",
        phone="9999999999", credit_limit=100000.0, outstanding=25000.0,
    )
    # Customer with zero balance — should NOT appear
    customer_clear = Customer(
        tenant_id=tenant.id, name="Clear Customer",
        phone="8888888888", credit_limit=50000.0, outstanding=0.0,
    )
    # Customer with large overdue — should appear
    customer_overdue = Customer(
        tenant_id=tenant.id, name="Overdue Customer",
        phone="7777777777", credit_limit=200000.0, outstanding=75000.0,
    )
    session.add_all([customer_owing, customer_clear, customer_overdue])
    session.commit()

    yield session, tenant, user, customer_owing, customer_clear, customer_overdue
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


def test_payment_reminders_endpoint_accessible(client, auth_headers):
    """FR-FIN-05: Payment reminders endpoint returns 200."""
    response = client.get("/api/v1/finance/payment-reminders", headers=auth_headers)
    assert response.status_code == 200


def test_reminders_include_customers_with_outstanding(client, auth_headers, db):
    """FR-FIN-05: Customers with outstanding > 0 appear in reminders."""
    session, tenant, user, customer_owing, customer_clear, customer_overdue = db
    response = client.get("/api/v1/finance/payment-reminders", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    reminder_names = [r["customer_name"] for r in data["reminders"]]
    assert customer_owing.name in reminder_names
    assert customer_overdue.name in reminder_names


def test_reminders_exclude_customers_without_outstanding(client, auth_headers, db):
    """FR-FIN-05: Customers with zero outstanding do NOT appear in reminders."""
    session, tenant, user, customer_owing, customer_clear, customer_overdue = db
    response = client.get("/api/v1/finance/payment-reminders", headers=auth_headers)
    data = response.json()

    reminder_names = [r["customer_name"] for r in data["reminders"]]
    assert customer_clear.name not in reminder_names


def test_reminders_count_matches_outstanding_customers(client, auth_headers, db):
    """FR-FIN-05: Reminder count equals number of customers with outstanding > 0."""
    session, tenant, user, customer_owing, _, customer_overdue = db
    response = client.get("/api/v1/finance/payment-reminders", headers=auth_headers)
    data = response.json()

    assert data["count"] == 2


def test_aging_buckets_populated(client, auth_headers):
    """FR-FIN-05: AR aging endpoint returns buckets 0-30, 31-60, 61-90, 90+."""
    response = client.get("/api/v1/finance/aging", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    ar = data["accounts_receivable"]
    assert "0-30" in ar
    assert "31-60" in ar
    assert "61-90" in ar
    assert "90+" in ar
    assert data["ar_total"] > 0
