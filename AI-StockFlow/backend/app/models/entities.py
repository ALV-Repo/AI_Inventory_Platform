"""ORM entities (SRS §8.1). Every tenant-owned table carries tenant_id.
Complete file — includes models from Dev A (lekhana), Dev B (frontend) and Dev C (Nikhil).
"""
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Float, ForeignKey,
    Index, Integer, JSON, String, Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TenantMixin:
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)


# ─────────────────────────────────────────────────────────────────────────────
# CORE
# ─────────────────────────────────────────────────────────────────────────────

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True)
    name = Column(String(160), nullable=False)
    plan = Column(String(32), default="starter")
    region = Column(String(64), default="IN")
    gstin = Column(String(20))
    status = Column(String(16), default="active")
    feature_flags = Column(JSON, default=dict)
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
    lead_time_days = Column(Integer, default=7)
    on_time_rate = Column(Float, default=1.0)
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
    payment_terms_days = Column(Integer, default=30)


# ─────────────────────────────────────────────────────────────────────────────
# INVENTORY
# ─────────────────────────────────────────────────────────────────────────────

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
    parent_id = Column(Integer, ForeignKey("products.id"))
    attributes = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    stock_items = relationship("StockItem", back_populates="product")
    parent = relationship("Product", remote_side=[id], backref="variants")

    __table_args__ = (
        Index("ix_products_tenant_sku", "tenant_id", "sku", unique=True),
    )


class StockItem(Base, TenantMixin):
    """FR-INV-05, FR-INV-09."""
    __tablename__ = "stock_items"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    batch_no = Column(String(64))
    expiry_date = Column(Date)
    quantity = Column(Float, default=0.0)
    reserved_qty = Column(Float, default=0.0)
    avg_cost = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    product = relationship("Product", back_populates="stock_items")

    @property
    def available(self) -> float:
        return (self.quantity or 0) - (self.reserved_qty or 0)


class StockMovement(Base, TenantMixin):
    """Immutable stock ledger — FR-INV-12."""
    __tablename__ = "stock_movements"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    movement_type = Column(String(24), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_cost = Column(Float, default=0.0)
    reason_code = Column(String(64))
    reference_type = Column(String(40))
    reference_id = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=utcnow, index=True)


class StockTransfer(Base, TenantMixin):
    """FR-INV-06 — warehouse transfer workflow."""
    __tablename__ = "stock_transfers"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    from_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    to_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    status = Column(String(20), default="pending", nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"))
    dispatched_by = Column(Integer, ForeignKey("users.id"))
    received_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=utcnow, nullable=False)
    approved_at = Column(DateTime)
    dispatched_at = Column(DateTime)
    received_at = Column(DateTime)


class StockSerial(Base, TenantMixin):
    """Serial-number tracking — FR-INV-04."""
    __tablename__ = "stock_serials"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    serial_number = Column(String(128), nullable=False, index=True)
    batch_no = Column(String(64))
    status = Column(String(24), default="available", nullable=False)
    created_at = Column(DateTime, default=utcnow)

    __table_args__ = (
        Index("uq_stock_serial_tenant_serial", "tenant_id", "serial_number", unique=True),
    )


