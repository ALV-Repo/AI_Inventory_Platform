"""ORM entities (SRS §8.1). Every tenant-owned table carries tenant_id."""
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TenantMixin:
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)


class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True)
    name = Column(String(160), nullable=False)
    plan = Column(String(32), default="starter")          # starter|professional|business|enterprise
    region = Column(String(64), default="IN")
    gstin = Column(String(20))
    status = Column(String(16), default="active")
    feature_flags = Column(JSON, default=dict)            # staged AI rollout (SRS §7.3)
    created_at = Column(DateTime, default=utcnow)


class User(Base, TenantMixin):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(180), nullable=False, index=True)
    full_name = Column(String(160))
    password_hash = Column(String(255), nullable=False)
    role = Column(String(40), default="cashier")
    mfa_enabled = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    __table_args__ = (Index("ix_users_tenant_email", "tenant_id", "email", unique=True),)


class Warehouse(Base, TenantMixin):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True)
    code = Column(String(32), nullable=False)
    name = Column(String(160), nullable=False)
    address = Column(Text)
    is_active = Column(Boolean, default=True)


class Supplier(Base, TenantMixin):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True)
    name = Column(String(180), nullable=False)
    gstin = Column(String(20))
    phone = Column(String(32))
    email = Column(String(180))
    payment_terms_days = Column(Integer, default=30)
    lead_time_days = Column(Integer, default=7)           # feeds AI Auto Purchase (FR-AI-PUR-01)
    on_time_rate = Column(Float, default=1.0)             # vendor scorecard (FR-PUR-06)
    is_active = Column(Boolean, default=True)


class Customer(Base, TenantMixin):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    name = Column(String(180), nullable=False)
    gstin = Column(String(20))
    phone = Column(String(32))
    email = Column(String(180))
    credit_limit = Column(Float, default=0.0)
    outstanding = Column(Float, default=0.0)


class Product(Base, TenantMixin):
    """FR-INV-01 / FR-INV-02."""
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    sku = Column(String(64), nullable=False)
    name = Column(String(220), nullable=False)
    description = Column(Text)
    category = Column(String(120))
    brand = Column(String(120))
    uom = Column(String(24), default="pcs")
    hsn_code = Column(String(16))
    gst_rate = Column(Float, default=18.0)
    cost_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    reorder_level = Column(Integer, default=10)
    safety_stock = Column(Integer, default=5)
    barcode = Column(String(64), index=True)
    track_batch = Column(Boolean, default=False)
    track_serial = Column(Boolean, default=False)
    parent_id = Column(Integer, ForeignKey("products.id"))  # variants
    attributes = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    stock_items = relationship("StockItem", back_populates="product")

    __table_args__ = (Index("ix_products_tenant_sku", "tenant_id", "sku", unique=True),)


class StockItem(Base, TenantMixin):
    """Current stock position per product per warehouse (FR-INV-05, FR-INV-09)."""
    __tablename__ = "stock_items"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    batch_no = Column(String(64))
    expiry_date = Column(Date)
    quantity = Column(Float, default=0.0)
    reserved_qty = Column(Float, default=0.0)
    avg_cost = Column(Float, default=0.0)                 # weighted average (FR-FIN-03)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    product = relationship("Product", back_populates="stock_items")

    @property
    def available(self) -> float:
        return (self.quantity or 0) - (self.reserved_qty or 0)


class StockMovement(Base, TenantMixin):
    """Immutable stock ledger — append only (FR-INV-12, NFR-08)."""
    __tablename__ = "stock_movements"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    movement_type = Column(String(24), nullable=False)    # receipt|sale|transfer|adjustment|return
    quantity = Column(Float, nullable=False)              # signed: + inward, - outward
    unit_cost = Column(Float, default=0.0)
    reason_code = Column(String(64))
    reference_type = Column(String(40))
    reference_id = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=utcnow, index=True)


