"""FR-HRM-02 — Biometric webhook: attendance recorded from device event."""
import pytest
from datetime import date, datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_token, hash_password
from app.main import app
from app.models.entities import Attendance, Employee, Tenant, User

DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

TODAY = date.today().isoformat()
CHECK_IN_TIME = f"{TODAY}T09:00:00"
CHECK_OUT_TIME = f"{TODAY}T18:00:00"


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
    session.flush()

    employee = Employee(
        tenant_id=tenant.id,
        employee_code="EMP-001",
        full_name="Test Employee",
        department="Engineering",
        joining_date=date(2025, 1, 1),
        basic_salary=50000.0,
        status="active",
    )
    session.add(employee)
    session.commit()

    yield session, tenant, user, employee
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


def test_biometric_checkin_creates_attendance(client, auth_headers, db):
    """FR-HRM-02: Biometric check-in webhook creates attendance record."""
    session, tenant, user, employee = db

    response = client.post(
        "/api/v1/hrm/attendance/biometric-webhook",
        json={
            "employee_id": employee.id,
            "event_time": CHECK_IN_TIME,
            "event_type": "check_in",
        },
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["received"] is True
    assert data["employee_id"] == employee.id


def test_attendance_record_has_check_in(client, auth_headers, db):
    """FR-HRM-02: After biometric check-in, attendance record has check_in set."""
    session, tenant, user, employee = db
    session.expire_all()

    record = session.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.tenant_id == tenant.id,
        Attendance.date == date.today(),
    ).first()

    assert record is not None
    assert record.check_in is not None
    assert record.source == "biometric"
    assert record.status == "present"


def test_biometric_checkout_updates_same_record(client, auth_headers, db):
    """FR-HRM-02: Biometric check-out updates existing record, not create new."""
    session, tenant, user, employee = db

    response = client.post(
        "/api/v1/hrm/attendance/biometric-webhook",
        json={
            "employee_id": employee.id,
            "event_time": CHECK_OUT_TIME,
            "event_type": "check_out",
        },
        headers=auth_headers,
    )

    assert response.status_code == 200

    session.expire_all()
    records = session.query(Attendance).filter(
        Attendance.employee_id == employee.id,
        Attendance.tenant_id == tenant.id,
        Attendance.date == date.today(),
    ).all()

    # Must be exactly ONE record — not two
    assert len(records) == 1
    assert records[0].check_out is not None


def test_invalid_event_time_rejected(client, auth_headers, db):
    """FR-HRM-02: Webhook rejects malformed event_time."""
    session, tenant, user, employee = db

    response = client.post(
        "/api/v1/hrm/attendance/biometric-webhook",
        json={
            "employee_id": employee.id,
            "event_time": "not-a-date",
            "event_type": "check_in",
        },
        headers=auth_headers,
    )

    assert response.status_code == 422


def test_missing_employee_id_rejected(client, auth_headers):
    """FR-HRM-02: Webhook rejects payload missing employee_id."""
    response = client.post(
        "/api/v1/hrm/attendance/biometric-webhook",
        json={"event_time": CHECK_IN_TIME, "event_type": "check_in"},
        headers=auth_headers,
    )
    assert response.status_code == 422


def test_nonexistent_employee_returns_404(client, auth_headers):
    """FR-HRM-02: Webhook returns 404 for unknown employee."""
    response = client.post(
        "/api/v1/hrm/attendance/biometric-webhook",
        json={
            "employee_id": 99999,
            "event_time": CHECK_IN_TIME,
            "event_type": "check_in",
        },
        headers=auth_headers,
    )
    assert response.status_code == 404