class CycleCountSession(Base, TenantMixin):
    """FR-INV-07 — physical stock cycle-count session."""
    __tablename__ = "cycle_count_sessions"
    id = Column(Integer, primary_key=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    status = Column(String(20), default="open", nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    closed_at = Column(DateTime)


class CycleCountEntry(Base, TenantMixin):
    """Physical count entry — FR-INV-07."""
    __tablename__ = "cycle_count_entries"
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("cycle_count_sessions.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    system_quantity = Column(Float, nullable=False)
    counted_quantity = Column(Float)
    variance = Column(Float)
    counted_by = Column(Integer, ForeignKey("users.id"))
    counted_at = Column(DateTime)


class ProductBOM(Base, TenantMixin):
    """Bill of materials / bundle — FR-INV-10."""
    __tablename__ = "product_boms"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utcnow)
    product = relationship("Product")
    lines = relationship("ProductBOMLine", back_populates="bom", cascade="all, delete-orphan")


class ProductBOMLine(Base, TenantMixin):
    """Component in a BOM — FR-INV-10."""
    __tablename__ = "product_bom_lines"
    id = Column(Integer, primary_key=True)
    bom_id = Column(Integer, ForeignKey("product_boms.id", ondelete="CASCADE"), nullable=False, index=True)
    component_product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    bom = relationship("ProductBOM", back_populates="lines")
    component_product = relationship("Product")


# ─────────────────────────────────────────────────────────────────────────────
# PURCHASE
# ─────────────────────────────────────────────────────────────────────────────

class PurchaseOrder(Base, TenantMixin):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True)
    po_number = Column(String(40), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    status = Column(String(24), default="draft")
    order_date = Column(Date, default=lambda: utcnow().date())
    expected_date = Column(Date)
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    due_date = Column(Date, nullable=True)
    outstanding = Column(Float, default=0.0)
    created_by_ai = Column(Boolean, default=False)
    ai_reasoning = Column(JSON)
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


# ─────────────────────────────────────────────────────────────────────────────
# SALES
# ─────────────────────────────────────────────────────────────────────────────

class Quotation(Base, TenantMixin):
    """FR-SAL-01."""
    __tablename__ = "quotations"
    id = Column(Integer, primary_key=True)
    quote_number = Column(String(40), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    status = Column(String(24), default="draft")
    valid_until = Column(Date)
    revision = Column(Integer, default=1)
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utcnow)
    lines = relationship("QuotationLine", back_populates="quotation", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_quotations_tenant_number", "tenant_id", "quote_number", unique=True),
    )


class QuotationLine(Base, TenantMixin):
    __tablename__ = "quotation_lines"
    id = Column(Integer, primary_key=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    gst_rate = Column(Float, default=18.0)
    tax_amount = Column(Float, default=0.0)
    line_total = Column(Float, default=0.0)
    quotation = relationship("Quotation", back_populates="lines")


class SalesOrder(Base, TenantMixin):
    """FR-SAL-02, FR-SAL-03, FR-SAL-05."""
    __tablename__ = "sales_orders"
    id = Column(Integer, primary_key=True)
    order_number = Column(String(40), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    channel = Column(String(24), default="pos")
    status = Column(String(24), default="confirmed")
    order_date = Column(DateTime, default=utcnow, index=True)
    subtotal = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    cogs = Column(Float, default=0.0)
    payment_mode = Column(String(24), default="cash")
    idempotency_key = Column(String(64))
    irn = Column(String(64), nullable=True)
    irn_status = Column(String(24), default="not_required")
    due_date = Column(Date, nullable=True)
    outstanding = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utcnow)
    lines = relationship("SalesOrderLine", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_sales_tenant_number", "tenant_id", "order_number", unique=True),
        Index(
            "ix_sales_tenant_idem", "tenant_id", "idempotency_key",
            unique=True,
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


# ─────────────────────────────────────────────────────────────────────────────
# FINANCE
# ─────────────────────────────────────────────────────────────────────────────

class Expense(Base, TenantMixin):
    """FR-FIN-02."""
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True)
    category = Column(String(80), nullable=False)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(24), default="cash")
    description = Column(Text)
    attachment_url = Column(String(500))
    expense_date = Column(Date, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=utcnow)


class FinanceTransaction(Base, TenantMixin):
    """FR-FIN-04, FR-FIN-06."""
    __tablename__ = "finance_transactions"
    id = Column(Integer, primary_key=True)
    transaction_type = Column(String(24), nullable=False)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(24), default="cash")
    reference_type = Column(String(40))
    reference_id = Column(Integer)
    party_id = Column(Integer)
    notes = Column(Text)
    transaction_date = Column(Date, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=utcnow)


class FinanceAllocation(Base, TenantMixin):
    """FR-FIN-06."""
    __tablename__ = "finance_allocations"
    id = Column(Integer, primary_key=True)
    transaction_id = Column(Integer, ForeignKey("finance_transactions.id"), nullable=False, index=True)
    document_type = Column(String(40), nullable=False)
    document_id = Column(Integer, nullable=False)
    allocated_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utcnow)


# ─────────────────────────────────────────────────────────────────────────────
# AI
# ─────────────────────────────────────────────────────────────────────────────

class ForecastResult(Base, TenantMixin):
    """FR-AI-FOR-01..04."""
    __tablename__ = "forecast_results"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    period_start = Column(Date, nullable=False)
    period_days = Column(Integer, default=30)
    predicted_demand = Column(Float, nullable=False)
    confidence = Column(Float, default=0.5)
    method = Column(String(40), default="heuristic")
    model_version = Column(String(32), default="v1")
    created_at = Column(DateTime, default=utcnow)


class AIRecommendation(Base, TenantMixin):
    """FR-AI-PUR, FR-AI-DSD, FR-AI-PRC — always human-approved (NFR-16)."""
    __tablename__ = "ai_recommendations"
    id = Column(Integer, primary_key=True)
    rec_type = Column(String(32), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    payload = Column(JSON, nullable=False)
    reasoning = Column(JSON)
    status = Column(String(20), default="pending")
    acted_by = Column(Integer, ForeignKey("users.id"))
    acted_at = Column(DateTime)
    created_at = Column(DateTime, default=utcnow, index=True)


# ─────────────────────────────────────────────────────────────────────────────
# AUDIT
# ─────────────────────────────────────────────────────────────────────────────

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


# ─────────────────────────────────────────────────────────────────────────────
# CRM (Dev C — FR-CRM-01 to FR-CRM-04)
# ─────────────────────────────────────────────────────────────────────────────

class Lead(Base, TenantMixin):
    """FR-CRM-01."""
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True)
    name = Column(String(180), nullable=False)
    email = Column(String(180))
    phone = Column(String(32))
    source = Column(String(40), default="walk_in")
    status = Column(String(32), default="new")
    assigned_to = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    activities = relationship("LeadActivity", back_populates="lead", cascade="all, delete-orphan")

    __table_args__ = (Index("ix_leads_tenant_status", "tenant_id", "status"),)


class LeadActivity(Base, TenantMixin):
    """FR-CRM-02."""
    __tablename__ = "lead_activities"
    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)
    activity_type = Column(String(40), default="note")
    description = Column(Text, nullable=False)
    due_date = Column(DateTime)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=utcnow)
    lead = relationship("Lead", back_populates="activities")