class PurchaseOrder(Base, TenantMixin):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True)
    po_number = Column(String(40), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    status = Column(String(24), default="draft")          # FR-PUR-02
    order_date = Column(Date, default=lambda: utcnow().date())
    expected_date = Column(Date)
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    created_by_ai = Column(Boolean, default=False)        # FR-AI-PUR-01
    ai_reasoning = Column(JSON)                           # FR-AI-PUR-03
    created_at = Column(DateTime, default=utcnow)

    lines = relationship("PurchaseOrderLine", back_populates="order", cascade="all, delete-orphan")


class PurchaseOrderLine(Base, TenantMixin):
    __tablename__ = "purchase_order_lines"
    id = Column(Integer, primary_key=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    received_qty = Column(Float, default=0.0)
    unit_price = Column(Float, default=0.0)
    gst_rate = Column(Float, default=18.0)

    order = relationship("PurchaseOrder", back_populates="lines")


class SalesOrder(Base, TenantMixin):
    """Sales order / POS bill / invoice (FR-SAL-02, FR-SAL-03, FR-SAL-05)."""
    __tablename__ = "sales_orders"
    id = Column(Integer, primary_key=True)
    order_number = Column(String(40), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    channel = Column(String(24), default="pos")           # pos|order|online
    status = Column(String(24), default="confirmed")
    order_date = Column(DateTime, default=utcnow, index=True)
    subtotal = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    cogs = Column(Float, default=0.0)                     # for gross profit (FR-RPT-01)
    payment_mode = Column(String(24), default="cash")
    idempotency_key = Column(String(64))                  # NFR-05 offline POS sync
    created_at = Column(DateTime, default=utcnow)

    lines = relationship("SalesOrderLine", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        # Numbering and replay protection must hold under concurrency (NFR-05):
        # the database, not application code, is the arbiter of uniqueness.
        Index("ix_sales_tenant_number", "tenant_id", "order_number", unique=True),
        Index(
            "ix_sales_tenant_idem", "tenant_id", "idempotency_key",
            unique=True, postgresql_where=idempotency_key.isnot(None),
            sqlite_where=idempotency_key.isnot(None),
        ),
    )


class SalesOrderLine(Base, TenantMixin):
    __tablename__ = "sales_order_lines"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    gst_rate = Column(Float, default=18.0)
    tax_amount = Column(Float, default=0.0)
    line_total = Column(Float, default=0.0)
    unit_cost = Column(Float, default=0.0)

    order = relationship("SalesOrder", back_populates="lines")


class ForecastResult(Base, TenantMixin):
    """FR-AI-FOR-01..04."""
    __tablename__ = "forecast_results"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    period_start = Column(Date, nullable=False)
    period_days = Column(Integer, default=30)
    predicted_demand = Column(Float, nullable=False)
    confidence = Column(Float, default=0.5)
    method = Column(String(40), default="heuristic")      # heuristic label required by FR-AI-FOR-04
    model_version = Column(String(32), default="v1")
    created_at = Column(DateTime, default=utcnow)


class AIRecommendation(Base, TenantMixin):
    """FR-AI-PUR, FR-AI-DSD, FR-AI-PRC — always human-approved (NFR-16)."""
    __tablename__ = "ai_recommendations"
    id = Column(Integer, primary_key=True)
    rec_type = Column(String(32), nullable=False)         # reorder|price|dead_stock|transfer
    product_id = Column(Integer, ForeignKey("products.id"))
    payload = Column(JSON, nullable=False)
    reasoning = Column(JSON)
    status = Column(String(20), default="pending")        # pending|accepted|rejected
    acted_by = Column(Integer, ForeignKey("users.id"))
    acted_at = Column(DateTime)
    created_at = Column(DateTime, default=utcnow, index=True)


class AuditLog(Base, TenantMixin):
    """NFR-08 — immutable."""
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(80), nullable=False)
    entity_type = Column(String(60))
    entity_id = Column(Integer)
    details = Column(JSON)
    ip_address = Column(String(64))
    created_at = Column(DateTime, default=utcnow, index=True)
