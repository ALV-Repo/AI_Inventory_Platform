import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.entities import (
    Product,
    SalesOrder,
    SalesOrderLine,
    StockItem,
    Supplier,
    Tenant,
    User,
    Warehouse,
)
from app.services import copilot


TEST_DATABASE_URL = "sqlite:///./test_copilot.db"

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
        name="Copilot Test Tenant",
        plan="starter",
    )
    session.add(tenant)
    session.flush()

    user = User(
        tenant_id=tenant.id,
        email="copilot@example.com",
        password_hash=(
            "$2b$12$HUm1Qhttp4CSh6QKmv9C.ectCdAy0Ut80JVNDl/"
            "AdkX1sS5gQjBJK"
        ),
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
        sku="COP-001",
        name="Copilot Test Product",
        cost_price=100,
        selling_price=150,
        reorder_level=10,
        is_active=True,
    )
    session.add(product)

    session.commit()

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


def test_retrieve_inventory_sales_and_purchase_facts(db):
    tenant = db.query(Tenant).first()

    product = (
        db.query(Product)
        .filter(Product.tenant_id == tenant.id)
        .first()
    )

    warehouse = (
        db.query(Warehouse)
        .filter(Warehouse.tenant_id == tenant.id)
        .first()
    )

    stock = StockItem(
        tenant_id=tenant.id,
        product_id=product.id,
        warehouse_id=warehouse.id,
        quantity=5,
        reserved_qty=1,
        avg_cost=100,
    )
    db.add(stock)

    supplier = Supplier(
        tenant_id=tenant.id,
        name="Fast Supplier",
        lead_time_days=3,
        on_time_rate=0.95,
        is_active=True,
    )
    db.add(supplier)

    order = SalesOrder(
        tenant_id=tenant.id,
        order_number="COP-001",
        subtotal=200,
        tax_amount=36,
        total=236,
        cogs=100,
    )
    db.add(order)
    db.flush()

    line = SalesOrderLine(
        tenant_id=tenant.id,
        order_id=order.id,
        product_id=product.id,
        quantity=2,
        unit_price=100,
        unit_cost=50,
        tax_amount=36,
        line_total=236,
    )
    db.add(line)

    db.commit()

    facts = copilot._retrieve(
        db,
        tenant.id,
        "owner",
    )

    assert "generated_at" in facts
    assert "low_stock_items" in facts
    assert "total_inventory_value" in facts

    assert facts["total_inventory_value"] == 500

    assert "revenue_last_7_days" in facts
    assert "revenue_last_30_days" in facts
    assert "revenue_prev_30_days" in facts
    assert "orders_last_30_days" in facts

    assert "top_products_30d" in facts
    assert "suppliers" in facts

    assert facts["suppliers"][0]["name"] == "Fast Supplier"


def test_retrieve_respects_permissions(db):
    tenant = db.query(Tenant).first()

    facts = copilot._retrieve(
        db,
        tenant.id,
        "inventory_manager",
    )

    assert "generated_at" in facts

    # Current permission mapping does not grant this role
    # Copilot data permissions.
    assert "low_stock_items" not in facts
    assert "total_inventory_value" not in facts
    assert "revenue_last_30_days" not in facts
    assert "top_products_30d" not in facts


def test_deterministic_low_stock_with_items():
    facts = {
        "low_stock_items": [
            {
                "name": "Keyboard",
                "on_hand": 2,
            },
            {
                "name": "Mouse",
                "on_hand": 5,
            },
        ]
    }

    answer = copilot._deterministic_answer(
        "Which products are low stock?",
        facts,
    )

    assert "2 items" in answer
    assert "Keyboard" in answer
    assert "Mouse" in answer


def test_deterministic_low_stock_without_items():
    answer = copilot._deterministic_answer(
        "Which products are running low?",
        {
            "low_stock_items": [],
        },
    )

    assert answer == (
        "Nothing is below its reorder level right now."
    )


def test_deterministic_revenue():
    facts = {
        "revenue_last_30_days": 12000,
        "revenue_prev_30_days": 10000,
        "orders_last_30_days": 40,
    }

    answer = copilot._deterministic_answer(
        "How is revenue compared with last month?",
        facts,
    )

    assert "Rs 12,000.00" in answer
    assert "40 orders" in answer
    assert "up 20.0%" in answer


def test_deterministic_revenue_when_previous_is_zero():
    facts = {
        "revenue_last_30_days": 5000,
        "revenue_prev_30_days": 0,
        "orders_last_30_days": 10,
    }

    answer = copilot._deterministic_answer(
        "Show me sales",
        facts,
    )

    assert "Rs 5,000.00" in answer
    assert "up 0.0%" in answer


def test_deterministic_supplier():
    facts = {
        "suppliers": [
            {
                "name": "Slow Supplier",
                "lead_time_days": 10,
                "on_time_rate": 0.80,
            },
            {
                "name": "Fast Supplier",
                "lead_time_days": 3,
                "on_time_rate": 0.95,
            },
        ]
    }

    answer = copilot._deterministic_answer(
        "Which supplier has the fastest lead time?",
        facts,
    )

    assert "Fast Supplier" in answer
    assert "3 days" in answer
    assert "95%" in answer


def test_deterministic_supplier_without_records():
    answer = copilot._deterministic_answer(
        "Which supplier is fastest?",
        {
            "suppliers": [],
        },
    )

    assert answer == "No supplier records are available yet."


def test_deterministic_top_products():
    facts = {
        "top_products_30d": [
            {
                "name": "Laptop",
                "revenue": 250000,
            },
            {
                "name": "Monitor",
                "revenue": 100000,
            },
        ]
    }

    answer = copilot._deterministic_answer(
        "What are the top products?",
        facts,
    )

    assert "Laptop" in answer
    assert "Monitor" in answer
    assert "250,000" in answer


def test_deterministic_top_products_without_sales():
    answer = copilot._deterministic_answer(
        "Which products are best selling?",
        {
            "top_products_30d": [],
        },
    )

    assert answer == (
        "No sales were recorded in the last 30 days."
    )


def test_deterministic_inventory_value():
    answer = copilot._deterministic_answer(
        "What is the inventory value?",
        {
            "total_inventory_value": 125000.50,
        },
    )

    assert "Rs 125,000.50" in answer


def test_deterministic_unknown_question():
    answer = copilot._deterministic_answer(
        "What is the weather?",
        {},
    )

    assert "stock levels" in answer
    assert "revenue trends" in answer


def test_answer_question_uses_rule_fallback(
    monkeypatch,
    db,
):
    tenant = db.query(Tenant).first()

    monkeypatch.setattr(
        copilot,
        "_call_llm",
        lambda question, facts: None,
    )

    result = copilot.answer_question(
        db=db,
        tenant_id=tenant.id,
        role="owner",
        question="What is my inventory value?",
    )

    assert result["question"] == (
        "What is my inventory value?"
    )

    assert result["source"] == "rules"
    assert result["scoped_to_tenant"] == tenant.id
    assert result["role_filtered"] is True

    assert "grounded_in" in result
    assert "Current inventory" in result["answer"]


def test_call_llm_returns_none_when_stub(monkeypatch):
    monkeypatch.setattr(
        copilot.settings,
        "AI_PROVIDER",
        "stub",
    )

    monkeypatch.setattr(
        copilot.settings,
        "AI_API_KEY",
        "",
    )

    result = copilot._call_llm(
        "What is my stock?",
        {
            "total_inventory_value": 100,
        },
    )

    assert result is None