class SalesPipeline(Base, TenantMixin):
    """FR-CRM-04."""
    __tablename__ = "sales_pipeline"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    title = Column(String(220), nullable=False)
    stage = Column(String(40), default="prospect")
    value = Column(Float, default=0.0)
    expected_close_date = Column(Date)
    assigned_to = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    __table_args__ = (Index("ix_pipeline_tenant_stage", "tenant_id", "stage"),)


# ─────────────────────────────────────────────────────────────────────────────
# HRM (Dev C — FR-HRM-01 to FR-HRM-04)
# ─────────────────────────────────────────────────────────────────────────────

class Employee(Base, TenantMixin):
    """FR-HRM-01."""
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True)
    employee_code = Column(String(32), nullable=False)
    full_name = Column(String(180), nullable=False)
    email = Column(String(180))
    phone = Column(String(32))
    department = Column(String(120))
    designation = Column(String(120))
    joining_date = Column(Date, nullable=False)
    basic_salary = Column(Float, default=0.0)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=utcnow)

    __table_args__ = (
        Index("ix_employees_tenant_code", "tenant_id", "employee_code", unique=True),
    )


class Attendance(Base, TenantMixin):
    """FR-HRM-02."""
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    check_in = Column(DateTime)
    check_out = Column(DateTime)
    status = Column(String(20), default="present")
    source = Column(String(20), default="manual")

    __table_args__ = (
        Index("ix_attendance_employee_date", "tenant_id", "employee_id", "date", unique=True),
    )


class LeaveRequest(Base, TenantMixin):
    """FR-HRM-03."""
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    leave_type = Column(String(40), default="casual")
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)
    days = Column(Float, nullable=False)
    reason = Column(Text)
    status = Column(String(20), default="pending")
    approved_by = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    created_at = Column(DateTime, default=utcnow)


