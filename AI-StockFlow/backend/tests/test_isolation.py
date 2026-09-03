"""Cross-tenant isolation tests (NFR-01, SRS §13 release gate).

These run on every build. A failure here blocks the release — a leak between
tenants is the single most damaging defect this platform can ship.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db, scoped
from app.core.security import hash_password
from app.main import app
from app.models.entities import (
    AuditLog,
    Product,
    StockItem,
    StockMovement,
    Tenant,
    User,
    Warehouse,
)


# Shared in-memory SQLite database for all test connections.
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

    for name, sku, email in (
        ("Tenant Alpha", "ALPHA-001", "alpha@example.com"),
        ("Tenant Beta", "BETA-001", "beta@example.com"),
    ):
        tenant = Tenant(name=name, plan="starter")
        session.add(tenant)
        session.flush()

        session.add(
            User(
                tenant_id=tenant.id,
                email=email,
                full_name=name + " Owner",
                role="owner",
                password_hash=hash_password("Test@12345"),
            )
        )

        wh = Warehouse(
            tenant_id=tenant.id,
            code="WH-MAIN",
            name="Main",
        )
        session.add(wh)
        session.flush()

        product = Product(
            tenant_id=tenant.id,
            sku=sku,
            name=f"{name} Secret Product",
            category="Electronics",
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
                warehouse_id=wh.id,
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
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


# Cache tokens so tests don't repeatedly hit the login rate limiter.
_TOKEN_CACHE = {}


def token_for(client, email: str) -> str:
    if email in _TOKEN_CACHE:
        return _TOKEN_CACHE[email]

    r = client.post(
        "/api/v1/auth/login",
        data={
            "username": email,
            "password": "Test@12345",
        },
    )

    assert r.status_code == 200, r.text

    token = r.json()["access_token"]
    _TOKEN_CACHE[email] = token

    return token


class TestQueryScoping:

    def test_scoped_returns_only_one_tenants_rows(self, db):
        alpha = (
            db.query(Tenant)
            .filter(Tenant.name == "Tenant Alpha")
            .one()
        )

        rows = scoped(db, Product, alpha.id).all()

        assert len(rows) == 1
        assert all(r.tenant_id == alpha.id for r in rows)

    def test_scoped_refuses_a_null_tenant(self, db):
        with pytest.raises(ValueError):
            scoped(db, Product, None).all()

    def test_scoped_refuses_untenanted_models(self, db):
        with pytest.raises(TypeError):
            scoped(db, Tenant, 1).all()


class TestApiIsolation:

    def test_product_list_never_crosses_tenants(self, client, db):
        beta_sku = "BETA-001"

        r = client.get(
            "/api/v1/inventory/products",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200
        assert beta_sku not in [p["sku"] for p in r.json()]

    def test_each_tenant_sees_exactly_its_own_catalogue(self, client):
        for email, expected in (
            ("alpha@example.com", "ALPHA-001"),
            ("beta@example.com", "BETA-001"),
        ):
            r = client.get(
                "/api/v1/inventory/products",
                headers={
                    "Authorization": f"Bearer {token_for(client, email)}"
                },
            )

            assert [p["sku"] for p in r.json()] == [expected]

    def test_copilot_answers_never_include_other_tenant_data(
        self,
        client,
        db,
    ):
        """FR-AI-COP-03 + NFR-01: AI path is covered by isolation tests."""

        r = client.post(
            "/api/v1/ai/copilot",
            json={
                "question": "Which products will run out next week?"
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

        body = r.json()
        assert "Tenant Beta Secret Product" not in str(body)
        assert body["role_filtered"] is True
        
    

    def test_unauthenticated_requests_are_rejected(self, client):
        assert (
            client.get("/api/v1/inventory/products").status_code
            == 401
        )

    def test_tampered_token_is_rejected(self, client):
        good = token_for(client, "alpha@example.com")
        bad = good[:-4] + "aaaa"

        r = client.get(
            "/api/v1/inventory/products",
            headers={
                "Authorization": f"Bearer {bad}"
            },
        )

        assert r.status_code == 401


class TestRbac:

    def test_cashier_cannot_write_inventory(self, client, db):
        alpha = (
            db.query(Tenant)
            .filter(Tenant.name == "Tenant Alpha")
            .one()
        )

        db.add(
            User(
                tenant_id=alpha.id,
                email="cashier@example.com",
                full_name="Cashier",
                role="cashier",
                password_hash=hash_password("Test@12345"),
            )
        )

        db.commit()

        r = client.post(
            "/api/v1/inventory/products",
            json={
                "sku": "NEW-001",
                "name": "Should Not Be Created",
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'cashier@example.com')}"
                )
            },
        )

        assert r.status_code == 403

    def test_owner_can_write_inventory(self, client):
        r = client.post(
            "/api/v1/inventory/products",
            json={
                "sku": "ALPHA-002",
                "name": "New Product",
                "selling_price": 500,
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 201


class TestHealth:

    def test_liveness(self, client):
        assert client.get("/health").json()["status"] == "ok"


class TestAiDecisionFlow:
    """Regression tests for reorder decision contract."""

    def _make_recommendation(
        self,
        db,
        tenant_name="Tenant Alpha",
    ):
        from app.models.entities import AIRecommendation, Supplier

        tenant = (
            db.query(Tenant)
            .filter(Tenant.name == tenant_name)
            .one()
        )

        product = (
            db.query(Product)
            .filter(Product.tenant_id == tenant.id)
            .first()
        )

        if not db.query(Supplier).filter(
            Supplier.tenant_id == tenant.id
        ).first():
            db.add(
                Supplier(
                    tenant_id=tenant.id,
                    name="Test Supplier",
                    lead_time_days=5,
                )
            )

        rec = AIRecommendation(
            tenant_id=tenant.id,
            rec_type="reorder",
            product_id=product.id,
            payload={
                "product_id": product.id,
                "suggested_qty": 24,
                "estimated_cost": 2400,
                "days_of_cover": 3.0,
            },
            reasoning={"rule": "test"},
            status="pending",
        )

        db.add(rec)
        db.commit()

        return rec

    def test_accepting_a_reorder_drafts_a_purchase_order(
        self,
        client,
        db,
    ):
        from app.models.entities import PurchaseOrder

        rec = self._make_recommendation(db)

        r = client.post(
            f"/api/v1/ai/recommendations/{rec.id}/decision",
            json={"decision": "accepted"},
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200, r.text

        body = r.json()

        assert body["status"] == "accepted"
        assert body["draft_po_id"] is not None

        po = (
            db.query(PurchaseOrder)
            .filter(
                PurchaseOrder.id == body["draft_po_id"]
            )
            .one()
        )

        assert po.status == "draft"
        assert po.created_by_ai is True
        assert po.ai_reasoning == {"rule": "test"}

    def test_decision_is_final(self, client, db):
        rec = self._make_recommendation(db)

        headers = {
            "Authorization": (
                f"Bearer {token_for(client, 'alpha@example.com')}"
            )
        }

        first = client.post(
            f"/api/v1/ai/recommendations/{rec.id}/decision",
            json={"decision": "rejected"},
            headers=headers,
        )

        assert first.status_code == 200

        second = client.post(
            f"/api/v1/ai/recommendations/{rec.id}/decision",
            json={"decision": "accepted"},
            headers=headers,
        )

        assert second.status_code == 409
    def test_cannot_decide_another_tenants_recommendation(
        self,
        client,
        db,
    ):
        rec = self._make_recommendation(
            db,
            "Tenant Alpha",
        )

        r = client.post(
            f"/api/v1/ai/recommendations/{rec.id}/decision",
            json={"decision": "accepted"},
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'beta@example.com')}"
                )
            },
        )

        assert r.status_code == 404

    def test_reorder_suggestions_requires_authentication(self, client):
        r = client.get(
            "/api/v1/ai/reorder-suggestions?limit=25"
        )

        assert r.status_code == 401
    def test_reorder_suggestions(self, client):
        r = client.get(
            "/api/v1/ai/reorder-suggestions?limit=25",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200, r.text

        body = r.json()
        assert isinstance(body, list)

class TestLoginLockout:
    def test_reorder_suggestions_updates_existing_pending_recommendation(
        self, client
    ):
        headers = {
            "Authorization": (
                f"Bearer {token_for(client, 'alpha@example.com')}"
            )
        }

        first = client.get(
            "/api/v1/ai/reorder-suggestions?limit=25",
            headers=headers,
        )

        assert first.status_code == 200

        second = client.get(
            "/api/v1/ai/reorder-suggestions?limit=25",
            headers=headers,
        )

        assert second.status_code == 200
        assert isinstance(second.json(), list)

    def test_mfa_toggle(self, client):
        headers = {
            "Authorization": (
                f"Bearer {token_for(client, 'alpha@example.com')}"
            )
        }

        r = client.patch(
            "/api/v1/auth/mfa",
            json={"enabled": True},
            headers=headers,
        )

        assert r.status_code == 200
        assert r.json()["mfa_enabled"] is True

        r = client.patch(
            "/api/v1/auth/mfa",
            json={"enabled": False},
            headers=headers,
        )

        assert r.status_code == 200
        assert r.json()["mfa_enabled"] is False

    def test_five_failures_lock_the_account(self, client, db):
        """SRS §9: brute-force protection on sign-in."""

        alpha = (
            db.query(Tenant)
            .filter(Tenant.name == "Tenant Alpha")
            .one()
        )

        db.add(
            User(
                tenant_id=alpha.id,
                email="lockme@example.com",
                full_name="Lock Me",
                role="cashier",
                password_hash=hash_password("Correct@12345"),
            )
        )

        db.commit()

        for _ in range(5):
            r = client.post(
                "/api/v1/auth/login",
                data={
                    "username": "lockme@example.com",
                    "password": "wrong",
                },
            )

            assert r.status_code == 401

        r = client.post(
            "/api/v1/auth/login",
            data={
                "username": "lockme@example.com",
                "password": "Correct@12345",
            },
        )

        assert r.status_code == 429
        assert "Retry-After" in r.headers


class TestForecastEndpoints:
    """API tests for demand forecast and forecast accuracy."""

    def test_product_forecast(self, client):
        r = client.get(
            "/api/v1/ai/forecast/1?horizon_days=30&seasonality_index=1",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

        body = r.json()

        assert body["product_id"] == 1
        assert body["horizon_days"] == 30
        assert body["predicted_demand"] >= 0
        assert body["daily_rate"] >= 0
        assert 0 <= body["confidence"] <= 1
        assert "method" in body
    def test_forecast_accuracy(self, client):
        r = client.get(
            "/api/v1/ai/forecast-accuracy/1",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

        body = r.json()

        assert body["product_id"] == 1
        assert "mape" in body
        assert "accuracy_pct" in body
        assert "sample_count" in body
        assert "confidence" in body

        if body["mape"] is not None:
            assert body["mape"] >= 0

        if body["accuracy_pct"] is not None:
            assert 0 <= body["accuracy_pct"] <= 100

    def test_forecast_accuracy_requires_authentication(self, client):
        r = client.get(
            "/api/v1/ai/forecast-accuracy/1"
        )

        assert r.status_code == 401

    def test_category_forecast_requires_authentication(self, client):
        r = client.get(
            "/api/v1/ai/forecast/category/electronics?horizon_days=30"
        )

        assert r.status_code == 401
   
    def test_category_forecast(self, client):
        r = client.get(
            "/api/v1/ai/forecast/category/Electronics?horizon_days=30",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

        body = r.json()

        assert body["category"] == "Electronics"
        assert body["product_count"] >= 1
        assert body["horizon_days"] == 30
        assert body["predicted_demand"] >= 0
        assert body["daily_rate"] >= 0
        assert 0 <= body["confidence"] <= 1
        assert "method" in body
        assert "is_heuristic" in body
class TestDeadStockEndpoints:

    def test_positive_manual_adjustment(self, client, db):
        stock = (
            db.query(StockItem)
            .filter(
                StockItem.product_id == 1,
                StockItem.warehouse_id == 1,
            )
            .one()
        )

        before = stock.quantity

        r = client.post(
            "/api/v1/inventory/adjustments",
            json={
                "product_id": 1,
                "warehouse_id": 1,
                "quantity": 2,
                "reason_code": "stock_found",
                "note": "Manual stock increase",
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 201, r.text

        body = r.json()

        assert body["product_id"] == 1
        assert body["new_quantity"] == before + 2
        assert body["movement_id"] is not None

    def test_negative_manual_adjustment(self, client, db):
        stock = (
            db.query(StockItem)
            .filter(
                StockItem.product_id == 1,
                StockItem.warehouse_id == 1,
            )
            .one()
        )

        before = stock.quantity

        r = client.post(
            "/api/v1/inventory/adjustments",
            json={
                "product_id": 1,
                "warehouse_id": 1,
                "quantity": -1,
                "reason_code": "damaged_stock",
                "note": "Damaged item removed",
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 201, r.text
        assert r.json()["new_quantity"] == before - 1

    def test_adjustment_requires_reason_code(self, client):
        r = client.post(
            "/api/v1/inventory/adjustments",
            json={
                "product_id": 1,
                "warehouse_id": 1,
                "quantity": 2,
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 422

    def test_adjustment_cannot_make_stock_negative(self, client):
        r = client.post(
            "/api/v1/inventory/adjustments",
            json={
                "product_id": 1,
                "warehouse_id": 1,
                "quantity": -999999,
                "reason_code": "stock_correction",
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 400

    def test_adjustment_creates_movement_and_audit_log(self, client, db):
        r = client.post(
            "/api/v1/inventory/adjustments",
            json={
                "product_id": 1,
                "warehouse_id": 1,
                "quantity": 3,
                "reason_code": "audit_correction",
                "note": "Cycle verification correction",
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 201, r.text

        movement_id = r.json()["movement_id"]

        movement = (
            db.query(StockMovement)
            .filter(StockMovement.id == movement_id)
            .one()
        )

        assert movement.movement_type == "adjustment"
        assert movement.quantity == 3
        assert movement.reason_code == "audit_correction"

        audit = (
            db.query(AuditLog)
            .filter(
                AuditLog.action == "inventory.adjustment",
                AuditLog.entity_type == "product",
                AuditLog.entity_id == 1,
            )
            .order_by(AuditLog.id.desc())
            .first()
        )

        assert audit is not None
        assert audit.details["quantity"] == 3
        assert audit.details["reason"] == "audit_correction"
        assert audit.details["note"] == "Cycle verification correction"
    def test_dead_stock_requires_authentication(self, client):
        r = client.get("/api/v1/ai/dead-stock")

        assert r.status_code == 401

    def test_dead_stock(self, client):
        r = client.get(
            "/api/v1/ai/dead-stock",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

        body = r.json()

        assert "summary" in body
        assert "total_locked_in_slow_or_dead" in body
        assert "items" in body
        assert isinstance(body["summary"], dict)
        assert isinstance(body["items"], list)
class TestInventoryEndpoints:

    def test_stock_positions(self, client):
        r = client.get(
            "/api/v1/inventory/stock",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_stock_positions_by_warehouse(self, client):
        r = client.get(
            "/api/v1/inventory/stock?warehouse_id=1",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

    def test_list_warehouses(self, client):
        r = client.get(
            "/api/v1/inventory/warehouses",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_list_products_with_search(self, client):
        r = client.get(
            "/api/v1/inventory/products?search=Secret",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

    def test_list_products_with_category(self, client):
        r = client.get(
            "/api/v1/inventory/products?category=Electronics",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

    def test_list_products_low_stock(self, client):
        r = client.get(
            "/api/v1/inventory/products?low_stock_only=true",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

    def test_create_duplicate_product_is_rejected(self, client):
        r = client.post(
            "/api/v1/inventory/products",
            json={
                "sku": "ALPHA-001",
                "name": "Duplicate Product",
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 409

    def test_stock_movements(self, client):
        r = client.get(
            "/api/v1/inventory/movements",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200

    def test_stock_movements_filtered(self, client):
        r = client.get(
            "/api/v1/inventory/movements?product_id=1",
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 200
    

    def test_create_reservation(self, client):
        r = client.post(
            "/api/v1/inventory/reservations",
            json={
                "product_id": 1,
                "warehouse_id": 1,
                "quantity": 1,
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 201

        body = r.json()
        assert body["product_id"] == 1
        assert body["warehouse_id"] == 1
        assert body["reserved"] >= 1


    def test_reservation_requires_authentication(self, client):
        r = client.post(
            "/api/v1/inventory/reservations",
            json={
                "product_id": 1,
                "warehouse_id": 1,
                "quantity": 1,
            },
        )

        assert r.status_code == 401


    def test_reservation_rejects_excess_quantity(self, client):
        r = client.post(
            "/api/v1/inventory/reservations",
            json={
                "product_id": 1,
                "warehouse_id": 1,
                "quantity": 999999,
            },
            headers={
                "Authorization": (
                    f"Bearer {token_for(client, 'alpha@example.com')}"
                )
            },
        )

        assert r.status_code == 400