class Payslip(Base, TenantMixin):
    """FR-HRM-04."""
    __tablename__ = "payslips"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    working_days = Column(Float, default=0.0)
    present_days = Column(Float, default=0.0)
    basic = Column(Float, default=0.0)
    allowances = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    net_pay = Column(Float, default=0.0)
    status = Column(String(20), default="draft")
    created_at = Column(DateTime, default=utcnow)

    __table_args__ = (
        Index("ix_payslips_employee_month", "tenant_id", "employee_id", "year", "month", unique=True),
    )


# ─────────────────────────────────────────────────────────────────────────────
# WAREHOUSE (Dev C — FR-WHS-01 to FR-WHS-04)
# ─────────────────────────────────────────────────────────────────────────────

class WarehouseBin(Base, TenantMixin):
    """FR-WHS-01 — zone → rack → bin."""
    __tablename__ = "warehouse_bins"
    id = Column(Integer, primary_key=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    zone = Column(String(32), nullable=False)
    rack = Column(String(32), nullable=False)
    bin_code = Column(String(32), nullable=False)
    capacity = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)

    __table_args__ = (
        Index("ix_bins_tenant_code", "tenant_id", "warehouse_id", "bin_code", unique=True),
    )


class PickList(Base, TenantMixin):
    """FR-WHS-02."""
    __tablename__ = "pick_lists"
    id = Column(Integer, primary_key=True)
    sales_order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    status = Column(String(20), default="pending")
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=utcnow)
    completed_at = Column(DateTime)
    lines = relationship("PickListLine", back_populates="pick_list", cascade="all, delete-orphan")


class PickListLine(Base, TenantMixin):
    __tablename__ = "pick_list_lines"
    id = Column(Integer, primary_key=True)
    pick_list_id = Column(Integer, ForeignKey("pick_lists.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    bin_id = Column(Integer, ForeignKey("warehouse_bins.id"))
    quantity_required = Column(Float, nullable=False)
    quantity_picked = Column(Float, default=0.0)
    is_picked = Column(Boolean, default=False)
    pick_list = relationship("PickList", back_populates="lines")


class PutAway(Base, TenantMixin):
    """FR-WHS-03."""
    __tablename__ = "put_aways"
    id = Column(Integer, primary_key=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    suggested_bin_id = Column(Integer, ForeignKey("warehouse_bins.id"))
    actual_bin_id = Column(Integer, ForeignKey("warehouse_bins.id"))
    quantity = Column(Float, nullable=False)
    status = Column(String(20), default="pending")
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=utcnow)
    completed_at = Column(DateTime)


class Dispatch(Base, TenantMixin):
    """FR-WHS-04."""
    __tablename__ = "dispatches"
    id = Column(Integer, primary_key=True)
    sales_order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    courier = Column(String(120))
    vehicle_number = Column(String(32))
    tracking_number = Column(String(64))
    gate_pass_number = Column(String(32))
    dispatched_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    dispatched_at = Column(DateTime, default=utcnow)
    status = Column(String(20), default="dispatched")


# ─────────────────────────────────────────────────────────────────────────────
# SALES RETURNS (Dev A — FR-SAL-06)
# ─────────────────────────────────────────────────────────────────────────────

class SalesReturn(Base, TenantMixin):
    """FR-SAL-06 — sales return / credit note."""
    __tablename__ = "sales_returns"
    id = Column(Integer, primary_key=True)
    return_number = Column(String(40), nullable=False)
    sales_order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    return_date = Column(DateTime, default=utcnow)
    reason = Column(String(255))
    refund_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    status = Column(String(24), default="pending")
    created_at = Column(DateTime, default=utcnow)

    __table_args__ = (
        Index("ix_sales_returns_tenant_number", "tenant_id", "return_number", unique=True),
    )


class SalesReturnLine(Base, TenantMixin):
    """Individual line in a sales return."""
    __tablename__ = "sales_return_lines"
    id = Column(Integer, primary_key=True)
    return_id = Column(Integer, ForeignKey("sales_returns.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, default=0.0)
    gst_rate = Column(Float, default=18.0)
    line_total = Column(Float, default=0.0)
